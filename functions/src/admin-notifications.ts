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
    serviceNames: string[]; // Array of service names for multi-service support
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
        <meta name="color-scheme" content="dark">
        <meta name="supported-color-schemes" content="dark">
        <title>New Appointment Request - Bueno Brows</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
          }
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1a1a1a;
          }
          .header-banner {
            background-color: #FFC107;
            padding: 36px 20px;
            text-align: center;
          }
          .header-banner h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            letter-spacing: 1px;
          }
          .header-banner h2 {
            margin: 10px 0 0 0;
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
          }
          .content {
            background-color: #2a2a2a;
            padding: 28px 20px;
            color: #ffffff;
          }
          .greeting {
            margin: 0 0 15px 0;
            font-size: 16px;
          }
          .appointment-card {
            background-color: #3a3a3a;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .appointment-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #4a4a4a;
          }
          .appointment-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            color: #FFC107;
            font-weight: 500;
          }
          .detail-value {
            color: #ffffff;
            font-weight: 600;
            text-align: right;
          }
          .service-list {
            color: #ffffff;
            font-weight: 600;
            text-align: right;
            line-height: 1.8;
          }
          .cta-button {
            display: inline-block;
            background-color: #FFC107;
            color: #1a1a1a !important;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            margin: 20px 0;
          }
          .footer {
            background-color: #1a1a1a;
            padding: 24px 20px;
            text-align: center;
            color: #888;
            font-size: 14px;
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
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="header-banner">
            <h1>BUENO BROWS</h1>
            <h2>🔔 New Appointment Request</h2>
          </div>
          <div class="content">
            <div class="urgent-badge">⚠️ ACTION REQUIRED</div>
            
            <p class="greeting">Hello Admin,</p>
            <p>A new appointment has been requested and needs your confirmation.</p>

            <div class="appointment-card">
              <div class="appointment-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${appointmentDetails.customerName}</span>
              </div>
              <div class="appointment-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${appointmentDetails.customerEmail}</span>
              </div>
              ${appointmentDetails.customerPhone ? `
              <div class="appointment-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${appointmentDetails.customerPhone}</span>
              </div>
              ` : ''}
              <div class="appointment-row">
                <span class="detail-label">Service${appointmentDetails.serviceNames.length > 1 ? 's' : ''}:</span>
                <span class="service-list">${appointmentDetails.serviceNames.map(name => `<div>${name}</div>`).join('')}</span>
              </div>
              <div class="appointment-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${appointmentDetails.date}</span>
              </div>
              <div class="appointment-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${appointmentDetails.time}</span>
              </div>
              <div class="appointment-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${appointmentDetails.duration} minutes</span>
              </div>
              ${appointmentDetails.price ? `
              <div class="appointment-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">$${appointmentDetails.price.toFixed(2)}</span>
              </div>
              ` : ''}
              ${appointmentDetails.notes ? `
              <div class="appointment-row">
                <span class="detail-label">Notes:</span>
                <span class="detail-value">${appointmentDetails.notes}</span>
              </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" class="cta-button">Review & Confirm Appointment</a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #aaa;">
              <strong>Quick Actions:</strong><br>
              • Click the button above to review and confirm the appointment<br>
              • Or visit the admin dashboard to manage all appointments<br>
              • The customer will be notified once you confirm
            </p>
          </div>
          <div class="footer">
            <p><strong style="color: #FFC107;"><a href="https://bueno-brows-7cce7.web.app" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
            <p>📍 315 9th Ave, San Mateo, CA 94401</p>
            <p>📞 (650) 613-8455</p>
            <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
            <p style="margin-top: 10px;"><a href="https://bueno-brows-7cce7.web.app" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
            <p style="margin-top: 16px; color: #666;">This is an automated notification from your booking system.</p>
          </div>
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

      // Get business hours for timezone
      const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
      const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
      const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';

      // Handle multiple services
      const serviceIds = appointmentData.serviceIds || (appointmentData.serviceId ? [appointmentData.serviceId] : []);
      const serviceNames: string[] = [];
      
      for (const serviceId of serviceIds) {
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
        if (serviceData?.name) {
          serviceNames.push(serviceData.name);
        }
      }

      // If no services found, fall back to single service
      if (serviceNames.length === 0) {
        const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
        const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
        serviceNames.push(serviceData?.name || 'Unknown Service');
      }

      // Format appointment details with proper timezone
      const appointmentDate = new Date(appointmentData.start);
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

      const appointmentDetails = {
        customerName: appointmentData.customerName || 'Unknown Customer',
        customerEmail: appointmentData.customerEmail || '',
        customerPhone: appointmentData.customerPhone || undefined,
        serviceNames,
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
