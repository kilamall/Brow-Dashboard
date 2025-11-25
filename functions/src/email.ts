import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineString } from 'firebase-functions/params';
import sgMail from '@sendgrid/mail';

try { initializeApp(); } catch {}
const db = getFirestore();

// Define SendGrid API key as a parameter (will use value from firebase functions:config)
const sendgridApiKey = defineString('SENDGRID_API_KEY', {
  description: 'SendGrid API key for sending emails',
  default: ''
});

const FROM_EMAIL = 'hello@buenobrows.com';
const FROM_NAME = 'Bueno Brows';

// Helper function to load email template from Firestore
export async function getEmailTemplate(templateId: string): Promise<{ subject: string; html: string; variables: string[] } | null> {
  try {
    const templatesDoc = await db.collection('settings').doc('emailTemplates').get();
    if (!templatesDoc.exists) {
      console.warn(`⚠️ Email templates not found in Firestore for template: ${templateId}`);
      return null;
    }
    
    const templatesData = templatesDoc.data();
    const templates = templatesData?.templates || [];
    
    const template = templates.find((t: any) => t.id === templateId);
    if (!template) {
      console.warn(`⚠️ Template ${templateId} not found in Firestore`);
      return null;
    }
    
    return {
      subject: template.subject,
      html: template.html,
      variables: template.variables || []
    };
  } catch (error) {
    console.error(`❌ Error loading email template ${templateId}:`, error);
    return null;
  }
}

// Helper function to replace template variables
export function replaceTemplateVariables(template: string, variables: Record<string, string | number>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value));
  });
  return result;
}

// Helper to initialize SendGrid
export function initSendGrid(): boolean {
  const apiKey = sendgridApiKey.value();
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid initialized');
    return true;
  } else {
    console.warn('⚠️ SENDGRID_API_KEY not set - email notifications will not be sent');
    return false;
  }
}

/**
 * Generic function to send email using SendGrid
 */
