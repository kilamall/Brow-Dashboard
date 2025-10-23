// functions/src/cleanup-edit-requests.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Clean up old edit requests (approved/denied, older than 30 days)
export const cleanupOldEditRequests = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can cleanup edit requests');
    }

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const oldRequests = await db.collection('appointmentEditRequests')
        .where('status', 'in', ['approved', 'denied'])
        .where('processedAt', '<', thirtyDaysAgo.toISOString())
        .limit(1000)
        .get();
      
      if (oldRequests.empty) {
        return {
          success: true,
          message: 'No old edit requests to clean up',
          deleted: 0,
          timestamp: new Date().toISOString()
        };
      }

      // Delete in batches
      const batchSize = 500;
      let totalDeleted = 0;
      const docs = oldRequests.docs;
      
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = docs.slice(i, i + batchSize);
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        totalDeleted += batchDocs.length;
      }
      
      console.log(`Cleaned up ${totalDeleted} old edit requests`);
      
      return {
        success: true,
        message: `Cleaned up ${totalDeleted} old edit requests`,
        deleted: totalDeleted,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Error cleaning up edit requests:', error);
      throw new HttpsError('internal', `Cleanup failed: ${error.message}`);
    }
  }
);
