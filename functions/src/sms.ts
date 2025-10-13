import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

try { initializeApp(); } catch {}
const db = getFirestore();

// SMS Service Integration
interface SMSMessage {
  to: string;
  from: string;
  body: string;
  customerId?: string;
  appointmentId?: string;
  type: 'availability' | 'confirmation' | 'reminder' | 'faq' | 'booking' | 'admin_message';
}

interface CustomerSMS {
  phoneNumber: string;
  customerId: string;
  customerName: string;
  lastInteraction: string;
  messageCount: number;
  status: 'active' | 'blocked' | 'unsubscribed';
}

// AWS SNS configuration
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BUSINESS_PHONE_NUMBER = process.env.BUSINESS_PHONE_NUMBER; // Your existing phone number

// SMS Response Templates
const SMS_TEMPLATES = {
  availability: (availableSlots: string[]) => {
    if (availableSlots.length === 0) {
      return "Hi! We don't have any available slots for the next 7 days. Please call us at (555) 123-4567 to discuss other options. - Bueno Brows";
    }
    return `Hi! Here are our available slots:\n\n${availableSlots.slice(0, 5).join('\n')}\n\nReply with "BOOK [date] [time]" to reserve (e.g., "BOOK 12/15 2:00 PM"). - Bueno Brows`;
  },
  
  confirmation: (appointment: any) => {
    return `✅ Confirmed! Your ${appointment.serviceName} appointment is scheduled for ${appointment.date} at ${appointment.time}. We'll send a reminder 24 hours before. - Bueno Brows`;
  },
  
  faq: (question: string, answer: string) => {
    return `${answer}\n\nNeed more help? Reply with your question or call (555) 123-4567. - Bueno Brows`;
  },
  
  booking_instructions: () => {
    return `To book an appointment, reply with:\n"BOOK [date] [time]"\n\nExample: "BOOK 12/15 2:00 PM"\n\nFor availability, reply "AVAILABLE"\nFor questions, just ask! - Bueno Brows`;
  },
  
  error: () => {
    return "Sorry, I didn't understand that. Reply 'HELP' for instructions or call (555) 123-4567. - Bueno Brows";
  }
};

// FAQ Database
const FAQ_DATABASE = {
  'hours': 'We\'re open Tuesday-Saturday 9AM-6PM, Sunday 10AM-4PM. Closed Mondays.',
  'pricing': 'Brow services start at $45. Full pricing: Basic $45, Shaping $55, Tinting $25, Waxing $15. Package deals available!',
  'location': 'We\'re located at 123 Main Street, Downtown. Free parking in the back lot.',
  'cancellation': 'Please give us 24 hours notice for cancellations. Same-day cancellations may incur a fee.',
  'first time': 'Welcome! Your first visit will take about 60-90 minutes. We\'ll discuss your goals and create a custom plan.',
  'aftercare': 'Avoid touching brows for 24 hours. No makeup, swimming, or sweating for 24 hours. Use provided aftercare products.',
  'how long': 'Most appointments take 60-90 minutes. Touch-ups are 30-45 minutes.',
  'pain': 'Most clients find it very comfortable. We use numbing cream and gentle techniques.',
  'results': 'Results last 4-6 weeks. Touch-ups recommended every 4-6 weeks for best results.',
  'payment': 'We accept cash, credit cards, and Venmo. Payment is due at time of service.'
};

// Parse incoming SMS and determine response
function parseSMSMessage(message: string): { type: string; data: any } {
  const text = message.toLowerCase().trim();
  
  // Check for booking requests
  if (text.includes('book') || text.includes('schedule') || text.includes('appointment')) {
    const dateMatch = text.match(/(\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|\d{1,2}\s+\d{1,2})/);
    const timeMatch = text.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))/i);
    
    if (dateMatch && timeMatch) {
      return {
        type: 'booking_request',
        data: {
          date: dateMatch[1],
          time: timeMatch[0]
        }
      };
    }
    return { type: 'booking_help', data: null };
  }
  
  // Check for availability requests
  if (text.includes('available') || text.includes('open') || text.includes('free')) {
    return { type: 'availability_request', data: null };
  }
  
  // Check for FAQ questions
  for (const [keyword, answer] of Object.entries(FAQ_DATABASE)) {
    if (text.includes(keyword)) {
      return {
        type: 'faq',
        data: { question: keyword, answer }
      };
    }
  }
  
  // Check for help requests
  if (text.includes('help') || text.includes('info') || text.includes('menu')) {
    return { type: 'help', data: null };
  }
  
  // Default to error
  return { type: 'error', data: null };
}

