// functions/src/test-admin-email.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';
import { defineString } from 'firebase-functions/params';

try { initializeApp(); } catch {}
const db = getFirestore();

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
    console.log('✅ SendGrid initialized for test emails');
    return true;
  } else {
    console.warn('⚠️ SENDGRID_API_KEY not set - test emails will not be sent');
    return false;
  }
}

/**
 * Send test admin notification email
 */
export const sendTestAdminNotification = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    try {
      const { adminEmail, testData } = req.data || {};
      
      if (!adminEmail) {
        throw new HttpsError('invalid-argument', 'Admin email is required');
      }

      // Initialize SendGrid
      if (!initSendGrid()) {
        throw new HttpsError('failed-precondition', 'Email service not configured');
      }

      const confirmUrl = `https://buenobrows.com/admin/schedule?confirm=${testData.appointmentId}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Admin Notification - Bueno Brows</title>
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
            .test-badge {
              background: #4CAF50;
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
              margin-bottom: 20px;
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
            <h1 class="header-title">🧪 Test Email Notification</h1>
          </div>

          <div class="content">
            <div class="test-badge">✅ TEST EMAIL - Admin Setup Working</div>
            
            <p>Hello Admin,</p>
            <p>This is a test email to confirm that your admin notification system is working correctly.</p>

            <div class="appointment-details">
              <div class="detail-row">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">${testData.customerName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${testData.customerEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${testData.serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">${testData.date}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">${testData.time}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Duration:</span>
                <span class="detail-value">${testData.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">$${testData.price.toFixed(2)}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmUrl}" class="button">Review & Confirm Appointment</a>
            </div>

            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              <strong>✅ Test Successful!</strong><br>
              Your admin notification system is working correctly. You will receive emails like this for all new appointment requests.
            </p>
          </div>

          <div class="footer">
            <p>
              This is a test email from your Bueno Brows booking system.
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
        subject: `🧪 Test Email - Admin Notifications Working - ${testData.customerName}`,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`✅ Test email sent to ${adminEmail}`);
      
      return { success: true, message: 'Test email sent successfully' };
    } catch (error: any) {
      console.error('❌ Failed to send test email:', error);
      throw new HttpsError('internal', 'Failed to send test email');
    }
  }
);
