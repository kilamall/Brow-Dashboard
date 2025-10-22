// functions/src/clear-cancelled-appointments.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Function to clear cancelled appointments
export const clearCancelledAppointments = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can clear cancelled appointments');
    }

    try {
      console.log('Starting cancelled appointments cleanup...');
      
      // Get all cancelled appointments
      const cancelledAppointmentsSnapshot = await db.collection('appointments')
        .where('status', '==', 'cancelled')
        .get();

      const cancelledAppointments = cancelledAppointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${cancelledAppointments.length} cancelled appointments to delete`);

      if (cancelledAppointments.length === 0) {
        return {
          message: 'No cancelled appointments found',
          deletedCount: 0,
          timestamp: new Date().toISOString()
        };
      }

      // Delete cancelled appointments in batches
      const batchSize = 500; // Firestore batch limit
      let deletedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < cancelledAppointments.length; i += batchSize) {
        const batch = db.batch();
        const batchAppointments = cancelledAppointments.slice(i, i + batchSize);
        
        batchAppointments.forEach(appointment => {
          const appointmentRef = db.collection('appointments').doc(appointment.id);
          batch.delete(appointmentRef);
        });

        try {
          await batch.commit();
          deletedCount += batchAppointments.length;
          console.log(`Deleted batch of ${batchAppointments.length} cancelled appointments`);
        } catch (error) {
          console.error(`Error deleting batch starting at index ${i}:`, error);
          errorCount += batchAppointments.length;
        }
      }

      const result = {
        message: `Cancelled appointments cleanup completed`,
        totalFound: cancelledAppointments.length,
        deletedCount,
        errorCount,
        timestamp: new Date().toISOString()
      };

      console.log('Cleanup completed:', result);
      return result;

    } catch (error: any) {
      console.error('Error in clearCancelledAppointments:', error);
      throw new HttpsError('internal', `Cleanup failed: ${error.message}`);
    }
  }
);

// Function to get cancelled appointments count (for preview)
export const getCancelledAppointmentsCount = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can view cancelled appointments count');
    }

    try {
      const cancelledAppointmentsSnapshot = await db.collection('appointments')
        .where('status', '==', 'cancelled')
        .get();

      const count = cancelledAppointmentsSnapshot.size;
      
      return {
        count,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Error getting cancelled appointments count:', error);
      throw new HttpsError('internal', `Failed to get count: ${error.message}`);
    }
  }
);
