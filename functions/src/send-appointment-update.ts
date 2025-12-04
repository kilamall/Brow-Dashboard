// Send appointment update notification to customer
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sendAppointmentConfirmationEmail } from './email.js';
import { sendSMS } from './sms.js';
import { defineSecret, defineString } from 'firebase-functions/params';

try { initializeApp(); } catch {}
const db = getFirestore();

// Twilio configuration
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineString('TWILIO_PHONE_NUMBER', { default: '+16506839181' });
const twilioMessagingServiceSid = defineString('TWILIO_MESSAGING_SERVICE_SID', { default: '' });

/**
 * Send appointment update notification
 * Sends email (preferred) or SMS (fallback) to customer when appointment is edited
 */
export const sendAppointmentUpdate = onCall(
  {
    region: 'us-central1',
    cors: true,
    secrets: [twilioAccountSid, twilioAuthToken]
  },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { appointmentId } = req.data;
    
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'Appointment ID is required');
    }

    try {
      // Get appointment
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }
      
      const appointment = appointmentDoc.data() as any;
      
      // Get customer
      const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
      if (!customerDoc.exists) {
        throw new HttpsError('not-found', 'Customer not found');
      }
      
      const customer = customerDoc.data() as any;
      const customerEmail = customer?.email;
      const customerPhone = customer?.phone || customer?.phoneNumber;
      const customerName = customer?.name || 'Valued Customer';
      
      // Get service details
      const serviceIds = appointment.serviceIds || [appointment.serviceId];
      const servicePromises = serviceIds.map((id: string) => 
        db.collection('services').doc(id).get()
      );
      const serviceDocs = await Promise.all(servicePromises);
      const serviceNames = serviceDocs
        .filter(doc => doc.exists)
        .map(doc => doc.data()?.name || 'Service');
      
      // Get business hours for timezone
      const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
      const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
      const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';
      
      // Format appointment time
      const appointmentDate = new Date(appointment.start);
      const time = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: businessTimezone,
      });
      
      let notificationSent = false;
      let method = 'none';
      
      // Try email first (preferred - lower cost)
      if (customerEmail) {
        try {
          const emailSuccess = await sendAppointmentConfirmationEmail(
            customerEmail,
            customerName,
            {
              serviceNames,
              date: appointment.start,
              time,
              duration: appointment.duration || 60,
              price: appointment.bookedPrice || appointment.totalPrice,
              notes: appointment.notes,
              businessTimezone,
            }
          );
          
          if (emailSuccess) {
            notificationSent = true;
            method = 'email';
            console.log(`✅ Appointment update email sent to ${customerEmail}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send update email:', emailError);
        }
      }
      
      // Fallback to SMS if email failed or not available
      if (!notificationSent && customerPhone) {
        try {
          const twilioConfig = {
            accountSid: twilioAccountSid.value(),
            authToken: twilioAuthToken.value(),
            phoneNumber: twilioPhoneNumber.value(),
            messagingServiceSid: twilioMessagingServiceSid.value() || undefined
          };
          
          if (twilioConfig.accountSid && twilioConfig.authToken) {
            const serviceNamesDisplay = serviceNames.join(', ');
            const formattedDate = appointmentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: businessTimezone,
            });
            
            const smsMessage = {
              to: customerPhone,
              from: twilioConfig.phoneNumber || '',
              body: `✨ Appointment Updated!\n\n${serviceNamesDisplay}\n${formattedDate} at ${time}\n\nWe look forward to seeing you!\n\n- Bueno Brows\n(650) 613-8455`,
              customerId: appointment.customerId,
              appointmentId: appointmentId,
              type: 'admin_message' as const
            };
            
            const smsSent = await sendSMS(smsMessage, twilioConfig);
            
            if (smsSent) {
              notificationSent = true;
              method = 'sms';
              console.log(`✅ Appointment update SMS sent to ${customerPhone}`);
            }
          }
        } catch (smsError) {
          console.error('❌ Failed to send update SMS:', smsError);
        }
      }
      
      return {
        success: notificationSent,
        method,
        appointmentId,
        message: notificationSent 
          ? `Appointment update sent via ${method}` 
          : 'Appointment updated but notification could not be sent (no email or phone on file)'
      };
      
    } catch (error: any) {
      console.error('Error sending appointment update:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to send update: ${error.message}`);
    }
  }
);