// Get available appointment slots
async function getAvailableSlots(days: number = 7): Promise<string[]> {
  try {
    // Get business hours
    const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
    const businessHours = businessHoursDoc.data();
    
    if (!businessHours) {
      return ['Please call (555) 123-4567 for availability'];
    }
    
    // Get existing appointments for the next 7 days
    const now = new Date();
    const endDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const appointmentsQuery = db.collection('appointments')
      .where('start', '>=', now.toISOString())
      .where('start', '<=', endDate.toISOString())
      .where('status', 'in', ['confirmed', 'pending']);
    
    const appointments = await appointmentsQuery.get();
    const existingAppointments = appointments.docs.map(doc => ({
      start: doc.data().start,
      duration: doc.data().duration || 60
    }));
    
    // Get available services
    const servicesQuery = db.collection('services').where('active', '==', true);
    const services = await servicesQuery.get();
    const availableServices = services.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      duration: doc.data().duration || 60,
      price: doc.data().price
    }));
    
    // Generate available slots (simplified logic)
    const availableSlots: string[] = [];
    const currentDate = new Date();
    
    for (let i = 1; i <= days; i++) {
      const checkDate = new Date(currentDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dayOfWeek = checkDate.getDay();
      
      // Skip if closed (assuming closed on Mondays, day 1)
      if (dayOfWeek === 1) continue;
      
      // Generate time slots (9 AM to 5 PM, every hour)
      for (let hour = 9; hour <= 17; hour++) {
        const slotTime = new Date(checkDate);
        slotTime.setHours(hour, 0, 0, 0);
        
        // Check if slot is available
        const slotEnd = new Date(slotTime.getTime() + (60 * 60 * 1000)); // 1 hour duration
        
        const isConflict = existingAppointments.some(apt => {
          const aptStart = new Date(apt.start);
          const aptEnd = new Date(aptStart.getTime() + (apt.duration * 60 * 1000));
          return (slotTime < aptEnd && slotEnd > aptStart);
        });
        
        if (!isConflict) {
          const dateStr = checkDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          const timeStr = slotTime.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          availableSlots.push(`${dateStr} at ${timeStr}`);
        }
      }
    }
    
    return availableSlots.slice(0, 10); // Limit to 10 slots
  } catch (error) {
    console.error('Error getting available slots:', error);
    return ['Please call (555) 123-4567 for availability'];
  }
}

// Send SMS via AWS SNS
async function sendSMS(message: SMSMessage): Promise<boolean> {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.log('AWS SNS not configured, logging SMS instead:', {
        to: message.to,
        body: message.body
      });
      
      // Store SMS in database for tracking
      await db.collection('sms_logs').add({
        ...message,
        timestamp: new Date().toISOString(),
        status: 'logged_only'
      });
      
      return true;
    }

    // Use AWS SDK to send SMS
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION
    });

    const params = {
      Message: message.body,
      PhoneNumber: message.to
    };

    const result = await sns.publish(params).promise();
    console.log('SMS sent via AWS SNS:', result.MessageId);
    
    // Store SMS in database for tracking
    await db.collection('sms_logs').add({
      ...message,
      timestamp: new Date().toISOString(),
      status: 'sent',
      awsMessageId: result.MessageId
    });
    
    return true;
  } catch (error) {
    console.error('Error sending SMS via AWS SNS:', error);
    
    // Store failed SMS attempt
    await db.collection('sms_logs').add({
      ...message,
      timestamp: new Date().toISOString(),
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    });
    
    return false;
  }
}

