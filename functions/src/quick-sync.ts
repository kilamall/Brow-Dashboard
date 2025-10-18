// Quick sync function that can be called without authentication
// This is a temporary function to sync existing appointments

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const quickSyncAvailability = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // Allow anyone to call this for now (temporary)
    console.log('Starting quick availability sync...');
    console.log('Request data:', req.data);
    
    try {
      // Get all appointments
      const appointmentsSnapshot = await db.collection('appointments').get();
      console.log(`Found ${appointmentsSnapshot.size} total appointments`);
      
      let synced = 0;
      let skipped = 0;
      const batch = db.batch();
      let batchCount = 0;
      const BATCH_SIZE = 500;
      
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
          await batch.commit();
          console.log(`Committed batch of ${batchCount} slots`);
          batchCount = 0;
        }
      }
      
      // Commit any remaining items
      if (batchCount > 0) {
        await batch.commit();
        console.log(`Committed final batch of ${batchCount} slots`);
      }
      
      console.log('Quick sync complete:', { synced, skipped });
      
      return {
        success: true,
        message: `Quick sync complete! Synced ${synced} appointments, skipped ${skipped} cancelled appointments`,
        synced,
        skipped,
      };
      
    } catch (error: any) {
      console.error('Error in quick sync:', error);
      throw new HttpsError('internal', error.message);
    }
  }
);
