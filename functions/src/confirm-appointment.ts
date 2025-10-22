// Admin function to confirm or reject appointments
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const confirmAppointment = onCall(
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

    const { appointmentId, action, rejectionReason } = req.data || {};
    
    if (!appointmentId || !action) {
      throw new HttpsError('invalid-argument', 'Missing appointmentId or action');
    }
    
    if (!['confirm', 'reject'].includes(action)) {
      throw new HttpsError('invalid-argument', 'Action must be "confirm" or "reject"');
    }

    // Helper function to check if appointment is in the past
    function isAppointmentInPast(startISO: string): boolean {
      return new Date(startISO).getTime() < Date.now();
    }

    try {
      const appointmentRef = db.collection('appointments').doc(appointmentId);
      const appointmentDoc = await appointmentRef.get();
      
      if (!appointmentDoc.exists) {
        throw new HttpsError('not-found', 'Appointment not found');
      }
      
      const appointment: any = appointmentDoc.data();
      
      // Check if already processed
      if (appointment.status !== 'pending') {
        throw new HttpsError('failed-precondition', `Appointment already ${appointment.status}`);
      }

      if (action === 'confirm') {
        // Update appointment to confirmed
        await appointmentRef.update({
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          confirmedBy: req.auth.uid,
          updatedAt: new Date().toISOString()
        });


        // Auto-approve customer profile if status is pending
        const customerId = appointment.customerId;
        if (customerId) {
          try {
            const customerRef = db.collection('customers').doc(customerId);
            const customerDoc = await customerRef.get();
            
            if (customerDoc.exists) {
              const customerData = customerDoc.data();
              
              // If customer status is 'pending', update to 'active'
              if (customerData?.status === 'pending') {
                await customerRef.update({
                  status: 'active',
                  updatedAt: new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error('⚠️ Error updating customer status:', error);
            // Don't fail the confirmation if customer update fails
          }
        }

        // Send confirmation SMS/email only if appointment is in the future
        if (!isAppointmentInPast(appointment.start)) {
          try {
            const { sendBookingConfirmation } = await import('./appointment-reminders.js');
            await sendBookingConfirmation(appointmentId);
          } catch (error) {
            console.error('⚠️ Error sending confirmation:', error);
            // Don't fail the confirmation if notification fails
          }
        } else {
        }

        return {
          success: true,
          message: 'Appointment confirmed and customer notified',
          appointmentId,
          status: 'confirmed'
        };

      } else {
        // Reject appointment
        await appointmentRef.update({
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: req.auth.uid,
          rejectionReason: rejectionReason || 'No reason provided',
          updatedAt: new Date().toISOString()
        });


        // Delete the availability slot since appointment is rejected
        const availRef = db.collection('availability').doc(appointmentId);
        await availRef.delete();

        // Optionally send rejection notification to customer
        // TODO: Implement rejection notification if needed

        return {
          success: true,
          message: 'Appointment rejected',
          appointmentId,
          status: 'rejected'
        };
      }

    } catch (error: any) {
      console.error('Error confirming/rejecting appointment:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', `Failed to ${action} appointment: ${error.message}`);
    }
  }
);

// Bulk confirm multiple appointments (for admin convenience)
export const bulkConfirmAppointments = onCall(
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

    const { appointmentIds } = req.data || {};
    
    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      throw new HttpsError('invalid-argument', 'Invalid appointmentIds array');
    }

    if (appointmentIds.length > 50) {
      throw new HttpsError('invalid-argument', 'Cannot confirm more than 50 appointments at once');
    }

    // Helper function to check if appointment is in the past
    function isAppointmentInPast(startISO: string): boolean {
      return new Date(startISO).getTime() < Date.now();
    }

    try {
      const results = {
        confirmed: [] as string[],
        failed: [] as { id: string; error: string }[]
      };

      for (const appointmentId of appointmentIds) {
        try {
          const appointmentRef = db.collection('appointments').doc(appointmentId);
          const appointmentDoc = await appointmentRef.get();
          
          if (!appointmentDoc.exists) {
            results.failed.push({ id: appointmentId, error: 'Not found' });
            continue;
          }
          
          const appointment: any = appointmentDoc.data();
          
          if (appointment.status !== 'pending') {
            results.failed.push({ id: appointmentId, error: `Already ${appointment.status}` });
            continue;
          }

          // Update to confirmed
          await appointmentRef.update({
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            confirmedBy: req.auth!.uid,
            updatedAt: new Date().toISOString()
          });

          // Auto-approve customer profile if status is pending
          const customerId = appointment.customerId;
          if (customerId) {
            try {
              const customerRef = db.collection('customers').doc(customerId);
              const customerDoc = await customerRef.get();
              
              if (customerDoc.exists) {
                const customerData = customerDoc.data();
                
                if (customerData?.status === 'pending') {
                  await customerRef.update({
                    status: 'active',
                    updatedAt: new Date().toISOString()
                  });
                }
              }
            } catch (error) {
              console.error(`⚠️ Error updating customer status for ${customerId}:`, error);
              // Don't fail the confirmation if customer update fails
            }
          }

          // Send confirmation only if appointment is in the future
          if (!isAppointmentInPast(appointment.start)) {
            try {
              const { sendBookingConfirmation } = await import('./appointment-reminders.js');
              await sendBookingConfirmation(appointmentId);
            } catch (error) {
              console.error(`⚠️ Error sending confirmation for ${appointmentId}:`, error);
            }
          } else {
          }

          results.confirmed.push(appointmentId);
          
          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error: any) {
          results.failed.push({ id: appointmentId, error: error.message });
        }
      }

      return {
        success: true,
        message: `Confirmed ${results.confirmed.length} appointments`,
        results
      };

    } catch (error: any) {
      console.error('Error in bulk confirm:', error);
      throw new HttpsError('internal', `Bulk confirm failed: ${error.message}`);
    }
  }
);

