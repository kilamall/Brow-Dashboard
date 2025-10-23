import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import sgMail from '@sendgrid/mail';
import { defineString } from 'firebase-functions/params';

try { initializeApp(); } catch {}
const db = getFirestore();

// Define SendGrid API key as a parameter
const sendgridApiKey = defineString('SENDGRID_API_KEY', {
  description: 'SendGrid API key for sending emails',
  default: ''
});

// SMS configuration
// TODO: Once A2P 10DLC campaign is approved, switch to Twilio
// Add these to .env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const FROM_EMAIL = 'hello@buenobrows.com';
const FROM_NAME = 'Bueno Brows';

// Helper to send SMS (will use Twilio once A2P 10DLC is approved)
async function sendVerificationSMS(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string }> {
  const message = `Your Bueno Brows verification code is: ${code}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this code, please ignore this message.`;

  // Option 1: Use Twilio (once A2P 10DLC is approved)
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
    try {
      const twilio = await import('twilio');
      const client = twilio.default(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      
      const result = await client.messages.create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });
      
      console.log(`✅ SMS verification code sent via Twilio to ${phoneNumber}:`, result.sid);
      
      // Log SMS in database
      await db.collection('sms_logs').add({
        to: phoneNumber,
        body: message,
        type: 'verification',
        status: 'sent',
        timestamp: new Date().toISOString(),
        twilioMessageId: result.sid,
        provider: 'twilio'
      });
      
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      throw error;
    }
  }
  
  // Option 2: Use AWS SNS (temporary fallback)
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    try {
      const AWS = await import('aws-sdk');
      const sns = new AWS.SNS({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION
      });

      const params = {
        Message: message,
        PhoneNumber: phoneNumber
      };

      const result = await sns.publish(params).promise();
      console.log(`✅ SMS verification code sent via AWS SNS to ${phoneNumber}:`, result.MessageId);

      // Log SMS in database
      await db.collection('sms_logs').add({
        to: phoneNumber,
        body: message,
        type: 'verification',
        status: 'sent',
        timestamp: new Date().toISOString(),
        awsMessageId: result.MessageId,
        provider: 'aws_sns'
      });
      
      return { success: true, messageId: result.MessageId };
    } catch (error) {
      console.error('Error sending SMS via AWS SNS:', error);
      throw error;
    }
  }
  
  // Option 3: No SMS provider configured - log only
  console.log('⏳ SMS would be sent (waiting for A2P 10DLC approval):', {
    to: phoneNumber,
    code: code,
    message: message
  });
  
  // Log SMS in database
  await db.collection('sms_logs').add({
    to: phoneNumber,
    body: message,
    type: 'verification',
    status: 'pending_a2p',
    timestamp: new Date().toISOString(),
    note: 'Waiting for A2P 10DLC campaign approval - no SMS provider configured'
  });
  
  return { success: true, messageId: 'pending_a2p' };
}

// Helper to initialize SendGrid
function initSendGrid(): boolean {
  const apiKey = sendgridApiKey.value();
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid initialized');
    return true;
  } else {
    console.warn('⚠️ SENDGRID_API_KEY not set - email verification will not work');
    return false;
  }
}

