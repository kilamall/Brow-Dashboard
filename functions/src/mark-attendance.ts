// functions/src/mark-attendance.ts
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
    html: '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">' +
      '<div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">' +
        '<h2 style="color: #8B4513; margin-bottom: 20px;">Thank You for Your Visit!</h2>' +
        '<p>Hi {{customerName}},</p>' +
        '<p>Thank you for choosing {{businessName}}! Here\'s your receipt for today\'s services:</p>' +
        '<div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">' +
          '<h3 style="margin-top: 0; color: #333;">Receipt #{{receiptNumber}}</h3>' +
          '<p><strong>Date:</strong> {{date}}</p>' +
          '<p><strong>Time:</strong> {{time}}</p>' +
          '<div style="border-top: 1px solid #ddd; margin: 15px 0; padding-top: 15px;">' +
            '<p><strong>Services:</strong></p>' +
            '<p>{{serviceDetails}}</p>' +
            '<p><strong>Subtotal:</strong> ${{subtotal}}</p>' +
            '<p><strong>Tip:</strong> ${{tip}}</p>' +
            '<p style="font-size: 18px; font-weight: bold; border-top: 2px solid #8B4513; padding-top: 10px; margin-top: 10px;">' +
              '<strong>Total: ${{total}}</strong>' +
            '</p>' +
          '</div>' +
        '</div>' +
        '<p>Your detailed receipt is attached as a PDF for your records.</p>' +
        '<p>We hope you love your results! If you have any questions or would like to book your next appointment, please don\'t hesitate to contact us.</p>' +
        '<p>Thank you again for choosing {{businessName}}!<br>The {{businessName}} Team</p>' +
      '</div>' +
    '</div>'
  }
];

export const markAttendance = onCall(
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
          if (customerDoc.exists) {
            const customerData = customerDoc.data();
            const customerEmail = customerData?.email;
            const customerName = customerData?.name || 'Valued Customer';

            if (customerEmail) {
              // Generate receipt PDF
              const { generateReceiptHelper } = await import('./generate-receipt');
              const receiptResult = await generateReceiptHelper(appointmentId);
              
              if (receiptResult.success) {
                // Update appointment with receipt URL
                await appointmentRef.update({
                  receiptUrl: receiptResult.receiptUrl,
                  receiptGeneratedAt: now,
                  receiptNumber: `RCP-${appointmentId.substring(0, 8).toUpperCase()}`
                });
                
                console.log('✅ Receipt generated and stored');
                
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

                // Calculate pricing details
                const hasIndividualPrices = appointment.servicePrices && Object.keys(appointment.servicePrices).length > 0;
                let serviceDetails = '';
                let subtotal = 0;
                
                if (hasIndividualPrices && appointment.servicePrices) {
                  // Multi-service with individual prices
                  serviceDetails = services.map((service, index) => {
                    const servicePrice = appointment.servicePrices![service.id] || service.price;
                    subtotal += servicePrice;
                    return `${index + 1}. ${service.name} - $${servicePrice.toFixed(2)}`;
                  }).join('\n');
                } else {
                  // Single service or legacy pricing
                  const totalPrice = appointment.bookedPrice || (services[0]?.price || 0);
                  subtotal = totalPrice;
                  
                  if (services.length === 1) {
                    // Single service - show the total price
                    serviceDetails = `1. ${services[0].name} - $${totalPrice.toFixed(2)}`;
                  } else {
                    // Multi-service with legacy pricing - divide total by number of services
                    const pricePerService = totalPrice / services.length;
                    serviceDetails = services.map((service, index) => {
                      return `${index + 1}. ${service.name} - $${pricePerService.toFixed(2)}`;
                    }).join('\n');
                  }
                }

                const tip = parseFloat(tipAmount) || 0;
                const total = subtotal + tip;

                // Get email template
                const templatesDoc = await db.collection('settings').doc('emailTemplates').get();
                const templates = templatesDoc.exists ? templatesDoc.data()?.templates : defaultTemplates;
                const receiptTemplate = templates?.find((t: any) => t.id === 'receipt-email') || defaultTemplates.find(t => t.id === 'receipt-email');

                // Replace template variables
                let emailHtml = receiptTemplate.html;
                const variables = {
                  customerName: customerName,
                  businessName: businessInfo.businessName || 'Bueno Brows',
                  businessPhone: businessInfo.businessPhone || '(555) 123-4567',
                  businessEmail: businessInfo.businessEmail || 'hello@buenobrows.com',
                  receiptNumber: `RCP-${appointmentId.substring(0, 8).toUpperCase()}`,
                  date: formattedDate,
                  time: formattedTime,
                  serviceDetails: serviceDetails.replace(/\n/g, '<br>'),
                  subtotal: subtotal.toFixed(2),
                  tip: tip.toFixed(2),
                  total: total.toFixed(2),
                  receiptUrl: receiptResult.receiptUrl
                };

                Object.entries(variables).forEach(([key, value]) => {
                  emailHtml = emailHtml.replace(new RegExp(`{{${key}}}`, 'g'), value);
                });

                // Send receipt email
                const { sendEmail } = await import('./email');
                await sendEmail({
                  to: customerEmail,
                  from: { email: businessInfo.businessEmail || 'hello@buenobrows.com', name: businessInfo.businessName || 'Bueno Brows' },
                  subject: receiptTemplate.subject.replace(/\{\{businessName\}\}/g, businessInfo.businessName || 'Bueno Brows'),
                  html: emailHtml
                });

                console.log('✅ Receipt email sent to customer');
              }
            }
          }
        } catch (error) {
          console.error('⚠️ Error generating receipt or sending email:', error);
          // Don't fail the attendance marking if receipt generation fails
        }
        
        return {
          success: true,
          message: 'Appointment marked as attended and customer notified',
          appointmentId,
          status: 'completed',
          attendance: 'attended'
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