export async function sendEmail(msg: {
  to: string;
  from: { email: string; name: string };
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string; sendGridResponse?: any }> {
  if (!initSendGrid()) {
    const errorMsg = 'Cannot send email: SENDGRID_API_KEY not configured';
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  // Validate email address
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(msg.to)) {
    const errorMsg = `Invalid email address: ${msg.to}`;
    console.error('❌', errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', msg.to);
    console.log('📧 SendGrid response status:', response[0]?.statusCode);
    return { success: true, sendGridResponse: response };
  } catch (error: any) {
    console.error('❌ Error sending email to:', msg.to);
    console.error('❌ Error details:', error);
    
    // Extract detailed error information
    let errorMessage = error.message || 'Unknown error';
    let errorDetails: any = {};
    
    if (error.response) {
      errorDetails = {
        statusCode: error.response.statusCode,
        body: error.response.body,
        headers: error.response.headers
      };
      console.error('📧 SendGrid error response:', JSON.stringify(error.response.body, null, 2));
      console.error('📧 SendGrid error status:', error.response.statusCode);
      
      // Extract specific error messages from SendGrid
      if (error.response.body?.errors) {
        const sendGridErrors = error.response.body.errors.map((e: any) => e.message).join('; ');
        errorMessage = `SendGrid: ${sendGridErrors}`;
      }
    }
    
    return { 
      success: false, 
      error: errorMessage,
      sendGridResponse: errorDetails
    };
  }
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmationEmail(
  customerEmail: string,
  customerName: string,
  appointmentDetails: {
    serviceNames: string[]; // Array of service names for multi-service support
    date: string;
    time: string;
    duration: number;
    price?: number;
    notes?: string;
    businessTimezone?: string;
  }
): Promise<boolean> {
  // Initialize SendGrid
  if (!initSendGrid()) {
    console.error('Cannot send email: SENDGRID_API_KEY not configured');
    return false;
  }

  if (!customerEmail) {
    console.error('Cannot send email: customer email is missing');
    return false;
  }

  const { serviceNames, date, time, duration, price, notes } = appointmentDetails;
  const serviceNamesDisplay = serviceNames.join(', ');

  // Format the appointment date/time nicely with proper timezone
  const appointmentDate = new Date(date);
  const businessTimezone = appointmentDetails.businessTimezone || 'America/Los_Angeles';
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: businessTimezone,
  });

  // Try to load custom template from Firestore
  let htmlContent: string;
  let emailSubject: string;
  
  const customTemplate = await getEmailTemplate('appointment-confirmation');
  
  if (customTemplate) {
    // Use custom template from admin settings
    console.log('✅ Using custom email template for appointment confirmation');
    
    const businessInfo = await db.collection('settings').doc('businessInfo').get();
    const businessData = businessInfo.exists ? businessInfo.data() : {};
    
    const notesSection = notes 
      ? `<div style="background: #3a3a3a; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #ffffff;"><strong>Note:</strong> ${notes}</div>`
      : '';
    
    const websiteLink = businessData?.website || 'https://bueno-brows-7cce7.web.app';
    
    const templateVariables: Record<string, string | number> = {
      customerName: customerName,
      businessName: businessData?.name || 'Bueno Brows',
      date: formattedDate,
      time: time,
      serviceName: serviceNamesDisplay,
      duration: duration.toString(),
      notes: notes || '',
      notesSection: notesSection,
      businessPhone: businessData?.phone || '(650) 613-8455',
      businessEmail: businessData?.email || 'hello@buenobrows.com',
      websiteLink: websiteLink,
      bookingLink: 'https://bueno-brows-7cce7.web.app/dashboard'
    };
    
    htmlContent = replaceTemplateVariables(customTemplate.html, templateVariables);
    emailSubject = replaceTemplateVariables(customTemplate.subject, templateVariables);
  } else {
    // Fallback to hardcoded template
    console.log('⚠️ Using default hardcoded email template (no custom template found)');
    htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }
    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }
    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #FFC107; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>✨ Appointment Confirmed!</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi ${customerName},</p>
      <p>Great news! Your appointment at <strong style="color: #FFC107;">Bueno Brows</strong> has been confirmed.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Service${serviceNames.length > 1 ? 's' : ''}:</span>
          <span class="detail-value" style="text-align: right; line-height: 1.8;">${serviceNames.map(name => `<div>${name}</div>`).join('')}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${time}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Duration:</span>
          <span class="detail-value">${duration} minutes</span>
        </div>
      </div>
      ${notes ? `<div style="background: #3a3a3a; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px; color: #ffffff;"><strong>Note:</strong> ${notes}</div>` : ''}
      <div style="background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #FFC107;">
        <p style="margin: 0 0 12px 0; color: #FFC107; font-weight: 600; font-size: 16px;">💳 Accepted Payment Methods:</p>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px;">
          <span style="background-color: #4a4a4a; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;">Cash</span>
          <span style="background-color: #4a4a4a; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;">Zelle</span>
          <span style="background-color: #4a4a4a; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;">Venmo</span>
          <span style="background-color: #4a4a4a; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 500;">Apple Cash</span>
        </div>
      </div>
      <div style="text-align: center;"><a href="https://bueno-brows-7cce7.web.app/dashboard" class="cta-button">Manage Your Booking</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to reschedule or cancel? Please call us at (650) 613-8455</p>
    </div>
    <div class="footer">
      <p><strong style="color: #FFC107;"><a href="https://bueno-brows-7cce7.web.app" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="https://bueno-brows-7cce7.web.app" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>`;
    emailSubject = `✨ Appointment Confirmed - ${serviceNamesDisplay} on ${formattedDate}`;
  }

  const textContent = `
Appointment Confirmed!

Hi ${customerName},

Your appointment at Bueno Brows has been confirmed.

APPOINTMENT DETAILS:
Service${serviceNames.length > 1 ? 's' : ''}: ${serviceNamesDisplay}
Date: ${formattedDate}
Time: ${time}
Duration: ${duration} minutes
${price ? `Price: $${price.toFixed(2)}` : ''}

${notes ? `Note: ${notes}` : ''}

Need to reschedule or cancel? Please call us at (650) 613-8455

Bueno Brows
📍 315 9th Ave, San Mateo, CA 94401
📞 Phone: (650) 613-8455
✉️ Email: hello@buenobrows.com
🌐 Website: https://buenobrows.com

Filipino-inspired beauty studio specializing in brows & lashes
  `.trim();

  const msg = {
    to: customerEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: emailSubject,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Confirmation email sent to ${customerEmail}`);
    
    // Log email in database
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_confirmation',
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    
    // Log failed email attempt
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_confirmation',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return false;
  }
}

/**
 * Send appointment cancellation email
 */
