import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import * as crypto from 'crypto';

try { initializeApp(); } catch {}
const db = getFirestore();
const messaging = getMessaging();

// Gemini AI Configuration
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
const AI_CACHE_COLLECTION = 'ai_message_cache';
const AI_CACHE_TTL_HOURS = 24;

// Send push notification when a new message is created
export const onMessageCreated = onDocumentCreated(
  'messages/{messageId}',
  async (event) => {
    const messageData = event.data?.data();
    if (!messageData) return;

    // Only send notifications for customer messages (admin messages)
    if (messageData.type !== 'admin') return;

    const { customerId, content, customerName } = messageData;

    try {
      // Get customer's FCM token
      const tokenDoc = await db.collection('customer_tokens').doc(customerId).get();
      if (!tokenDoc.exists) {
        console.log('No FCM token found for customer:', customerId);
        return;
      }

      const tokenData = tokenDoc.data();
      const fcmToken = tokenData?.token;

      if (!fcmToken) {
        console.log('No valid FCM token for customer:', customerId);
        return;
      }

      // Send push notification
      const message = {
        token: fcmToken,
        notification: {
          title: 'New Message from Bueno Brows',
          body: content.length > 100 ? content.substring(0, 100) + '...' : content,
        },
        data: {
          type: 'message',
          customerId,
          messageId: event.params.messageId,
          customerName: customerName || 'Customer',
        },
        webpush: {
          notification: {
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            requireInteraction: true,
            actions: [
              {
                action: 'open',
                title: 'Open Chat'
              }
            ]
          }
        }
      };

      const response = await messaging.send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
);

// Update conversation when message is created
export const onMessageCreatedUpdateConversation = onDocumentCreated(
  'messages/{messageId}',
  async (event) => {
    const messageData = event.data?.data();
    if (!messageData) return;

    const { customerId, content, type, timestamp } = messageData;

    try {
      const conversationRef = db.collection('conversations').doc(customerId);
      
      await conversationRef.set({
        customerId,
        lastMessage: content,
        lastMessageTime: timestamp,
        unreadCount: type === 'customer' ? 1 : 0,
        status: 'active',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('Updated conversation for customer:', customerId);
    } catch (error) {
      console.error('Error updating conversation:', error);
    }
  }
);

// Send appointment reminder notifications
export const onAppointmentCreated = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const appointmentData = event.data?.data();
    if (!appointmentData) return;

    const { customerId, start, customerName, serviceId } = appointmentData;

    try {
      // Get service details
      const serviceDoc = await db.collection('services').doc(serviceId).get();
      const serviceData = serviceDoc.data();
      const serviceName = serviceData?.name || 'Service';

      // Get customer's FCM token
      const tokenDoc = await db.collection('customer_tokens').doc(customerId).get();
      if (!tokenDoc.exists) return;

      const tokenData = tokenDoc.data();
      const fcmToken = tokenData?.token;
      if (!fcmToken) return;

      // Send confirmation notification
      const message = {
        token: fcmToken,
        notification: {
          title: 'Appointment Confirmed!',
          body: `Your ${serviceName} appointment has been confirmed.`,
        },
        data: {
          type: 'appointment_confirmed',
          appointmentId: event.params.appointmentId,
          customerId,
          serviceName,
        }
      };

      await messaging.send(message);
      console.log('Sent appointment confirmation notification');
    } catch (error) {
      console.error('Error sending appointment notification:', error);
    }
  }
);

// Send appointment reminder 24 hours before
export const sendAppointmentReminder = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;

    // Check if appointment was just confirmed
    if (beforeData.status !== 'pending' && afterData.status === 'confirmed') {
      const { customerId, start, serviceId } = afterData;
      const appointmentTime = new Date(start);
      const now = new Date();
      const timeDiff = appointmentTime.getTime() - now.getTime();
      
      // If appointment is within 24 hours, send reminder
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        try {
          // Get service details
          const serviceDoc = await db.collection('services').doc(serviceId).get();
          const serviceData = serviceDoc.data();
          const serviceName = serviceData?.name || 'Service';

          // Get customer's FCM token
          const tokenDoc = await db.collection('customer_tokens').doc(customerId).get();
          if (!tokenDoc.exists) return;

          const tokenData = tokenDoc.data();
          const fcmToken = tokenData?.token;
          if (!fcmToken) return;

          const message = {
            token: fcmToken,
            notification: {
              title: 'Appointment Reminder',
              body: `Don't forget! Your ${serviceName} appointment is coming up.`,
            },
            data: {
              type: 'appointment_reminder',
              appointmentId: event.params.appointmentId,
              customerId,
              serviceName,
            }
          };

          await messaging.send(message);
          console.log('Sent appointment reminder notification');
        } catch (error) {
          console.error('Error sending appointment reminder:', error);
        }
      }
    }
  }
);

