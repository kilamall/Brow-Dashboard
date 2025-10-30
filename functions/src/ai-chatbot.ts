import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';
import { rateLimiters, consumeRateLimit, getClientIP } from './rate-limiter.js';

try { initializeApp(); } catch {}
const db = getFirestore();

// Cache configuration for AI chatbot responses
const CHATBOT_CACHE_COLLECTION = 'chatbot_ai_cache';
const CHATBOT_CACHE_TTL_HOURS = 24;

// Gemini AI Configuration
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Business Context for AI
const BUSINESS_CONTEXT = {
  name: "Bueno Brows",
  type: "Beauty salon specializing in eyebrow services",
  services: [
    { name: "Basic Brow Shaping", price: 45, duration: 60, description: "Basic eyebrow shaping and cleanup" },
    { name: "Premium Brow Shaping", price: 55, duration: 75, description: "Premium eyebrow shaping with tinting" },
    { name: "Brow Tinting", price: 25, duration: 30, description: "Eyebrow tinting service" },
    { name: "Brow Waxing", price: 15, duration: 30, description: "Eyebrow waxing service" }
  ],
  hours: {
    monday: "Closed",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM", 
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 6:00 PM",
    saturday: "9:00 AM - 6:00 PM",
    sunday: "10:00 AM - 4:00 PM"
  },
  location: "123 Main Street, Downtown",
  phone: "(650) 613-8455",
  policies: {
    cancellation: "24 hours notice required for cancellations",
    payment: "Cash, credit cards, and Venmo accepted",
    aftercare: "Avoid touching brows for 24 hours, no makeup or swimming"
  }
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CustomerContext {
  customerId: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  conversationHistory: ChatMessage[];
  lastInteraction: Date;
  preferences?: {
    preferredServices?: string[];
    preferredTimes?: string[];
  };
}

// Get real-time business data from Firebase
async function getBusinessData(): Promise<any> {
  try {
    const [servicesSnapshot, businessHoursSnapshot, appointmentsSnapshot] = await Promise.all([
      db.collection('services').where('active', '==', true).get(),
      db.collection('settings').doc('businessHours').get(),
      db.collection('appointments')
        .where('start', '>=', new Date().toISOString())
        .where('start', '<=', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .get()
    ]);

    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const businessHours = businessHoursSnapshot.data() || BUSINESS_CONTEXT.hours;

    const appointments = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      services,
      businessHours,
      appointments,
      availableSlots: generateAvailableSlots(services, businessHours, appointments)
    };
  } catch (error) {
    console.error('Error getting business data:', error);
    return {
      services: BUSINESS_CONTEXT.services,
      businessHours: BUSINESS_CONTEXT.hours,
      appointments: [],
      availableSlots: []
    };
  }
}

// Generate available appointment slots
function generateAvailableSlots(services: any[], businessHours: any, appointments: any[]): string[] {
  const slots: string[] = [];
  const now = new Date();
  
  for (let i = 1; i <= 7; i++) {
    const date = new Date(now.getTime() + (i * 24 * 60 * 60 * 1000));
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (businessHours[dayOfWeek] && businessHours[dayOfWeek] !== 'Closed') {
      const [openTime, closeTime] = businessHours[dayOfWeek].split(' - ');
      const openHour = parseInt(openTime.split(':')[0]);
      const closeHour = parseInt(closeTime.split(':')[0]);
      
      for (let hour = openHour; hour < closeHour; hour++) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);
        
        // Check if slot is available
        const isBooked = appointments.some(apt => {
          const aptStart = new Date(apt.start);
          return aptStart.getTime() === slotTime.getTime();
        });
        
        if (!isBooked) {
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const timeStr = slotTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          slots.push(`${dateStr} at ${timeStr}`);
        }
      }
    }
  }
  
  return slots.slice(0, 10); // Limit to 10 slots
}

// Normalize phone to E.164 format for consistent querying
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // US number
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}

