// functions/src/mark-attendance.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import { sendSMS } from './sms.js';

try { initializeApp(); } catch {}
const db = getFirestore();

// Twilio configuration (matching pattern from sms.ts)
const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhoneNumber = defineString('TWILIO_PHONE_NUMBER', { default: '+16506839181' });
const twilioMessagingServiceSid = defineString('TWILIO_MESSAGING_SERVICE_SID', { default: '' });

// Default email templates (fallback)
const defaultTemplates = [
  {
    id: 'receipt-email',
    name: 'Receipt Email',
    subject: 'Your Receipt from {{businessName}}',
    html: '<!DOCTYPE html><html><head><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><style>body { font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #1a1a1a; }.email-wrapper { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; }.header-banner { background-color: #FFC107; padding: 40px 20px; text-align: center; }.header-banner h1 { margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }.header-banner h2 { margin: 10px 0 0 0; font-size: 18px; font-weight: 600; color: #1a1a1a; }.content { background-color: #2a2a2a; padding: 28px 20px; color: #ffffff; }.greeting { margin: 0 0 15px 0; font-size: 16px; }.appointment-card { background-color: #3a3a3a; border-radius: 8px; padding: 20px; margin: 20px 0; }.appointment-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #4a4a4a; }.appointment-row:last-child { border-bottom: none; }.detail-label { color: #FFC107; font-weight: 500; }.detail-value { color: #ffffff; font-weight: 600; }.total-row { margin-top: 15px; padding-top: 15px; border-top: 2px solid #FFC107; }.total-price { color: #FFC107; font-size: 24px; font-weight: 700; }.cta-button { display: inline-block; background-color: #FFC107; color: #1a1a1a !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; margin: 20px 0; }.footer { background-color: #1a1a1a; padding: 24px 20px; text-align: center; color: #888; font-size: 14px; }</style></head><body><div class="email-wrapper"><div class="header-banner"><h1>BUENO BROWS</h1><h2>💰 Thank You for Your Visit!</h2></div><div class="content"><p class="greeting">Hi {{customerName}},</p><p>Thank you for choosing {{businessName}}! Here\'s your receipt for today\'s services:</p><div class="appointment-card"><h3 style="margin-top: 0; color: #FFC107; font-size: 16px;">Receipt #{{receiptNumber}}</h3><div class="appointment-row"><span class="detail-label">Date:</span><span class="detail-value">{{date}}</span></div><div class="appointment-row"><span class="detail-label">Time:</span><span class="detail-value">{{time}}</span></div><div style="border-top: 1px solid #4a4a4a; margin: 15px 0; padding-top: 15px;"><p style="margin: 10px 0; color: #FFC107; font-weight: 600;">Services:</p><div style="margin: 5px 0;">{{serviceDetails}}</div></div><div class="appointment-row"><span class="detail-label">Subtotal:</span><span class="detail-value">${{subtotal}}</span></div><div class="appointment-row"><span class="detail-label">Tip:</span><span class="detail-value">${{tip}}</span></div><div class="appointment-row total-row"><span class="detail-label">Total:</span><span class="total-price">${{total}}</span></div></div><p>Your detailed receipt is attached as a PDF for your records.</p><p style="margin-top: 20px;">We hope you love your results! If you have any questions or would like to book your next appointment, please don\'t hesitate to contact us.</p><div style="text-align: center;"><a href="{{receiptUrl}}" class="cta-button">Download Receipt PDF</a></div></div><div class="footer"><p><strong style="color: #FFC107;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: none;">Bueno Brows</a></strong></p><p>📍 315 9th Ave, San Mateo, CA 94401</p><p>📞 {{businessPhone}}</p><p>✉️ <a href="mailto:{{businessEmail}}" style="color: #888; text-decoration: none;">{{businessEmail}}</a></p><p style="margin-top: 10px;"><a href="{{websiteLink}}" style="color: #FFC107; text-decoration: underline;">Visit our website</a></p></div></div></body></html>'
  }
];

