import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sendAppointmentReminderEmail, getEmailTemplate, replaceTemplateVariables } from './email.js';
import { DateTime } from 'luxon';

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

// Calculate time until appointment (smart text) - timezone-aware
function calculateTimeUntilAppointment(appointmentStart: string, timezone: string = 'America/Los_Angeles'): string {
  // Use timezone-aware date calculations with Luxon
  const now = DateTime.now().setZone(timezone);
  
  // Parse appointment start - handle both ISO strings and other formats
  let appointmentTime: DateTime;
  if (appointmentStart.includes('T') || appointmentStart.includes('Z')) {
    // ISO format - assume UTC if no timezone specified
    appointmentTime = DateTime.fromISO(appointmentStart, { zone: 'utc' }).setZone(timezone);
  } else {
    // Try parsing as local time in business timezone
    appointmentTime = DateTime.fromISO(appointmentStart, { zone: timezone });
  }
  
  // Check if appointment is in the past
  if (appointmentTime < now) {
    return 'has passed';
  }
  
  const diffMs = appointmentTime.toMillis() - now.toMillis();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  // Get calendar days difference (timezone-aware) - compare start of day in business timezone
  const nowStartOfDay = now.startOf('day');
  const aptStartOfDay = appointmentTime.startOf('day');
  
  // Calculate days difference by getting the diff duration
  const daysDiff = aptStartOfDay.diff(nowStartOfDay, 'days').toObject().days || 0;
  const daysDiffRounded = Math.round(daysDiff);
  
  console.log(`[Time Calculation Debug] 
    Raw appointmentStart: ${appointmentStart}
    Now (${timezone}): ${now.toISO()} (${now.toLocaleString()})
    Appointment (${timezone}): ${appointmentTime.toISO()} (${appointmentTime.toLocaleString()})
    Now start of day: ${nowStartOfDay.toLocaleString()}
    Apt start of day: ${aptStartOfDay.toLocaleString()}
    DaysDiff (raw): ${daysDiff}
    DaysDiff (rounded): ${daysDiffRounded}
    Diff in hours: ${diffMinutes / 60}`);
  
  // Less than 2 hours away
  if (diffMinutes < 120) {
    if (diffMinutes < 60) {
      return diffMinutes === 0 ? 'now' : `in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`;
    }
    return 'in a few hours';
  }
  
  // Same calendar day (today)
  if (daysDiffRounded === 0) {
    return 'today';
  }
  
  // Tomorrow
  if (daysDiffRounded === 1) {
    return 'tomorrow';
  }
  
  // Within a week
  if (daysDiffRounded < 7) {
    return `in ${daysDiffRounded} days`;
  }
  
  // Exactly a week
  if (daysDiffRounded === 7) {
    return 'in a week';
  }
  
  // More than a week - show days
  return `in ${daysDiffRounded} days`;
}

