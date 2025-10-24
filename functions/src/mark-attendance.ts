// functions/src/mark-attendance.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

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
        
        // Send completion/thank you email
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

              // Import and send completion email
              const { sendAppointmentCompletionEmail } = await import('./email');
              await sendAppointmentCompletionEmail(customerEmail, customerName, {
                serviceName,
                date: appointment.start,
                time,
                duration: appointment.duration || 60,
                actualPrice: parseFloat(actualPrice) || appointment.bookedPrice,
                tipAmount: parseFloat(tipAmount) || 0,
                notes: notes?.trim(),
                businessTimezone,
              });

              console.log('✅ Completion email sent to customer');
            }
          }
        } catch (error) {
          console.error('⚠️ Error sending completion email:', error);
          // Don't fail the attendance marking if email fails
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
