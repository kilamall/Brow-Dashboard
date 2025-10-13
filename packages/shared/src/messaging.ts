import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot
} from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { FirebaseApp } from 'firebase/app';

export interface Message {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  adminId?: string;
  adminName?: string;
  content: string;
  timestamp: any;
  read: boolean;
  type: 'customer' | 'admin';
  appointmentId?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  status: 'active' | 'resolved' | 'archived';
  appointmentId?: string;
}

// Message collection operations
export class MessagingService {
  private db: any;
  private messaging?: ReturnType<typeof getMessaging>;

  constructor(db: any, app?: FirebaseApp) {
    this.db = db;
    if (app && typeof window !== 'undefined') {
      this.messaging = getMessaging(app);
    }
  }

  // Send a message
  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    const messageData = {
      ...message,
      timestamp: serverTimestamp(),
      read: false
    };

    const docRef = await addDoc(collection(this.db, 'messages'), messageData);
    return docRef.id;
  }

  // Get messages for a conversation
  async getMessages(customerId: string, limitCount: number = 50): Promise<Message[]> {
    const q = query(
      collection(this.db, 'messages'),
      where('customerId', '==', customerId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message));
  }

  // Listen to messages in real-time
  subscribeToMessages(
    customerId: string, 
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(this.db, 'messages'),
      where('customerId', '==', customerId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      callback(messages);
    });
  }

  // Mark messages as read
  async markMessagesAsRead(customerId: string, adminId: string): Promise<void> {
    const q = query(
      collection(this.db, 'messages'),
      where('customerId', '==', customerId),
      where('type', '==', 'customer'),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, { 
        read: true,
        readBy: adminId,
        readAt: serverTimestamp()
      })
    );

    await Promise.all(updatePromises);
  }

  // Get all conversations for admin
  async getConversations(): Promise<Conversation[]> {
    const q = query(
      collection(this.db, 'conversations'),
      orderBy('lastMessageTime', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Conversation));
  }

  // Listen to conversations in real-time
  subscribeToConversations(callback: (conversations: Conversation[]) => void): () => void {
    const q = query(
      collection(this.db, 'conversations'),
      orderBy('lastMessageTime', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      callback(conversations);
    });
  }

  // Update conversation when new message is sent
  async updateConversation(customerId: string, message: Partial<Message>): Promise<void> {
    const conversationRef = doc(this.db, 'conversations', customerId);
    
    await updateDoc(conversationRef, {
      lastMessage: message.content,
      lastMessageTime: serverTimestamp(),
      unreadCount: message.type === 'customer' ? 
        (await this.getUnreadCount(customerId)) + 1 : 0,
      status: 'active'
    }).catch(async () => {
      // Create conversation if it doesn't exist
      await addDoc(collection(this.db, 'conversations'), {
        customerId,
        customerName: message.customerName,
        customerEmail: message.customerEmail,
        lastMessage: message.content,
        lastMessageTime: serverTimestamp(),
        unreadCount: message.type === 'customer' ? 1 : 0,
        status: 'active',
        appointmentId: message.appointmentId
      });
    });
  }

  // Get unread message count for a customer
  private async getUnreadCount(customerId: string): Promise<number> {
    const q = query(
      collection(this.db, 'messages'),
      where('customerId', '==', customerId),
      where('type', '==', 'customer'),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  }

  // Request notification permission and get FCM token
  async requestNotificationPermission(): Promise<string | null> {
    if (!this.messaging) return null;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(this.messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        return token;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
    return null;
  }

  // Listen for foreground messages
  onMessage(callback: (payload: any) => void): () => void {
    if (!this.messaging) return () => {};

    return onMessage(this.messaging, callback);
  }

  // Save FCM token for a customer
  async saveCustomerToken(customerId: string, token: string): Promise<void> {
    const tokenRef = doc(this.db, 'customer_tokens', customerId);
    await updateDoc(tokenRef, {
      token,
      updatedAt: serverTimestamp()
    }).catch(async () => {
      await addDoc(collection(this.db, 'customer_tokens'), {
        customerId,
        token,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  }
}

// Utility functions for message formatting
export const formatMessageTime = (timestamp: any): string => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)}h ago`;
  } else if (diffInHours < 168) { // 7 days
    return `${Math.floor(diffInHours / 24)}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const getMessagePriority = (content: string, appointmentId?: string): 'low' | 'medium' | 'high' => {
  const urgentKeywords = ['urgent', 'emergency', 'cancel', 'reschedule', 'problem'];
  const hasUrgentKeyword = urgentKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  );
  
  if (hasUrgentKeyword || appointmentId) {
    return 'high';
  }
  
  if (content.length > 100) {
    return 'medium';
  }
  
  return 'low';
};
