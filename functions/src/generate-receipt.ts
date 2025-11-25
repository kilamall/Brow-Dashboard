import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
// @ts-ignore - pdfkit doesn't have type definitions
import PDFDocument from 'pdfkit';
// @ts-ignore - shared types import
import type { Appointment, Service } from '@buenobrows/shared/types';

try { initializeApp(); } catch {}
const db = getFirestore();
const storage = getStorage();

// Helper function to generate receipt that can be called directly
export async function generateReceiptHelper(appointmentId: string): Promise<{ success: boolean; receiptUrl: string; fileName: string }> {
  // Get appointment data
  const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
  
  if (!appointmentDoc.exists) {
    throw new Error('Appointment not found');
  }
  
  const appointment = { id: appointmentId, ...appointmentDoc.data() } as Appointment;
  
  // Get services data
  const serviceIds = (appointment as any).serviceIds || (appointment as any).selectedServices || [appointment.serviceId];
  const services: Service[] = [];
  
  for (const serviceId of serviceIds) {
    const serviceDoc = await db.collection('services').doc(serviceId).get();
    if (serviceDoc.exists) {
      services.push({ id: serviceDoc.id, ...serviceDoc.data() } as Service);
    }
  }

  // Get business settings - use same pattern as email templates
  const businessInfoDoc = await db.collection('settings').doc('businessInfo').get();
  const businessInfoData = businessInfoDoc.exists ? businessInfoDoc.data() : null;
  const businessInfo = businessInfoData || {
    businessName: 'Bueno Brows',
    businessAddress: '123 Main Street, Downtown',
    businessPhone: '(555) 123-4567',
    businessEmail: 'hello@buenobrows.com'
  };

  // Generate PDF
  const pdfBuffer = await generateReceiptPDF(appointment, services, businessInfo, appointmentId);
  
  // Upload to Firebase Storage
  const fileName = `receipts/${appointment.customerId}/${appointmentId}_receipt.pdf`;
  const bucket = storage.bucket();
  const file = bucket.file(fileName);
  
  await file.save(pdfBuffer, {
    metadata: {
      contentType: 'application/pdf',
      metadata: {
        appointmentId: appointmentId,
        customerId: appointment.customerId,
        generatedAt: new Date().toISOString()
      }
    }
  });

  // Make file publicly readable
  await file.makePublic();
  
  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  
  return {
    success: true,
    receiptUrl: publicUrl,
    fileName: fileName
  };
}

