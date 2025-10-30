import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, orderBy, onSnapshot, where, addDoc, updateDoc, doc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatMessageTime } from '@buenobrows/shared/messaging';
import type { Message } from '@buenobrows/shared/messaging';

interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  status: 'active' | 'resolved' | 'archived';
  hasAIResponse?: boolean;
}

export default function Messages() {
  const { db } = useFirebase();
  const auth = getAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'ai'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Load conversations
  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      
      setConversations(convs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('customerId', '==', selectedConversation.customerId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      
      setMessages(msgs);
      scrollToBottom();
      
      // Mark messages as read
      markAsRead(selectedConversation.customerId);
    });

    return () => unsubscribe();
  }, [selectedConversation, db]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const markAsRead = async (customerId: string) => {
    try {
      const adminId = auth.currentUser?.uid || 'admin';
      
      // Get unread customer messages
      const q = query(
        collection(db, 'messages'),
        where('customerId', '==', customerId),
        where('type', '==', 'customer'),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(msgDoc => 
        updateDoc(doc(db, 'messages', msgDoc.id), { 
          read: true,
          readBy: adminId,
          readAt: new Date()
        })
      );

      await Promise.all(updatePromises);

      // Update conversation unread count (handle doc id != customerId)
      try {
        await updateDoc(doc(db, 'conversations', selectedConversation?.id || customerId), {
          unreadCount: 0
        });
      } catch (e) {
        console.warn('Conversation doc not found by id, attempting by customerId', e);
        try {
          await updateDoc(doc(db, 'conversations', customerId), { unreadCount: 0 });
        } catch (e2) {
          console.error('Failed to update conversation unread count:', e2);
        }
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const adminId = auth.currentUser?.uid || 'admin';
      const adminName = auth.currentUser?.displayName || 'Admin';

      // Add message
      await addDoc(collection(db, 'messages'), {
        customerId: selectedConversation.customerId,
        customerName: selectedConversation.customerName,
        customerEmail: selectedConversation.customerEmail,
        adminId,
        adminName,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false,
        type: 'admin',
        priority: 'medium',
        isAI: false
      });

      // Update conversation
      await updateDoc(doc(db, 'conversations', selectedConversation.customerId), {
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date(),
        status: 'active',
        hasAIResponse: false
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateConversationStatus = async (status: 'active' | 'resolved' | 'archived') => {
    if (!selectedConversation) return;

    try {
      await updateDoc(doc(db, 'conversations', selectedConversation.customerId), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating conversation status:', error);
    }
  };

  const markAllAsReadNow = async () => {
    if (!selectedConversation) return;
    try {
      await markAsRead(selectedConversation.customerId);
      setConversations(prev => prev.map(c => c.customerId === selectedConversation.customerId ? { ...c, unreadCount: 0 } : c));
    } catch (e) {
      console.error('Mark all read failed:', e);
    }
  };

  const deleteConversation = async () => {
    if (!selectedConversation) return;
    const confirmDelete = confirm('Delete this entire conversation and all messages? This cannot be undone.');
    if (!confirmDelete) return;
    try {
      const customerId = selectedConversation.customerId;
      const conversationDocId = selectedConversation.id;
      // Delete messages in batches
      const q = query(
        collection(db, 'messages'),
        where('customerId', '==', customerId)
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(doc(db, 'messages', d.id)));
      await batch.commit();
      // Delete conversation doc
      await deleteDoc(doc(db, 'conversations', conversationDocId));
      // Update UI
      setSelectedConversation(null);
      setMessages([]);
      setConversations(prev => prev.filter(c => c.customerId !== customerId));
    } catch (e) {
      console.error('Delete conversation failed:', e);
      alert('Failed to delete conversation.');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (filter === 'all') return true;
    if (filter === 'active') return conv.status === 'active';
    if (filter === 'ai') return conv.hasAIResponse;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex gap-4">
      {/* Conversations List */}
      <div className="w-1/3 bg-white rounded-lg shadow-soft overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-serif font-semibold mb-3">Conversations</h2>
          
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'active' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({conversations.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('ai')}
              className={`px-3 py-1 rounded-md text-sm ${
                filter === 'ai' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              AI ({conversations.filter(c => c.hasAIResponse).length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={(e) => {
                  // Prevent row click when toggling checkbox
                  const target = e.target as HTMLElement;
                  if ((target as HTMLInputElement).type !== 'checkbox') setSelectedConversation(conv);
                }}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <input
                      id={`select-conv-${conv.id}`}
                      name={`select-conv-${conv.id}`}
                      type="checkbox"
                      checked={selectedIds.has(conv.id)}
                      onChange={(e) => {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(conv.id); else next.delete(conv.id);
                          return next;
                        });
                      }}
                      className="mr-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <h3 className="font-semibold text-gray-900">
                      <Link
                        to={`/customers/${conv.customerId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {conv.customerName}
                      </Link>
                    </h3>
                    {conv.hasAIResponse && (
                      <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                        AI
                      </span>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">{conv.lastMessage}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {conv.lastMessageTime ? formatMessageTime(conv.lastMessageTime) : ''}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    conv.status === 'active' ? 'bg-green-100 text-green-700' :
                    conv.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {conv.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages Panel */}
      <div className="flex-1 bg-white rounded-lg shadow-soft overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    <Link
                      to={`/customers/${selectedConversation.customerId}`}
                      className="hover:underline"
                    >
                      {selectedConversation.customerName}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-600">{selectedConversation.customerEmail}</p>
                </div>
                <div className="flex gap-2">
                  {selectedIds.size > 0 && (
                    <button
                      onClick={async () => {
                        const confirmDelete = confirm(`Delete ${selectedIds.size} selected conversations?`);
                        if (!confirmDelete) return;
                        try {
                          const toDelete = conversations.filter(c => selectedIds.has(c.id));
                          for (const conv of toDelete) {
                            const q = query(
                              collection(db, 'messages'),
                              where('customerId', '==', conv.customerId)
                            );
                            const snap = await getDocs(q);
                            const batch = writeBatch(db);
                            snap.docs.forEach(d => batch.delete(doc(db, 'messages', d.id)));
                            await batch.commit();
                            await deleteDoc(doc(db, 'conversations', conv.id));
                          }
                          setSelectedIds(new Set());
                        } catch (e) {
                          console.error('Bulk delete failed:', e);
                          alert('Failed to delete selected conversations.');
                        }
                      }}
                      className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete Selected
                    </button>
                  )}
                  <button
                    onClick={markAllAsReadNow}
                    className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    title="Mark all as read"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={deleteConversation}
                    className="px-3 py-1 rounded-md text-sm bg-red-600 text-white hover:bg-red-700"
                    title="Delete conversation"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => updateConversationStatus('active')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedConversation.status === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => updateConversationStatus('resolved')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedConversation.status === 'resolved'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => updateConversationStatus('archived')}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedConversation.status === 'archived'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Archive
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-md`}>
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          message.type === 'admin'
                            ? message.isAI
                              ? 'bg-purple-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        {message.type === 'admin' && (
                          <p className={`text-xs mb-1 ${message.isAI ? 'text-purple-200' : 'text-blue-200'}`}>
                            {message.adminName || 'Admin'}
                            {message.isAI && ' 🤖'}
                          </p>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <p className={`text-xs mt-1 ${
                        message.type === 'admin' ? 'text-right text-gray-400' : 'text-left text-gray-400'
                      }`}>
                        {formatMessageTime(message.timestamp)}
                        {message.read && message.type === 'customer' && ' • Read'}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  id="admin-message-input"
                  name="admin-message-input"
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 AI Assistant automatically responds to customer messages. You can follow up anytime.
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