// Send 7-day reminder
async function send7DayReminder(appointment: any & { id: string }, customer: any & { id: string }): Promise<void> {
  // PREFER EMAIL (low cost) - only use SMS as fallback if no email
  const customerEmail = customer.email;
  const phoneNumber = customer.phone || customer.phoneNumber;
  
  let reminderSent = false;
  
  // Try email first (preferred due to low cost)
  if (customerEmail) {
    try {
      const emailSent = await sendEmailReminder(appointment, customer, '7 days');
      if (emailSent) {
        reminderSent = true;
        console.log(`✅ 7-day reminder sent via EMAIL to ${customerEmail} for appointment ${appointment.id}`);
      } else {
        console.log(`⚠️ Email reminder failed for customer ${customer.id}, will try SMS fallback`);
      }
    } catch (error) {
      console.error(`❌ Failed to send 7-day email reminder, will try SMS fallback:`, error);
    }
  }
  
  // Fallback to SMS only if email failed or doesn't exist
  if (!reminderSent && phoneNumber) {
    // Build reminder message
    const serviceName = getServiceNames(appointment.services);
    const dateTime = formatDateTime(appointment.start);
    const date = formatDate(appointment.start);
    const time = formatTime(appointment.start);
    
    const message = `Hi ${customer.name || 'there'}! 👋

Friendly reminder from ${BUSINESS_NAME}:

📅 Your ${serviceName} appointment is coming up in a week:
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
      reminderSent = true;
      console.log(`✅ 7-day reminder sent via SMS to ${phoneNumber} for appointment ${appointment.id}`);
    }
  }
  
  // Mark reminder as sent if either method succeeded
  if (reminderSent) {
    await db.collection('appointments').doc(appointment.id).update({
      sevenDayReminderSent: true,
      sevenDayReminderSentAt: new Date().toISOString()
    });
  } else {
    console.log(`⚠️ No contact method available for customer ${customer.id}, skipping 7-day reminder`);
  }
}

// Send email reminder
async function sendEmailReminder(
  appointment: any & { id: string },
  customer: any & { id: string },
  reminderType: '7 days' | '24 hours' | '2 hours'
): Promise<boolean> {
  if (!customer.email) {
    console.log(`No email for customer ${customer.id}, skipping email reminder`);
    return false;
  }

  try {
    // Get service details
    const serviceNames: string[] = [];
    if (appointment.serviceIds && Array.isArray(appointment.serviceIds)) {
      const serviceDocs = await Promise.all(
        appointment.serviceIds.map((id: string) => db.collection('services').doc(id).get())
      );
      serviceNames.push(...serviceDocs
        .filter(doc => doc.exists)
        .map(doc => doc.data()?.name || 'Unknown Service')
      );
    } else if (appointment.serviceId) {
      const serviceDoc = await db.collection('services').doc(appointment.serviceId).get();
      if (serviceDoc.exists) {
        serviceNames.push(serviceDoc.data()?.name || 'Unknown Service');
      }
    }
    const serviceName = serviceNames.length > 0 ? serviceNames.join(', ') : 'your service';

    // Get business timezone for accurate date calculations
    const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
    const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
    const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';
    
    // Format date/time
    const appointmentDate = new Date(appointment.start);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: businessTimezone,
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: businessTimezone,
    });
    
    const timeUntilAppointment = calculateTimeUntilAppointment(appointment.start, businessTimezone);
    const duration = appointment.duration || 60;

    // Get business info
    const businessInfo = await db.collection('settings').doc('businessInfo').get();
    const businessData = businessInfo.exists ? businessInfo.data() : {};
    const websiteLink = businessData?.website || 'https://bueno-brows-7cce7.web.app';

    // Try to load custom template
    const customTemplate = await getEmailTemplate('appointment-reminder');
    let htmlContent: string;
    let emailSubject: string;

    if (customTemplate) {
      console.log('✅ Using custom email template for appointment reminder');
      
      const templateVariables: Record<string, string | number> = {
        customerName: customer.name || 'there',
        businessName: businessData?.name || 'Bueno Brows',
        date: formattedDate,
        time: formattedTime,
        serviceName: serviceName,
        duration: duration.toString(),
        timeUntilAppointment: timeUntilAppointment,
        websiteLink: websiteLink,
        businessPhone: businessData?.phone || '(650) 613-8455',
        businessAddress: businessData?.address || '315 9th Ave, San Mateo, CA 94401',
        businessEmail: businessData?.email || 'hello@buenobrows.com',
        bookingLink: 'https://bueno-brows-7cce7.web.app/dashboard'
      };

      htmlContent = replaceTemplateVariables(customTemplate.html, templateVariables);
      emailSubject = replaceTemplateVariables(customTemplate.subject, templateVariables);
    } else {
      // Fallback to function call
      const emailSent = await sendAppointmentReminderEmail(
        customer.email,
        customer.name || 'there',
        {
          serviceName: serviceName,
          date: appointmentDate.toISOString(),
          time: formattedTime
        }
      );
      return emailSent;
    }

    // Send email using SendGrid
    const sgMail = (await import('@sendgrid/mail')).default;
    const { defineString } = await import('firebase-functions/params');
    
    const sendgridApiKey = defineString('SENDGRID_API_KEY');
    const FROM_EMAIL = 'hello@buenobrows.com';
    const FROM_NAME = 'Bueno Brows';

    const apiKey = sendgridApiKey.value();
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      
      const msg = {
        to: customer.email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: emailSubject,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`✅ Reminder email sent to ${customer.email} for appointment ${appointment.id} (${reminderType})`);
      return true;
    } else {
      console.warn('SENDGRID_API_KEY not configured, skipping email reminder');
      return false;
    }
  } catch (error) {
    console.error(`Error sending email reminder (${reminderType}):`, error);
    return false;
  }
}

// Send 24-hour reminder
async function send24HourReminder(appointment: any & { id: string }, customer: any & { id: string }): Promise<void> {
  // PREFER EMAIL (low cost) - only use SMS as fallback if no email
  const customerEmail = customer.email;
  const phoneNumber = customer.phone || customer.phoneNumber;
  
  let reminderSent = false;
  
  // Try email first (preferred due to low cost)
  if (customerEmail) {
    try {
      const emailSent = await sendEmailReminder(appointment, customer, '24 hours');
      if (emailSent) {
        reminderSent = true;
        console.log(`✅ 24-hour reminder sent via EMAIL to ${customerEmail} for appointment ${appointment.id}`);
      } else {
        console.log(`⚠️ Email reminder failed for customer ${customer.id}, will try SMS fallback`);
      }
    } catch (error) {
      console.error(`❌ Failed to send 24-hour email reminder, will try SMS fallback:`, error);
    }
  }
  
  // Fallback to SMS only if email failed or doesn't exist
  if (!reminderSent && phoneNumber) {
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
      reminderSent = true;
      console.log(`✅ 24-hour reminder sent via SMS to ${phoneNumber} for appointment ${appointment.id}`);
    }
  }
  
  // Mark reminder as sent if either method succeeded
  if (reminderSent) {
    await db.collection('appointments').doc(appointment.id).update({
      reminderSent: true,
      reminderSentAt: new Date().toISOString()
    });
  } else {
    console.log(`⚠️ No contact method available for customer ${customer.id}, skipping 24-hour reminder`);
  }
}

// Send same-day reminder (2 hours before)
async function send2HourReminder(appointment: any & { id: string }, customer: any & { id: string }): Promise<void> {
  // PREFER EMAIL (low cost) - only use SMS as fallback if no email
  const customerEmail = customer.email;
  const phoneNumber = customer.phone || customer.phoneNumber;
  
  let reminderSent = false;
  
  // Try email first (preferred due to low cost)
  if (customerEmail) {
    try {
      const emailSent = await sendEmailReminder(appointment, customer, '2 hours');
      if (emailSent) {
        reminderSent = true;
        console.log(`✅ 2-hour reminder sent via EMAIL to ${customerEmail} for appointment ${appointment.id}`);
      } else {
        console.log(`⚠️ Email reminder failed for customer ${customer.id}, will try SMS fallback`);
      }
    } catch (error) {
      console.error(`❌ Failed to send 2-hour email reminder, will try SMS fallback:`, error);
    }
  }
  
  // Fallback to SMS only if email failed or doesn't exist
  if (!reminderSent && phoneNumber) {
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
      reminderSent = true;
      console.log(`✅ 2-hour reminder sent via SMS to ${phoneNumber} for appointment ${appointment.id}`);
    }
  }
  
  // Mark reminder as sent if either method succeeded
  if (reminderSent) {
    await db.collection('appointments').doc(appointment.id).update({
      twoHourReminderSent: true,
      twoHourReminderSentAt: new Date().toISOString()
    });
  } else {
    console.log(`⚠️ No contact method available for customer ${customer.id}, skipping 2-hour reminder`);
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
  console.log('⏰ Running appointment reminder check...');
  const startTime = Date.now();
  
  try {
    const now = new Date();
    
    // Calculate time windows with buffer to catch appointments
    // 7-day reminders: between 6 days 23 hours and 7 days 1 hour from now
    const sevenDaysMin = new Date(now.getTime() + (6 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000));
    const sevenDaysMax = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000) + (1 * 60 * 60 * 1000));
    
    // 24-hour reminders: between 23 hours and 25 hours from now
    const twentyFourHoursMin = new Date(now.getTime() + (23 * 60 * 60 * 1000));
    const twentyFourHoursMax = new Date(now.getTime() + (25 * 60 * 60 * 1000));
    
    // 2-hour reminders: between 1.5 hours and 3 hours from now
    const twoHoursMin = new Date(now.getTime() + (90 * 60 * 1000));
    const twoHoursMax = new Date(now.getTime() + (3 * 60 * 60 * 1000));
    
    console.log(`📅 Time windows:
      - 7-day: ${sevenDaysMin.toISOString()} to ${sevenDaysMax.toISOString()}
      - 24h: ${twentyFourHoursMin.toISOString()} to ${twentyFourHoursMax.toISOString()}
      - 2h: ${twoHoursMin.toISOString()} to ${twoHoursMax.toISOString()}`);
    
    let remindersSent = 0;
    let errors = 0;
    
    // Find appointments for 7-day reminders
    try {
      const appointments7d = await db.collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '>=', sevenDaysMin.toISOString())
        .where('start', '<=', sevenDaysMax.toISOString())
        .get();
      
      console.log(`📧 Found ${appointments7d.size} appointments for 7-day reminders`);
      
      // Send 7-day reminders
      for (const doc of appointments7d.docs) {
        try {
          const appointment: any = { id: doc.id, ...doc.data() };
          
          // Skip if reminder already sent
          if (appointment.sevenDayReminderSent) {
            console.log(`⏭️  7-day reminder already sent for ${appointment.id}`);
            continue;
          }
          
          // Get customer
          const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
          if (!customerDoc.exists) {
            console.log(`⚠️  Customer not found for appointment ${appointment.id}`);
            continue;
          }
          
          const customer: any = { id: customerDoc.id, ...customerDoc.data() };
          
          await send7DayReminder(appointment, customer);
          remindersSent++;
          
          // Add small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          errors++;
          console.error(`❌ Error sending 7-day reminder for appointment ${doc.id}:`, error);
        }
      }
    } catch (error: any) {
      console.error('❌ Error querying 7-day reminders:', error);
      errors++;
    }
    
    // Find appointments for 24-hour reminders
    try {
      const appointments24h = await db.collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '>=', twentyFourHoursMin.toISOString())
        .where('start', '<=', twentyFourHoursMax.toISOString())
        .get();
      
      console.log(`📧 Found ${appointments24h.size} appointments for 24h reminders`);
      
      // Send 24-hour reminders
      for (const doc of appointments24h.docs) {
        try {
          const appointment: any = { id: doc.id, ...doc.data() };
          
          // Skip if reminder already sent
          if (appointment.reminderSent) {
            console.log(`⏭️  24h reminder already sent for ${appointment.id}`);
            continue;
          }
          
          // Get customer
          const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
          if (!customerDoc.exists) {
            console.log(`⚠️  Customer not found for appointment ${appointment.id}`);
            continue;
          }
          
          const customer: any = { id: customerDoc.id, ...customerDoc.data() };
          
          await send24HourReminder(appointment, customer);
          remindersSent++;
          
          // Add small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          errors++;
          console.error(`❌ Error sending 24h reminder for appointment ${doc.id}:`, error);
        }
      }
    } catch (error: any) {
      console.error('❌ Error querying 24h reminders:', error);
      errors++;
    }
    
    // Find appointments for 2-hour reminders
    try {
      const appointments2h = await db.collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '>=', twoHoursMin.toISOString())
        .where('start', '<=', twoHoursMax.toISOString())
        .get();
      
      console.log(`📧 Found ${appointments2h.size} appointments for 2h reminders`);
      
      // Send 2-hour reminders
      for (const doc of appointments2h.docs) {
        try {
          const appointment: any = { id: doc.id, ...doc.data() };
          
          // Skip if 2-hour reminder already sent
          if (appointment.twoHourReminderSent) {
            console.log(`⏭️  2h reminder already sent for ${appointment.id}`);
            continue;
          }
          
          // Get customer
          const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
          if (!customerDoc.exists) {
            console.log(`⚠️  Customer not found for appointment ${appointment.id}`);
            continue;
          }
          
          const customer: any = { id: customerDoc.id, ...customerDoc.data() };
          
          await send2HourReminder(appointment, customer);
          remindersSent++;
          
          // Add small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          errors++;
          console.error(`❌ Error sending 2h reminder for appointment ${doc.id}:`, error);
        }
      }
    } catch (error: any) {
      console.error('❌ Error querying 2h reminders:', error);
      errors++;
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Appointment reminder check complete: ${remindersSent} reminders sent, ${errors} errors (took ${duration}ms)`);
    
    // Log summary to Firestore for monitoring
    try {
      await db.collection('reminder_logs').add({
        timestamp: new Date().toISOString(),
        remindersSent,
        errors,
        duration,
        status: 'success'
      });
    } catch (logError) {
      console.error('Failed to log reminder run:', logError);
    }
    
  } catch (error: any) {
    console.error('❌ Fatal error in sendAppointmentReminders:', error);
    console.error('Stack:', error.stack);
    
    // Log fatal error to Firestore
    try {
      await db.collection('reminder_logs').add({
        timestamp: new Date().toISOString(),
        error: true,
        errorMessage: error.message,
        errorStack: error.stack,
        status: 'failed'
      });
    } catch (logError) {
      // Ignore logging errors
    }
    
    // Re-throw to ensure Firebase knows the function failed
    throw error;
  }
});