// Get or create customer context with proper canonical field support
async function getCustomerContext(phoneNumber: string): Promise<CustomerContext> {
  try {
    const canonicalPhone = normalizePhone(phoneNumber);
    
    // Try canonical phone first
    let customerQuery = await db.collection('customers')
      .where('canonicalPhone', '==', canonicalPhone)
      .limit(1)
      .get();
    
    // Fallback to raw phone for customers created before canonical fields
    if (customerQuery.empty) {
      customerQuery = await db.collection('customers')
        .where('phone', '==', phoneNumber)
        .limit(1)
        .get();
    }
    
    let customerId: string;
    let customerData: any = {};
    
    if (customerQuery.empty) {
      // Create new customer with canonical fields
      const newCustomer = await db.collection('customers').add({
        phone: phoneNumber,
        canonicalPhone: canonicalPhone,
        name: 'SMS Customer',
        email: null,
        status: 'ai_customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiOptIn: true
      });
      customerId = newCustomer.id;
    } else {
      customerId = customerQuery.docs[0].id;
      customerData = customerQuery.docs[0].data();
      
      // Update canonical field if missing
      if (!customerData.canonicalPhone) {
        await db.collection('customers').doc(customerId).update({
          canonicalPhone: canonicalPhone,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    // Get conversation history
    const conversationQuery = await db.collection('ai_conversations')
      .where('customerId', '==', customerId)
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();
    
    const conversationHistory: ChatMessage[] = conversationQuery.docs.map(doc => {
      const data = doc.data();
      return {
        role: data.role,
        content: data.content,
        timestamp: data.timestamp.toDate()
      };
    }).reverse();
    
    return {
      customerId,
      phoneNumber,
      name: customerData.name,
      email: customerData.email,
      conversationHistory,
      lastInteraction: new Date(),
      preferences: customerData.preferences || {}
    };
  } catch (error) {
    console.error('Error getting customer context:', error);
    throw error;
  }
}

// Generate cache key for chatbot messages
function generateChatbotCacheKey(message: string): string {
  const normalizedMessage = message.toLowerCase().trim();
  const hash = crypto.createHash('md5');
  hash.update(normalizedMessage);
  return hash.digest('hex');
}

// SECURITY: Sanitize AI input to prevent prompt injection
function sanitizeAIInput(input: string): string {
  // Limit length to prevent abuse
  const maxLength = 500;
  let sanitized = input.substring(0, maxLength);
  
  // Remove potential prompt injection patterns
  sanitized = sanitized.replace(/\[INST\]|\[\/INST\]/gi, '');
  sanitized = sanitized.replace(/system:/gi, '');
  sanitized = sanitized.replace(/assistant:/gi, '');
  sanitized = sanitized.replace(/\<\|.*?\|\>/g, ''); // Remove special tokens
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

// Check chatbot response cache
async function checkChatbotCache(cacheKey: string): Promise<string | null> {
  try {
    const cacheDoc = await db.collection(CHATBOT_CACHE_COLLECTION).doc(cacheKey).get();
    
    if (!cacheDoc.exists) {
      return null;
    }
    
    const cacheData = cacheDoc.data();
    if (!cacheData) {
      return null;
    }
    
    const cachedAt = cacheData.cachedAt?.toDate();
    if (!cachedAt) {
      return null;
    }
    
    const now = new Date();
    const ageInHours = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours > CHATBOT_CACHE_TTL_HOURS) {
      await db.collection(CHATBOT_CACHE_COLLECTION).doc(cacheKey).delete();
      return null;
    }
    
    console.log(`Chatbot cache hit for key: ${cacheKey}`);
    return cacheData.response;
  } catch (error) {
    console.error('Error checking chatbot cache:', error);
    return null;
  }
}

// Save chatbot response to cache
async function saveChatbotToCache(cacheKey: string, response: string): Promise<void> {
  try {
    await db.collection(CHATBOT_CACHE_COLLECTION).doc(cacheKey).set({
      response,
      cachedAt: new Date(),
      cacheKey,
    });
  } catch (error) {
    console.error('Error saving chatbot to cache:', error);
  }
}

// Call Gemini AI API
async function callGeminiAPI(prompt: string, context: any, apiKey: string): Promise<string> {
  try {
    // Check cache for common questions
    const cacheKey = generateChatbotCacheKey(prompt);
    const cachedResponse = await checkChatbotCache(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    if (!apiKey) {
      console.log('Gemini API key not configured, returning fallback response');
      return generateFallbackResponse(prompt);
    }

    const systemPrompt = `You are an AI assistant for Bueno Brows, a beauty salon specializing in eyebrow services.

BUSINESS INFORMATION:
- Name: ${BUSINESS_CONTEXT.name}
- Type: ${BUSINESS_CONTEXT.type}
- Location: ${BUSINESS_CONTEXT.location}
- Phone: ${BUSINESS_CONTEXT.phone}

SERVICES:
${BUSINESS_CONTEXT.services.map(s => `- ${s.name}: $${s.price} (${s.duration} minutes) - ${s.description}`).join('\n')}

BUSINESS HOURS:
${Object.entries(BUSINESS_CONTEXT.hours).map(([day, hours]) => `- ${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join('\n')}

POLICIES:
- Cancellation: ${BUSINESS_CONTEXT.policies.cancellation}
- Payment: ${BUSINESS_CONTEXT.policies.payment}
- Aftercare: ${BUSINESS_CONTEXT.policies.aftercare}

REAL-TIME DATA:
- Available Slots: ${context.availableSlots.join(', ') || 'Please call for availability'}
- Current Services: ${context.services.map((s: any) => s.name).join(', ')}

CUSTOMER CONTEXT:
- Phone: ${context.customer.phoneNumber}
- Name: ${context.customer.name || 'Not provided'}
- Previous messages: ${context.customer.conversationHistory.slice(-3).map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n')}

INSTRUCTIONS:
1. Be friendly, professional, and helpful; answer all questions to the best of your ability.
2. Keep answers specific to Bueno Brows and our services; do not speculate about unrelated businesses.
3. Provide accurate info about services, pricing, hours, and availability. Offer to book when appropriate.
4. Keep responses concise (aim for < 160 characters when possible).
5. Always end with "- Bueno Brows". When relevant, include: "Call (650) 613-8455".
6. If uncertain or the request needs a human, say an admin will follow up shortly or the customer can call (650) 613-8455.

Customer message: ${prompt}`;

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
        maxOutputTokens: 200,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || generateFallbackResponse(prompt);
    
    const trimmedResponse = aiResponse.trim();
    
    // Cache common queries
    const lowerPrompt = prompt.toLowerCase();
    const isCacheable = lowerPrompt.includes('hours') || 
                        lowerPrompt.includes('price') || 
                        lowerPrompt.includes('cost') ||
                        lowerPrompt.includes('service') ||
                        lowerPrompt.includes('location');
    
    if (isCacheable) {
      await saveChatbotToCache(cacheKey, trimmedResponse);
    }
    
    return trimmedResponse;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateFallbackResponse(prompt);
  }
}

// Generate fallback response when AI is not available
function generateFallbackResponse(prompt: string): string {
  const text = prompt.toLowerCase();
  
  if (text.includes('available') || text.includes('open')) {
    return "We have openings this week. Call (650) 613-8455 to book, or an admin will follow up shortly. - Bueno Brows";
  }
  
  if (text.includes('price') || text.includes('cost')) {
    return "Services: Basic $45, Premium $55, Tint $25. Call (650) 613-8455 for details, or we’ll follow up shortly. - Bueno Brows";
  }
  
  if (text.includes('hours') || text.includes('open')) {
    return "We're open Tue-Sat 9AM-6PM, Sun 10AM-4PM. Closed Mondays. - Bueno Brows";
  }
  
  if (text.includes('book') || text.includes('appointment')) {
    return "To book, call (650) 613-8455. An admin can also assist shortly if you prefer. - Bueno Brows";
  }
  
  return "Thanks for contacting Bueno Brows! Call (650) 613-8455 or wait for an admin reply. - Bueno Brows";
}

// Main AI chatbot function
export const aiChatbot = onRequest(
  { region: 'us-central1', cors: true, secrets: [geminiApiKey] },
  async (req, res) => {
    const apiKey = geminiApiKey.value();
    console.log('AI Chatbot request received:', req.method, req.body);
    
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }
    
    const { phoneNumber, message } = req.body || {};
    
    if (!phoneNumber || !message) {
      res.status(400).send('Missing phone number or message');
      return;
    }
    
    // SECURITY: Rate limit AI chatbot requests (20 per minute per phone/IP)
    const rateLimitKey = phoneNumber ? `phone:${phoneNumber}` : `ip:${getClientIP(req)}`;
    try {
      await consumeRateLimit(rateLimiters.aiChatbot, rateLimitKey);
    } catch (error: any) {
      res.status(429).json({
        success: false,
        error: 'Too many requests. Please slow down.',
        retryAfter: error.retryAfter || 60
      });
      return;
    }
    
    try {
      // SECURITY: Sanitize user input to prevent prompt injection
      const sanitizedMessage = sanitizeAIInput(message);
      
      // Get customer context and business data
      const [customerContext, businessData] = await Promise.all([
        getCustomerContext(phoneNumber),
        getBusinessData()
      ]);
      
      // Prepare context for AI
      const aiContext = {
        customer: customerContext,
        business: businessData
      };
      
      // Get AI response with sanitized input
      const aiResponse = await callGeminiAPI(sanitizedMessage, aiContext, apiKey);
      
      // Store conversation
      await Promise.all([
        // Store user message
        db.collection('ai_conversations').add({
          customerId: customerContext.customerId,
          phoneNumber,
          role: 'user',
          content: message,
          timestamp: new Date(),
          aiContext: aiContext
        }),
        // Store AI response
        db.collection('ai_conversations').add({
          customerId: customerContext.customerId,
          phoneNumber,
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          aiContext: aiContext
        })
      ]);
      
      res.status(200).json({
        success: true,
        response: aiResponse,
        customerId: customerContext.customerId
      });
      
    } catch (error) {
      console.error('Error in AI chatbot:', error);
      res.status(500).json({
        success: false,
        error: 'Error processing AI request'
      });
    }
  }
);

// Test AI chatbot function
export const testAIChatbot = onCall(
  { region: 'us-central1', cors: true, secrets: [geminiApiKey] },
  async (req) => {
    // SECURITY FIX: Require authentication
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const apiKey = geminiApiKey.value();
    const { phoneNumber, message } = req.data || {};
    
    if (!phoneNumber || !message) {
      throw new HttpsError('invalid-argument', 'Missing phone number or message');
    }
    
    try {
      const [customerContext, businessData] = await Promise.all([
        getCustomerContext(phoneNumber),
        getBusinessData()
      ]);
      
      const aiContext = {
        customer: customerContext,
        business: businessData
      };
      
      const aiResponse = await callGeminiAPI(message, aiContext, apiKey);
      
      return {
        success: true,
        response: aiResponse,
        context: aiContext
      };
      
    } catch (error) {
      console.error('Error testing AI chatbot:', error);
      throw new HttpsError('internal', 'Error testing AI chatbot');
    }
  }
);

// Get AI conversation history
export const getAIConversation = onCall(
  { region: 'us-central1', cors: true, enforceAppCheck: true },
  async (req) => {
    const { customerId } = req.data || {};
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    if (!customerId) {
      throw new HttpsError('invalid-argument', 'Missing customer ID');
    }
    
    // SECURITY FIX: Prevent IDOR - only allow access to own data or admin
    const isAdmin = req.auth?.token?.role === 'admin';
    const isOwnData = userId === customerId;
    
    if (!isAdmin && !isOwnData) {
      throw new HttpsError('permission-denied', 'Cannot access other customers\' conversations');
    }
    
    try {
      const conversationQuery = await db.collection('ai_conversations')
        .where('customerId', '==', customerId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      
      const messages = conversationQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { messages };
      
    } catch (error) {
      console.error('Error getting AI conversation:', error);
      throw new HttpsError('internal', 'Error getting conversation');
    }
  }
);
