import { onDocumentCreated } from 'firebase-functions/v2/firestore';
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
function initSendGrid(): boolean {
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

  // Format the appointment date/time nicely
  const appointmentDate = new Date(date);
  const formattedDate = appointmentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Create email content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
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
          color: #804d00;
          padding: 40px 30px;
          border-radius: 10px 10px 0 0;
          text-align: center;
          position: relative;
        }
        .logo {
          margin-bottom: 15px;
        }
        .logo-bueno {
          font-size: 32px;
          font-weight: 700;
          color: #ffbd59;
          letter-spacing: 1px;
          text-shadow: 2px 2px 0px rgba(128, 77, 0, 0.2);
        }
        .logo-brows {
          font-size: 32px;
          font-weight: 600;
          color: #D1B6A4;
          letter-spacing: 1px;
          margin-left: 8px;
          text-shadow: 2px 2px 0px rgba(128, 77, 0, 0.1);
        }
        .header-title {
          margin: 15px 0 0 0;
          font-size: 24px;
          color: #D1B6A4;
          font-weight: 600;
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
          color: #6b7280;
          font-size: 14px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%);
          color: #804d00;
          padding: 14px 35px;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
          font-weight: 700;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
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
          <a href="https://buenobrows.com/dashboard" class="button">View My Appointments</a>
        </div>

        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
          <strong>Need to reschedule or cancel?</strong><br>
          Please call us at least 24 hours in advance to avoid any cancellation fees.
        </p>
      </div>
      
      <div class="footer">
        <p style="margin: 0 0 10px 0;">
          <span style="font-size: 18px; font-weight: 700; color: #ffbd59;">BUENO</span>
          <span style="font-size: 18px; font-weight: 600; color: #D1B6A4; margin-left: 4px;">BROWS</span>
        </p>
        <p style="margin: 5px 0; color: #4a4a4a;">123 Main Street, Downtown</p>
        <p style="margin: 5px 0; color: #4a4a4a;">Phone: (555) 123-4567</p>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280;">
          You're receiving this email because you booked an appointment with us.
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
123 Main Street, Downtown
Phone: (555) 123-4567
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
      <style>
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
          color: #ffbd59;
          letter-spacing: 1px;
          text-shadow: 2px 2px 0px rgba(128, 77, 0, 0.2);
        }
        .logo-brows {
          font-size: 28px;
          font-weight: 600;
          color: #D1B6A4;
          letter-spacing: 1px;
          margin-left: 6px;
          text-shadow: 2px 2px 0px rgba(128, 77, 0, 0.1);
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
      </style>
    </head>
    <body>
      <div class="reminder-box">
        <div class="logo">
          <span class="logo-bueno">BUENO</span>
          <span class="logo-brows">BROWS</span>
        </div>
        <h1 style="margin: 10px 0 0 0; font-size: 24px; color: #804d00; font-weight: 600;">⏰ Appointment Reminder</h1>
      </div>
      
      <div class="content-box">
        <p>Hi ${customerName},</p>
        
        <p>This is a friendly reminder that you have an appointment coming up soon:</p>
        
        <div class="appointment-box">
          <p style="margin: 5px 0;"><strong style="color: #804d00;">Service:</strong> ${serviceName}</p>
          <p style="margin: 5px 0;"><strong style="color: #804d00;">Date:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong style="color: #804d00;">Time:</strong> ${time}</p>
        </div>

        <p>We look forward to seeing you!</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          If you need to reschedule or cancel, please call us at (555) 123-4567.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #D8A14A; text-align: center; font-size: 14px;">
          <p style="margin: 0 0 5px 0;">
            <span style="font-size: 18px; font-weight: 700; color: #ffbd59;">BUENO</span>
            <span style="font-size: 18px; font-weight: 600; color: #D1B6A4; margin-left: 4px;">BROWS</span>
          </p>
          <p style="color: #6b7280; margin: 5px 0;">123 Main Street, Downtown | (555) 123-4567</p>
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
 * Cloud Function: Send email when appointment is created
 */
export const onAppointmentCreatedSendEmail = onDocumentCreated(
  'appointments/{appointmentId}',
  async (event) => {
    const appointmentData = event.data?.data();
    if (!appointmentData) return;

    const { customerId, start, duration, serviceId, bookedPrice, notes } = appointmentData;

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

      // Format date and time
      const appointmentDate = new Date(start);
      const time = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Send confirmation email
      await sendAppointmentConfirmationEmail(customerEmail, customerName, {
        serviceName,
        date: start,
        time,
        duration: duration || 60,
        price: bookedPrice,
        notes,
      });

      console.log(`✅ Confirmation email sent for appointment ${event.params.appointmentId}`);
    } catch (error) {
      console.error('Error sending appointment confirmation email:', error);
    }
  }
);