export const markAttendance = onCall(
  { 
    region: 'us-central1', 
    cors: true,
    secrets: [twilioAccountSid, twilioAuthToken]
  },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { appointmentId, attendance, actualPrice, tipAmount, notes } = req.data || {};
    
    if (!appointmentId || !attendance) {
      throw new HttpsError('invalid-argument', 'Missing appointmentId or attendance');
    }
    
    if (!['attended', 'no-show'].includes(attendance)) {
      throw new HttpsError('invalid-argument', 'Attendance must be "attended" or "no-show"');
    }

    try {
      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const appointmentDoc = await appointmentRef.get();
      
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }
      
      const appointment: any = appointmentDoc.data();
      
      // Check if already marked - but allow admin override with reason
      if (appointment.attendance && appointment.attendance !== 'pending') {
        const { overrideReason } = req.data;
        
        if (!overrideReason || overrideReason.trim() === '') {
          throw new HttpsError('failed-precondition', 
            `Appointment attendance already marked as "${appointment.attendance}". ` +
            `To change it, provide an "overrideReason" explaining why.`
          );
        }
        
        console.log(`⚠️ OVERRIDE: Changing attendance from "${appointment.attendance}" to "${attendance}". Reason: ${overrideReason}`);
      }

      const now = new Date().toISOString();
      const updateData: any = {
        attendance,
        attendanceMarkedAt: now,
        attendanceMarkedBy: req.auth.uid,
        updatedAt: now
      };

      // If this is an override, log the previous state
      if (appointment.attendance && appointment.attendance !== 'pending') {
        updateData.previousAttendance = appointment.attendance;
        updateData.attendanceOverrideReason = req.data.overrideReason?.trim();
        updateData.attendanceOverriddenAt = now;
        updateData.attendanceOverriddenBy = req.auth.uid;
        
        // IMPORTANT: Adjust customer no-show count if reversing a no-show
        if (appointment.attendance === 'no-show' && attendance === 'attended') {
          try {
            const customerRef = db.collection('customers').doc(appointment.customerId);
            const customerDoc = await customerRef.get();
            
            if (customerDoc.exists) {
              const customerData = customerDoc.data();
              const currentCount = customerData?.noShowCount || 0;
              
              await customerRef.update({
                noShowCount: Math.max(0, currentCount - 1),
                updatedAt: now
              });
              
              console.log(`✅ Decremented no-show count for customer ${appointment.customerId} from ${currentCount} to ${Math.max(0, currentCount - 1)}`);
            }
          } catch (error) {
            console.error('⚠️ Error adjusting customer no-show count:', error);
            // Don't fail the attendance marking if count adjustment fails
          }
        }
      }

      // Add financial tracking data if provided
      if (attendance === 'attended' && actualPrice !== undefined) {
        updateData.actualPrice = parseFloat(actualPrice) || 0;
        updateData.priceDifference = (parseFloat(actualPrice) || 0) - (appointment.bookedPrice || 0);
      }
      
      if (attendance === 'attended' && tipAmount !== undefined) {
        updateData.tipAmount = parseFloat(tipAmount) || 0;
      }
      
      if (attendance === 'attended' && notes) {
        updateData.attendanceNotes = notes.trim();
      }

      if (attendance === 'attended') {
        // Mark as completed and send post-service receipt
        updateData.status = 'completed';
        updateData.completedAt = now;
        updateData.completedBy = req.auth.uid;
        
        await appointmentRef.update(updateData);
        
        // Generate receipt and send email
        try {
          
          // Get customer details
          const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
          if (!customerDoc.exists) {
            console.error('❌ Customer document not found:', appointment.customerId);
            throw new Error(`Customer not found: ${appointment.customerId}`);
          }
          
          const customerData = customerDoc.data();
          const customerEmail = customerData?.email;
          const customerName = customerData?.name || 'Valued Customer';


          // Always generate receipt PDF, even if no email
          // Generate receipt PDF
          const { generateReceiptHelper } = await import('./generate-receipt');
          const receiptResult = await generateReceiptHelper(appointmentId);
          
          if (!receiptResult.success) {
            console.error('❌ Receipt generation failed:', receiptResult);
            throw new Error('Failed to generate receipt PDF');
          }
          
          // Update appointment with receipt URL
          await appointmentRef.update({
            receiptUrl: receiptResult.receiptUrl,
            receiptGeneratedAt: now,
            receiptNumber: `RCP-${appointmentId.substring(0, 8).toUpperCase()}`
          });
          
          
          // If no email, return early with emailRequired flag
          if (!customerEmail) {
            console.log('⚠️ Customer email is missing - receipt generated but email not sent');
            return {
              success: true,
              message: 'Appointment marked as attended. Receipt generated.',
              appointmentId,
              status: 'completed',
              attendance: 'attended',
              receiptGenerated: true,
              receiptUrl: receiptResult.receiptUrl,
              emailRequired: true // Flag to prompt admin for email
            };
          }

          
          // Get business info for email template
          const businessInfoDoc = await db.collection('settings').doc('businessInfo').get();
          const businessInfoData = businessInfoDoc.exists ? businessInfoDoc.data() : null;
          const businessInfo = businessInfoData || {
            businessName: 'Bueno Brows',
            businessPhone: '(555) 123-4567',
            businessEmail: 'hello@buenobrows.com'
          };

          // Get services data for email
          const serviceIds = (appointment as any).serviceIds || (appointment as any).selectedServices || [appointment.serviceId];
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
            // Multi-service with individual prices
            serviceDetails = services.map((service) => {
              const servicePrice = appointment.servicePrices![service.id] || service.price;
              subtotal += servicePrice;
              return `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #4a4a4a;"><span style="color: #ffffff;">${service.name}</span><span style="color: #ffffff; font-weight: 600;">$${servicePrice.toFixed(2)}</span></div>`;
            }).join('');
          } else {
            // Single service or legacy pricing
            const totalPrice = appointment.bookedPrice || (services[0]?.price || 0);
            subtotal = totalPrice;
            
            if (services.length === 1) {
              // Single service - show the total price
              serviceDetails = `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #4a4a4a;"><span style="color: #ffffff;">${services[0].name}</span><span style="color: #ffffff; font-weight: 600;">$${totalPrice.toFixed(2)}</span></div>`;
            } else {
              // Multi-service with legacy pricing - divide total by number of services
              const pricePerService = totalPrice / services.length;
              serviceDetails = services.map((service) => {
                return `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #4a4a4a;"><span style="color: #ffffff;">${service.name}</span><span style="color: #ffffff; font-weight: 600;">$${pricePerService.toFixed(2)}</span></div>`;
              }).join('');
            }
          }

          const tip = parseFloat(tipAmount) || 0;
          const total = subtotal + tip;

          // Get email template - PRIORITIZE Firestore template over hardcoded default
          const templatesDoc = await db.collection('settings').doc('emailTemplates').get();
          let receiptTemplate = null;
          
          console.log('🔍 Checking for receipt template in Firestore...');
          if (templatesDoc.exists) {
            const templateData = templatesDoc.data();
            const templates = templateData?.templates;
            if (templates && Array.isArray(templates)) {
              receiptTemplate = templates.find((t: any) => t.id === 'receipt-email');
            }
          }
          
          // Fallback to hardcoded default ONLY if Firestore template not found
          if (!receiptTemplate) {
            receiptTemplate = defaultTemplates.find(t => t.id === 'receipt-email');
          }
          
          if (!receiptTemplate) {
            throw new Error('Receipt email template not found');
          }

          // Replace template variables
          let emailHtml = receiptTemplate.html;
          const websiteLink = 'https://bueno-brows-7cce7.web.app';
          const variables = {
            customerName: customerName,
            businessName: businessInfo.businessName || 'Bueno Brows',
            businessPhone: businessInfo.businessPhone || '(650) 613-8455',
            businessEmail: businessInfo.businessEmail || 'hello@buenobrows.com',
            receiptNumber: `RCP-${appointmentId.substring(0, 8).toUpperCase()}`,
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

          // Send receipt email
          // IMPORTANT: Use the same FROM_EMAIL as confirmation emails to ensure delivery
          const { sendEmail } = await import('./email');
          const FROM_EMAIL = 'hello@buenobrows.com'; // Use same verified email as confirmation emails
          const emailResult = await sendEmail({
            to: customerEmail,
            from: { email: FROM_EMAIL, name: businessInfo.businessName || 'Bueno Brows' },
            subject: receiptTemplate.subject.replace(/\{\{businessName\}\}/g, businessInfo.businessName || 'Bueno Brows'),
            html: emailHtml
          });

          // Log email attempt to database - serialize sendGridResponse to plain object
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

          if (!emailResult.success) {
            console.error('Failed to send receipt email:', emailResult.error);
          }
          
          // Also send receipt link via SMS if customer has phone number
          const customerPhone = customerData?.phone;
          if (customerPhone) {
            try {
              console.log('📱 Attempting to send receipt link via SMS to:', customerPhone);
              
              // Get Twilio config (matching pattern from sms.ts)
              const twilioConfig = {
                accountSid: twilioAccountSid.value(),
                authToken: twilioAuthToken.value(),
                phoneNumber: twilioPhoneNumber.value(),
                messagingServiceSid: twilioMessagingServiceSid.value() || undefined
              };
              
              // Only send SMS if Twilio is configured
              if (twilioConfig.accountSid && twilioConfig.authToken) {
                const smsMessage = {
                  to: customerPhone,
                  from: twilioConfig.phoneNumber || '',
                  body: `Thank you for visiting ${businessInfo.businessName || 'Bueno Brows'}! Your receipt is ready: ${receiptResult.receiptUrl}\n\nTotal: $${total.toFixed(2)}\n\n- Bueno Brows`,
                  customerId: appointment.customerId,
                  appointmentId: appointmentId,
                  type: 'admin_message' as const
                };
                
                const smsSent = await sendSMS(smsMessage, twilioConfig);
                
                if (smsSent) {
                  
                  // Log SMS attempt
                  await db.collection('sms_logs').add({
                    to: customerPhone,
                    body: smsMessage.body,
                    customerId: appointment.customerId,
                    appointmentId: appointmentId,
                    type: 'receipt',
                    status: 'sent',
                    timestamp: new Date().toISOString(),
                    provider: 'twilio'
                  });
                } else {
                  console.warn('⚠️ Failed to send receipt SMS to:', customerPhone);
                }
              } else {
                console.log('ℹ️ Twilio not configured, skipping SMS receipt link');
              }
            } catch (smsError: any) {
              console.error('⚠️ Error sending receipt SMS:', smsError);
              // Don't fail the attendance marking if SMS fails
            }
          } else {
            console.log('ℹ️ Customer has no phone number, skipping SMS receipt link');
          }
        } catch (error: any) {
          console.error('⚠️ Error generating receipt or sending email:', error);
          console.error('⚠️ Error stack:', error.stack);
          // Don't fail the attendance marking if receipt generation fails
        }
        
        return {
          success: true,
          message: 'Appointment marked as attended and customer notified',
          appointmentId,
          status: 'completed',
          attendance: 'attended',
          receiptGenerated: true,
          emailRequired: false
        };

      } else {
        // Mark as no-show
        updateData.status = 'no-show';
        
        await appointmentRef.update(updateData);
        
        // Update customer record for no-show tracking
        try {
          const customerRef = db.collection('customers').doc(appointment.customerId);
          await customerRef.update({
            lastNoShow: now,
            noShowCount: (appointment.noShowCount || 0) + 1,
            updatedAt: now
          });
        } catch (error) {
          console.error('⚠️ Error updating customer no-show record:', error);
          // Don't fail the attendance marking if customer update fails
        }
        
        // Send no-show email
        try {
          // Get customer details
          const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
          if (customerDoc.exists) {
            const customerData = customerDoc.data();
            const customerEmail = customerData?.email;
            const customerName = customerData?.name || 'Valued Customer';

            if (customerEmail) {
              // Get service details
              const serviceDoc = await db.collection('services').doc(appointment.serviceId).get();
              const serviceData = serviceDoc.data();
              const serviceName = serviceData?.name || 'Service';

              // Get business hours for timezone
              const businessHoursDoc = await db.collection('settings').doc('businessHours').get();
              const businessHours = businessHoursDoc.exists ? businessHoursDoc.data() : null;
              const businessTimezone = businessHours?.timezone || 'America/Los_Angeles';

              // Format date and time
              const appointmentDate = new Date(appointment.start);
              const time = appointmentDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: businessTimezone,
              });

              // Import and send no-show email
              const { sendAppointmentNoShowEmail } = await import('./email');
              await sendAppointmentNoShowEmail(customerEmail, customerName, {
                serviceName,
                date: appointment.start,
                time,
                duration: appointment.duration || 60,
                price: appointment.bookedPrice,
                businessTimezone,
              });

              console.log('✅ No-show email sent to customer');
            }
          }
        } catch (error) {
          console.error('⚠️ Error sending no-show email:', error);
          // Don't fail the attendance marking if email fails
        }
        
        return {
          success: true,
          message: 'Appointment marked as no-show and customer notified',
          appointmentId,
          status: 'no-show',
          attendance: 'no-show'
        };
      }

    } catch (error: any) {
      console.error('Error marking attendance:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to mark attendance: ${error.message}`);
    }
  }
);
