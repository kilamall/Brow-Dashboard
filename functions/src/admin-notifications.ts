// functions/src/admin-notifications.ts
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import sgMail from '@sendgrid/mail';
import { defineString } from 'firebase-functions/params';

try { initializeApp(); } catch {}
const db = getFirestore();
const auth = getAuth();

// Define SendGrid API key as a parameter
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
    console.log('✅ SendGrid initialized for admin notifications');
    return true;
  } else {
    console.warn('⚠️ SENDGRID_API_KEY not set - admin notifications will not be sent');
    return false;
  }
}

/**
 * Send admin notification email for new appointment requests
 */
export async function sendAdminNotificationEmail(
  adminEmail: string,
  appointmentDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    serviceName: string;
    date: string;
    time: string;
    duration: number;
    price?: number;
    notes?: string;
    appointmentId: string;
  }
): Promise<boolean> {
  // Initialize SendGrid
  if (!initSendGrid()) {
    return false;
  }

  try {
    const confirmUrl = `https://bueno-brows-admin.web.app/schedule?appointmentId=${appointmentDetails.appointmentId}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Appointment Request - Bueno Brows</title>
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
            color: #1a0f08;
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
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e5e5;
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
            flex: 1;
            text-align: right;
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
          .urgent-badge {
            background: #ff4444;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
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
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">
            <span class="logo-bueno">BUENO</span>
            <span class="logo-brows">BROWS</span>
          </div>
          <h1 class="header-title">🔔 New Appointment Request</h1>
        </div>

        <div class="content">
          <div class="urgent-badge">⚠️ ACTION REQUIRED</div>
          
          <p>Hello Admin,</p>
          <p>A new appointment has been requested and needs your confirmation.</p>

          <div class="appointment-details">
            <div class="detail-row">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">${appointmentDetails.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${appointmentDetails.customerEmail}</span>
            </div>
            ${appointmentDetails.customerPhone ? `
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${appointmentDetails.customerPhone}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${appointmentDetails.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${appointmentDetails.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${appointmentDetails.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">${appointmentDetails.duration} minutes</span>
            </div>
            ${appointmentDetails.price ? `
            <div class="detail-row">
              <span class="detail-label">Price:</span>
              <span class="detail-value">$${appointmentDetails.price.toFixed(2)}</span>
            </div>
            ` : ''}
            ${appointmentDetails.notes ? `
            <div class="detail-row">
              <span class="detail-label">Notes:</span>
              <span class="detail-value">${appointmentDetails.notes}</span>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" class="button">Review & Confirm Appointment</a>
          </div>

          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            <strong>Quick Actions:</strong><br>
            • Click the button above to review and confirm the appointment<br>
            • Or visit the admin dashboard to manage all appointments<br>
            • The customer will be notified once you confirm
          </p>
        </div>

        <div class="footer">
          <p class="footer-text">
            This is an automated notification from your Bueno Brows booking system.
          </p>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: adminEmail,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: `🔔 New Appointment Request - ${appointmentDetails.customerName} - ${appointmentDetails.date}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`✅ Admin notification sent to ${adminEmail} for appointment ${appointmentDetails.appointmentId}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    return false;
  }
}

/**
 * Cloud Function: Send admin notification when new appointment is created
 */
export const onAppointmentCreatedNotifyAdmin = onDocumentCreated(
  {
    document: 'appointments/{appointmentId}',
    region: 'us-central1',
  },
  async (event) => {
    try {
      const appointmentData = event.data?.data();
      const appointmentId = event.params?.appointmentId;

      if (!appointmentData || !appointmentId) {
        console.log('No appointment data or ID found');
        return;
      }

      // Only notify for pending appointments (new requests)
      if (appointmentData.status !== 'pending') {
        console.log('Appointment is not pending, skipping admin notification');
        return;
      }

      console.log('📧 New appointment created, sending admin notification...');

      // Get admin email from settings
      const settingsDoc = await db.collection('settings').doc('admin').get();
      const adminEmail = settingsDoc.exists ? settingsDoc.data()?.email : null;

      if (!adminEmail) {
        console.log('No admin email configured, skipping notification');
        return;
      }

      // Get service details
      const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
      const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
      const serviceName = serviceData?.name || 'Unknown Service';

      // Format appointment details
      const appointmentDate = new Date(appointmentData.start);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const appointmentDetails = {
        customerName: appointmentData.customerName || 'Unknown Customer',
        customerEmail: appointmentData.customerEmail || '',
        customerPhone: appointmentData.customerPhone || undefined,
        serviceName,
        date: formattedDate,
        time: formattedTime,
        duration: appointmentData.duration || 60,
        price: appointmentData.totalPrice || appointmentData.bookedPrice,
        notes: appointmentData.notes || undefined,
        appointmentId,
      };

      // Send admin notification
      await sendAdminNotificationEmail(adminEmail, appointmentDetails);

      console.log('✅ Admin notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending admin notification:', error);
    }
  }
);