// Test function to check reminder system (callable function)
export const testReminderSystem = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    // SECURITY: Require admin role
    const userToken = req.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    try {
      const now = new Date();
      const results: any = {
        timestamp: now.toISOString(),
        upcomingAppointments: [],
        reminderStatus: {
          sevenDay: { count: 0, needsReminder: 0 },
          twentyFourHour: { count: 0, needsReminder: 0 },
          twoHour: { count: 0, needsReminder: 0 }
        }
      };
      
      // Find all confirmed appointments in the next 8 days
      const eightDaysFromNow = new Date(now.getTime() + (8 * 24 * 60 * 60 * 1000));
      const upcomingAppointments = await db.collection('appointments')
        .where('status', '==', 'confirmed')
        .where('start', '>=', now.toISOString())
        .where('start', '<=', eightDaysFromNow.toISOString())
        .orderBy('start', 'asc')
        .limit(50)
        .get();
      
      console.log(`Found ${upcomingAppointments.size} upcoming appointments`);
      
      for (const doc of upcomingAppointments.docs) {
        const appointment: any = { id: doc.id, ...doc.data() };
        const appointmentTime = new Date(appointment.start);
        const timeDiff = appointmentTime.getTime() - now.getTime();
        const hoursUntil = timeDiff / (1000 * 60 * 60);
        const daysUntil = hoursUntil / 24;
        
        const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
        const customer: any = customerDoc.exists ? { id: customerDoc.id, ...customerDoc.data() } : null;
        
        const appointmentInfo: any = {
          appointmentId: appointment.id,
          start: appointment.start,
          hoursUntil: Math.round(hoursUntil * 10) / 10,
          daysUntil: Math.round(daysUntil * 10) / 10,
          customerId: appointment.customerId,
          customerEmail: customer?.email || null,
          customerPhone: customer?.phone || customer?.phoneNumber || null,
          sevenDayReminderSent: appointment.sevenDayReminderSent || false,
          reminderSent: appointment.reminderSent || false,
          twoHourReminderSent: appointment.twoHourReminderSent || false
        };
        
        // Check which reminders are needed
        if (daysUntil >= 6.5 && daysUntil <= 7.5 && !appointment.sevenDayReminderSent) {
          results.reminderStatus.sevenDay.needsReminder++;
          appointmentInfo.needsSevenDayReminder = true;
        }
        if (hoursUntil >= 23 && hoursUntil <= 25 && !appointment.reminderSent) {
          results.reminderStatus.twentyFourHour.needsReminder++;
          appointmentInfo.needsTwentyFourHourReminder = true;
        }
        if (hoursUntil >= 1.5 && hoursUntil <= 3 && !appointment.twoHourReminderSent) {
          results.reminderStatus.twoHour.needsReminder++;
          appointmentInfo.needsTwoHourReminder = true;
        }
        
        results.upcomingAppointments.push(appointmentInfo);
        
        if (daysUntil >= 6.5 && daysUntil <= 7.5) results.reminderStatus.sevenDay.count++;
        if (hoursUntil >= 23 && hoursUntil <= 25) results.reminderStatus.twentyFourHour.count++;
        if (hoursUntil >= 1.5 && hoursUntil <= 3) results.reminderStatus.twoHour.count++;
      }
      
      return results;
    } catch (error: any) {
      console.error('Error testing reminder system:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Error testing reminder system: ${error.message}`);
    }
  }
);

