// functions/src/send-receipt-email.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Default email templates (fallback)
const defaultTemplates = [
  {
    id: 'receipt-email',
    name: 'Receipt Email',
    subject: 'Your Receipt from {{businessName}}',
    html: '<!DOCTYPE html><html><head><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><style>body { font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }.email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }.header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }.header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }.header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }.content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }.greeting { margin: 0 0 15px 0; font-size: 16px; }.appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }.appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }.appointment-row:last-child { border-bottom: none; }.detail-label { color: #FFC107; font-weight: 500; }.detail-value { color: #ffffff; font-weight: 600; }.total-row { margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFC107; }.total-price { color: #FFC107; font-size: 24px; font-weight: 700; }.cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }.footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }</style></head><body><div class="email-wrapper"><div class="header-banner"><h1>BUENO BROWS</h1><h2>💰 Thank You for Your Visit!</h2></div><div class="content"><p class="greeting">Hi {{customerName}},</p><p>Thank you for choosing {{businessName}}! Here\'s your receipt for today\'s services:</p><div class="appointment-card"><h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Receipt #{{receiptNumber}}</h3><div class="appointment-row"><span class="detail-label">Date:</span><span class="detail-value">{{date}}</span></div><div class="appointment-row"><span class="detail-label">Time:</span><span class="detail-value">{{time}}</span></div><div style="border-top: 1px solid #4a4a4a; margin: 15px 0; padding-top: 15px;"><p style="margin: 10px 0; color: #FFC107; font-weight: 600;">Services:</p><div style="margin: 5px 0;">{{serviceDetails}}</div></div><div class="appointment-row"><span class="detail-label">Subtotal:</span><span class="detail-value">${{subtotal}}</span></div><div class="appointment-row"><span class="detail-label">Tip:</span><span class="detail-value">${{tip}}</span></div><div class="appointment-row total-row"><span class="detail-label">Total:</span><span class="total-price">${{total}}</span></div></div><p>Your detailed receipt is attached as a PDF for your records.</p><p style="margin-top: 20px;">We hope you love your results! If you have any questions or would like to book your next appointment, please don\'t hesitate to contact us.</p><div style="text-align: center;"><a href="{{receiptUrl}}" class="cta-button">Download Receipt PDF</a></div></div><div class="footer"><p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p><p>📍 315 9th Ave, San Mateo, CA 94401</p><p>📞 {{businessPhone}}</p><p>✉️ <a href="mailto:{{businessEmail}}" style="color: #888; text-decoration: none;">{{businessEmail}}</a></p><p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p></div></div></body></html>'
  }
];

