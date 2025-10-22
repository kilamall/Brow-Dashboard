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
      
      // Check if already marked
      if (appointment.attendance && appointment.attendance !== 'pending') {
        throw new HttpsError('failed-precondition', `Appointment attendance already marked as ${appointment.attendance}`);
      }

      const now = new Date().toISOString();
      const updateData: any = {
        attendance,
        attendanceMarkedAt: now,
        attendanceMarkedBy: req.auth.uid,
        updatedAt: now
      };

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
        
        // Send post-service receipt
        try {
          const { sendPostServiceReceipt } = await import('./post-service-receipt.js');
          await sendPostServiceReceipt(appointmentId);
        } catch (error) {
          console.error('⚠️ Error sending post-service receipt:', error);
          // Don't fail the attendance marking if receipt fails
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
        
        
        return {
          success: true,
          message: 'Appointment marked as no-show',
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