export async function sendAppointmentCancellationEmail(
  customerEmail: string,
  customerName: string,
  appointmentDetails: {
    serviceName: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
    notes?: string;
    businessTimezone?: string;
    cancelledBy?: 'customer' | 'admin';
    cancellationReason?: string;
  }
): Promise<boolean> {
  if (!initSendGrid() || !customerEmail) return false;

  const { serviceName, date, time, duration, price, notes, cancelledBy, cancellationReason } = appointmentDetails;
  
  // Format the appointment date/time nicely with proper timezone
  const appointmentDate = new Date(date);
  const businessTimezone = appointmentDetails.businessTimezone || 'America/Los_Angeles';
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: businessTimezone,
  });

  const cancelledByText = cancelledBy === 'customer' ? 'you' : 'our team';
  const cancellationTitle = cancelledBy === 'customer' ? 'Appointment Cancelled' : 'Appointment Cancelled by Admin';

  // Create email content
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .header-banner { background-color: #dc2626; padding: 40px 20px; text-align: center; }
    .header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 1px; }
    .header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #ffffff; }
    .content { background-color: #2a2a2a; padding: 30px 20px; color: #ffffff; }
    .greeting { margin: 0 0 15px 0; font-size: 16px; }
    .appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }
    .appointment-row:last-child { border-bottom: none; }
    .detail-label { color: #fca5a5; font-weight: 500; }
    .detail-value { color: #ffffff; font-weight: 600; }
    .cta-button { display: inline-block; background-color: #dc2626; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }
    .footer { background-color: #1a1a1a; padding: 30px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header-banner">
      <h1>BUENO BROWS</h1>
      <h2>❌ ${cancellationTitle}</h2>
    </div>
    <div class="content">
      <p class="greeting">Hi ${customerName},</p>
      <p>We're writing to inform you that your appointment at <strong>Bueno Brows</strong> has been cancelled by ${cancelledByText}.</p>
      <div class="appointment-card">
        <div class="appointment-row">
          <span class="detail-label">Service:</span>
          <span class="detail-value">${serviceName}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="appointment-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${time}</span>
        </div>
      </div>
      ${cancellationReason ? `<div style="background: #3a3a3a; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px; color: #ffffff;"><strong>Reason for cancellation:</strong><br>${cancellationReason}</div>` : ''}
      <p style="margin-top: 20px;">We apologize for any inconvenience. Please contact us at (650) 766-3918 to reschedule your appointment.</p>
      <div style="text-align: center;"><a href="https://bueno-brows-7cce7.web.app/dashboard" class="cta-button">Book a New Appointment</a></div>
      <p style="margin-top: 20px; font-size: 14px; color: #aaa;">Need to reschedule? We'd love to help you find a new time that works for you.</p>
    </div>
    <div class="footer">
      <p><strong style="color: #dc2626;"><a href="https://bueno-brows-7cce7.web.app" style="color: #dc2626; text-decoration: none;">Bueno Brows</a></strong></p>
      <p>📍 315 9th Ave, San Mateo, CA 94401</p>
      <p>📞 (650) 613-8455</p>
      <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
      <p style="margin-top: 10px;"><a href="https://bueno-brows-7cce7.web.app" style="color: #dc2626; text-decoration: underline;">Visit our website</a></p>
    </div>
  </div>
</body>
</html>`;

  const textContent = `
Appointment Cancelled - Bueno Brows

Hi ${customerName},

We're writing to inform you that your appointment at Bueno Brows has been cancelled by ${cancelledByText}.

APPOINTMENT DETAILS:
Service: ${serviceName}
Date: ${formattedDate}
Time: ${time}
Duration: ${duration} minutes
${price ? `Price: $${price.toFixed(2)}` : ''}

${cancellationReason ? `Reason for cancellation: ${cancellationReason}` : ''}

${notes ? `Original Notes: ${notes}` : ''}

Need to reschedule? We'd love to help you find a new time that works for you.

Bueno Brows
📍 315 9th Ave, San Mateo, CA 94401
📞 Phone: (650) 766-3918
✉️ Email: hello@buenobrows.com
🌐 Website: https://buenobrows.com

Filipino-inspired beauty studio specializing in brows & lashes
  `.trim();

  const msg = {
    to: customerEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `❌ Appointment Cancelled - ${serviceName} on ${formattedDate}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Cancellation email sent to ${customerEmail}`);
    
    // Log email in database
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_cancellation',
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error);
    
    // Log failed email attempt
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_cancellation',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return false;
  }
}

/**
 * Send appointment completion/attendance email
 */
export async function sendAppointmentCompletionEmail(
  customerEmail: string,
  customerName: string,
  appointmentDetails: {
    serviceName: string;
    date: string;
    time: string;
    duration: number;
    actualPrice?: number;
    tipAmount?: number;
    notes?: string;
    businessTimezone?: string;
  }
): Promise<boolean> {
  if (!initSendGrid() || !customerEmail) return false;

  const { serviceName, date, time, duration, actualPrice, tipAmount, notes } = appointmentDetails;
  
  // Format the appointment date/time nicely with proper timezone
  const appointmentDate = new Date(date);
  const businessTimezone = appointmentDetails.businessTimezone || 'America/Los_Angeles';
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: businessTimezone,
  });

  const totalAmount = (actualPrice || 0) + (tipAmount || 0);

  // Create email content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        /* Base styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #FAF6EF;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          padding: 40px 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .logo {
          margin-bottom: 15px;
        }
        .logo-bueno {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff !important;
          letter-spacing: 1px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .logo-brows {
          font-size: 32px;
          font-weight: 600;
          color: #ffffff !important;
          letter-spacing: 1px;
          margin-left: 8px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header-title {
          margin: 15px 0 0 0;
          font-size: 24px;
          color: #ffffff !important;
          font-weight: 700;
          text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 2px solid #10b981;
          border-top: none;
        }
        .appointment-details {
          background: #ecfdf5;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #a7f3d0;
          box-shadow: 0 10px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
        }
        .detail-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #d1fae5;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          width: 140px;
          color: #059669;
        }
        .detail-value {
          color: #4a4a4a;
        }
        .footer {
          background: #FAF6EF;
          padding: 20px 30px;
          border: 2px solid #10b981;
          border-top: none;
          border-radius: 0 0 10px 10px;
          text-align: center;
          color: #4a4a4a;
          font-size: 14px;
        }
        .footer-text {
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          border: 3px solid #10b981;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          letter-spacing: 0.5px;
        }
        .button:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .note {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff;
          }
          .content {
            background: #2a2a2a;
            border-color: #059669;
            color: #e0e0e0;
          }
          .appointment-details {
            background: #1f1f1f;
            border-color: #059669;
          }
          .detail-row {
            border-bottom-color: #3a3a3a;
          }
          .detail-label {
            color: #6ee7b7;
          }
          .detail-value {
            color: #d0d0d0;
          }
          .footer {
            background: #1a1a1a;
            border-color: #059669;
            color: #d0d0d0;
          }
          .footer-text {
            color: #a0a0a0;
          }
          .button {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            border-color: #059669;
          }
          .note {
            background: #1f1f1f;
            border-left-color: #6ee7b7;
            color: #e0e0e0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <span class="logo-bueno">BUENO</span>
          <span class="logo-brows">BROWS</span>
        </div>
        <h1 class="header-title">✅ Thank You for Your Visit!</h1>
      </div>
      
      <div class="content">
        <p>Hi ${customerName},</p>
        
        <p>Thank you for visiting <strong>Bueno Brows</strong> today! We hope you enjoyed your experience.</p>
        
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">Service:</div>
            <div class="detail-value"><strong>${serviceName}</strong></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">${formattedDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">${time}</div>
          </div>
          ${actualPrice ? `
          <div class="detail-row">
            <div class="detail-label">Service Price:</div>
            <div class="detail-value">$${actualPrice.toFixed(2)}</div>
          </div>
          ` : ''}
          ${tipAmount ? `
          <div class="detail-row">
            <div class="detail-label">Tip:</div>
            <div class="detail-value">$${tipAmount.toFixed(2)}</div>
          </div>
          ` : ''}
          ${totalAmount > 0 ? `
          <div class="detail-row">
            <div class="detail-label"><strong>Total:</strong></div>
            <div class="detail-value"><strong>$${totalAmount.toFixed(2)}</strong></div>
          </div>
          ` : ''}
        </div>

        ${notes ? `
        <div class="note">
          <strong>Service Notes:</strong><br>
          ${notes}
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="https://buenobrows.com" class="button">Book Your Next Appointment</a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          <strong>We'd love to see you again!</strong><br>
          Thank you for choosing Bueno Brows. We appreciate your business.
        </p>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 10px 0;">
          <span class="logo-bueno" style="font-size: 18px;">BUENO</span>
          <span class="logo-brows" style="font-size: 18px; margin-left: 4px;">BROWS</span>
        </p>
        <p style="margin: 5px 0;">📍 315 9th Ave, San Mateo, CA 94401</p>
        <p style="margin: 5px 0;">📞 Phone: <a href="tel:+16507663918" style="color: #10b981; text-decoration: none;">(650) 766-3918</a></p>
        <p style="margin: 5px 0;">✉️ Email: hello@buenobrows.com</p>
        <p style="margin: 5px 0;">🌐 Website: <a href="https://buenobrows.com" style="color: #10b981; text-decoration: none;">buenobrows.com</a></p>
        <p class="footer-text" style="margin: 15px 0 0 0; font-size: 12px;">
          You're receiving this email because you visited us today.<br>
          <strong>Bueno Brows</strong> - Filipino-inspired beauty studio specializing in brows & lashes
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Thank You for Your Visit!

Hi ${customerName},

Thank you for visiting Bueno Brows today! We hope you enjoyed your experience.

VISIT DETAILS:
Service: ${serviceName}
Date: ${formattedDate}
Time: ${time}
${actualPrice ? `Service Price: $${actualPrice.toFixed(2)}` : ''}
${tipAmount ? `Tip: $${tipAmount.toFixed(2)}` : ''}
${totalAmount > 0 ? `Total: $${totalAmount.toFixed(2)}` : ''}

${notes ? `Service Notes: ${notes}` : ''}

We'd love to see you again! Thank you for choosing Bueno Brows.

Bueno Brows
📍 315 9th Ave, San Mateo, CA 94401
📞 Phone: (650) 766-3918
✉️ Email: hello@buenobrows.com
🌐 Website: https://buenobrows.com

Filipino-inspired beauty studio specializing in brows & lashes
  `.trim();

  const msg = {
    to: customerEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `✅ Thank you for your visit - ${serviceName}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Completion email sent to ${customerEmail}`);
    
    // Log email in database
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_completion',
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending completion email:', error);
    
    // Log failed email attempt
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_completion',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return false;
  }
}

/**
 * Send appointment no-show notification email
 */
export async function sendAppointmentNoShowEmail(
  customerEmail: string,
  customerName: string,
  appointmentDetails: {
    serviceName: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
    businessTimezone?: string;
  }
): Promise<boolean> {
  if (!initSendGrid() || !customerEmail) return false;

  const { serviceName, date, time, duration, price } = appointmentDetails;
  
  // Format the appointment date/time nicely with proper timezone
  const appointmentDate = new Date(date);
  const businessTimezone = appointmentDetails.businessTimezone || 'America/Los_Angeles';
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: businessTimezone,
  });

  // Create email content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        /* Base styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #FAF6EF;
        }
        .header {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          padding: 40px 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        .logo {
          margin-bottom: 15px;
        }
        .logo-bueno {
          font-size: 32px;
          font-weight: 700;
          color: #ffffff !important;
          letter-spacing: 1px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .logo-brows {
          font-size: 32px;
          font-weight: 600;
          color: #ffffff !important;
          letter-spacing: 1px;
          margin-left: 8px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .header-title {
          margin: 15px 0 0 0;
          font-size: 24px;
          color: #ffffff !important;
          font-weight: 700;
          text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.3);
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 2px solid #f59e0b;
          border-top: none;
        }
        .appointment-details {
          background: #fffbeb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #fde68a;
          box-shadow: 0 10px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
        }
        .detail-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #fef3c7;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          width: 140px;
          color: #d97706;
        }
        .detail-value {
          color: #4a4a4a;
        }
        .footer {
          background: #FAF6EF;
          padding: 20px 30px;
          border: 2px solid #f59e0b;
          border-top: none;
          border-radius: 0 0 10px 10px;
          text-align: center;
          color: #4a4a4a;
          font-size: 14px;
        }
        .footer-text {
          color: #6b7280;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          border: 3px solid #f59e0b;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          letter-spacing: 0.5px;
        }
        .button:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .note {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: #ffffff;
          }
          .content {
            background: #2a2a2a;
            border-color: #d97706;
            color: #e0e0e0;
          }
          .appointment-details {
            background: #1f1f1f;
            border-color: #d97706;
          }
          .detail-row {
            border-bottom-color: #3a3a3a;
          }
          .detail-label {
            color: #fbbf24;
          }
          .detail-value {
            color: #d0d0d0;
          }
          .footer {
            background: #1a1a1a;
            border-color: #d97706;
            color: #d0d0d0;
          }
          .footer-text {
            color: #a0a0a0;
          }
          .button {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            border-color: #d97706;
          }
          .note {
            background: #1f1f1f;
            border-left-color: #fbbf24;
            color: #e0e0e0;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <span class="logo-bueno">BUENO</span>
          <span class="logo-brows">BROWS</span>
        </div>
        <h1 class="header-title">⏰ We Missed You!</h1>
      </div>
      
      <div class="content">
        <p>Hi ${customerName},</p>
        
        <p>We noticed you were unable to make your scheduled appointment at <strong>Bueno Brows</strong>.</p>
        
        <div class="appointment-details">
          <div class="detail-row">
            <div class="detail-label">Service:</div>
            <div class="detail-value"><strong>${serviceName}</strong></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Date:</div>
            <div class="detail-value">${formattedDate}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Time:</div>
            <div class="detail-value">${time}</div>
          </div>
        </div>

        <div class="note">
          <strong>Missed Appointment Policy:</strong><br>
          We understand that things come up. If you need to cancel or reschedule in the future, please give us at least 24 hours notice so we can open the slot for other clients.
        </div>

        <div style="text-align: center;">
          <a href="https://buenobrows.com" class="button">Reschedule Your Appointment</a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          <strong>We'd love to see you!</strong><br>
          Please reach out if you'd like to book a new appointment. We're here to help!
        </p>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 10px 0;">
          <span class="logo-bueno" style="font-size: 18px;">BUENO</span>
          <span class="logo-brows" style="font-size: 18px; margin-left: 4px;">BROWS</span>
        </p>
        <p style="margin: 5px 0;">📍 315 9th Ave, San Mateo, CA 94401</p>
        <p style="margin: 5px 0;">📞 Phone: <a href="tel:+16507663918" style="color: #f59e0b; text-decoration: none;">(650) 766-3918</a></p>
        <p style="margin: 5px 0;">✉️ Email: hello@buenobrows.com</p>
        <p style="margin: 5px 0;">🌐 Website: <a href="https://buenobrows.com" style="color: #f59e0b; text-decoration: none;">buenobrows.com</a></p>
        <p class="footer-text" style="margin: 15px 0 0 0; font-size: 12px;">
          You're receiving this email about a missed appointment.<br>
          <strong>Bueno Brows</strong> - Filipino-inspired beauty studio specializing in brows & lashes
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
We Missed You - Bueno Brows

Hi ${customerName},

We noticed you were unable to make your scheduled appointment at Bueno Brows.

MISSED APPOINTMENT:
Service: ${serviceName}
Date: ${formattedDate}
Time: ${time}

Missed Appointment Policy:
We understand that things come up. If you need to cancel or reschedule in the future, please give us at least 24 hours notice so we can open the slot for other clients.

We'd love to see you! Please reach out if you'd like to book a new appointment.

Bueno Brows
📍 315 9th Ave, San Mateo, CA 94401
📞 Phone: (650) 766-3918
✉️ Email: hello@buenobrows.com
🌐 Website: https://buenobrows.com

Filipino-inspired beauty studio specializing in brows & lashes
  `.trim();

  const msg = {
    to: customerEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `⏰ We missed you - ${serviceName} on ${formattedDate}`,
    text: textContent,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ No-show email sent to ${customerEmail}`);
    
    // Log email in database
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_no_show',
      status: 'sent',
      timestamp: new Date().toISOString(),
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error sending no-show email:', error);
    
    // Log failed email attempt
    await db.collection('email_logs').add({
      to: customerEmail,
      subject: msg.subject,
      type: 'appointment_no_show',
      status: 'failed',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    
    return false;
  }
}

/**
 * Send appointment reminder email (24 hours before)
 */
export async function sendAppointmentReminderEmail(
  customerEmail: string,
  customerName: string,
  appointmentDetails: {
    serviceName: string;
    date: string;
    time: string;
  }
): Promise<boolean> {
  if (!initSendGrid() || !customerEmail) return false;

  const { serviceName, date, time } = appointmentDetails;
  const appointmentDate = new Date(date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <style>
        /* Base styles */
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #FAF6EF;
        }
        .reminder-box {
          background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%);
          color: #804d00;
          padding: 40px 30px;
          border-radius: 10px;
          text-align: center;
          margin: 20px 0;
        }
        .logo {
          margin-bottom: 15px;
        }
        .logo-bueno {
          font-size: 28px;
          font-weight: 700;
          color: #cc7700;
          letter-spacing: 1px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        .logo-brows {
          font-size: 28px;
          font-weight: 600;
          color: #8B7355;
          letter-spacing: 1px;
          margin-left: 6px;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }
        .content-box {
          background: #ffffff;
          padding: 30px;
          border-radius: 8px;
          margin: 20px 0;
          border: 2px solid #D8A14A;
        }
        .appointment-box {
          background: #FAF6EF;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #D8A14A;
        }
        .reminder-title {
          margin: 10px 0 0 0;
          font-size: 24px;
          color: #804d00;
          font-weight: 600;
        }
        .label-text {
          color: #804d00;
        }
        .footer-text {
          color: #6b7280;
        }
        .payment-methods {
          background-color: #fffbeb;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          border-left: 4px solid #D8A14A;
        }
        .payment-methods-title {
          margin: 0 0 12px 0;
          color: #804d00;
          font-weight: 600;
          font-size: 16px;
        }
        .payment-badge {
          background-color: #fef3c7;
          color: #804d00;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
          .reminder-box {
            background: linear-gradient(135deg, #cc9922 0%, #b3861e 100%);
            color: #fff;
          }
          .logo-bueno {
            color: #ffcc33;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          .logo-brows {
            color: #D1B6A4;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
          }
          .reminder-title {
            color: #fff;
          }
          .content-box {
            background: #2a2a2a;
            border-color: #b3861e;
            color: #e0e0e0;
          }
          .appointment-box {
            background: #1f1f1f;
            border-color: #b3861e;
          }
          .label-text {
            color: #ffcc33;
          }
          .footer-text {
            color: #a0a0a0;
          }
          .payment-methods {
            background-color: #1f1f1f;
            border-left-color: #ffcc33;
          }
          .payment-methods-title {
            color: #ffcc33;
          }
          .payment-badge {
            background-color: #2a2a2a;
            color: #ffffff;
          }
        }

        /* Light mode specific adjustments */
        @media (prefers-color-scheme: light) {
          .logo-bueno {
            color: #cc7700;
          }
          .logo-brows {
            color: #8B7355;
          }
          .reminder-title {
            color: #804d00;
          }
        }
      </style>
    </head>
    <body>
      <div class="reminder-box">
        <div class="logo">
          <span class="logo-bueno">BUENO</span>
          <span class="logo-brows">BROWS</span>
        </div>
        <h1 class="reminder-title">⏰ Appointment Reminder</h1>
      </div>
      
      <div class="content-box">
        <p>Hi ${customerName},</p>
        
        <p>This is a friendly reminder that you have an appointment coming up soon:</p>
        
        <div class="appointment-box">
          <p style="margin: 5px 0;"><strong class="label-text">Service:</strong> ${serviceName}</p>
          <p style="margin: 5px 0;"><strong class="label-text">Date:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong class="label-text">Time:</strong> ${time}</p>
        </div>

        <div class="payment-methods">
          <p class="payment-methods-title">💳 Accepted Payment Methods:</p>
          <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px;">
            <span class="payment-badge">Cash</span>
            <span class="payment-badge">Zelle</span>
            <span class="payment-badge">Venmo</span>
            <span class="payment-badge">Apple Cash</span>
          </div>
        </div>

        <p>We look forward to seeing you!</p>
        
        <p class="footer-text" style="font-size: 14px;">
          If you need to reschedule or cancel, please call us at (555) 123-4567.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #D8A14A; text-align: center; font-size: 14px;">
          <p style="margin: 0 0 5px 0;">
            <span class="logo-bueno" style="font-size: 18px;">BUENO</span>
            <span class="logo-brows" style="font-size: 18px; margin-left: 4px;">BROWS</span>
          </p>
          <p class="footer-text" style="margin: 5px 0;">123 Main Street, Downtown | (555) 123-4567</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const msg = {
    to: customerEmail,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: `⏰ Reminder: ${serviceName} appointment tomorrow`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Reminder email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending reminder email:', error);
    return false;
  }
}

/**
 * Cloud Function: Send email when appointment status changes to cancelled
 * This ensures cancellation emails are sent automatically when appointments are cancelled
 */
export const onAppointmentCancelledSendEmail = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;

    // Only send email when status changes to cancelled
    if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
      const { customerId, start, duration, serviceId, bookedPrice, notes, cancelledBy, cancellationReason } = afterData;

      try {
        // Get customer details
        const customerDoc = await db.collection('customers').doc(customerId).get();
        if (!customerDoc.exists) {
          console.error('Customer not found:', customerId);
          return;
        }

        const customerData = customerDoc.data();
        const customerEmail = customerData?.email;
        const customerName = customerData?.name || 'Valued Customer';

        if (!customerEmail) {
          console.log('No email for customer:', customerId);
          return;
        }

        // Get service details
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        const serviceData = serviceDoc.data();
        const serviceName = serviceData?.name || 'Service';

        // Get business hours for timezone
        const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
        const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;

        // Format date and time with proper timezone
        const appointmentDate = new Date(start);
        const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';
        const time = appointmentDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: businessTimezone,
        });

        // Send cancellation email
        await sendAppointmentCancellationEmail(customerEmail, customerName, {
          serviceName,
          date: start,
          time,
          duration: duration || 60,
          price: bookedPrice,
          notes,
          businessTimezone,
          cancelledBy: cancelledBy || 'admin',
          cancellationReason,
        });

        console.log(`✅ Cancellation email sent for cancelled appointment ${event.params.appointmentId}`);
      } catch (error) {
        console.error('Error sending appointment cancellation email:', error);
      }
    }
  }
);

/**
 * Cloud Function: Send email when appointment status changes to confirmed
 * This ensures emails are only sent AFTER admin confirmation, not on initial booking
 */
export const onAppointmentConfirmedSendEmail = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    if (!beforeData || !afterData) return;

    // Only send email when status changes from pending to confirmed
    if (beforeData.status === 'pending' && afterData.status === 'confirmed') {
      const { customerId, start, duration, serviceId, serviceIds, bookedPrice, notes } = afterData;

      try {
        // Get customer details
        const customerDoc = await db.collection('customers').doc(customerId).get();
        if (!customerDoc.exists) {
          console.error('Customer not found:', customerId);
          return;
        }

        const customerData = customerDoc.data();
        const customerEmail = customerData?.email;
        const customerName = customerData?.name || 'Valued Customer';

        if (!customerEmail) {
          console.log('No email for customer:', customerId);
          return;
        }

        // Get business hours for timezone
        const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
        const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
        const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';

        // Handle multiple services
        const serviceIdList = serviceIds || (serviceId ? [serviceId] : []);
        const serviceNames: string[] = [];
        
        for (const sid of serviceIdList) {
          const serviceDoc = await db.collection('services').doc(sid).get();
          const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
          if (serviceData?.name) {
            serviceNames.push(serviceData.name);
          }
        }

        // If no services found, fall back to single service
        if (serviceNames.length === 0 && serviceId) {
          const serviceDoc = await db.collection('services').doc(serviceId).get();
          const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
          serviceNames.push(serviceData?.name || 'Unknown Service');
        }

        // Format date and time with proper timezone
        const appointmentDate = new Date(start);
        const time = appointmentDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          timeZone: businessTimezone,
        });

        // Send confirmation email
        await sendAppointmentConfirmationEmail(customerEmail, customerName, {
          serviceNames,
          date: start,
          time,
          duration: duration || 60,
          price: bookedPrice,
          notes,
          businessTimezone,
        });

        console.log(`✅ Confirmation email sent for confirmed appointment ${event.params.appointmentId}`);
      } catch (error) {
        console.error('Error sending appointment confirmation email on confirmation:', error);
      }
    }
  }
);

// Resend appointment confirmation email (admin function)
export const resendAppointmentConfirmation = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { appointmentId } = req.data || {};
    
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'appointmentId is required');
    }

    try {
      // Get appointment details
      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const appointmentDoc = await appointmentRef.get();
      
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }
      
      const appointment: any = appointmentDoc.data();
      
      // Get customer details
      const customerRef = db.collection('customers').doc(appointment.customerId);
      const customerDoc = await customerRef.get();
      const customer: any = customerDoc.exists ? customerDoc.data() : {};
      
      if (!customer.email) {
        throw new HttpsError('failed-precondition', 'Customer email not found');
      }

      // Get business hours for timezone
      const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
      const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
      const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';

      // Handle multiple services
      const serviceIdList = appointment.serviceIds || (appointment.serviceId ? [appointment.serviceId] : []);
      const serviceNames: string[] = [];
      
      for (const serviceId of serviceIdList) {
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
        if (serviceData?.name) {
          serviceNames.push(serviceData.name);
        }
      }

      // If no services found, fall back to single service
      if (serviceNames.length === 0 && appointment.serviceId) {
        const serviceDoc = await db.collection('services').doc(appointment.serviceId).get();
        const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
        serviceNames.push(serviceData?.name || 'Unknown Service');
      }

      // Format date and time with proper timezone
      const appointmentDate = new Date(appointment.start);
      const time = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: businessTimezone,
      });

      // Send confirmation email
      const success = await sendAppointmentConfirmationEmail(customer.email, customer.name || 'Valued Customer', {
        serviceNames,
        date: appointment.start,
        time,
        duration: appointment.duration || 60,
        price: appointment.bookedPrice || appointment.totalPrice,
        notes: appointment.notes,
        businessTimezone,
      });

      if (success) {
        console.log('✅ Resent confirmation email for appointment:', appointmentId);
        return {
          success: true,
          message: 'Confirmation email resent successfully',
          appointmentId
        };
      } else {
        throw new HttpsError('internal', 'Failed to send confirmation email');
      }

    } catch (error: any) {
      console.error('Error resending confirmation email:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to resend confirmation: ${error.message}`);
    }
  }
);

// Send appointment confirmation email (admin function for new appointments)
export const sendAppointmentConfirmation = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { 
      appointmentId, 
      customerId, 
      customerEmail, 
      customerName, 
      start, 
      duration, 
      serviceNames, 
      totalPrice 
    } = req.data || {};
    
    if (!appointmentId || !customerEmail || !customerName || !start) {
      throw new HttpsError('invalid-argument', 'Required fields: appointmentId, customerEmail, customerName, start');
    }

    try {
      // Get business timezone
      const businessDoc = await db.collection('settings').doc('business').get();
      const businessTimezone = businessDoc.exists ? businessDoc.data()?.timezone || 'America/Los_Angeles' : 'America/Los_Angeles';

      // Format the date and time
      const appointmentDate = new Date(start);
      const date = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: businessTimezone,
      });
      
      const time = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: businessTimezone,
      });

      // Convert serviceNames to array if it's a string
      const serviceNamesArray = Array.isArray(serviceNames) 
        ? serviceNames 
        : (serviceNames ? [serviceNames] : ['Service']);

      // Send confirmation email
      const success = await sendAppointmentConfirmationEmail(customerEmail, customerName, {
        serviceNames: serviceNamesArray,
        date: start,
        time,
        duration: duration || 60,
        price: totalPrice,
        businessTimezone,
      });

      if (success) {
        console.log('✅ Sent confirmation email for new appointment:', appointmentId);
        return {
          success: true,
          message: 'Confirmation email sent successfully',
          appointmentId
        };
      } else {
        throw new HttpsError('internal', 'Failed to send confirmation email');
      }

    } catch (error: any) {
      console.error('Error sending confirmation email:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to send confirmation: ${error.message}`);
    }
  }
);

