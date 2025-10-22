// functions/src/cleanup-expired-holds.ts
import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const cleanupExpiredHolds = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    try {
      const now = new Date().toISOString();
      console.log('🧹 Starting cleanup of expired holds at:', now);
      
      // Clean up expired holds
      const holdsRef = db.collection('holds');
      const holdsQuery = holdsRef.where('expiresAt', '<=', now);
      const holdsSnap = await holdsQuery.get();
      
      let holdsDeleted = 0;
      const holdsBatch = db.batch();
      
      holdsSnap.forEach(doc => {
        const data = doc.data();
        console.log(`Deleting expired hold: ${doc.id}, expired at: ${data.expiresAt}`);
        holdsBatch.delete(doc.ref);
        holdsDeleted++;
      });
      
      if (holdsDeleted > 0) {
        await holdsBatch.commit();
        console.log(`✅ Deleted ${holdsDeleted} expired holds`);
      }
      
      // Clean up expired availability slots
      const availabilityRef = db.collection('availability');
      const availQuery = availabilityRef.where('status', '==', 'held').where('expiresAt', '<=', now);
      const availSnap = await availQuery.get();
      
      let availDeleted = 0;
      const availBatch = db.batch();
      
      availSnap.forEach(doc => {
        const data = doc.data();
        console.log(`Deleting expired availability slot: ${doc.id}, expired at: ${data.expiresAt}`);
        availBatch.delete(doc.ref);
        availDeleted++;
      });
      
      if (availDeleted > 0) {
        await availBatch.commit();
        console.log(`✅ Deleted ${availDeleted} expired availability slots`);
      }
      
      res.json({
        success: true,
        holdsDeleted,
        availDeleted,
        cleanedAt: now
      });
      
    } catch (error: any) {
      console.error('❌ Error cleaning up expired holds:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);