export const generateReceipt = onCall(
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

    const { appointmentId, sendEmail: shouldSendEmail } = req.data || {};
    
    if (!appointmentId) {
      throw new HttpsError('invalid-argument', 'Missing appointmentId');
    }

    try {
      // Generate receipt PDF
      const receiptResult = await generateReceiptHelper(appointmentId);
      
      // If email should be sent, send it
      if (shouldSendEmail !== false) { // Default to true if not specified
        try {
          // Get appointment to check for customer email
          const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
          if (appointmentDoc.exists) {
            const appointment = appointmentDoc.data();
            const customerEmail = appointment?.customerEmail;
            
            if (!customerEmail) {
              console.warn('⚠️ Customer email is missing - receipt generated but email not sent');
              // Log the missing email attempt
              await db.collection('email_logs').add({
                to: null,
                subject: 'Receipt Email - Customer Email Missing',
                type: 'receipt-email',
                status: 'failed',
                error: 'Customer email is missing from appointment document',
                timestamp: new Date().toISOString(),
                appointmentId: appointmentId,
                receiptUrl: receiptResult.receiptUrl
              });
              return receiptResult;
            }
            
            // Import the email sending logic
            const { sendEmail } = await import('./email.js');
            
            // Get customer details
            const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
            const customerName = customerDoc.exists ? (customerDoc.data()?.name || 'Valued Customer') : 'Valued Customer';
            
            // Get business info
            const businessInfoDoc = await db.collection('settings').doc('businessInfo').get();
            const businessInfo = businessInfoDoc.exists ? businessInfoDoc.data() : {
              businessName: 'Bueno Brows',
              businessPhone: '(555) 123-4567',
              businessEmail: 'hello@buenobrows.com'
            } as any;
            
            // Get email template - PRIORITIZE Firestore template over hardcoded default
            const templatesDoc = await db.collection('settings').doc('emailTemplates').get();
            let receiptTemplate = null;
            
            if (templatesDoc.exists) {
              const templateData = templatesDoc.data();
              const templates = templateData?.templates;
              if (templates && Array.isArray(templates)) {
                receiptTemplate = templates.find((t: any) => t.id === 'receipt-email');
              }
            }
            
            // Fallback to hardcoded default ONLY if Firestore template not found
            if (!receiptTemplate) {
              // Use a simple default template if Firestore template not found
              receiptTemplate = {
                id: 'receipt-email',
                subject: 'Your Receipt from {{businessName}}',
                html: '<!DOCTYPE html><html><head><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><style>body { font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }.email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }.header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }.header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }.header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }.content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }.greeting { margin: 0 0 15px 0; font-size: 16px; }.appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }.appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }.appointment-row:last-child { border-bottom: none; }.detail-label { color: #FFC107; font-weight: 500; }.detail-value { color: #ffffff; font-weight: 600; }.total-row { margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFC107; }.total-price { color: #FFC107; font-size: 24px; font-weight: 700; }.cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }.footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }</style></head><body><div class="email-wrapper"><div class="header-banner"><h1>BUENO BROWS</h1><h2>💰 Thank You for Your Visit!</h2></div><div class="content"><p class="greeting">Hi {{customerName}},</p><p>Thank you for choosing {{businessName}}! Here\'s your receipt for today\'s services:</p><div class="appointment-card"><h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Receipt #{{receiptNumber}}</h3><div class="appointment-row"><span class="detail-label">Date:</span><span class="detail-value">{{date}}</span></div><div class="appointment-row"><span class="detail-label">Time:</span><span class="detail-value">{{time}}</span></div><div style="border-top: 1px solid #4a4a4a; margin: 15px 0; padding-top: 15px;"><p style="margin: 10px 0; color: #FFC107; font-weight: 600;">Services:</p><div style="margin: 5px 0;">{{serviceDetails}}</div></div><div class="appointment-row"><span class="detail-label">Subtotal:</span><span class="detail-value">${{subtotal}}</span></div><div class="appointment-row"><span class="detail-label">Tip:</span><span class="detail-value">${{tip}}</span></div><div class="appointment-row total-row"><span class="detail-label">Total:</span><span class="total-price">${{total}}</span></div></div><p>Your detailed receipt is attached as a PDF for your records.</p><p style="margin-top: 20px;">We hope you love your results! If you have any questions or would like to book your next appointment, please don\'t hesitate to contact us.</p><div style="text-align: center;"><a href="{{receiptUrl}}" class="cta-button">Download Receipt PDF</a></div></div><div class="footer"><p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p><p>📍 315 9th Ave, San Mateo, CA 94401</p><p>📞 {{businessPhone}}</p><p>✉️ <a href="mailto:{{businessEmail}}" style="color: #888; text-decoration: none;">{{businessEmail}}</a></p><p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p></div></div></body></html>'
              };
            }
            
            
            // Format date and time
            const appointmentDate = new Date(appointment.start);
            const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
            const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
            const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';
            
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
            
            // Get services for service details
            const serviceIds = appointment.serviceIds || appointment.selectedServices || [appointment.serviceId];
            const services: any[] = [];
            for (const serviceId of serviceIds) {
              const serviceDoc = await db.collection('services').doc(serviceId).get();
              if (serviceDoc.exists) {
                services.push({ id: serviceDoc.id, ...serviceDoc.data() });
              }
            }
            
            // Calculate pricing - format as styled div rows for dark theme
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
            
            // Replace template variables
            let emailHtml = receiptTemplate.html;
            const websiteLink = 'https://bueno-brows-7cce7.web.app';
            const variables = {
              customerName: customerName,
              businessName: businessInfo.businessName || 'Bueno Brows',
              businessPhone: businessInfo.businessPhone || '(650) 613-8455',
              businessEmail: businessInfo.businessEmail || 'hello@buenobrows.com',
              receiptNumber: appointment.receiptNumber || `RCP-${appointmentId.substring(0, 8).toUpperCase()}`,
              date: formattedDate,
              time: formattedTime,
              serviceDetails: serviceDetails, // Already formatted as HTML div rows
              subtotal: subtotal.toFixed(2),
              tip: tip.toFixed(2),
              total: total.toFixed(2),
              receiptUrl: receiptResult.receiptUrl,
              websiteLink: websiteLink
            };
            
            Object.entries(variables).forEach(([key, value]) => {
              emailHtml = emailHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
            });
            
            // Send email
            const FROM_EMAIL = 'hello@buenobrows.com';
            const emailResult = await sendEmail({
              to: customerEmail,
              from: { email: FROM_EMAIL, name: businessInfo.businessName || 'Bueno Brows' },
              subject: receiptTemplate.subject.replace(/\{\{businessName\}\}/g, businessInfo.businessName || 'Bueno Brows'),
              html: emailHtml
            });
            
            if (!emailResult.success) {
              console.error('❌ Email send failed. Error:', emailResult.error);
            }
            
            // Log email attempt - serialize sendGridResponse to plain object
            const logData: any = {
              to: customerEmail,
              subject: receiptTemplate.subject.replace(/\{\{businessName\}\}/g, businessInfo.businessName || 'Bueno Brows'),
              type: 'receipt-email',
              status: emailResult.success ? 'sent' : 'failed',
              error: emailResult.error || null,
              timestamp: new Date().toISOString(),
              appointmentId: appointmentId,
              receiptUrl: receiptResult.receiptUrl
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
              console.log('✅ Receipt email sent successfully to:', customerEmail);
            } else {
              console.error('❌ Failed to send receipt email to:', customerEmail);
              console.error('❌ Error details:', emailResult.error);
              // Don't throw - receipt was generated successfully, email is secondary
            }
          } else {
            console.warn('⚠️ Appointment document not found:', appointmentId);
          }
        } catch (emailError: any) {
          console.error('⚠️ Error sending receipt email (receipt still generated):', emailError);
          console.error('⚠️ Error stack:', emailError?.stack);
          console.error('⚠️ Error message:', emailError?.message);
          // Don't fail the receipt generation if email fails
        }
      }
      
      return receiptResult;
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new HttpsError('internal', `Failed to generate receipt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

async function generateReceiptPDF(
  appointment: Appointment, 
  services: Service[], 
  businessInfo: any,
  appointmentId: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 35
    });

    const buffers: Buffer[] = [];
    
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 35;
    let yPos = margin;

    // Header - Compact business info (matching email template variables)
    const businessName = businessInfo.businessName || 'Bueno Brows';
    const businessAddress = businessInfo.businessAddress || businessInfo.address || '';
    const businessPhone = businessInfo.businessPhone || businessInfo.phone || '(555) 123-4567';
    const businessEmail = businessInfo.businessEmail || businessInfo.email || 'hello@buenobrows.com';

    doc.fontSize(18)
       .fillColor('#8B4513') // Terracotta color (matching email template)
       .text(businessName, margin, yPos, { align: 'center' });
    
    yPos += 20;
    if (businessAddress) {
      doc.fontSize(8)
         .fillColor('#666666')
         .text(businessAddress, margin, yPos, { align: 'center' });
      yPos += 10;
    }
    
    doc.fontSize(8)
       .fillColor('#666666')
       .text(`Phone: ${businessPhone} | Email: ${businessEmail}`, margin, yPos, { align: 'center' });

    // Divider line
    yPos += 12;
    doc.moveTo(margin, yPos)
       .lineTo(pageWidth - margin, yPos)
       .strokeColor('#CCCCCC')
       .lineWidth(0.5)
       .stroke();

    // Receipt title and number - side by side
    yPos += 10;
    const receiptNumber = `RCP-${appointmentId.substring(0, 8).toUpperCase()}`;
    doc.fontSize(14)
       .fillColor('#000000')
       .text('RECEIPT', margin, yPos);
    
    doc.fontSize(9)
       .fillColor('#666666')
       .text(`Receipt #: ${receiptNumber}`, pageWidth - margin - 150, yPos, { width: 150, align: 'right' });

    // Date and time - compact
    yPos += 16;
    const serviceDate = new Date(appointment.start);
    const formattedDate = serviceDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const formattedTime = serviceDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    doc.fontSize(9)
       .fillColor('#666666')
       .text(`Date: ${formattedDate} | Time: ${formattedTime}`, margin, yPos);

    // Customer info - compact inline
    yPos += 14;
    doc.fontSize(9)
       .fillColor('#333333')
       .text(`Customer: ${appointment.customerName || 'N/A'}`, margin, yPos);
    
    if (appointment.customerEmail || appointment.customerPhone) {
      yPos += 10;
      const contactInfo = [
        appointment.customerEmail ? `Email: ${appointment.customerEmail}` : '',
        appointment.customerPhone ? `Phone: ${appointment.customerPhone}` : ''
      ].filter(Boolean).join(' | ');
      doc.fontSize(8)
         .fillColor('#666666')
         .text(contactInfo, margin, yPos);
      yPos += 10;
    } else {
      yPos += 8;
    }

    // Divider line
    doc.moveTo(margin, yPos)
       .lineTo(pageWidth - margin, yPos)
       .strokeColor('#CCCCCC')
       .lineWidth(0.5)
       .stroke();

    // Services section - compact table
    yPos += 10;
    doc.fontSize(10)
       .fillColor('#000000')
       .text('SERVICES', margin, yPos);

    yPos += 12;
    let totalServicePrice = 0;
    const hasIndividualPrices = appointment.servicePrices && Object.keys(appointment.servicePrices).length > 0;
    
    // Table header - properly positioned
    const amountColumnX = pageWidth - margin - 100;
    doc.fontSize(8)
       .fillColor('#666666')
       .text('Service', margin, yPos)
       .text('Amount', amountColumnX, yPos, { width: 100, align: 'right' });
    
    yPos += 10;
    doc.moveTo(margin, yPos)
       .lineTo(pageWidth - margin, yPos)
       .strokeColor('#CCCCCC')
       .lineWidth(0.3)
       .stroke();
    
    yPos += 6;
    
    if (hasIndividualPrices && appointment.servicePrices) {
      // Multi-service with individual prices
      services.forEach((service) => {
        const servicePrice = appointment.servicePrices![service.id] || service.price;
        totalServicePrice += servicePrice;
        
        // Service name on left, amount on right - properly positioned
        doc.fontSize(9)
           .fillColor('#333333')
           .text(service.name, margin, yPos, { width: amountColumnX - margin - 10 })
           .text(`$${servicePrice.toFixed(2)}`, amountColumnX, yPos, { width: 100, align: 'right' });
        
        yPos += 12;
      });
    } else {
      // Single service or legacy pricing
      const servicePrice = appointment.bookedPrice || (services[0]?.price || 0);
      totalServicePrice = servicePrice;
      
      services.forEach((service) => {
        // Service name on left, amount on right - properly positioned
        doc.fontSize(9)
           .fillColor('#333333')
           .text(service.name, margin, yPos, { width: amountColumnX - margin - 10 })
           .text(`$${servicePrice.toFixed(2)}`, amountColumnX, yPos, { width: 100, align: 'right' });
        
        yPos += 12;
      });
    }

    // Totals section - properly aligned
    yPos += 4;
    doc.moveTo(margin, yPos)
       .lineTo(pageWidth - margin, yPos)
       .strokeColor('#CCCCCC')
       .lineWidth(0.5)
       .stroke();
    
    yPos += 8;
    const totalsX = pageWidth - margin - 100;
    doc.fontSize(9)
       .fillColor('#333333')
       .text('Subtotal:', totalsX - 60, yPos, { width: 60, align: 'right' })
       .text(`$${totalServicePrice.toFixed(2)}`, totalsX, yPos, { width: 100, align: 'right' });

    const tipAmount = appointment.tip || 0;
    if (tipAmount > 0) {
      yPos += 14;
      doc.fontSize(9)
         .fillColor('#333333')
         .text('Tip:', totalsX - 60, yPos, { width: 60, align: 'right' })
         .text(`$${tipAmount.toFixed(2)}`, totalsX, yPos, { width: 100, align: 'right' });
    }

    const totalAmount = totalServicePrice + tipAmount;
    yPos += (tipAmount > 0 ? 16 : 10);
    doc.moveTo(margin, yPos)
       .lineTo(pageWidth - margin, yPos)
       .strokeColor('#8B4513')
       .lineWidth(1)
       .stroke();
    
    yPos += 6;
    doc.fontSize(10)
       .fillColor('#000000')
       .text('TOTAL:', totalsX - 60, yPos, { width: 60, align: 'right' });
    doc.fontSize(12)
       .fillColor('#000000')
       .text(`$${totalAmount.toFixed(2)}`, totalsX, yPos, { width: 100, align: 'right' });

    // Notes (if any) - compact
    if (appointment.notes) {
      yPos += 18;
      doc.fontSize(8)
         .fillColor('#666666')
         .text('Notes:', margin, yPos)
         .fontSize(8)
         .fillColor('#333333')
         .text(appointment.notes, margin, yPos + 10, { width: pageWidth - margin * 2 });
      yPos += 15;
    }

    // Thank you message - positioned dynamically to fit on one page
    yPos += 20;
    doc.fontSize(9)
       .fillColor('#8B4513') // Terracotta color
       .text(`Thank you for choosing ${businessName}!`, margin, yPos, { align: 'center' });
    
    yPos += 10;
    doc.fontSize(8)
       .fillColor('#666666')
       .text('We look forward to seeing you again soon.', margin, yPos, { align: 'center' });
    
    yPos += 12;
    doc.fontSize(7)
       .fillColor('#666666')
       .text(`Questions? Contact us at ${businessPhone} or ${businessEmail}`, margin, yPos, { align: 'center' });

    // Footer - very compact
    yPos = pageHeight - 25;
    doc.fontSize(6)
       .fillColor('#999999')
       .text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPos, { align: 'center' });

    doc.end();
  });
}
