// functions/src/send-receipt-sms.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { sendSMS } from './sms.js';

try { initializeApp(); } catch {}
const db = getFirestore();

// Twilio configuration (matching pattern from sms.ts)
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineString('TWILIO_PHONE_NUMBER', { default: '+16506839181' });
const twilioMessagingServiceSid = defineString('TWILIO_MESSAGING_SERVICE_SID', { default: '' });

export const sendReceiptSMS = onCall(
  { 
    region: 'us-central1', 
    cors: true,
    secrets: [twilioAccountSid, twilioAuthToken]
  },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can send receipt SMS');
    }

    const { appointmentId } = req.data;

    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'appointmentId is required');
    }

    try {
      // Get appointment
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }

      const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() } as any;

      // Check if receipt exists
      if (!appointment.receiptUrl) {
        throw new HttpsError('failed-precondition', 'Receipt has not been generated for this appointment. Please generate receipt first.');
      }

      // Get customer details
      const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
      if (!customerDoc.exists) {
        throw new HttpsError('not-found', 'Customer not found');
      }

      const customerData = customerDoc.data();
      const customerPhone = customerData?.phone;
      const customerName = customerData?.name || 'Valued Customer';

      if (!customerPhone) {
        throw new HttpsError('failed-precondition', 'Customer does not have a phone number on file');
      }

      // Get business info
      const businessInfoDoc = await db.collection('settings').doc('businessInfo').get();
      const businessInfoData = businessInfoDoc.exists ? businessInfoDoc.data() : null;
      const businessInfo = businessInfoData || {
        businessName: 'Bueno Brows',
        businessPhone: '(555) 123-4567',
        businessEmail: 'hello@buenobrows.com'
      };

      // Get services data
      const serviceIds = appointment.serviceIds || appointment.selectedServices || [appointment.serviceId];
      const services: any[] = [];
      
      for (const serviceId of serviceIds) {
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        if (serviceDoc.exists) {
          services.push({ id: serviceDoc.id, ...serviceDoc.data() });
        }
      }

      // Calculate total
      const subtotal = appointment.bookedPrice || 0;
      const tip = parseFloat(appointment.tipAmount || appointment.tip || 0) || 0;
      const total = subtotal + tip;

      // Get Twilio config
      const twilioConfig = {
        accountSid: twilioAccountSid.value(),
        authToken: twilioAuthToken.value(),
        phoneNumber: twilioPhoneNumber.value(),
        messagingServiceSid: twilioMessagingServiceSid.value() || undefined
      };

      // Check if Twilio is configured
      if (!twilioConfig.accountSid || !twilioConfig.authToken) {
        throw new HttpsError('failed-precondition', 'Twilio is not configured. Please configure Twilio credentials to send SMS.');
      }

      // Send SMS
      const smsMessage = {
        to: customerPhone,
        from: twilioConfig.phoneNumber || '',
        body: `Thank you for visiting ${businessInfo.businessName || 'Bueno Brows'}! Your receipt is ready: ${appointment.receiptUrl}\n\nTotal: $${total.toFixed(2)}\n\n- Bueno Brows`,
        customerId: appointment.customerId,
        appointmentId: appointmentId,
        type: 'admin_message' as const
      };

      const smsSent = await sendSMS(smsMessage, twilioConfig);

      if (smsSent) {

        // Log SMS attempt
        await db.collection('sms_logs').add({
          to: customerPhone,
          body: smsMessage.body,
          customerId: appointment.customerId,
          appointmentId: appointmentId,
          type: 'receipt',
          status: 'sent',
          timestamp: new Date().toISOString(),
          provider: 'twilio'
        });

        return {
          success: true,
          message: 'Receipt SMS sent successfully',
          phone: customerPhone
        };
      } else {
        console.error('❌ Failed to send receipt SMS to:', customerPhone);
        throw new HttpsError('internal', 'Failed to send SMS. Please check Twilio configuration.');
      }
    } catch (error: any) {
      console.error('⚠️ Error sending receipt SMS:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to send receipt SMS: ${error.message}`);
    }
  }
);