// Manual trigger for sending a reminder (callable function)
export const sendManualReminder = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { appointmentId, reminderType, dryRun } = req.data || {};
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
    
    // reminderType: '7-day' | '24-hour' | '2-hour' | 'auto' (default: 'auto' - determines based on time)
    const type = reminderType || 'auto';
    
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
      
      // Calculate time until appointment
      const now = new Date();
      const appointmentTime = new Date(appointment.start);
      const timeDiff = appointmentTime.getTime() - now.getTime();
      const hoursUntil = timeDiff / (1000 * 60 * 60);
      const daysUntil = hoursUntil / 24;
      
      let reminderFunction: ((appointment: any, customer: any) => Promise<void>) | null = null;
      let selectedType = type;
      
      // Determine which reminder to send
      if (type === 'auto') {
        if (daysUntil >= 6.5 && daysUntil <= 7.5) {
          selectedType = '7-day';
          reminderFunction = send7DayReminder;
        } else if (hoursUntil >= 23 && hoursUntil <= 25) {
          selectedType = '24-hour';
          reminderFunction = send24HourReminder;
        } else if (hoursUntil >= 1.5 && hoursUntil <= 3) {
          selectedType = '2-hour';
          reminderFunction = send2HourReminder;
        } else {
          // Force send based on closest match
          if (daysUntil > 7) {
            selectedType = '7-day';
            reminderFunction = send7DayReminder;
          } else if (hoursUntil > 25) {
            selectedType = '24-hour';
            reminderFunction = send24HourReminder;
          } else {
            selectedType = '2-hour';
            reminderFunction = send2HourReminder;
          }
        }
      } else {
        switch (type) {
          case '7-day':
            reminderFunction = send7DayReminder;
            break;
          case '24-hour':
            reminderFunction = send24HourReminder;
            break;
          case '2-hour':
            reminderFunction = send2HourReminder;
            break;
          default:
            throw new HttpsError('invalid-argument', 'Invalid reminder type. Use: 7-day, 24-hour, or 2-hour');
        }
      }
      
      if (!reminderFunction) {
        throw new HttpsError('internal', 'Could not determine reminder function');
      }
      
      // Dry run mode - just return what would be sent
      if (dryRun) {
        return {
          success: true,
          dryRun: true,
          message: `Would send ${selectedType} reminder`,
          appointmentId,
          appointmentStart: appointment.start,
          hoursUntil: Math.round(hoursUntil * 10) / 10,
          daysUntil: Math.round(daysUntil * 10) / 10,
          reminderType: selectedType,
          customerEmail: customer.email || null,
          customerPhone: customer.phone || customer.phoneNumber || null,
          wouldSendEmail: !!customer.email,
          wouldSendSMS: !customer.email && !!(customer.phone || customer.phoneNumber)
        };
      }
      
      // Actually send the reminder
      await reminderFunction(appointment, customer);
      
      return { 
        success: true, 
        message: `${selectedType} reminder sent successfully`,
        appointmentId,
        reminderType: selectedType,
        customerEmail: customer.email || null,
        customerPhone: customer.phone || customer.phoneNumber || null,
        sentVia: customer.email ? 'email' : (customer.phone || customer.phoneNumber ? 'sms' : 'none')
      };
      
    } catch (error) {
      console.error('Error sending manual reminder:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', 'Error sending reminder');
    }
  }
);