// AI Auto-Response Functions

// Get business data for AI context
async function getBusinessData(): Promise<any> {
  try {
    const [servicesSnapshot, businessHoursSnapshot] = await Promise.all([
      db.collection('services').where('active', '==', true).get(),
      db.collection('settings').doc('businessHours').get(),
    ]);

    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const businessHours = businessHoursSnapshot.data();

    return { services, businessHours };
  } catch (error) {
    console.error('Error getting business data:', error);
    return { services: [], businessHours: null };
  }
}

// Get customer context
async function getCustomerContext(customerId: string): Promise<any> {
  try {
    const customerDoc = await db.collection('customers').doc(customerId).get();
    const customerData = customerDoc.data();

    // Skip conversation history for now to avoid index issues
    // We'll get this working first, then add conversation history back
    return {
      customerId,
      name: customerData?.name || 'Customer',
      email: customerData?.email || '',
      phone: customerData?.phone || '',
      conversationHistory: [] // Temporarily empty to avoid Firestore index issues
    };
  } catch (error) {
    console.error('Error getting customer context:', error);
    return {
      customerId,
      name: 'Customer',
      email: '',
      phone: '',
      conversationHistory: []
    };
  }
}

// Generate cache key
function generateCacheKey(message: string): string {
  const normalized = message.toLowerCase().trim();
  const hash = crypto.createHash('md5');
  hash.update(normalized);
  return hash.digest('hex');
}

