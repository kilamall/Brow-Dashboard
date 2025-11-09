// functions/src/cleanup-stats.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Get count of cancelled appointments older than 30 days
export const getCancelledAppointmentsCount = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can view cancelled appointments count');
    }

    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

      // Query for cancelled appointments older than 30 days
      const cancelledSnapshot = await db.collection('appointments')
        .where('status', '==', 'cancelled')
        .where('updatedAt', '<', thirtyDaysAgoTimestamp)
        .get();

      const count = cancelledSnapshot.size;

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

// Get comprehensive cleanup statistics
export const getCleanupStats = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can view cleanup stats');
    }

    try {
      const now = new Date();
      const stats: any = {};

      // 1. Cancelled appointments older than 30 days
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
      
      const cancelledSnapshot = await db.collection('appointments')
        .where('status', '==', 'cancelled')
        .where('updatedAt', '<', thirtyDaysAgoTimestamp)
        .get();
      stats.cancelledAppointments = cancelledSnapshot.size;

      // 2. Expired holds (older than 30 minutes)
      const thirtyMinutesAgo = new Date(now);
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      const thirtyMinutesAgoTimestamp = Timestamp.fromDate(thirtyMinutesAgo);
      
      const expiredHoldsSnapshot = await db.collection('holds')
        .where('expiresAt', '<', thirtyMinutesAgoTimestamp)
        .get();
      stats.expiredHolds = expiredHoldsSnapshot.size;

      // 3. Expired tokens (older than 7 days)
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);
      
      const expiredTokensSnapshot = await db.collection('customer_tokens')
        .where('expiresAt', '<', sevenDaysAgoTimestamp)
        .get();
      stats.expiredTokens = expiredTokensSnapshot.size;

      // 4. Old messages (older than 90 days)
      // Note: Messages may store timestamp as ISO string or Timestamp
      // We'll get all messages and filter in code to handle both formats
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const ninetyDaysAgoTimestamp = Timestamp.fromDate(ninetyDaysAgo);
      
      const allMessagesSnapshot = await db.collection('messages').get();
      const oldMessages = allMessagesSnapshot.docs.filter(doc => {
        const data = doc.data();
        const timestamp = data.timestamp;
        if (!timestamp) return false;
        
        // Handle both Timestamp and ISO string formats
        let messageDate: Date;
        if (timestamp.toDate) {
          messageDate = timestamp.toDate();
        } else if (typeof timestamp === 'string') {
          messageDate = new Date(timestamp);
        } else {
          return false;
        }
        
        return messageDate < ninetyDaysAgo;
      });
      stats.oldMessages = oldMessages.length;

      // 5. Old skin analysis requests (older than 90 days)
      const oldSkinAnalysisSnapshot = await db.collection('skinAnalysisRequests')
        .where('createdAt', '<', ninetyDaysAgoTimestamp)
        .get();
      stats.oldSkinAnalysisRequests = oldSkinAnalysisSnapshot.size;

      // 6. Old edit requests (older than 30 days)
      const oldEditRequestsSnapshot = await db.collection('editRequests')
        .where('createdAt', '<', thirtyDaysAgoTimestamp)
        .get();
      stats.oldEditRequests = oldEditRequestsSnapshot.size;

      return {
        ...stats,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error getting cleanup stats:', error);
      throw new HttpsError('internal', `Failed to get stats: ${error.message}`);
    }
  }
);

// Clear cancelled appointments older than 30 days
export const clearCancelledAppointments = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can clear cancelled appointments');
    }

    try {
      // Calculate date 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);

      // Query for cancelled appointments older than 30 days
      const cancelledSnapshot = await db.collection('appointments')
        .where('status', '==', 'cancelled')
        .where('updatedAt', '<', thirtyDaysAgoTimestamp)
        .get();

      if (cancelledSnapshot.empty) {
        return {
          deleted: 0,
          message: 'No cancelled appointments to clear'
        };
      }

      // Delete in batches (Firestore batch limit is 500)
      let deleted = 0;
      const docs = cancelledSnapshot.docs;
      
      for (let i = 0; i < docs.length; i += 500) {
        const batchDocs = docs.slice(i, i + 500);
        const batch = db.batch();
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        deleted += batchDocs.length;
      }

      return {
        deleted,
        message: `Successfully deleted ${deleted} cancelled appointments`,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error clearing cancelled appointments:', error);
      throw new HttpsError('internal', `Failed to clear cancelled appointments: ${error.message}`);
    }
  }
);

