import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret, defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as crypto from 'crypto';

try { initializeApp(); } catch {}
const db = getFirestore();

// Cache configuration for SMS AI responses
const SMS_CACHE_COLLECTION = 'sms_ai_cache';
const SMS_CACHE_TTL_HOURS = 24; // Cache SMS responses for 24 hours

// Define secrets for Twilio
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineString('TWILIO_PHONE_NUMBER', { default: '+16506839181' });
const twilioMessagingServiceSid = defineString('TWILIO_MESSAGING_SERVICE_SID', { default: '' });

// SMS Provider Configuration (Twilio preferred if available, AWS SNS as fallback)
// For A2P 10DLC compliance, use Messaging Service SID instead of phone number
const getTwilioConfig = () => ({
  accountSid: twilioAccountSid.value(),
  authToken: twilioAuthToken.value(),
  phoneNumber: twilioPhoneNumber.value(),
  messagingServiceSid: twilioMessagingServiceSid.value() || undefined
});

// AWS SNS configuration (fallback)
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// Gemini AI configuration
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Business context
const BUSINESS_CONTEXT = {
  name: "Bueno Brows",
  type: "Beauty salon specializing in eyebrow services",
  services: [
    { name: "Basic Brow Shaping", price: 45, duration: 60 },
    { name: "Premium Brow Shaping", price: 55, duration: 75 },
    { name: "Brow Tinting", price: 25, duration: 30 },
    { name: "Brow Waxing", price: 15, duration: 30 }
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
  location: "315 9th Ave, San Mateo, CA 94401",
  phone: "(650) 766-3918"
};

// Get real-time business data
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

    let services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filter out consultation services and event services (they're not regular bookable services)
    services = services.filter((s: any) => {
      const nameLower = (s.name || '').toLowerCase();
      const categoryLower = (s.category || '').toLowerCase();
      const isConsultation = nameLower.includes('consultation') || nameLower.includes('consult');
      const isEvent = categoryLower === 'events';
      return !isConsultation && !isEvent;
    });
    
    const businessHours = businessHoursSnapshot.data() || BUSINESS_CONTEXT.hours;
    const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { services, businessHours, appointments };
  } catch (error) {
    console.error('Error getting business data:', error);
    return { services: BUSINESS_CONTEXT.services, businessHours: BUSINESS_CONTEXT.hours, appointments: [] };
  }
}

// Normalize phone to E.164 format for consistent querying
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // US number
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}

