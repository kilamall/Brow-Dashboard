// functions/src/fix-orphaned-appointments.ts
// Cloud Function to fix appointments with missing customer documents
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const fixOrphanedAppointments = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can fix orphaned appointments');
    }

    const { appointmentIds, action } = req.data || {};
    
    // action can be: 'create_customer' (create placeholder customer) or 'delete_appointment' (delete orphaned appointment)
    if (!action || !['create_customer', 'delete_appointment'].includes(action)) {
      throw new HttpsError('invalid-argument', 'action must be "create_customer" or "delete_appointment"');
    }

    if (!appointmentIds || !Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      throw new HttpsError('invalid-argument', 'appointmentIds array is required');
    }

    try {
      const results: any[] = [];
      const errors: any[] = [];

      for (const appointmentId of appointmentIds) {
        try {
          const appointmentDoc = await db.collection('appointments').doc(appointmentId).get();
          
          if (!appointmentDoc.exists) {
            errors.push({ appointmentId, error: 'Appointment not found' });
            continue;
          }

          const appointment = { id: appointmentDoc.id, ...appointmentDoc.data() } as any;
          const customerId = appointment.customerId;

          if (!customerId) {
            errors.push({ appointmentId, error: 'Appointment has no customerId' });
            continue;
          }

          // Check if customer already exists
          const customerDoc = await db.collection('customers').doc(customerId).get();
          if (customerDoc.exists) {
            results.push({ appointmentId, action: 'skipped', reason: 'Customer already exists' });
            continue;
          }

          if (action === 'create_customer') {
            // Create a placeholder customer from appointment data
            const customerData: any = {
              name: appointment.customerName || 'Unknown Customer',
              email: appointment.customerEmail || null,
              phone: appointment.customerPhone || null,
              status: 'active',
              createdAt: appointment.createdAt || new Date(),
              updatedAt: new Date(),
              identityStatus: 'recovered',
              notes: `Customer record recovered from orphaned appointment ${appointmentId} on ${new Date().toISOString()}`
            };

            // Add canonical fields if email/phone exist
            if (customerData.email) {
              customerData.canonicalEmail = customerData.email.toLowerCase().trim();
            }
            if (customerData.phone) {
              // Normalize phone number
              const normalized = customerData.phone.replace(/\D/g, '');
              customerData.canonicalPhone = normalized;
            }

            await db.collection('customers').doc(customerId).set(customerData);
            
            results.push({
              appointmentId,
              action: 'created_customer',
              customerId,
              customerName: customerData.name
            });

            console.log(`✅ Created customer ${customerId} from orphaned appointment ${appointmentId}`);
          } else if (action === 'delete_appointment') {
            // Delete the orphaned appointment
            await db.collection('appointments').doc(appointmentId).delete();
            
            results.push({
              appointmentId,
              action: 'deleted_appointment',
              customerId
            });

            console.log(`✅ Deleted orphaned appointment ${appointmentId}`);
          }
        } catch (error: any) {
          console.error(`❌ Error processing appointment ${appointmentId}:`, error);
          errors.push({ appointmentId, error: error.message || 'Unknown error' });
        }
      }

      return {
        success: true,
        processed: appointmentIds.length,
        results,
        errors,
        message: `Processed ${appointmentIds.length} appointments. ${results.length} succeeded, ${errors.length} failed.`
      };
    } catch (error: any) {
      console.error('Error fixing orphaned appointments:', error);
      throw new HttpsError('internal', `Failed to fix orphaned appointments: ${error.message}`);
    }
  }
);


