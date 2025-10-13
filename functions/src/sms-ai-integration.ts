import { onRequest, onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// AWS SNS configuration
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BUSINESS_PHONE_NUMBER = process.env.BUSINESS_PHONE_NUMBER;

// Gemini AI configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
  location: "123 Main Street, Downtown",
  phone: "(555) 123-4567"
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

    const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const businessHours = businessHoursSnapshot.data() || BUSINESS_CONTEXT.hours;
    const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { services, businessHours, appointments };
  } catch (error) {
    console.error('Error getting business data:', error);
    return { services: BUSINESS_CONTEXT.services, businessHours: BUSINESS_CONTEXT.hours, appointments: [] };
  }
}

// Get customer context
async function getCustomerContext(phoneNumber: string): Promise<any> {
  try {
    const customerQuery = await db.collection('customers').where('phone', '==', phoneNumber).limit(1).get();
    
    if (customerQuery.empty) {
      const newCustomer = await db.collection('customers').add({
        phone: phoneNumber,
        name: 'SMS Customer',
        status: 'ai_customer',
        createdAt: new Date().toISOString()
      });
      return { customerId: newCustomer.id, phoneNumber, name: 'SMS Customer' };
    } else {
      const customerData = customerQuery.docs[0].data();
      return { customerId: customerQuery.docs[0].id, ...customerData };
    }
  } catch (error) {
    console.error('Error getting customer context:', error);
    throw error;
  }
}

// Call Gemini AI
async function callGeminiAI(message: string, context: any): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      return generateFallbackResponse(message);
    }

    const systemPrompt = `You are an AI assistant for Bueno Brows beauty salon. 

BUSINESS INFO:
- Name: ${BUSINESS_CONTEXT.name}
- Location: ${BUSINESS_CONTEXT.location}
- Phone: ${BUSINESS_CONTEXT.phone}

SERVICES:
${BUSINESS_CONTEXT.services.map(s => `- ${s.name}: $${s.price} (${s.duration} min)`).join('\n')}

HOURS:
${Object.entries(BUSINESS_CONTEXT.hours).map(([day, hours]) => `- ${day}: ${hours}`).join('\n')}

REAL-TIME DATA:
- Available slots: ${context.availableSlots?.join(', ') || 'Call for availability'}
- Services: ${context.services?.map((s: any) => s.name).join(', ') || 'All services available'}

CUSTOMER: ${context.customer.phoneNumber} (${context.customer.name || 'New customer'})

INSTRUCTIONS:
1. Be friendly and professional
2. Keep responses under 160 characters for SMS
3. Help with appointments, pricing, hours
4. Always end with "- Bueno Brows"
5. If booking, provide clear next steps

Customer message: ${message}`;

    const requestBody = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || generateFallbackResponse(message);
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    return generateFallbackResponse(message);
  }
}

// Generate fallback response
function generateFallbackResponse(message: string): string {
  const text = message.toLowerCase();
  
  if (text.includes('available') || text.includes('open')) {
    return "Hi! We have slots available this week. Call (555) 123-4567 to book. - Bueno Brows";
  }
  
  if (text.includes('price') || text.includes('cost')) {
    return "Services start at $45. Basic Brow $45, Premium $55, Tinting $25. - Bueno Brows";
  }
  
  if (text.includes('hours')) {
    return "Open Tue-Sat 9AM-6PM, Sun 10AM-4PM. Closed Mon. - Bueno Brows";
  }
  
  if (text.includes('book') || text.includes('appointment')) {
    return "To book, call (555) 123-4567 or visit our website. - Bueno Brows";
  }
  
  return "Thanks for contacting Bueno Brows! Call (555) 123-4567 for help. - Bueno Brows";
}

// Send SMS via AWS SNS
async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.log('AWS SNS not configured, logging SMS:', { to: phoneNumber, body: message });
      return true;
    }

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
    console.log('SMS sent via AWS SNS:', result.MessageId);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
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
  { region: 'us-central1', cors: true },
  async (req, res) => {
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
      const aiResponse = await callGeminiAI(body, aiContext);
      
      // Send SMS response
      const smsSent = await sendSMS(from, aiResponse);
      
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
  { region: 'us-central1', cors: true },
  async (req) => {
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
      
      const aiResponse = await callGeminiAI(message, aiContext);
      const smsSent = await sendSMS(phoneNumber, aiResponse);
      
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
