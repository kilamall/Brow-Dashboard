// Callable Cloud Function to sync existing appointments to availability collection
// Can be called by admins to do the initial migration

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const syncExistingAppointmentsToAvailability = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // Only admins can run this
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can sync availability');
    }

    console.log('Starting availability sync for existing appointments...');
    
    try {
      // Get all appointments
      const appointmentsSnapshot = await db.collection('appointments').get();
      console.log(`Found ${appointmentsSnapshot.size} total appointments`);
      
      let synced = 0;
      let skipped = 0;
      const batch = db.batch();
      let batchCount = 0;
      const BATCH_SIZE = 500;
      const batches: any[] = [];
      
      for (const doc of appointmentsSnapshot.docs) {
        const appt = doc.data();
        
        // Skip cancelled appointments
        if (appt.status === 'cancelled') {
          skipped++;
          continue;
        }
        
        // Calculate end time
        const startMs = new Date(appt.start).getTime();
        const endMs = startMs + (appt.duration * 60 * 1000);
        const end = new Date(endMs).toISOString();
        
        // Create availability slot
        const availRef = db.collection('availability').doc(doc.id);
        const availSlot = {
          start: appt.start,
          end: end,
          status: 'booked',
          createdAt: appt.createdAt || new Date().toISOString(),
        };
        
        batch.set(availRef, availSlot);
        synced++;
        batchCount++;
        
        // Commit batch if we hit the limit
        if (batchCount >= BATCH_SIZE) {
          batches.push(batch.commit());
          console.log(`Queued batch of ${batchCount} slots`);
          batchCount = 0;
        }
      }
      
      // Commit any remaining items
      if (batchCount > 0) {
        batches.push(batch.commit());
        console.log(`Queued final batch of ${batchCount} slots`);
      }
      
      // Wait for all batches to complete
      await Promise.all(batches);
      
      console.log('Sync complete:', { synced, skipped });
      
      return {
        success: true,
        message: `Synced ${synced} appointments, skipped ${skipped} cancelled appointments`,
        synced,
        skipped,
      };
      
    } catch (error: any) {
      console.error('Error syncing availability:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);


