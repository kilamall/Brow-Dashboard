import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// AWS SNS configuration
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const BUSINESS_PHONE_NUMBER = process.env.BUSINESS_PHONE_NUMBER || '+16506138455';
const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Bueno Brows';

interface SMSMessage {
  to: string;
  from: string;
  body: string;
  customerId?: string;
  appointmentId?: string;
  type: 'confirmation' | 'reminder' | 'verification';
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

// Format date/time for display
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Format date only
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

// Format time only
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Get service names from appointment
function getServiceNames(services: any[]): string {
  if (!services || services.length === 0) return 'your appointment';
  if (services.length === 1) return services[0].name || 'your service';
  return services.map(s => s.name).join(' + ');
}

// Send 24-hour reminder
async function send24HourReminder(appointment: any & { id: string }, customer: any & { id: string }): Promise<void> {
  const phoneNumber = customer.phone || customer.phoneNumber;
  
  if (!phoneNumber) {
    console.log(`No phone number for customer ${customer.id}, skipping reminder`);
    return;
  }
  
  // Build reminder message
  const serviceName = getServiceNames(appointment.services);
  const dateTime = formatDateTime(appointment.start);
  const date = formatDate(appointment.start);
  const time = formatTime(appointment.start);
  
  const message = `Hi ${customer.name || 'there'}! 👋

This is your friendly reminder from ${BUSINESS_NAME}.

📅 Your ${serviceName} appointment is tomorrow:
${date} at ${time}

We're looking forward to seeing you!

Need to reschedule? Reply or call us at ${BUSINESS_PHONE_NUMBER}.

- ${BUSINESS_NAME} Team ✨`;

  const smsMessage: SMSMessage = {
    to: phoneNumber,
    from: BUSINESS_PHONE_NUMBER,
    body: message,
    customerId: customer.id,
    appointmentId: appointment.id,
    type: 'reminder'
  };
  
  const sent = await sendSMS(smsMessage);
  
  if (sent) {
    // Mark reminder as sent
    await db.collection('appointments').doc(appointment.id).update({
      reminderSent: true,
      reminderSentAt: new Date().toISOString()
    });
    
    console.log(`24h reminder sent to ${phoneNumber} for appointment ${appointment.id}`);
  }
}

// Send same-day reminder (2 hours before)
async function send2HourReminder(appointment: any & { id: string }, customer: any & { id: string }): Promise<void> {
  const phoneNumber = customer.phone || customer.phoneNumber;
  
  if (!phoneNumber) {
    console.log(`No phone number for customer ${customer.id}, skipping reminder`);
    return;
  }
  
  const serviceName = getServiceNames(appointment.services);
  const time = formatTime(appointment.start);
  
  const message = `Quick reminder! Your ${serviceName} appointment at ${BUSINESS_NAME} is in 2 hours (${time}). See you soon! 💕`;

  const smsMessage: SMSMessage = {
    to: phoneNumber,
    from: BUSINESS_PHONE_NUMBER,
    body: message,
    customerId: customer.id,
    appointmentId: appointment.id,
    type: 'reminder'
  };
  
  const sent = await sendSMS(smsMessage);
  
  if (sent) {
    // Mark 2-hour reminder as sent
    await db.collection('appointments').doc(appointment.id).update({
      twoHourReminderSent: true,
      twoHourReminderSentAt: new Date().toISOString()
    });
    
    console.log(`2h reminder sent to ${phoneNumber} for appointment ${appointment.id}`);
  }
}

// Send booking confirmation immediately
export async function sendBookingConfirmation(appointmentId: string): Promise<boolean> {
  try {
    const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
    
    if (!appointmentDoc.exists) {
      console.error('Appointment not found:', appointmentId);
      return false;
    }
    
    const appointment: any = { id: appointmentDoc.id, ...appointmentDoc.data() };
    
    // Get customer info
    const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
    
    if (!customerDoc.exists) {
      console.error('Customer not found:', appointment.customerId);
      return false;
    }
    
    const customer: any = { id: customerDoc.id, ...customerDoc.data() };
    const phoneNumber = customer.phone || customer.phoneNumber;
    
    if (!phoneNumber) {
      console.log('No phone number for customer, skipping confirmation SMS');
      return false;
    }
    
    // Build confirmation message
    const serviceName = getServiceNames(appointment.services);
    const dateTime = formatDateTime(appointment.start);
    const date = formatDate(appointment.start);
    const time = formatTime(appointment.start);
    
    const message = `✅ Booking Confirmed!

Hi ${customer.name || 'there'}, your appointment at ${BUSINESS_NAME} is all set!

📅 ${date}
🕐 ${time}
💅 ${serviceName}

We'll send you a reminder 24 hours before.

Need to reschedule? Reply or call ${BUSINESS_PHONE_NUMBER}.

- ${BUSINESS_NAME} Team ✨`;

    const smsMessage: SMSMessage = {
      to: phoneNumber,
      from: BUSINESS_PHONE_NUMBER,
      body: message,
      customerId: customer.id,
      appointmentId: appointment.id,
      type: 'confirmation'
    };
    
    const sent = await sendSMS(smsMessage);
    
    if (sent) {
      // Mark confirmation as sent
      await db.collection('appointments').doc(appointmentId).update({
        confirmationSent: true,
        confirmationSentAt: new Date().toISOString()
      });
      
      console.log(`Confirmation sent to ${phoneNumber} for appointment ${appointmentId}`);
    }
    
    return sent;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    return false;
  }
}

// Scheduled function - runs every hour to send reminders
export const sendAppointmentReminders = onSchedule({
  schedule: 'every 1 hours',  // Run every hour
  timeZone: 'America/Los_Angeles',  // Adjust to your timezone
  region: 'us-central1'
}, async (event) => {
  console.log('Running appointment reminder check...');
  
  try {
    const now = new Date();
    
    // Calculate time windows
    const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const twentyFiveHoursFromNow = new Date(now.getTime() + (25 * 60 * 60 * 1000));
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));
    const threeHoursFromNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    
    // Find appointments in the next 24-25 hours that haven't been reminded
    const appointments24h = await db.collection('appointments')
      .where('start', '>=', twentyFourHoursFromNow.toISOString())
      .where('start', '<=', twentyFiveHoursFromNow.toISOString())
      .where('status', '==', 'confirmed')
      .get();
    
    console.log(`Found ${appointments24h.size} appointments for 24h reminders`);
    
    // Send 24-hour reminders
    for (const doc of appointments24h.docs) {
      const appointment: any = { id: doc.id, ...doc.data() };
      
      // Skip if reminder already sent
      if (appointment.reminderSent) {
        console.log(`24h reminder already sent for ${appointment.id}`);
        continue;
      }
      
      // Get customer
      const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
      if (!customerDoc.exists) continue;
      
      const customer: any = { id: customerDoc.id, ...customerDoc.data() };
      
      await send24HourReminder(appointment, customer);
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Find appointments in the next 2-3 hours that haven't been reminded
    const appointments2h = await db.collection('appointments')
      .where('start', '>=', twoHoursFromNow.toISOString())
      .where('start', '<=', threeHoursFromNow.toISOString())
      .where('status', '==', 'confirmed')
      .get();
    
    console.log(`Found ${appointments2h.size} appointments for 2h reminders`);
    
    // Send 2-hour reminders
    for (const doc of appointments2h.docs) {
      const appointment: any = { id: doc.id, ...doc.data() };
      
      // Skip if 2-hour reminder already sent
      if (appointment.twoHourReminderSent) {
        console.log(`2h reminder already sent for ${appointment.id}`);
        continue;
      }
      
      // Get customer
      const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
      if (!customerDoc.exists) continue;
      
      const customer: any = { id: customerDoc.id, ...customerDoc.data() };
      
      await send2HourReminder(appointment, customer);
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Appointment reminder check complete');
    
  } catch (error) {
    console.error('Error in sendAppointmentReminders:', error);
  }
});

// Manual trigger for sending a reminder (callable function)
import { onCall, HttpsError } from 'firebase-functions/v2/https';

export const sendManualReminder = onCall(
  { region: 'us-central1', cors: true, enforceAppCheck: true },
  async (req) => {
    const { appointmentId } = req.data || {};
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    // SECURITY: Require admin role
    const userToken = req.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'Missing appointment ID');
    }
    
    try {
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }
      
      const appointment: any = { id: appointmentDoc.id, ...appointmentDoc.data() };
      
      // Get customer
      const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
      
      if (!customerDoc.exists) {
        throw new HttpsError('not-found', 'Customer not found');
      }
      
      const customer: any = { id: customerDoc.id, ...customerDoc.data() };
      
      // Send reminder
      await send24HourReminder(appointment, customer);
      
      return { success: true, message: 'Reminder sent successfully' };
      
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Error sending reminder');
    }
  }
);