// Get customer context with proper canonical field support
async function getCustomerContext(phoneNumber: string): Promise<any> {
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
    
    if (customerQuery.empty) {
      const newCustomer = await db.collection('customers').add({
        phone: phoneNumber,
        canonicalPhone: canonicalPhone,
        name: 'SMS Customer',
        status: 'ai_customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { customerId: newCustomer.id, phoneNumber, name: 'SMS Customer' };
    } else {
      const customerData = customerQuery.docs[0].data();
      
      // Update canonical field if missing
      if (!customerData.canonicalPhone) {
        await db.collection('customers').doc(customerQuery.docs[0].id).update({
          canonicalPhone: canonicalPhone,
          updatedAt: new Date().toISOString()
        });
      }
      
      return { customerId: customerQuery.docs[0].id, ...customerData };
    }
  } catch (error) {
    console.error('Error getting customer context:', error);
    throw error;
  }
}

// Generate cache key for SMS messages
function generateSMSCacheKey(message: string, phoneNumber: string): string {
  const normalizedMessage = message.toLowerCase().trim();
  const hash = crypto.createHash('md5');
  hash.update(normalizedMessage + phoneNumber);
  return hash.digest('hex');
}

// Check SMS response cache
async function checkSMSCache(cacheKey: string): Promise<string | null> {
  try {
    const cacheDoc = await db.collection(SMS_CACHE_COLLECTION).doc(cacheKey).get();
    
    if (!cacheDoc.exists) {
      return null;
    }
    
    const cacheData = cacheDoc.data();
    if (!cacheData) {
      return null;
    }
    
    // Check if cache is still valid
    const cachedAt = cacheData.cachedAt?.toDate();
    if (!cachedAt) {
      return null;
    }
    
    const now = new Date();
    const ageInHours = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
    
    if (ageInHours > SMS_CACHE_TTL_HOURS) {
      // Cache expired
      await db.collection(SMS_CACHE_COLLECTION).doc(cacheKey).delete();
      return null;
    }
    
    console.log(`SMS cache hit for key: ${cacheKey} (${ageInHours.toFixed(1)} hours old)`);
    return cacheData.response;
  } catch (error) {
    console.error('Error checking SMS cache:', error);
    return null;
  }
}

// Save SMS response to cache
async function saveSMSToCache(cacheKey: string, response: string): Promise<void> {
  try {
    await db.collection(SMS_CACHE_COLLECTION).doc(cacheKey).set({
      response,
      cachedAt: new Date(),
      cacheKey,
    });
    console.log(`SMS response cached with key: ${cacheKey}`);
  } catch (error) {
    console.error('Error saving SMS to cache:', error);
  }
}

// Call Gemini AI
export async function callGeminiAI(message: string, context: any, phoneNumber: string, apiKey: string): Promise<string> {
  try {
    // For service questions, don't use cache - always get fresh response with latest services
    const msgLowerCheck = message.toLowerCase();
    const isServiceQuestionCheck = msgLowerCheck.includes('service') || 
                              msgLowerCheck.includes('what do you') ||
                              msgLowerCheck.includes('what can you') ||
                              msgLowerCheck.includes('do you do') ||
                              msgLowerCheck.includes('do you offer') ||
                              msgLowerCheck.includes('do you have') ||
                              msgLowerCheck.includes('eyelash') ||
                              msgLowerCheck.includes('brow') ||
                              msgLowerCheck.includes('wax') ||
                              msgLowerCheck.includes('tint') ||
                              msgLowerCheck.includes('offer') ||
                              msgLowerCheck.includes('menu');
    
    // Only check cache for non-service questions
    if (!isServiceQuestionCheck) {
      const cacheKey = generateSMSCacheKey(message, 'generic');
      const cachedResponse = await checkSMSCache(cacheKey);
      
      if (cachedResponse) {
        console.log('Using cached SMS response');
        return cachedResponse;
      }
    } else {
      console.log('Service question detected - skipping cache to get fresh response with latest services');
    }
    
    if (!apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not provided, using fallback');
      return generateFallbackResponse(message, context);
    }

    // Use real-time services from database if available, otherwise fallback to hardcoded
    let servicesToUse = context.services && context.services.length > 0 
      ? context.services 
      : BUSINESS_CONTEXT.services;
    
    // Filter out consultation services and event services (they're not regular bookable services)
    servicesToUse = servicesToUse.filter((s: any) => {
      const nameLower = (s.name || '').toLowerCase();
      const categoryLower = (s.category || '').toLowerCase();
      const isConsultation = nameLower.includes('consultation') || nameLower.includes('consult');
      const isEvent = categoryLower === 'events';
      return !isConsultation && !isEvent;
    });
    
    const servicesList = servicesToUse.map((s: any) => 
      `- ${s.name}: $${s.price || 'N/A'} (${s.duration || 'N/A'} min)`
    ).join('\n');

    const systemPrompt = `You are an AI assistant for Bueno Brows beauty salon. You embody the brand's philosophy of natural beauty and enhancing what makes each person uniquely beautiful.

BUSINESS INFO:
- Name: ${BUSINESS_CONTEXT.name}
- Location: ${BUSINESS_CONTEXT.location}
- Phone: ${BUSINESS_CONTEXT.phone}
- Brand Philosophy: Natural beauty enhancements that complement your natural features and keep you looking "bueno" (good/beautiful) longer

SERVICES (use these real-time services from our database):
${servicesList}

HOURS:
${Object.entries(BUSINESS_CONTEXT.hours).map(([day, hours]) => `- ${day}: ${hours}`).join('\n')}

REAL-TIME DATA:
- Available slots: ${context.availableSlots?.join(', ') || 'Call for availability'}

CUSTOMER: ${context.customer.phoneNumber} (${context.customer.name || 'New customer'})

INSTRUCTIONS:
1. Be warm, friendly, and conversational - like talking to a friend who knows beauty. Use natural language, not robotic responses.
2. For service questions (e.g., "do you do X?", "what services?", "do you offer Y?"), ALWAYS list ALL available services with prices and durations. Use the full 300 characters if needed.
3. If asked about a service we DON'T offer (e.g., "do you do eyelash extensions"):
   - Politely say we don't offer that specific service
   - Intelligently suggest similar/related services we DO offer (e.g., if asked about lash extensions, suggest lash lifts or brow services that complement natural beauty)
   - Use brand language like "natural beauty enhancements", "complement your natural beauty", "keep you looking bueno longer"
   - Be helpful and educational - explain why our services might be a great alternative
4. Match the brand voice: Use "bueno" naturally, emphasize natural beauty, be warm and approachable.
5. For other questions, keep responses under 160 characters when possible, but prioritize being helpful over strict length limits.
6. Keep answers specific to Bueno Brows; do not speculate about other businesses.
7. Help with appointments, pricing, and hours. Offer to book when appropriate.
8. Always end with "- Bueno Brows" and, when relevant, add: "Call (650) 613-8455".
9. If uncertain or it needs a human, say an admin will follow up shortly or the customer can call (650) 613-8455.

EXAMPLES OF GOOD RESPONSES:
- If asked "do you do eyelash extensions?": "We don't do lash extensions, but we offer lash lifts and other natural beauty enhancements that complement your natural beauty to keep you looking bueno longer! We specialize in brows, tinting, and waxing. Want to see our full menu? - Bueno Brows"
- If asked "what services do you do?": List all services with prices naturally and conversationally.

Customer message: ${message}`;

    // Determine if this is a service question (needs longer response)
    const msgLowerForTokens = message.toLowerCase();
    const isServiceQuestionForTokens = msgLowerForTokens.includes('service') || 
                              msgLowerForTokens.includes('what do you') ||
                              msgLowerForTokens.includes('what can you') ||
                              msgLowerForTokens.includes('do you do') ||
                              msgLowerForTokens.includes('do you offer') ||
                              msgLowerForTokens.includes('do you have') ||
                              msgLowerForTokens.includes('do you provide') ||
                              msgLowerForTokens.includes('what services') ||
                              msgLowerForTokens.includes('what do you offer') ||
                              msgLowerForTokens.includes('offer') ||
                              msgLowerForTokens.includes('menu') ||
                              msgLowerForTokens.includes('eyelash') ||
                              msgLowerForTokens.includes('brow') ||
                              msgLowerForTokens.includes('wax') ||
                              msgLowerForTokens.includes('tint');

    const requestBody = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: isServiceQuestionForTokens ? 300 : 150, // Allow longer responses for service questions
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!aiResponse || aiResponse.trim().length === 0) {
      console.warn('⚠️ Gemini returned empty response, using fallback');
      return generateFallbackResponse(message, context);
    }
    
    console.log('✅ Gemini AI response received:', aiResponse.substring(0, 100) + '...');
    
    // Cache the response for common queries (but NOT service questions - they need fresh data)
    if (!isServiceQuestionCheck) {
      const lowerMsgForCache = message.toLowerCase();
      const isCacheable = lowerMsgForCache.includes('hours') || 
                          lowerMsgForCache.includes('price') || 
                          lowerMsgForCache.includes('cost') ||
                          lowerMsgForCache.includes('location') ||
                          lowerMsgForCache.includes('address');
      
      if (isCacheable) {
        const cacheKey = generateSMSCacheKey(message, 'generic');
        await saveSMSToCache(cacheKey, aiResponse);
      }
    }
    
    return aiResponse;
  } catch (error) {
    console.error('❌ Error calling Gemini AI:', error);
    return generateFallbackResponse(message, context);
  }
}