// Handle incoming SMS webhook (HTTP function for Twilio)
export const smsWebhook = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    console.log('SMS webhook received:', req.method, req.body);
    
    // Only accept POST requests
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      res.status(405).send('Method not allowed');
      return;
    }
    
    // Extract data from Twilio webhook
    const { From: from, Body: body, To: to } = req.body || {};
    
    if (!from || !body) {
      console.error('Missing required fields:', { from, body, to });
      res.status(400).send('Missing required fields');
      return;
    }
    
    console.log('Processing SMS:', { from, body, to });
    
    try {
      // Parse the incoming message
      const parsed = parseSMSMessage(body);
      
      // Get or create customer record
      let customer = await db.collection('customers').where('phone', '==', from).limit(1).get();
      let customerId: string;
      
      if (customer.empty) {
        // Create new customer
        const newCustomer = await db.collection('customers').add({
          phone: from,
          name: 'SMS Customer',
          email: null,
          status: 'sms_customer',
          createdAt: new Date().toISOString(),
          smsOptIn: true
        });
        customerId = newCustomer.id;
      } else {
        customerId = customer.docs[0].id;
      }
      
      // Store incoming message
      await db.collection('sms_conversations').add({
        customerId,
        phoneNumber: from,
        message: body,
        direction: 'inbound',
        timestamp: new Date().toISOString(),
        parsedType: parsed.type
      });
      
      let responseMessage = '';
      
      // Generate response based on parsed message
      switch (parsed.type) {
        case 'availability_request':
          const availableSlots = await getAvailableSlots();
          responseMessage = SMS_TEMPLATES.availability(availableSlots);
          break;
          
        case 'faq':
          responseMessage = SMS_TEMPLATES.faq(parsed.data.question, parsed.data.answer);
          break;
          
        case 'booking_help':
          responseMessage = SMS_TEMPLATES.booking_instructions();
          break;
          
        case 'help':
          responseMessage = SMS_TEMPLATES.booking_instructions();
          break;
          
        case 'booking_request':
          // For now, provide instructions for booking
          responseMessage = "To complete your booking, please call us at (555) 123-4567 or visit our website. We'll need to confirm your details. - Bueno Brows";
          break;
          
        default:
          responseMessage = SMS_TEMPLATES.error();
      }
      
      // Send response
      const smsMessage: SMSMessage = {
        to: from,
        from: to || BUSINESS_PHONE_NUMBER || '+15551234567',
        body: responseMessage,
        customerId,
        type: parsed.type as any
      };
      
      const sent = await sendSMS(smsMessage);
      
      // Store outgoing message
      if (sent) {
        await db.collection('sms_conversations').add({
          customerId,
          phoneNumber: from,
          message: responseMessage,
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          messageType: parsed.type
        });
      }
      
      // Send simple response (AWS SNS doesn't use TwiML)
      res.status(200).json({
        success: true,
        response: responseMessage,
        message: 'SMS processed successfully'
      });
      
    } catch (error) {
      console.error('Error handling SMS:', error);
      res.status(500).send('Error processing SMS');
    }
  }
);

// Send SMS to customer (admin function)
export const sendSMSToCustomer = onCall(
  { region: 'us-central1', cors: true, enforceAppCheck: true },
  async (req) => {
    const { phoneNumber, message, customerId } = req.data || {};
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    if (!phoneNumber || !message) {
      throw new HttpsError('invalid-argument', 'Missing phone number or message');
    }
    
    try {
      const smsMessage: SMSMessage = {
        to: phoneNumber,
        from: BUSINESS_PHONE_NUMBER || '+15551234567',
        body: message,
        customerId,
        type: 'admin_message'
      };
      
      const sent = await sendSMS(smsMessage);
      
      if (sent) {
        // Store in conversation log
        await db.collection('sms_conversations').add({
          customerId,
          phoneNumber,
          message,
          direction: 'outbound',
          timestamp: new Date().toISOString(),
          messageType: 'admin_message',
          sentBy: userId
        });
      }
      
      return { success: sent };
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new HttpsError('internal', 'Error sending SMS');
    }
  }
);

// Test SMS function (for testing AWS SNS)
export const testSMS = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { phoneNumber, message } = req.data || {};
    
    if (!phoneNumber || !message) {
      throw new HttpsError('invalid-argument', 'Missing phone number or message');
    }
    
    try {
      const smsMessage: SMSMessage = {
        to: phoneNumber,
        from: BUSINESS_PHONE_NUMBER || '+15551234567',
        body: message,
        type: 'admin_message'
      };
      
      const sent = await sendSMS(smsMessage);
      return { success: sent, message: 'Test SMS sent' };
      
    } catch (error) {
      console.error('Error sending test SMS:', error);
      throw new HttpsError('internal', 'Error sending test SMS');
    }
  }
);

// Get SMS conversation history
export const getSMSConversation = onCall(
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
      const conversationQuery = db.collection('sms_conversations')
        .where('customerId', '==', customerId)
        .orderBy('timestamp', 'desc')
        .limit(50);
      
      const conversation = await conversationQuery.get();
      const messages = conversation.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { messages };
      
    } catch (error) {
      console.error('Error getting SMS conversation:', error);
      throw new HttpsError('internal', 'Error getting conversation');
    }
  }
);
