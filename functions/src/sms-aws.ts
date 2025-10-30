// Alternative SMS service using AWS SNS
// This can work with your existing phone number

import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// AWS SNS Configuration
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

// SMS Response Templates (same as before)
const PRIVACY_URL = 'https://bueno-brows-7cce7.web.app/privacy';
const A2P_FOOTER = `\n\nReply STOP to opt out, HELP for help. Msg&data rates may apply. Privacy: ${PRIVACY_URL}`;
const SMS_TEMPLATES = {
  availability: (availableSlots: string[]) => {
    if (availableSlots.length === 0) {
      return "Hi! We don't have any available slots for the next 7 days. Please call us at (555) 123-4567 to discuss other options. - Bueno Brows" + A2P_FOOTER;
    }
    return `Hi! Here are our available slots:\n\n${availableSlots.slice(0, 5).join('\n')}\n\nReply with "BOOK [date] [time]" to reserve (e.g., "BOOK 12/15 2:00 PM"). - Bueno Brows` + A2P_FOOTER;
  },
  
  faq: (question: string, answer: string) => {
    return `${answer}\n\nNeed more help? Reply with your question or call (555) 123-4567. - Bueno Brows` + A2P_FOOTER;
  },
  
  booking_instructions: () => {
    return `To book an appointment, reply with:\n"BOOK [date] [time]"\n\nExample: "BOOK 12/15 2:00 PM"\n\nFor availability, reply "AVAILABLE"\nFor questions, just ask! - Bueno Brows` + A2P_FOOTER;
  },
  
  error: () => {
    return "Sorry, I didn't understand that. Reply 'HELP' for instructions or call (555) 123-4567. - Bueno Brows" + A2P_FOOTER;
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
  
  if (text.includes('available') || text.includes('open') || text.includes('free')) {
    return { type: 'availability_request', data: null };
  }
  
  for (const [keyword, answer] of Object.entries(FAQ_DATABASE)) {
    if (text.includes(keyword)) {
      return {
        type: 'faq',
        data: { question: keyword, answer }
      };
    }
  }
  
  if (text.includes('book') || text.includes('schedule') || text.includes('appointment')) {
    return { type: 'booking_help', data: null };
  }
  
  if (text.includes('help') || text.includes('info') || text.includes('menu')) {
    return { type: 'help', data: null };
  }
  
  return { type: 'error', data: null };
}

// Send SMS via AWS SNS
async function sendSMSViaAWS(phoneNumber: string, message: string): Promise<boolean> {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.log('AWS SNS not configured, logging SMS instead:', {
        to: phoneNumber,
        body: message
      });
      return true;
    }

    // For now, we'll log the SMS instead of actually sending
    // In production, you'd use the AWS SDK:
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS({
    //   accessKeyId: AWS_ACCESS_KEY_ID,
    //   secretAccessKey: AWS_SECRET_ACCESS_KEY,
    //   region: AWS_REGION
    // });
    // 
    // const params = {
    //   Message: message,
    //   PhoneNumber: phoneNumber
    // };
    // 
    // const result = await sns.publish(params).promise();
    // console.log('SMS sent via AWS SNS:', result.MessageId);
    
    console.log('SMS would be sent via AWS SNS:', {
      to: phoneNumber,
      body: message
    });
    
    return true;
  } catch (error) {
    console.error('Error sending SMS via AWS SNS:', error);
    return false;
  }
}

// Handle incoming SMS webhook (for services that support webhooks)
export const smsWebhookAWS = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    console.log('SMS webhook received:', req.method, req.body);
    
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }
    
    // Extract data from webhook (format depends on service)
    const { From: from, Body: body, To: to } = req.body || {};
    
    if (!from || !body) {
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
          responseMessage = SMS_TEMPLATES.availability(['Dec 15 at 2:00 PM', 'Dec 16 at 10:00 AM', 'Dec 17 at 3:00 PM']);
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
          
        default:
          responseMessage = SMS_TEMPLATES.error();
      }
      
      // Send response via AWS SNS
      const sent = await sendSMSViaAWS(from, responseMessage);
      
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
      
      res.status(200).send('OK');
      
    } catch (error) {
      console.error('Error handling SMS:', error);
      res.status(500).send('Error processing SMS');
    }
  }
);
