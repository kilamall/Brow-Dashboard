import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initSendGrid, sendEmail, getEmailTemplate, replaceTemplateVariables } from './email.js';
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
function initSendGridHelper(): boolean {
  const apiKey = sendgridApiKey.value();
  if (apiKey) {
    sgMail.setApiKey(apiKey);
    return true;
  }
  return false;
}

/**
 * Send admin notification when an appointment edit request is submitted
 */
export const onEditRequestCreated = onDocumentCreated(
  {
    document: 'appointmentEditRequests/{requestId}',
    region: 'us-central1',
  },
  async (event) => {
    const editRequestData = event.data?.data();
    const requestId = event.params.requestId;

    if (!editRequestData) {
      console.log('No edit request data found');
      return;
    }

    console.log('📧 New edit request submitted, sending admin notification...');

    try {
      // Get admin email from settings
      const settingsDoc = await db.collection('settings').doc('admin').get();
      const adminEmail = settingsDoc.exists ? settingsDoc.data()?.email : null;

      if (!adminEmail) {
        console.log('No admin email configured, skipping edit request notification');
        return;
      }

      // Get appointment details
      const appointmentDoc = await db.collection('appointments').doc(editRequestData.appointmentId).get();
      const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

      if (!appointmentData) {
        console.log('Appointment not found for edit request');
        return;
      }

      // Get customer details
      const customerDoc = await db.collection('customers').doc(editRequestData.customerId).get();
      const customerData = customerDoc.exists ? customerDoc.data() : null;

      // Get service details
      const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
      const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
      const serviceName = serviceData?.name || 'Unknown Service';

      // Format current appointment details
      const currentDate = new Date(appointmentData.start);
      const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedCurrentTime = currentDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      // Format requested changes
      let requestedChangesText = '';
      if (editRequestData.requestedChanges.start) {
        const newDate = new Date(editRequestData.requestedChanges.start);
        const formattedNewDate = newDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedNewTime = newDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        requestedChangesText += `📅 <strong>New Date/Time:</strong> ${formattedNewDate} at ${formattedNewTime}<br>`;
      }

      if (editRequestData.requestedChanges.serviceIds && editRequestData.requestedChanges.serviceIds.length > 0) {
        requestedChangesText += `🔧 <strong>New Services:</strong> ${editRequestData.requestedChanges.serviceIds.join(', ')}<br>`;
      }

      if (editRequestData.requestedChanges.notes) {
        requestedChangesText += `📝 <strong>Notes:</strong> ${editRequestData.requestedChanges.notes}<br>`;
      }

      if (editRequestData.reason) {
        requestedChangesText += `💭 <strong>Reason:</strong> ${editRequestData.reason}<br>`;
      }

      const reviewLink = `https://bueno-brows-admin.web.app/edit-requests?highlight=${requestId}`;
      
      // Get service names for multi-service support
      let currentServiceNames: string[] = [serviceName];
      if (appointmentData.serviceIds && Array.isArray(appointmentData.serviceIds) && appointmentData.serviceIds.length > 0) {
        const serviceDocs = await Promise.all(
          appointmentData.serviceIds.map((id: string) => db.collection('services').doc(id).get())
        );
        currentServiceNames = serviceDocs
          .filter(doc => doc.exists)
          .map(doc => doc.data()?.name || 'Unknown Service');
      }
      const currentServiceNamesDisplay = currentServiceNames.join(', ');

      // Build requested changes section
      let requestedChangesSection = '';
      if (editRequestData.requestedChanges.start) {
        const newDate = new Date(editRequestData.requestedChanges.start);
        const formattedNewDate = newDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedNewTime = newDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        requestedChangesSection += `<p style="margin: 5px 0;"><strong style="color: #FFC107;">📅 New Date/Time:</strong> ${formattedNewDate} at ${formattedNewTime}</p>`;
      }

      if (editRequestData.requestedChanges.serviceIds && editRequestData.requestedChanges.serviceIds.length > 0) {
        const newServiceDocs = await Promise.all(
          editRequestData.requestedChanges.serviceIds.map((id: string) => db.collection('services').doc(id).get())
        );
        const newServiceNames = newServiceDocs
          .filter(doc => doc.exists)
          .map(doc => doc.data()?.name || 'Unknown Service');
        requestedChangesSection += `<p style="margin: 5px 0;"><strong style="color: #FFC107;">🔧 New Services:</strong> ${newServiceNames.join(', ')}</p>`;
      }

      if (editRequestData.requestedChanges.notes) {
        requestedChangesSection += `<p style="margin: 5px 0;"><strong style="color: #FFC107;">📝 Notes:</strong> ${editRequestData.requestedChanges.notes}</p>`;
      }

      if (!requestedChangesSection) {
        requestedChangesSection = '<p style="margin: 5px 0;">No specific changes requested.</p>';
      }

      // Build conditional sections
      const customerPhoneSection = customerData?.phone 
        ? `<div class="appointment-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${customerData.phone}</span>
          </div>`
        : '';

      const reasonSection = editRequestData.reason
        ? `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #5a4a3a;">
            <p style="margin: 5px 0; color: #FFC107;"><strong>Reason:</strong></p>
            <p style="margin: 5px 0;">${editRequestData.reason}</p>
          </div>`
        : '';

      // Get business info for template variables
      const businessInfo = await db.collection('settings').doc('businessInfo').get();
      const businessData = businessInfo.exists ? businessInfo.data() : {};
      const websiteLink = businessData?.website || 'https://bueno-brows-7cce7.web.app';

      // Try to load custom template from Firestore
      const customTemplate = await getEmailTemplate('edit-request-admin');
      let htmlContent: string;
      let emailSubject: string;

      if (customTemplate) {
        // Use custom template
        console.log('✅ Using custom email template for edit request notification');
        
        const templateVariables: Record<string, string | number> = {
          customerName: customerData?.name || 'Unknown Customer',
          customerEmail: customerData?.email || 'N/A',
          customerPhone: customerData?.phone || '',
          customerPhoneSection: customerPhoneSection,
          serviceName: currentServiceNamesDisplay,
          currentServiceName: currentServiceNamesDisplay,
          currentDate: formattedCurrentDate,
          currentTime: formattedCurrentTime,
          requestedChangesSection: requestedChangesSection,
          reason: editRequestData.reason || '',
          reasonSection: reasonSection,
          reviewLink: reviewLink,
          websiteLink: websiteLink,
          businessName: businessData?.name || 'Bueno Brows',
          businessPhone: businessData?.phone || '(650) 613-8455',
          businessEmail: businessData?.email || 'hello@buenobrows.com',
          businessAddress: businessData?.address || '315 9th Ave, San Mateo, CA 94401'
        };

        htmlContent = replaceTemplateVariables(customTemplate.html, templateVariables);
        emailSubject = replaceTemplateVariables(customTemplate.subject, templateVariables);
      } else {
        // Fallback to hardcoded template matching admin notification style
        console.log('⚠️ Using default hardcoded email template for edit request notification');
        
        htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="dark">
            <meta name="supported-color-schemes" content="dark">
            <title>Edit Request - Bueno Brows</title>
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
                padding: 40px 20px;
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
              .changes-card {
                background-color: #4a3a2a;
                border-left: 4px solid #FFC107;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="email-wrapper">
              <div class="header-banner">
                <h1>BUENO BROWS</h1>
                <h2>📝 Edit Request Received</h2>
              </div>
              <div class="content">
                <div class="urgent-badge">⚠️ ACTION REQUIRED</div>
                <p class="greeting">Hello Admin,</p>
                <p>A customer has requested to edit their appointment. Please review the changes below.</p>
                <div class="appointment-card">
                  <div class="appointment-row">
                    <span class="detail-label">Customer:</span>
                    <span class="detail-value">${customerData?.name || 'Unknown Customer'}</span>
                  </div>
                  <div class="appointment-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${customerData?.email || 'N/A'}</span>
                  </div>
                  ${customerPhoneSection}
                  <div class="appointment-row">
                    <span class="detail-label">Current Service:</span>
                    <span class="detail-value" style="text-align: right; line-height: 1.8;">${currentServiceNamesDisplay}</span>
                  </div>
                  <div class="appointment-row">
                    <span class="detail-label">Current Date:</span>
                    <span class="detail-value">${formattedCurrentDate}</span>
                  </div>
                  <div class="appointment-row">
                    <span class="detail-label">Current Time:</span>
                    <span class="detail-value">${formattedCurrentTime}</span>
                  </div>
                </div>
                <div class="changes-card">
                  <h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Requested Changes:</h3>
                  ${requestedChangesSection}
                  ${reasonSection}
                </div>
                <div style="text-align: center;">
                  <a href="${reviewLink}" class="cta-button">Review & Approve Edit Request</a>
                </div>
                <p style="margin-top: 20px; font-size: 14px; color: #aaa;">
                  <strong>Quick Actions:</strong><br>
                  • Click the button above to review and approve the edit request<br>
                  • Or visit the admin dashboard to manage all edit requests<br>
                  • The customer will be notified once you approve
                </p>
              </div>
              <div class="footer">
                <p><strong style="color: #FFC107;"><a href="${websiteLink}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p>
                <p>📍 315 9th Ave, San Mateo, CA 94401</p>
                <p>📞 (650) 613-8455</p>
                <p>✉️ <a href="mailto:hello@buenobrows.com" style="color: #888; text-decoration: none;">hello@buenobrows.com</a></p>
                <p style="margin-top: 10px;"><a href="${websiteLink}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p>
                <p style="margin-top: 16px; color: #666;">This is an automated notification from your booking system.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        emailSubject = `📝 Edit Request: ${currentServiceNamesDisplay} - ${customerData?.name || 'Customer'}`;
      }

      const msg = {
        to: adminEmail,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: emailSubject,
        html: htmlContent,
      };

      if (!initSendGridHelper()) {
        console.error('❌ Cannot send email: SENDGRID_API_KEY not configured');
        return;
      }

      await sgMail.send(msg);
      console.log(`✅ Edit request notification sent to ${adminEmail} for request ${requestId}`);
    } catch (error) {
      console.error('Error sending edit request notification email:', error);
    }
  }
);

/**
 * Send email notification to customer when edit request is approved
 */
export const sendEditApprovalEmail = onCall(
  {
    region: 'us-central1',
  },
  async (request) => {
    const { editRequestId, appointmentId, customerId } = request.data;

    if (!editRequestId || !appointmentId || !customerId) {
      throw new Error('Missing required parameters');
    }

    console.log('📧 Sending edit approval email...');

    try {
      // Get edit request details
      const editRequestDoc = await db.collection('appointmentEditRequests').doc(editRequestId).get();
      const editRequestData = editRequestDoc.exists ? editRequestDoc.data() : null;

      if (!editRequestData) {
        throw new Error('Edit request not found');
      }

      // Get appointment details
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      const appointmentData = appointmentDoc.exists ? appointmentDoc.data() : null;

      if (!appointmentData) {
        throw new Error('Appointment not found');
      }

      // Get customer details
      const customerDoc = await db.collection('customers').doc(customerId).get();
      const customerData = customerDoc.exists ? customerDoc.data() : null;

      if (!customerData?.email) {
        throw new Error('Customer email not found');
      }

      // Get service details
      const serviceDoc = await db.collection('services').doc(appointmentData.serviceId).get();
      const serviceData = serviceDoc.exists ? serviceDoc.data() : null;
      const serviceName = serviceData?.name || 'Unknown Service';

      // Format the new appointment details
      const newDate = new Date(appointmentData.start);
      const formattedDate = newDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = newDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ffcc33 0%, #D8A14A 100%); color: #2c1810; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #1a0f08;">✅ Edit Request Approved</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
            <h2 style="color: #2c1810; margin-top: 0;">Your appointment has been updated!</h2>
            
            <p>Hi ${customerData.name || 'there'},</p>
            
            <p>Great news! Your appointment edit request has been approved. Here are your updated appointment details:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c1810; margin-top: 0;">Updated Appointment Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedTime}</p>
              ${appointmentData.notes ? `<p><strong>Notes:</strong> ${appointmentData.notes}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://buenobrows.com" style="background: #D8A14A; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                View Your Appointment
              </a>
            </div>

            <p>If you have any questions or need to make further changes, please don't hesitate to contact us.</p>
            
            <div style="border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p>Thank you for choosing Bueno Brows!</p>
              <p><strong>Bueno Brows Team</strong></p>
            </div>
          </div>
        </div>
      `;

      const msg = {
        to: customerData.email,
        from: { email: 'hello@buenobrows.com', name: 'Bueno Brows' },
        subject: `✅ Appointment Updated - ${serviceName} on ${formattedDate}`,
        html: emailContent,
      };

      await sendEmail(msg);
      console.log('Edit approval email sent successfully to:', customerData.email);
      
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      console.error('Error sending edit approval email:', error);
      throw error;
    }
  }
);