export const sendReceiptEmail = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can send receipt emails');
    }

    const { appointmentId, email } = req.data;

    if (!appointmentId || !email) {
      throw new HttpsError('invalid-argument', 'appointmentId and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new HttpsError('invalid-argument', 'Invalid email address format');
    }

    try {
      // Get appointment
      const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }

      const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() } as any;

      // Check if receipt exists
      if (!appointment.receiptUrl) {
        throw new HttpsError('failed-precondition', 'Receipt has not been generated for this appointment');
      }

      // Get customer details
      const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
      if (!customerDoc.exists) {
        throw new HttpsError('not-found', 'Customer not found');
      }

      const customerData = customerDoc.data();
      const customerName = customerData?.name || 'Valued Customer';

      // Get business info
      const businessInfoDoc = await db.collection('settings').doc('businessInfo').get();
      const businessInfoData = businessInfoDoc.exists ? businessInfoDoc.data() : null;
      const businessInfo = businessInfoData || {
        businessName: 'Bueno Brows',
        businessPhone: '(555) 123-4567',
        businessEmail: 'hello@buenobrows.com'
      };

      // Get services data
      const serviceIds = appointment.serviceIds || appointment.selectedServices || [appointment.serviceId];
      const services: any[] = [];
      
      for (const serviceId of serviceIds) {
        const serviceDoc = await db.collection('services').doc(serviceId).get();
        if (serviceDoc.exists) {
          services.push({ id: serviceDoc.id, ...serviceDoc.data() });
        }
      }

      // Get business hours for timezone
      const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
      const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
      const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';

      // Format date and time
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

      // Calculate pricing details - format as styled div rows for dark theme
      const hasIndividualPrices = appointment.servicePrices && Object.keys(appointment.servicePrices).length > 0;
      let serviceDetails = '';
      let subtotal = 0;
      
      if (hasIndividualPrices && appointment.servicePrices) {
        serviceDetails = services.map((service) => {
          const servicePrice = appointment.servicePrices[service.id] || service.price;
          subtotal += servicePrice;
          return `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #4a4a4a;"><span style="color: #ffffff;">${service.name}</span><span style="color: #ffffff; font-weight: 600;">$${servicePrice.toFixed(2)}</span></div>`;
        }).join('');
      } else {
        const totalPrice = appointment.bookedPrice || (services[0]?.price || 0);
        subtotal = totalPrice;
        
        if (services.length === 1) {
          serviceDetails = `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #4a4a4a;"><span style="color: #ffffff;">${services[0].name}</span><span style="color: #ffffff; font-weight: 600;">$${totalPrice.toFixed(2)}</span></div>`;
        } else {
          const pricePerService = totalPrice / services.length;
          serviceDetails = services.map((service) => {
            return `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #4a4a4a;"><span style="color: #ffffff;">${service.name}</span><span style="color: #ffffff; font-weight: 600;">$${pricePerService.toFixed(2)}</span></div>`;
          }).join('');
        }
      }

      const tip = parseFloat(appointment.tip) || 0;
      const total = subtotal + tip;

      // Get email template - PRIORITIZE Firestore template over hardcoded default
      const templatesDoc = await db.collection('settings').doc('emailTemplates').get();
      let receiptTemplate = null;
      
      if (templatesDoc.exists) {
        const templates = templatesDoc.data()?.templates;
        if (templates && Array.isArray(templates)) {
          receiptTemplate = templates.find((t: any) => t.id === 'receipt-email');
        }
      }
      
      // Fallback to hardcoded default ONLY if Firestore template not found
      if (!receiptTemplate) {
        receiptTemplate = defaultTemplates.find(t => t.id === 'receipt-email');
      }
      
      if (!receiptTemplate) {
        throw new HttpsError('failed-precondition', 'Receipt email template not found');
      }

      // Replace template variables
      let emailHtml = receiptTemplate.html;
      const variables = {
        customerName: customerName,
        businessName: businessInfo.businessName || 'Bueno Brows',
        businessPhone: businessInfo.businessPhone || '(555) 123-4567',
        businessEmail: businessInfo.businessEmail || 'hello@buenobrows.com',
        receiptNumber: appointment.receiptNumber || `RCP-${appointmentId.substring(0, 8).toUpperCase()}`,
        date: formattedDate,
        time: formattedTime,
        serviceDetails: serviceDetails, // Already formatted as HTML table rows
        subtotal: subtotal.toFixed(2),
        tip: tip.toFixed(2),
        total: total.toFixed(2),
        receiptUrl: appointment.receiptUrl
      };

      Object.entries(variables).forEach(([key, value]) => {
        emailHtml = emailHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // Send receipt email
      const { sendEmail } = await import('./email');
      const FROM_EMAIL = 'hello@buenobrows.com';
      const emailResult = await sendEmail({
        to: email,
        from: { email: FROM_EMAIL, name: businessInfo.businessName || 'Bueno Brows' },
        subject: receiptTemplate.subject.replace(/\{\{businessName\}\}/g, businessInfo.businessName || 'Bueno Brows'),
        html: emailHtml
      });

      // Log email attempt to database - serialize sendGridResponse to plain object
      const logData: any = {
        to: email,
        subject: receiptTemplate.subject.replace(/\{\{businessName\}\}/g, businessInfo.businessName || 'Bueno Brows'),
        type: 'receipt-email',
        status: emailResult.success ? 'sent' : 'failed',
        error: emailResult.error || null,
        timestamp: new Date().toISOString(),
        appointmentId: appointmentId,
        receiptUrl: appointment.receiptUrl
      };
      
      // Safely serialize sendGridResponse (convert Response objects to plain objects)
      if (emailResult.sendGridResponse) {
        try {
          // If it's an array with Response objects, convert to plain objects
          if (Array.isArray(emailResult.sendGridResponse)) {
            logData.sendGridResponse = emailResult.sendGridResponse.map((item: any) => {
              if (item && typeof item === 'object') {
                return JSON.parse(JSON.stringify(item));
              }
              return item;
            });
          } else if (emailResult.sendGridResponse && typeof emailResult.sendGridResponse === 'object') {
            logData.sendGridResponse = JSON.parse(JSON.stringify(emailResult.sendGridResponse));
          } else {
            logData.sendGridResponse = emailResult.sendGridResponse;
          }
        } catch (e) {
          // If serialization fails, just store a string representation
          logData.sendGridResponse = String(emailResult.sendGridResponse);
        }
      }
      
      await db.collection('email_logs').add(logData);

      if (emailResult.success) {
        return {
          success: true,
          message: 'Receipt email sent successfully',
          email: email
        };
      } else {
        console.error('❌ Failed to send receipt email to:', email);
        console.error('❌ Error:', emailResult.error);
        throw new HttpsError('internal', `Failed to send email: ${emailResult.error}`);
      }
    } catch (error: any) {
      console.error('⚠️ Error sending receipt email:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to send receipt email: ${error.message}`);
    }
  }
);

