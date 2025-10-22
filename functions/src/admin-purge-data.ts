// functions/src/admin-purge-data.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

try { initializeApp(); } catch {}
const db = getFirestore();
const auth = getAuth();

export const adminPurgeData = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admins to purge data
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can purge data');
    }

    const { collections, confirmPurge } = req.data || {};
    
    if (!confirmPurge) {
      throw new HttpsError('invalid-argument', 'Must confirm purge operation');
    }

    try {
      const results: any = {};
      const batch = db.batch();
      let totalDeleted = 0;

      // Define all collections that can be purged
      const purgeableCollections = [
        'customers',
        'appointments', 
        'services',
        'messages',
        'conversations',
        'sms_conversations',
        'sms_logs',
        'ai_conversations',
        'ai_sms_conversations',
        'holds',
        'availability',
        'customer_tokens'
      ];

      // If specific collections requested, filter to those
      const collectionsToPurge = collections && collections.length > 0 
        ? collections.filter((col: string) => purgeableCollections.includes(col))
        : purgeableCollections;

      console.log(`Starting purge of collections: ${collectionsToPurge.join(', ')}`);

      for (const collectionName of collectionsToPurge) {
        try {
          // Get all documents in the collection
          const snapshot = await db.collection(collectionName).get();
          
          if (snapshot.empty) {
            results[collectionName] = { deleted: 0, status: 'empty' };
            continue;
          }

          // Delete all documents in batches (Firestore batch limit is 500)
          let deleted = 0;
          const docs = snapshot.docs;
          
          for (let i = 0; i < docs.length; i += 500) {
            const batchDocs = docs.slice(i, i + 500);
            const currentBatch = db.batch();
            
            batchDocs.forEach(doc => {
              currentBatch.delete(doc.ref);
            });
            
            await currentBatch.commit();
            deleted += batchDocs.length;
            totalDeleted += batchDocs.length;
          }

          results[collectionName] = { 
            deleted, 
            status: 'success',
            message: `Deleted ${deleted} documents from ${collectionName}`
          };

          console.log(`Purged ${deleted} documents from ${collectionName}`);
          
        } catch (error: any) {
          results[collectionName] = { 
            deleted: 0, 
            status: 'error',
            message: error.message 
          };
          console.error(`Error purging ${collectionName}:`, error);
        }
      }

      // Log the purge operation
      console.log(`Admin purge completed by ${req.auth.token.email}:`, {
        totalDeleted,
        collectionsPurged: collectionsToPurge,
        timestamp: new Date().toISOString(),
        results
      });

      return {
        success: true,
        message: `Purge completed. Deleted ${totalDeleted} total documents.`,
        results,
        totalDeleted,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      console.error('Purge operation failed:', error);
      throw new HttpsError('internal', `Purge failed: ${error.message}`);
    }
  }
);

// Alternative: Get collection counts before purging
export const getCollectionCounts = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admins to view collection counts
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can view collection counts');
    }

    try {
      const collections = [
        'customers',
        'appointments', 
        'services',
        'messages',
        'conversations',
        'sms_conversations',
        'sms_logs',
        'ai_conversations',
        'ai_sms_conversations',
        'holds',
        'availability',
        'customer_tokens'
      ];

      const counts: any = {};

      for (const collectionName of collections) {
        try {
          const snapshot = await db.collection(collectionName).get();
          counts[collectionName] = snapshot.size;
        } catch (error: any) {
          counts[collectionName] = { error: error.message };
        }
      }

      return {
        success: true,
        counts,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      throw new HttpsError('internal', `Failed to get counts: ${error.message}`);
    }
  }
);