// Manual cleanup function that can clean multiple types
export const manualCleanup = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run manual cleanup');
    }

    try {
      const { cleanupTypes } = req.data || {};
      const now = new Date();
      const results: any = {};

      // If specific types requested, only clean those; otherwise clean all
      const typesToClean = cleanupTypes && cleanupTypes.length > 0 
        ? cleanupTypes 
        : ['cancelledAppointments', 'expiredHolds', 'expiredTokens', 'oldMessages', 'oldSkinAnalysisRequests', 'oldEditRequests'];

      // 1. Clear cancelled appointments
      if (typesToClean.includes('cancelledAppointments')) {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
        
        const cancelledSnapshot = await db.collection('appointments')
          .where('status', '==', 'cancelled')
          .where('updatedAt', '<', thirtyDaysAgoTimestamp)
          .get();
        
        let deleted = 0;
        const docs = cancelledSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batchDocs = docs.slice(i, i + 500);
          const batch = db.batch();
          batchDocs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deleted += batchDocs.length;
        }
        results.cancelledAppointments = deleted;
      }

      // 2. Clear expired holds
      if (typesToClean.includes('expiredHolds')) {
        const thirtyMinutesAgo = new Date(now);
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        const thirtyMinutesAgoTimestamp = Timestamp.fromDate(thirtyMinutesAgo);
        
        const expiredHoldsSnapshot = await db.collection('holds')
          .where('expiresAt', '<', thirtyMinutesAgoTimestamp)
          .get();
        
        let deleted = 0;
        const docs = expiredHoldsSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batchDocs = docs.slice(i, i + 500);
          const batch = db.batch();
          batchDocs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deleted += batchDocs.length;
        }
        results.expiredHolds = deleted;
      }

      // 3. Clear expired tokens
      if (typesToClean.includes('expiredTokens')) {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoTimestamp = Timestamp.fromDate(sevenDaysAgo);
        
        const expiredTokensSnapshot = await db.collection('customer_tokens')
          .where('expiresAt', '<', sevenDaysAgoTimestamp)
          .get();
        
        let deleted = 0;
        const docs = expiredTokensSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batchDocs = docs.slice(i, i + 500);
          const batch = db.batch();
          batchDocs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deleted += batchDocs.length;
        }
        results.expiredTokens = deleted;
      }

      // 4. Clear old messages
      if (typesToClean.includes('oldMessages')) {
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        // Fetch all messages and filter in code to handle both Timestamp and ISO string formats
        const allMessagesSnapshot = await db.collection('messages').get();
        const oldMessagesDocs = allMessagesSnapshot.docs.filter(doc => {
          const data = doc.data();
          const timestamp = data.timestamp;
          if (!timestamp) return false;
          
          // Handle both Timestamp and ISO string formats
          let messageDate: Date;
          if (timestamp.toDate) {
            messageDate = timestamp.toDate();
          } else if (typeof timestamp === 'string') {
            messageDate = new Date(timestamp);
          } else {
            return false;
          }
          
          return messageDate < ninetyDaysAgo;
        });
        
        let deleted = 0;
        for (let i = 0; i < oldMessagesDocs.length; i += 500) {
          const batchDocs = oldMessagesDocs.slice(i, i + 500);
          const batch = db.batch();
          batchDocs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deleted += batchDocs.length;
        }
        results.oldMessages = deleted;
      }

      // 5. Clear old skin analysis requests
      if (typesToClean.includes('oldSkinAnalysisRequests')) {
        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const ninetyDaysAgoTimestamp = Timestamp.fromDate(ninetyDaysAgo);
        
        const oldSkinAnalysisSnapshot = await db.collection('skinAnalysisRequests')
          .where('createdAt', '<', ninetyDaysAgoTimestamp)
          .get();
        
        let deleted = 0;
        const docs = oldSkinAnalysisSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batchDocs = docs.slice(i, i + 500);
          const batch = db.batch();
          batchDocs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deleted += batchDocs.length;
        }
        results.oldSkinAnalysisRequests = deleted;
      }

      // 6. Clear old edit requests
      if (typesToClean.includes('oldEditRequests')) {
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
        
        const oldEditRequestsSnapshot = await db.collection('editRequests')
          .where('createdAt', '<', thirtyDaysAgoTimestamp)
          .get();
        
        let deleted = 0;
        const docs = oldEditRequestsSnapshot.docs;
        for (let i = 0; i < docs.length; i += 500) {
          const batchDocs = docs.slice(i, i + 500);
          const batch = db.batch();
          batchDocs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          deleted += batchDocs.length;
        }
        results.oldEditRequests = deleted;
      }

      return {
        ...results,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Error in manual cleanup:', error);
      throw new HttpsError('internal', `Cleanup failed: ${error.message}`);
    }
  }
);