// Helper to initialize AWS SNS
function initAWS(): boolean {
  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    console.log('✅ AWS SNS initialized');
    return true;
  } else {
    console.warn('⚠️ AWS credentials not set - SMS verification will not work');
    return false;
  }
}

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send email verification code
export const sendEmailVerificationCode = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { email } = req.data || {};
    
    if (!email) {
      throw new HttpsError('invalid-argument', 'Email is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError('invalid-argument', 'Invalid email format');
    }

    if (!initSendGrid()) {
      throw new HttpsError('failed-precondition', 'Email service not configured');
    }

    try {
      const code = generateVerificationCode();
      
      // Store verification code in database with expiration (5 minutes)
      const verificationRef = db.collection('verification_codes').doc();
      const verificationData = {
        email,
        code,
        type: 'email',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        used: false
      };
      await verificationRef.set(verificationData);

      // Send verification email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
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
            .header {
              background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%);
              color: #804d00;
              padding: 40px 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .logo-bueno {
              font-size: 32px;
              font-weight: 700;
              color: #cc7700;
              letter-spacing: 1px;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
            .logo-brows {
              font-size: 32px;
              font-weight: 600;
              color: #8B7355;
              letter-spacing: 1px;
              margin-left: 8px;
              text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 2px solid #D8A14A;
              border-top: none;
            }
            .verification-code {
              background: #FAF6EF;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #D8A14A;
              text-align: center;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #804d00;
              letter-spacing: 4px;
              margin: 10px 0;
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
            @media (prefers-color-scheme: dark) {
              body {
                background-color: #1a1a1a;
                color: #e0e0e0;
              }
              .header {
                background: linear-gradient(135deg, #cc9922 0%, #b3861e 100%);
                color: #fff;
              }
              .content {
                background: #2a2a2a;
                border-color: #b3861e;
                color: #e0e0e0;
              }
              .verification-code {
                background: #1f1f1f;
                border-color: #b3861e;
              }
              .code {
                color: #ffcc33;
              }
              .footer {
                background: #1a1a1a;
                border-color: #b3861e;
                color: #d0d0d0;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <span class="logo-bueno">BUENO</span>
              <span class="logo-brows">BROWS</span>
            </div>
            <h1 style="margin: 15px 0 0 0; font-size: 24px; color: #804d00; font-weight: 600;">Email Verification</h1>
          </div>
          
          <div class="content">
            <p>Hi there!</p>
            
            <p>Please use the following verification code to complete your appointment booking:</p>
            
            <div class="verification-code">
              <p style="margin: 0 0 10px 0; color: #804d00; font-weight: 600;">Your verification code:</p>
              <div class="code">${code}</div>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">This code expires in 5 minutes</p>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              <span class="logo-bueno" style="font-size: 18px;">BUENO</span>
              <span class="logo-brows" style="font-size: 18px; margin-left: 4px;">BROWS</span>
            </p>
            <p style="margin: 5px 0;">📍 315 9th Ave, San Mateo, CA 94401</p>
            <p style="margin: 5px 0;">📞 Phone: (650) 766-3918</p>
            <p style="margin: 5px 0;">✉️ Email: hello@buenobrows.com</p>
          </div>
        </body>
        </html>
      `;

      const textContent = `
Email Verification - Bueno Brows

Hi there!

Please use the following verification code to complete your appointment booking:

Verification Code: ${code}

This code expires in 5 minutes.

If you didn't request this code, please ignore this email.

Bueno Brows
📍 315 9th Ave, San Mateo, CA 94401
📞 Phone: (650) 766-3918
✉️ Email: hello@buenobrows.com
      `.trim();

      const msg = {
        to: email,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: '🔐 Verify your email - Bueno Brows',
        text: textContent,
        html: htmlContent,
      };

      await sgMail.send(msg);
      console.log(`✅ Email verification code sent to ${email}`);

      return {
        success: true,
        message: 'Verification code sent to your email'
      };

    } catch (error) {
      console.error('❌ Error sending email verification:', error);
      throw new HttpsError('internal', 'Failed to send verification email');
    }
  }
);

// Send SMS verification code
export const sendSMSVerificationCode = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { phoneNumber } = req.data || {};
    
    if (!phoneNumber) {
      throw new HttpsError('invalid-argument', 'Phone number is required');
    }

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      throw new HttpsError('invalid-argument', 'Invalid phone number format');
    }

    // If no provider is configured, we still proceed and log the attempt.
    // sendVerificationSMS() already supports a fallback that logs instead of sending.
    // This keeps UX consistent with sign-in where SMS can still be used.
    initAWS();

    try {
      const code = generateVerificationCode();
      
      // Store verification code in database with expiration (5 minutes)
      const verificationRef = db.collection('verification_codes').doc();
      await verificationRef.set({
        phoneNumber,
        code,
        type: 'sms',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        used: false
      });

      // Send SMS (will automatically use Twilio once A2P 10DLC is approved)
      await sendVerificationSMS(phoneNumber, code);

      return {
        success: true,
        message: 'Verification code sent to your phone'
      };

    } catch (error) {
      console.error('❌ Error sending SMS verification:', error);
      throw new HttpsError('internal', 'Failed to send verification SMS');
    }
  }
);

// Verify email code
export const verifyEmailCode = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { email, code } = req.data || {};
    
    if (!email || !code) {
      throw new HttpsError('invalid-argument', 'Email and code are required');
    }

    try {
      // Find the verification code
      const verificationQuery = await db.collection('verification_codes')
        .where('email', '==', email)
        .where('code', '==', code)
        .where('type', '==', 'email')
        .where('used', '==', false)
        .where('expiresAt', '>', new Date())
        .limit(1)
        .get();

      if (verificationQuery.empty) {
        throw new HttpsError('invalid-argument', 'Invalid or expired verification code');
      }

      const verificationDoc = verificationQuery.docs[0];
      
      // Mark code as used
      await verificationDoc.ref.update({ used: true });

      console.log(`✅ Email verification successful for ${email}`);

      return {
        success: true,
        message: 'Email verified successfully'
      };

    } catch (error) {
      console.error('❌ Error verifying email code:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to verify email code');
    }
  }
);

// Verify SMS code
export const verifySMSCode = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { phoneNumber, code } = req.data || {};
    
    if (!phoneNumber || !code) {
      throw new HttpsError('invalid-argument', 'Phone number and code are required');
    }

    try {
      // Find the verification code
      const verificationQuery = await db.collection('verification_codes')
        .where('phoneNumber', '==', phoneNumber)
        .where('code', '==', code)
        .where('type', '==', 'sms')
        .where('used', '==', false)
        .where('expiresAt', '>', new Date())
        .limit(1)
        .get();

      if (verificationQuery.empty) {
        throw new HttpsError('invalid-argument', 'Invalid or expired verification code');
      }

      const verificationDoc = verificationQuery.docs[0];
      
      // Mark code as used
      await verificationDoc.ref.update({ used: true });

      console.log(`✅ SMS verification successful for ${phoneNumber}`);

      return {
        success: true,
        message: 'Phone number verified successfully'
      };

    } catch (error) {
      console.error('❌ Error verifying SMS code:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Failed to verify SMS code');
    }
  }
);

