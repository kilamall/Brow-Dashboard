import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { sendEmail } from './email.js';

try { initializeApp(); } catch {}
const db = getFirestore();

interface EventInquiry {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  eventType?: string;
  eventDate?: string;
  numberOfAttendees?: string;
  preferredServices?: string[];
  additionalDetails?: string;
  preferredContactMethod?: string;
}

/**
 * Submit an event inquiry from the Events page
 */
export const submitEventInquiry = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const inquiry: EventInquiry = req.data || {};
    
    // Validate required fields
    if (!inquiry.name || !inquiry.email) {
      throw new HttpsError('invalid-argument', 'Name and email are required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiry.email)) {
      throw new HttpsError('invalid-argument', 'Invalid email address');
    }

    try {
      // Save inquiry to Firestore
      const inquiryRef = await db.collection('event_inquiries').add({
        ...inquiry,
        status: 'new',
        source: 'events_page',
        createdAt: new Date().toISOString(),
        read: false,
      });

      // Get admin email from settings
      let adminEmail = 'hello@buenobrows.com'; // Default
      try {
        const settingsDoc = await db.collection('settings').doc('adminEmail').get();
        if (settingsDoc.exists) {
          const data = settingsDoc.data();
          adminEmail = data?.email || adminEmail;
        }
      } catch (error) {
        console.error('Error fetching admin email:', error);
      }

      // Get service names if service IDs are provided
      let serviceNames: string[] = [];
      if (inquiry.preferredServices && inquiry.preferredServices.length > 0) {
        try {
          const serviceDocs = await Promise.all(
            inquiry.preferredServices.map((serviceId) => db.collection('services').doc(serviceId).get())
          );
          serviceNames = serviceDocs
            .map((doc) => (doc.exists ? doc.data()?.name : null))
            .filter((name): name is string => !!name);
        } catch (error) {
          console.error('Error fetching service names:', error);
        }
      }

      // Send admin notification email
      const emailSubject = `New Event Inquiry from ${inquiry.name}`;
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Event Inquiry</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h1 {
              color: #1a1a1a;
              font-size: 24px;
              margin-bottom: 20px;
              border-bottom: 2px solid #ffcc33;
              padding-bottom: 10px;
            }
            .field {
              margin-bottom: 15px;
            }
            .field-label {
              font-weight: 600;
              color: #333;
              margin-bottom: 5px;
              display: block;
            }
            .field-value {
              color: #666;
              padding: 8px 12px;
              background-color: #f9f9f9;
              border-radius: 4px;
            }
            .cta-button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background-color: #ffcc33;
              color: #1a1a1a;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <h1>🎉 New Event Inquiry</h1>
            
            <div class="field">
              <span class="field-label">Name:</span>
              <div class="field-value">${inquiry.name}</div>
            </div>
            
            <div class="field">
              <span class="field-label">Email:</span>
              <div class="field-value">${inquiry.email}</div>
            </div>
            
            ${inquiry.phone ? `
            <div class="field">
              <span class="field-label">Phone:</span>
              <div class="field-value">${inquiry.phone}</div>
            </div>
            ` : ''}
            
            ${inquiry.company ? `
            <div class="field">
              <span class="field-label">Company:</span>
              <div class="field-value">${inquiry.company}</div>
            </div>
            ` : ''}
            
            ${inquiry.eventType ? `
            <div class="field">
              <span class="field-label">Event Type:</span>
              <div class="field-value">${inquiry.eventType}</div>
            </div>
            ` : ''}
            
            ${inquiry.eventDate ? `
            <div class="field">
              <span class="field-label">Event Date:</span>
              <div class="field-value">${inquiry.eventDate}</div>
            </div>
            ` : ''}
            
            ${inquiry.numberOfAttendees ? `
            <div class="field">
              <span class="field-label">Number of Attendees:</span>
              <div class="field-value">${inquiry.numberOfAttendees}</div>
            </div>
            ` : ''}
            
            ${serviceNames.length > 0 ? `
            <div class="field">
              <span class="field-label">Preferred Services:</span>
              <div class="field-value">${serviceNames.join(', ')}</div>
            </div>
            ` : ''}
            
            ${inquiry.preferredContactMethod ? `
            <div class="field">
              <span class="field-label">Preferred Contact Method:</span>
              <div class="field-value">${inquiry.preferredContactMethod}</div>
            </div>
            ` : ''}
            
            ${inquiry.additionalDetails ? `
            <div class="field">
              <span class="field-label">Additional Details:</span>
              <div class="field-value">${inquiry.additionalDetails.replace(/\n/g, '<br>')}</div>
            </div>
            ` : ''}
            
            <a href="https://bueno-brows-admin.web.app/customers" class="cta-button">
              View in Admin Dashboard
            </a>
            
            <p style="margin-top: 30px; color: #999; font-size: 12px;">
              Inquiry ID: ${inquiryRef.id}<br>
              Submitted: ${new Date().toLocaleString()}
            </p>
          </div>
        </body>
        </html>
      `;

      // Send admin notification email
      await sendEmail({
        to: adminEmail,
        from: { email: 'hello@buenobrows.com', name: 'Bueno Brows' },
        subject: emailSubject,
        html: emailHtml,
      });

      // Send confirmation email to the client
      const confirmationSubject = 'Thank You for Your Event Inquiry - Bueno Brows';
      const confirmationHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Event Inquiry Received</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #ffcc33;
            }
            h1 {
              color: #1a1a1a;
              font-size: 28px;
              margin-bottom: 10px;
            }
            .greeting {
              color: #333;
              font-size: 16px;
              margin-bottom: 20px;
            }
            .content {
              color: #666;
              font-size: 15px;
              line-height: 1.8;
            }
            .highlight-box {
              background-color: #fff8e1;
              border-left: 4px solid #ffcc33;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .next-steps {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 6px;
              margin: 25px 0;
            }
            .next-steps h3 {
              color: #1a1a1a;
              margin-top: 0;
              font-size: 18px;
            }
            .next-steps ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .next-steps li {
              margin: 8px 0;
              color: #666;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              text-align: center;
              color: #999;
              font-size: 13px;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1>Event Inquiry Received</h1>
              <p style="color: #666; margin: 0;">Bueno Brows</p>
            </div>
            
            <div class="greeting">
              Dear ${inquiry.name},
            </div>
            
            <div class="content">
              <p>Thank you for your interest in our premium event packages! We've received your inquiry and are excited about the opportunity to create a memorable experience for your event.</p>
              
              <div class="highlight-box">
                <strong>Inquiry Summary:</strong><br>
                ${inquiry.company ? `Company: ${inquiry.company}<br>` : ''}
                ${inquiry.eventType ? `Event Type: ${inquiry.eventType}<br>` : ''}
                ${inquiry.eventDate ? `Preferred Date: ${inquiry.eventDate}<br>` : ''}
                ${inquiry.numberOfAttendees ? `Attendees: ${inquiry.numberOfAttendees}<br>` : ''}
                ${serviceNames.length > 0 ? `Services of Interest: ${serviceNames.join(', ')}<br>` : ''}
              </div>
              
              <p>Our team will review your inquiry and get back to you within <strong>24 hours</strong> via your preferred contact method (${inquiry.preferredContactMethod || 'email'}).</p>
              
              <div class="next-steps">
                <h3>What Happens Next?</h3>
                <ul>
                  <li>We'll review your event requirements and preferences</li>
                  <li>Create a customized package proposal tailored to your needs</li>
                  <li>Reach out to discuss pricing, availability, and logistics</li>
                  <li>Answer any questions you may have about our services</li>
                </ul>
              </div>
              
              ${inquiry.additionalDetails ? `
              <p><strong>Your Additional Details:</strong></p>
              <p style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-style: italic; color: #555;">
                "${inquiry.additionalDetails}"
              </p>
              ` : ''}
              
              <p>If you have any urgent questions in the meantime, please don't hesitate to reach out:</p>
              <p style="margin: 15px 0;">
                📧 Email: <a href="mailto:hello@buenobrows.com" style="color: #ffcc33; text-decoration: none;">hello@buenobrows.com</a><br>
                📞 Phone: <a href="tel:+16506138455" style="color: #ffcc33; text-decoration: none;">(650) 613-8455</a>
              </p>
              
              <p>We look forward to working with you to make your event extraordinary!</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Bueno Brows Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>Bueno Brows | Premium Beauty & Event Services</p>
              <p>315 9th Ave, San Mateo, CA 94401</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: inquiry.email,
        from: { email: 'hello@buenobrows.com', name: 'Bueno Brows' },
        subject: confirmationSubject,
        html: confirmationHtml,
      });

      return {
        success: true,
        messageId: inquiryRef.id,
        message: 'Your inquiry has been submitted successfully. We\'ll get back to you soon!',
      };
    } catch (error) {
      console.error('Error submitting event inquiry:', error);
      throw new HttpsError('internal', 'Failed to submit inquiry. Please try again.');
    }
  }
);

