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
}): Promise<boolean> {
  if (!initSendGrid()) {
    console.error('Cannot send email: SENDGRID_API_KEY not configured');
    return false;
  }

  try {
    await sgMail.send(msg);
    console.log('✅ Email sent successfully to:', msg.to);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmationEmail(
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

  const { serviceName, date, time, duration, price, notes } = appointmentDetails;

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
          background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%);
          color: #2c1810;
          padding: 40px 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          position: relative;
          box-shadow: inset 0 0 0 1px rgba(44, 24, 16, 0.1);
        }
        .logo {
          margin-bottom: 15px;
        }
        .logo-bueno {
          font-size: 32px;
          font-weight: 700;
          color: #1a0f08 !important;
          letter-spacing: 1px;
          text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.9);
        }
        .logo-brows {
          font-size: 32px;
          font-weight: 600;
          color: #2d1b0f !important;
          letter-spacing: 1px;
          margin-left: 8px;
          text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.9);
        }
        .header-title {
          margin: 15px 0 0 0;
          font-size: 24px;
          color: #1a0f08 !important;
          font-weight: 700;
          text-shadow: 2px 2px 3px rgba(255, 255, 255, 0.8);
        }
        .content {
          background: #ffffff;
          padding: 30px;
          border: 2px solid #D8A14A;
          border-top: none;
        }
        .appointment-details {
          background: #FAF6EF;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #D8A14A;
          box-shadow: 0 10px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
        }
        .detail-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #e8dfcf;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          width: 140px;
          color: #804d00;
        }
        .detail-value {
          color: #4a4a4a;
        }
        .footer {
          background: #FAF6EF;
          padding: 20px 30px;
          border: 2px solid #D8A14A;
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
          background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
          color: #ffffff !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          border: 3px solid #D8A14A;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          letter-spacing: 0.5px;
        }
        .button:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .note {
          background: #fff8d1;
          border-left: 4px solid #ffcc33;
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
            background: linear-gradient(135deg, #cc9922 0%, #b3861e 100%);
            color: #2c1810;
          }
          .logo-bueno {
            color: #2c1810;
            text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
          }
          .logo-brows {
            color: #4a2c1a;
            text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
          }
          .header-title {
            color: #2c1810;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.6);
          }
          .content {
            background: #2a2a2a;
            border-color: #b3861e;
            color: #e0e0e0;
          }
          .appointment-details {
            background: #1f1f1f;
            border-color: #b3861e;
          }
          .detail-row {
            border-bottom-color: #3a3a3a;
          }
          .detail-label {
            color: #ffcc33;
          }
          .detail-value {
            color: #d0d0d0;
          }
          .footer {
            background: #1a1a1a;
            border-color: #b3861e;
            color: #d0d0d0;
          }
          .footer-text {
            color: #a0a0a0;
          }
          .button {
            background: linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%);
            color: #ffffff !important;
            font-weight: 700;
            font-size: 16px;
            border: 3px solid #b3861e;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            letter-spacing: 0.5px;
          }
          .note {
            background: #2a2400;
            border-left-color: #e6b829;
            color: #e0e0e0;
          }
        }

        /* Light mode specific adjustments */
        @media (prefers-color-scheme: light) {
          .logo-bueno {
            color: #2c1810;
            text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
          }
          .logo-brows {
            color: #4a2c1a;
            text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.8);
          }
          .header-title {
            color: #2c1810;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.6);
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
        <h1 class="header-title">✨ Appointment Confirmed!</h1>
      </div>
      
      <div class="content">
        <p>Hi ${customerName},</p>
        
        <p>Great news! Your appointment at <strong>Bueno Brows</strong> has been confirmed.</p>
        
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
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">${duration} minutes</div>
          </div>
          ${price ? `
          <div class="detail-row">
            <div class="detail-label">Price:</div>
            <div class="detail-value">$${price.toFixed(2)}</div>
          </div>
          ` : ''}
        </div>

        ${notes ? `
        <div class="note">
          <strong>Note:</strong> ${notes}
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="https://buenobrows.com" class="button">Book Your Next Appointment</a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          <strong>Need to reschedule or cancel?</strong><br>
          Please call us at least 24 hours in advance to avoid any cancellation fees.
        </p>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 10px 0;">
          <span class="logo-bueno" style="font-size: 18px;">BUENO</span>
          <span class="logo-brows" style="font-size: 18px; margin-left: 4px;">BROWS</span>
        </p>
        <p style="margin: 5px 0;">📍 315 9th Ave, San Mateo, CA 94401</p>
        <p style="margin: 5px 0;">📞 Phone: <a href="tel:+16507663918" style="color: #D8A14A; text-decoration: none;">(650) 766-3918</a></p>
        <p style="margin: 5px 0;">✉️ Email: hello@buenobrows.com</p>
        <p style="margin: 5px 0;">🌐 Website: <a href="https://buenobrows.com" style="color: #D8A14A; text-decoration: none;">buenobrows.com</a></p>
        <p class="footer-text" style="margin: 15px 0 0 0; font-size: 12px;">
          You're receiving this email because you booked an appointment with us.<br>
          <strong>Bueno Brows</strong> - Filipino-inspired beauty studio specializing in brows & lashes
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Appointment Confirmed!

Hi ${customerName},

Your appointment at Bueno Brows has been confirmed.

APPOINTMENT DETAILS:
Service: ${serviceName}
Date: ${formattedDate}
Time: ${time}
Duration: ${duration} minutes
${price ? `Price: $${price.toFixed(2)}` : ''}

${notes ? `Note: ${notes}` : ''}

Need to reschedule or cancel? Please call us at least 24 hours in advance.

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
    subject: `✨ Appointment Confirmed - ${serviceName} on ${formattedDate}`,
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
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
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
          border: 2px solid #dc2626;
          border-top: none;
        }
        .appointment-details {
          background: #fef2f2;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #fecaca;
          box-shadow: 0 10px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04);
        }
        .detail-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #fecaca;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          width: 140px;
          color: #dc2626;
        }
        .detail-value {
          color: #4a4a4a;
        }
        .footer {
          background: #FAF6EF;
          padding: 20px 30px;
          border: 2px solid #dc2626;
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
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #ffffff !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
          border: 3px solid #dc2626;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          letter-spacing: 0.5px;
        }
        .button:hover {
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .note {
          background: #fef2f2;
          border-left: 4px solid #dc2626;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .cancellation-info {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }

        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #1a1a1a;
            color: #e0e0e0;
          }
          .header {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
            color: #ffffff;
          }
          .content {
            background: #2a2a2a;
            border-color: #b91c1c;
            color: #e0e0e0;
          }
          .appointment-details {
            background: #1f1f1f;
            border-color: #b91c1c;
          }
          .detail-row {
            border-bottom-color: #3a3a3a;
          }
          .detail-label {
            color: #fca5a5;
          }
          .detail-value {
            color: #d0d0d0;
          }
          .footer {
            background: #1a1a1a;
            border-color: #b91c1c;
            color: #d0d0d0;
          }
          .footer-text {
            color: #a0a0a0;
          }
          .button {
            background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
            border-color: #b91c1c;
          }
          .note {
            background: #1f1f1f;
            border-left-color: #fca5a5;
            color: #e0e0e0;
          }
          .cancellation-info {
            background: #1f1f1f;
            border-color: #b91c1c;
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
        <h1 class="header-title">❌ ${cancellationTitle}</h1>
      </div>
      
      <div class="content">
        <p>Hi ${customerName},</p>
        
        <p>We're writing to inform you that your appointment at <strong>Bueno Brows</strong> has been cancelled by ${cancelledByText}.</p>
        
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
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div class="detail-value">${duration} minutes</div>
          </div>
          ${price ? `
          <div class="detail-row">
            <div class="detail-label">Price:</div>
            <div class="detail-value">$${price.toFixed(2)}</div>
          </div>
          ` : ''}
        </div>

        ${cancellationReason ? `
        <div class="cancellation-info">
          <strong>Reason for cancellation:</strong><br>
          ${cancellationReason}
        </div>
        ` : ''}

        ${notes ? `
        <div class="note">
          <strong>Original Notes:</strong> ${notes}
        </div>
        ` : ''}

        <div style="text-align: center;">
          <a href="https://buenobrows.com" class="button">Book a New Appointment</a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          <strong>Need to reschedule?</strong><br>
          We'd love to help you find a new time that works for you. Please call us or book online.
        </p>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 10px 0;">
          <span class="logo-bueno" style="font-size: 18px;">BUENO</span>
          <span class="logo-brows" style="font-size: 18px; margin-left: 4px;">BROWS</span>
        </p>
        <p style="margin: 5px 0;">📍 315 9th Ave, San Mateo, CA 94401</p>
        <p style="margin: 5px 0;">📞 Phone: <a href="tel:+16507663918" style="color: #dc2626; text-decoration: none;">(650) 766-3918</a></p>
        <p style="margin: 5px 0;">✉️ Email: hello@buenobrows.com</p>
        <p style="margin: 5px 0;">🌐 Website: <a href="https://buenobrows.com" style="color: #dc2626; text-decoration: none;">buenobrows.com</a></p>
        <p class="footer-text" style="margin: 15px 0 0 0; font-size: 12px;">
          You're receiving this email because your appointment was cancelled.<br>
          <strong>Bueno Brows</strong> - Filipino-inspired beauty studio specializing in brows & lashes
        </p>
      </div>
    </body>
    </html>
  `;

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
      const { customerId, start, duration, serviceId, bookedPrice, notes } = afterData;

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

        // Send confirmation email
        await sendAppointmentConfirmationEmail(customerEmail, customerName, {
          serviceName,
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
      
      // Get service details
      const serviceRef = db.collection('services').doc(appointment.serviceId);
      const serviceDoc = await serviceRef.get();
      const service: any = serviceDoc.exists ? serviceDoc.data() : { name: 'Service' };
      
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
        serviceName: service.name,
        date: appointment.start,
        time,
        duration: appointment.duration || 60,
        price: appointment.bookedPrice,
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

      // Send confirmation email
      const success = await sendAppointmentConfirmationEmail(customerEmail, customerName, {
        serviceName: serviceNames || 'Service',
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