// Generate fallback response
function generateFallbackResponse(message: string, context?: any): string {
  const text = message.toLowerCase();
  
  if (text.includes('available') || text.includes('open')) {
    return "We have openings this week. Call (650) 613-8455 to book, or an admin will follow up shortly. - Bueno Brows";
  }
  
  if (text.includes('service') || text.includes('what do you') || text.includes('what can you') || 
      text.includes('do you do') || text.includes('do you offer') || text.includes('do you have') ||
      text.includes('offer') || text.includes('menu') || text.includes('eyelash') || 
      text.includes('brow') || text.includes('wax') || text.includes('tint')) {
    
    // Use actual services from context if available
    if (context?.services && Array.isArray(context.services) && context.services.length > 0) {
      const servicesList = context.services.slice(0, 5).map((s: any) => 
        `${s.name}: $${s.price || 'N/A'}`
      ).join(', ');
      
      // Check if asking about a specific service we don't offer
      if (text.includes('eyelash extension')) {
        return `We don't do lash extensions, but we offer lash lifts and other natural beauty enhancements that complement your natural beauty to keep you looking bueno longer! We specialize in: ${servicesList}. Want to see our full menu? Visit buenobrows.com/services or call (650) 613-8455. - Bueno Brows`;
      }
      
      return `We offer: ${servicesList}${context.services.length > 5 ? ' & more' : ''}! Visit buenobrows.com/services or call (650) 613-8455 for full menu. - Bueno Brows`;
    }
    
    // Fallback if no services in context
    if (text.includes('eyelash extension')) {
      return "We don't do lash extensions, but we offer lash lifts and other natural beauty enhancements that complement your natural beauty to keep you looking bueno longer! Visit buenobrows.com/services or call (650) 613-8455. - Bueno Brows";
    }
    
    return "We offer brow shaping, tinting, waxing & more! Visit buenobrows.com/services or call (650) 613-8455 for full menu. - Bueno Brows";
  }
  
  if (text.includes('price') || text.includes('cost')) {
    return "Services: Basic $45, Premium $55, Tint $25. Call (650) 613-8455 for details. - Bueno Brows";
  }
  
  if (text.includes('hours')) {
    return "Open Tue-Sat 9AM-6PM, Sun 10AM-4PM. Closed Mon. - Bueno Brows";
  }
  
  if (text.includes('book') || text.includes('appointment')) {
    return "To book, call (650) 613-8455. An admin can also assist shortly. - Bueno Brows";
  }
  
  return "Thanks for contacting Bueno Brows! Call (650) 613-8455 or wait for an admin reply. - Bueno Brows";
}

