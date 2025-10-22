// functions/src/post-service-receipt.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Bueno Brows';
const BUSINESS_PHONE_NUMBER = process.env.BUSINESS_PHONE_NUMBER || '+16506138455';

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

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Send post-service receipt email/SMS
export async function sendPostServiceReceipt(appointmentId: string): Promise<boolean> {
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
    
    // Get service info
    const serviceDoc = await db.collection('services').doc(appointment.serviceId).get();
    
    if (!serviceDoc.exists) {
      console.error('Service not found:', appointment.serviceId);
      return false;
    }
    
    const service: any = { id: serviceDoc.id, ...serviceDoc.data() };
    
    // Calculate totals
    const servicePrice = appointment.bookedPrice || service.price || 0;
    const tipAmount = appointment.tip || 0;
    const totalAmount = servicePrice + tipAmount;
    
    // Build receipt message
    const dateTime = formatDateTime(appointment.start);
    const serviceName = service.name || 'Service';
    
    const message = `Thank you for visiting ${BUSINESS_NAME}! ✨

📅 Service Date: ${dateTime}
💅 Service: ${serviceName}
💰 Service Fee: ${formatCurrency(servicePrice)}${tipAmount > 0 ? `\n💝 Tip: ${formatCurrency(tipAmount)}` : ''}
💳 Total Paid: ${formatCurrency(totalAmount)}

We hope you love your results! 💕

Please consider leaving us a review - it means the world to us!

Questions? Call us at ${BUSINESS_PHONE_NUMBER}

- ${BUSINESS_NAME} Team ✨`;

    // Send via SMS if customer has phone number
    const phoneNumber = customer.phone || customer.phoneNumber;
    if (phoneNumber) {
      try {
        // Use existing SMS infrastructure from appointment-reminders
        const AWS = require('aws-sdk');
        const sns = new AWS.SNS({
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || 'us-east-1'
        });

        const params = {
          Message: message,
          PhoneNumber: phoneNumber
        };

        const result = await sns.publish(params).promise();
        
        // Store SMS in database for tracking
        await db.collection('sms_logs').add({
          to: phoneNumber,
          from: BUSINESS_PHONE_NUMBER,
          body: message,
          customerId: customer.id,
          appointmentId: appointment.id,
          type: 'receipt',
          timestamp: new Date().toISOString(),
          status: 'sent',
          awsMessageId: result.MessageId
        });
        
      } catch (error) {
        console.error('Error sending SMS receipt:', error);
        return false;
      }
    }
    
    // Mark receipt as sent
    await db.collection('appointments').doc(appointmentId).update({
      receiptSent: true,
      receiptSentAt: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending post-service receipt:', error);
    return false;
  }
}
