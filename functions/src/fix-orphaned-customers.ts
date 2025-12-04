// functions/src/fix-orphaned-customers.ts
// Cloud Function to find and fix appointments with missing customer documents
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const fixOrphanedCustomers = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run this diagnostic');
    }

    try {
      // Get all appointments
      const appointmentsSnapshot = await db.collection('appointments').get();
      const appointments = appointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const orphanedAppointments: any[] = [];
      const missingCustomers: Set<string> = new Set();

      // Check each appointment for missing customer
      for (const appointment of appointments) {
        const customerId = (appointment as any).customerId;
        if (!customerId) continue;

        const customerDoc = await db.collection('customers').doc(customerId).get();
        if (!customerDoc.exists) {
          orphanedAppointments.push({
            appointmentId: appointment.id,
            customerId: customerId,
            customerName: (appointment as any).customerName,
            customerEmail: (appointment as any).customerEmail,
            customerPhone: (appointment as any).customerPhone,
            start: (appointment as any).start,
            status: (appointment as any).status
          });
          missingCustomers.add(customerId);
        }
      }

      return {
        totalAppointments: appointments.length,
        orphanedCount: orphanedAppointments.length,
        missingCustomerIds: Array.from(missingCustomers),
        orphanedAppointments: orphanedAppointments.slice(0, 50), // Limit to first 50 for response size
        message: `Found ${orphanedAppointments.length} appointments with missing customer documents out of ${appointments.length} total appointments.`
      };
    } catch (error: any) {
      console.error('Error checking orphaned customers:', error);
      throw new HttpsError('internal', `Failed to check orphaned customers: ${error.message}`);
    }
  }
);