// Check cache
async function checkCache(cacheKey: string): Promise<string | null> {
  try {
    const cacheDoc = await db.collection(AI_CACHE_COLLECTION).doc(cacheKey).get();
    
    if (!cacheDoc.exists) return null;
    
    const cacheData = cacheDoc.data();
    if (!cacheData) return null;
    
    const cachedAt = cacheData.cachedAt?.toDate();
    if (!cachedAt) return null;
    
    const now = new Date();
    const ageInHours = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours > AI_CACHE_TTL_HOURS) {
      await db.collection(AI_CACHE_COLLECTION).doc(cacheKey).delete();
      return null;
    }
    
    console.log(`AI cache hit: ${cacheKey}`);
    return cacheData.response;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

// Save to cache
async function saveToCache(cacheKey: string, response: string): Promise<void> {
  try {
    await db.collection(AI_CACHE_COLLECTION).doc(cacheKey).set({
      response,
      cachedAt: new Date(),
      cacheKey,
    });
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
}

// Call Gemini AI
async function callGeminiAI(message: string, context: any, apiKey: string): Promise<string> {
  try {
    const cacheKey = generateCacheKey(message);
    const cachedResponse = await checkCache(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (!apiKey) {
      console.log('Gemini API key not configured');
      return generateFallbackResponse(message);
    }

    const systemPrompt = `You are an AI assistant for Bueno Brows, a premier beauty salon specializing in eyebrow services.

BUSINESS INFORMATION:
- Name: Bueno Brows
- Specialty: Expert eyebrow shaping, tinting, and waxing services
- Location: Downtown location (check website for address)
- Phone: Contact through our website or booking system
- Business Hours: Tuesday-Saturday 9AM-6PM, Sunday 10AM-4PM (Closed Mondays)

SERVICES OFFERED:
${context.business.services.length > 0 
  ? context.business.services.map((s: any) => `- ${s.name}: $${s.price} (${s.duration} minutes)${s.description ? ' - ' + s.description : ''}`).join('\n')
  : '- Basic Brow Shaping: $45 (60 min)\n- Premium Brow Shaping: $55 (75 min)\n- Brow Tinting: $25 (30 min)\n- Brow Waxing: $15 (30 min)'}

POLICIES:
- Cancellation: 24-hour notice required for cancellations
- Payment: We accept all major credit cards, cash, and digital payments
- Aftercare: Avoid touching brows for 24 hours after service, no makeup or swimming

CUSTOMER CONTEXT:
- Customer Name: ${context.customer.name}
- Recent Conversation: ${context.customer.conversationHistory.slice(-3).map((m: any) => `${m.type === 'customer' ? 'Customer' : 'You'}: ${m.content}`).join(' | ')}

YOUR ROLE & GUIDELINES:
1. Be warm, professional, and knowledgeable about brow services
2. Provide accurate pricing, timing, and service information
3. Guide customers toward booking through our website booking system
4. Keep responses concise and friendly (under 200 characters when possible)
5. If asked about availability, direct them to check the booking page for real-time slots
6. For complex questions or special requests, suggest they speak with our team
7. Always end with "- Bueno Brows AI Assistant" for clarity

Customer's message: "${message}"

Your helpful response:`;

    const requestBody = {
      contents: [{
        parts: [{
          text: systemPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 150,
      }
    };

    console.log('Calling Gemini API with URL:', GEMINI_API_URL);
    console.log('API Key present:', !!apiKey);
    console.log('API Key first 10 chars:', apiKey?.substring(0, 10));
    console.log('System prompt being sent:', systemPrompt);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || generateFallbackResponse(message);
    
    const trimmedResponse = aiResponse.trim();
    
    // Cache common queries
    const lowerMessage = message.toLowerCase();
    const isCacheable = lowerMessage.includes('hours') || 
                        lowerMessage.includes('price') || 
                        lowerMessage.includes('cost') ||
                        lowerMessage.includes('service');
    
    if (isCacheable) {
      await saveToCache(cacheKey, trimmedResponse);
    }
    
    return trimmedResponse;
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    return generateFallbackResponse(message);
  }
}

// Fallback responses
function generateFallbackResponse(message: string): string {
  const text = message.toLowerCase();
  
  if (text.includes('price') || text.includes('cost') || text.includes('how much')) {
    return "Our services range from $15-$55. Basic Brow Shaping $45 (60min), Premium $55 (75min), Tinting $25 (30min), Waxing $15 (30min). Check our booking page for details! - Bueno Brows AI Assistant";
  }
  
  if (text.includes('hours') || text.includes('when') || text.includes('open') || text.includes('time')) {
    return "We're open Tue-Sat 9AM-6PM, Sun 10AM-4PM (Closed Mondays). Check our booking page for available appointment times! - Bueno Brows AI Assistant";
  }
  
  if (text.includes('book') || text.includes('appointment') || text.includes('schedule')) {
    return "I'd love to help you book! Visit our booking page to see real-time availability and reserve your spot. An admin can also assist you shortly. - Bueno Brows AI Assistant";
  }
  
  if (text.includes('location') || text.includes('address') || text.includes('where')) {
    return "We're conveniently located downtown. Check our website for the exact address and directions! - Bueno Brows AI Assistant";
  }
  
  if (text.includes('cancel') || text.includes('reschedule') || text.includes('change')) {
    return "For cancellations or reschedules, please give us 24-hour notice. An admin will help you with this shortly! - Bueno Brows AI Assistant";
  }
  
  return "Thanks for contacting Bueno Brows! An admin will respond soon. Meanwhile, I can help with questions about our services, hours, pricing, or booking! - Bueno Brows AI Assistant";
}

// AI Auto-Response Trigger
export const onCustomerMessageAutoResponse = onDocumentCreated(
  {
    document: 'messages/{messageId}',
    secrets: [geminiApiKey]
  },
  async (event) => {
    const apiKey = geminiApiKey.value();
    const messageData = event.data?.data();
    if (!messageData) return;

    // Only respond to customer messages
    if (messageData.type !== 'customer') return;

    const { customerId, content, customerName, customerEmail } = messageData;

    // Don't respond to very short messages or just emojis
    if (!content || content.trim().length < 3) return;

    try {
      console.log('Generating AI response for customer:', customerId);
      console.log('Message content:', content);

      // Get context
      const [businessData, customerContext] = await Promise.all([
        getBusinessData(),
        getCustomerContext(customerId)
      ]);

      console.log('Business data:', JSON.stringify(businessData, null, 2));
      console.log('Customer context:', JSON.stringify(customerContext, null, 2));

      const context = {
        business: businessData,
        customer: customerContext
      };

      // Generate AI response
      const aiResponse = await callGeminiAI(content, context, apiKey);

      // Save AI response as admin message
      await db.collection('messages').add({
        customerId,
        customerName: customerName || 'Customer',
        customerEmail: customerEmail || '',
        adminId: 'ai-assistant',
        adminName: 'AI Assistant',
        content: aiResponse,
        timestamp: new Date(),
        read: false,
        type: 'admin',
        priority: 'medium',
        isAI: true
      });

      // Update conversation
      await db.collection('conversations').doc(customerId).set({
        customerId,
        customerName: customerName || 'Customer',
        customerEmail: customerEmail || '',
        lastMessage: aiResponse,
        lastMessageTime: new Date(),
        unreadCount: 0,
        status: 'active',
        hasAIResponse: true,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log('AI response sent successfully');
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  }
);