// Force trigger reminder system immediately (for testing)
export const triggerReminderSystem = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    // SECURITY: Require admin role
    const userToken = req.auth?.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    try {
      // This essentially runs the scheduled function logic immediately
      const now = new Date();
      
      // Calculate time windows with buffer
      const sevenDaysMin = new Date(now.getTime() + (6 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000));
      const sevenDaysMax = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000) + (1 * 60 * 60 * 1000));
      const twentyFourHoursMin = new Date(now.getTime() + (23 * 60 * 60 * 1000));
      const twentyFourHoursMax = new Date(now.getTime() + (25 * 60 * 60 * 1000));
      const twoHoursMin = new Date(now.getTime() + (90 * 60 * 1000));
      const twoHoursMax = new Date(now.getTime() + (3 * 60 * 60 * 1000));
      
      const results: any = {
        timestamp: now.toISOString(),
        remindersSent: 0,
        errors: 0,
        details: {
          sevenDay: { found: 0, sent: 0, errors: 0 },
          twentyFourHour: { found: 0, sent: 0, errors: 0 },
          twoHour: { found: 0, sent: 0, errors: 0 }
        }
      };
      
      // 7-day reminders
      try {
        const appointments7d = await db.collection('appointments')
          .where('status', '==', 'confirmed')
          .where('start', '>=', sevenDaysMin.toISOString())
          .where('start', '<=', sevenDaysMax.toISOString())
          .get();
        
        results.details.sevenDay.found = appointments7d.size;
        
        for (const doc of appointments7d.docs) {
          try {
            const appointment: any = { id: doc.id, ...doc.data() };
            if (appointment.sevenDayReminderSent) continue;
            
            const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
            if (!customerDoc.exists) continue;
            
            const customer: any = { id: customerDoc.id, ...customerDoc.data() };
            await send7DayReminder(appointment, customer);
            results.details.sevenDay.sent++;
            results.remindersSent++;
          } catch (error: any) {
            results.details.sevenDay.errors++;
            results.errors++;
            console.error(`Error sending 7-day reminder:`, error);
          }
        }
      } catch (error: any) {
        console.error('Error querying 7-day reminders:', error);
        results.errors++;
      }
      
      // 24-hour reminders
      try {
        const appointments24h = await db.collection('appointments')
          .where('status', '==', 'confirmed')
          .where('start', '>=', twentyFourHoursMin.toISOString())
          .where('start', '<=', twentyFourHoursMax.toISOString())
          .get();
        
        results.details.twentyFourHour.found = appointments24h.size;
        
        for (const doc of appointments24h.docs) {
          try {
            const appointment: any = { id: doc.id, ...doc.data() };
            if (appointment.reminderSent) continue;
            
            const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
            if (!customerDoc.exists) continue;
            
            const customer: any = { id: customerDoc.id, ...customerDoc.data() };
            await send24HourReminder(appointment, customer);
            results.details.twentyFourHour.sent++;
            results.remindersSent++;
          } catch (error: any) {
            results.details.twentyFourHour.errors++;
            results.errors++;
            console.error(`Error sending 24h reminder:`, error);
          }
        }
      } catch (error: any) {
        console.error('Error querying 24h reminders:', error);
        results.errors++;
      }
      
      // 2-hour reminders
      try {
        const appointments2h = await db.collection('appointments')
          .where('status', '==', 'confirmed')
          .where('start', '>=', twoHoursMin.toISOString())
          .where('start', '<=', twoHoursMax.toISOString())
          .get();
        
        results.details.twoHour.found = appointments2h.size;
        
        for (const doc of appointments2h.docs) {
          try {
            const appointment: any = { id: doc.id, ...doc.data() };
            if (appointment.twoHourReminderSent) continue;
            
            const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
            if (!customerDoc.exists) continue;
            
            const customer: any = { id: customerDoc.id, ...customerDoc.data() };
            await send2HourReminder(appointment, customer);
            results.details.twoHour.sent++;
            results.remindersSent++;
          } catch (error: any) {
            results.details.twoHour.errors++;
            results.errors++;
            console.error(`Error sending 2h reminder:`, error);
          }
        }
      } catch (error: any) {
        console.error('Error querying 2h reminders:', error);
        results.errors++;
      }
      
      return results;
      
    } catch (error: any) {
      console.error('Error triggering reminder system:', error);
      if (error instanceof HttpsError) throw error;
      throw new HttpsError('internal', `Error triggering reminder system: ${error.message}`);
    }
  }
);