// Send SMS via AWS SNS
async function sendSMS(phoneNumber: string, message: string, twilioConfig?: { accountSid: string; authToken: string; phoneNumber: string; messagingServiceSid?: string }): Promise<boolean> {
  try {
    // Option 1: Use Twilio (preferred - A2P approved)
    if (twilioConfig?.accountSid && twilioConfig?.authToken) {
      try {
        const twilio = await import('twilio');
        const client = twilio.default(twilioConfig.accountSid, twilioConfig.authToken);
        
        // For A2P 10DLC compliance, use Messaging Service SID if available
        // Otherwise fall back to phone number
        const messageParams: any = {
          body: message,
          to: phoneNumber
        };
        
        if (twilioConfig.messagingServiceSid) {
          // Use Messaging Service SID for A2P compliance
          messageParams.messagingServiceSid = twilioConfig.messagingServiceSid;
          console.log('📱 Using Messaging Service SID for A2P compliance');
        } else if (twilioConfig.phoneNumber) {
          // Fallback to phone number if Messaging Service not configured
          messageParams.from = twilioConfig.phoneNumber;
          console.log('📱 Using phone number directly (not A2P optimized)');
        } else {
          throw new Error('Either messagingServiceSid or phoneNumber must be provided');
        }
        
        const result = await client.messages.create(messageParams);
        
        console.log('✅ AI SMS sent via Twilio (A2P approved):', result.sid);
      return true;
      } catch (error) {
        console.error('Error sending SMS via Twilio:', error);
        throw error;
      }
    }

    // Option 2: Use AWS SNS (fallback)
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
    });

    const params = {
      Message: message,
      PhoneNumber: phoneNumber
    };

    const result = await sns.publish(params).promise();
      console.log('✅ AI SMS sent via AWS SNS:', result.MessageId);
      return true;
    }
    
    // Option 3: No SMS provider configured
    console.log('⚠️ No SMS provider configured, logging AI SMS:', { to: phoneNumber, body: message });
    return true;
  } catch (error) {
    console.error('❌ Error sending AI SMS:', error);
    return false;
  }
}