/**
 * Send an initial onboarding/invitation email to a customer with key links
 * - Booking page
 * - Profile setup
 * - Skin analysis
 */
export const sendInitialRequest = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const userToken = req.auth.token as any;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { customerId, customerName, customerEmail } = req.data || {};

    if (!customerEmail) {
      throw new HttpsError('invalid-argument', 'customerEmail is required');
    }

    try {
      // Prefer values from Firestore to keep links and name in sync
      let name = customerName as string | undefined;
      if (customerId) {
        const snap = await db.collection('customers').doc(customerId).get();
        if (snap.exists) {
          const data = snap.data() as any;
          name = data?.name || name;
        }
      }

      // Optional: load business info for variables
      const businessDoc = await db.collection('settings').doc('businessInfo').get();
      const business = businessDoc.exists ? (businessDoc.data() as any) : {};

      // Try to load a customizable template first
      const template = await getEmailTemplate('initial-request');

      const vars = {
        customerName: name || 'there',
        businessName: business?.name || 'Bueno Brows',
        bookingLink: 'https://bueno-brows-7cce7.web.app/book',
        profileLink: 'https://bueno-brows-7cce7.web.app/profile',
        skinAnalysisLink: 'https://bueno-brows-7cce7.web.app/skin-analysis',
        businessPhone: business?.phone || '(650) 766-3918',
        businessEmail: business?.email || 'hello@buenobrows.com',
        businessAddress: business?.address || 'San Mateo, CA',
      } as Record<string, string>;

      const subject = template
        ? replaceTemplateVariables(template.subject, vars)
        : `Welcome to ${vars.businessName}! Start by booking or setting up your profile`;

      const html = template
        ? replaceTemplateVariables(template.html, vars)
        : `<!DOCTYPE html>
<html>
<head>
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }
    .wrap { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }
    .banner { background-color: #FFC107; padding: 36px 20px; text-align: center; }
    .banner h1 { margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a; }
    .content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }
    .cta { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 12px 22px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 10px 8px 0 0; }
    .footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }
  </style>
  </head>
  <body>
    <div class="wrap">
      <div class="banner"><h1>BUENO BROWS</h1></div>
      <div class="content">
        <p>Hi ${vars.customerName},</p>
        <p>Welcome! You can get started in a few ways:</p>
        <p>
          <a class="cta" href="${vars.bookingLink}">Book an appointment</a>
          <a class="cta" href="${vars.profileLink}">Set up your profile</a>
          <a class="cta" href="${vars.skinAnalysisLink}">Try Skin Analysis</a>
        </p>
        <p style="margin-top:16px; color:#bbb">Questions? Call us at ${vars.businessPhone}.</p>
      </div>
      <div class="footer">
        <p><strong style="color:#FFC107;">${vars.businessName}</strong></p>
        <p>📍 ${vars.businessAddress}</p>
        <p>✉️ ${vars.businessEmail}</p>
      </div>
    </div>
  </body>
</html>`;

      const emailResult = await sendEmail({
        to: customerEmail,
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        html,
      });

      return { success: emailResult.success };
    } catch (err: any) {
      console.error('Error sending initial request:', err);
      throw new HttpsError('internal', 'Failed to send initial request');
    }
  }
);