// Generate available slots
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
        
        const isBooked = appointments.some(apt => {
          const aptStart = new Date(apt.start);
          return aptStart.getTime() === slotTime.getTime();
        });
        
        if (!isBooked) {
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const timeStr = slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
          slots.push(`${dateStr} at ${timeStr}`);
        }
      }
    }
  }
  
  return slots.slice(0, 8);
}

// Main SMS + AI integration function
export const smsAIWebhook = onRequest(
  { 
    region: 'us-central1', 
    cors: true, 
    secrets: [geminiApiKey, twilioAccountSid, twilioAuthToken] 
  },
  async (req, res) => {
    const apiKey = geminiApiKey.value();
    console.log('SMS AI webhook received:', req.method, req.body);
    
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }
    
    const { From: from, Body: body, To: to } = req.body || {};
    
    if (!from || !body) {
      res.status(400).send('Missing required fields');
      return;
    }
    
    console.log('Processing SMS with AI:', { from, body, to });
    
    try {
      // Get customer context and business data
      const [customerContext, businessData] = await Promise.all([
        getCustomerContext(from),
        getBusinessData()
      ]);
      
      // Generate available slots
      const availableSlots = generateAvailableSlots(
        businessData.services,
        businessData.businessHours,
        businessData.appointments
      );
      
      // Prepare context for AI
      const aiContext = {
        customer: customerContext,
        services: businessData.services,
        businessHours: businessData.businessHours,
        availableSlots
      };
      
      // Get AI response
      const aiResponse = await callGeminiAI(body, aiContext, from, apiKey);
      
      // Send SMS response
      const twilioConfig = getTwilioConfig();
      const smsSent = await sendSMS(from, aiResponse, twilioConfig);
      
      // Store conversation
      await Promise.all([
        // Store incoming message
        db.collection('ai_sms_conversations').add({
          customerId: customerContext.customerId,
          phoneNumber: from,
          message: body,
          direction: 'inbound',
          timestamp: new Date(),
          aiContext: aiContext
        }),
        // Store AI response
        db.collection('ai_sms_conversations').add({
          customerId: customerContext.customerId,
          phoneNumber: from,
          message: aiResponse,
          direction: 'outbound',
          timestamp: new Date(),
          aiContext: aiContext,
          smsSent
        })
      ]);
      
      res.status(200).json({
        success: true,
        response: aiResponse,
        customerId: customerContext.customerId
      });
      
    } catch (error) {
      console.error('Error in SMS AI webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Error processing SMS with AI'
      });
    }
  }
);

// Test SMS + AI integration
export const testSMSAI = onCall(
  { 
    region: 'us-central1', 
    cors: true, 
    secrets: [geminiApiKey, twilioAccountSid, twilioAuthToken] 
  },
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
      
      const availableSlots = generateAvailableSlots(
        businessData.services,
        businessData.businessHours,
        businessData.appointments
      );
      
      const aiContext = {
        customer: customerContext,
        services: businessData.services,
        businessHours: businessData.businessHours,
        availableSlots
      };
      
      const aiResponse = await callGeminiAI(message, aiContext, phoneNumber, apiKey);
      const twilioConfig = getTwilioConfig();
      const smsSent = await sendSMS(phoneNumber, aiResponse, twilioConfig);
      
      return {
        success: true,
        response: aiResponse,
        smsSent,
        context: aiContext
      };
      
    } catch (error) {
      console.error('Error testing SMS AI:', error);
      throw new HttpsError('internal', 'Error testing SMS AI');
    }
  }
);

// Get AI SMS conversation history
export const getAISMSConversation = onCall(
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
      const conversationQuery = await db.collection('ai_sms_conversations')
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
      console.error('Error getting AI SMS conversation:', error);
      throw new HttpsError('internal', 'Error getting conversation');
    }
  }
);
