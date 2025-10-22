// functions/src/manual-cleanup.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Manual cleanup function for admin use
export const manualCleanup = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run manual cleanup');
    }

    const { cleanupTypes } = req.data || {};
    
    // Default to all cleanup types if none specified
    const typesToClean = cleanupTypes || [
      'cancelledAppointments',
      'expiredHolds', 
      'expiredTokens',
      'oldMessages',
      'oldSkinAnalysisRequests'
    ];

    console.log('Starting manual cleanup for types:', typesToClean);
    
    const cleanupResults = {
      cancelledAppointments: 0,
      expiredHolds: 0,
      expiredTokens: 0,
      oldMessages: 0,
      oldSkinAnalysisRequests: 0,
      errors: 0,
      timestamp: new Date().toISOString()
    };

    try {
      if (typesToClean.includes('cancelledAppointments')) {
        await cleanupOldCancelledAppointments(cleanupResults);
      }
      
      if (typesToClean.includes('expiredHolds')) {
        await cleanupExpiredHolds(cleanupResults);
      }
      
      if (typesToClean.includes('expiredTokens')) {
        await cleanupExpiredTokens(cleanupResults);
      }
      
      if (typesToClean.includes('oldMessages')) {
        await cleanupOldMessages(cleanupResults);
      }
      
      if (typesToClean.includes('oldSkinAnalysisRequests')) {
        await cleanupOldSkinAnalysisRequests(cleanupResults);
      }
      
      console.log('Manual cleanup completed:', cleanupResults);
      return cleanupResults;
      
    } catch (error: any) {
      console.error('Manual cleanup failed:', error);
      throw new HttpsError('internal', `Cleanup failed: ${error.message}`);
    }
  }
);

// Get cleanup statistics
export const getCleanupStats = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can view cleanup stats');
    }

    try {
      const stats = {
        cancelledAppointments: 0,
        expiredHolds: 0,
        expiredTokens: 0,
        oldMessages: 0,
        oldSkinAnalysisRequests: 0,
        timestamp: new Date().toISOString()
      };

      // Count cancelled appointments older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const cancelledAppointments = await db.collection('appointments')
        .where('status', '==', 'cancelled')
        .where('updatedAt', '<', thirtyDaysAgo.toISOString())
        .get();
      stats.cancelledAppointments = cancelledAppointments.size;

      // Count expired holds (older than 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);
      const expiredHolds = await db.collection('holds')
        .where('createdAt', '<', oneDayAgo.toISOString())
        .get();
      stats.expiredHolds = expiredHolds.size;

      // Count expired tokens (older than 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const expiredTokens = await db.collection('customer_tokens')
        .where('lastUsed', '<', ninetyDaysAgo.toISOString())
        .get();
      stats.expiredTokens = expiredTokens.size;

      // Count old skin analysis requests (older than 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const oldSkinRequests = await db.collection('skinAnalysisRequests')
        .where('createdAt', '<', sixMonthsAgo.toISOString())
        .get();
      stats.oldSkinAnalysisRequests = oldSkinRequests.size;

      // Count old messages (approximate - messages older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oldMessages = await db.collection('messages')
        .where('timestamp', '<', oneYearAgo.toISOString())
        .get();
      stats.oldMessages = oldMessages.size;

      return stats;

    } catch (error: any) {
      console.error('Error getting cleanup stats:', error);
      throw new HttpsError('internal', `Failed to get stats: ${error.message}`);
    }
  }
);

// Helper functions (same as auto-cleanup but for manual use)
async function cleanupOldCancelledAppointments(results: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cancelledAppointments = await db.collection('appointments')
      .where('status', '==', 'cancelled')
      .where('updatedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();

    if (cancelledAppointments.empty) {
      console.log('No old cancelled appointments to clean up');
      return;
    }

    const batchSize = 500;
    const docs = cancelledAppointments.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      results.cancelledAppointments += batchDocs.length;
    }
    
  } catch (error) {
    console.error('Error cleaning up cancelled appointments:', error);
    results.errors++;
  }
}

async function cleanupExpiredHolds(results: any) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const expiredHolds = await db.collection('holds')
      .where('createdAt', '<', oneDayAgo.toISOString())
      .limit(1000)
      .get();

    if (expiredHolds.empty) {
      console.log('No expired holds to clean up');
      return;
    }

    const batchSize = 500;
    const docs = expiredHolds.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      results.expiredHolds += batchDocs.length;
    }
    
  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    results.errors++;
  }
}

async function cleanupExpiredTokens(results: any) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const expiredTokens = await db.collection('customer_tokens')
      .where('lastUsed', '<', ninetyDaysAgo.toISOString())
      .limit(1000)
      .get();

    if (expiredTokens.empty) {
      console.log('No expired tokens to clean up');
      return;
    }

    const batchSize = 500;
    const docs = expiredTokens.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      results.expiredTokens += batchDocs.length;
    }
    
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    results.errors++;
  }
}

async function cleanupOldMessages(results: any) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const customers = await db.collection('customers').get();
    
    for (const customerDoc of customers.docs) {
      const customerId = customerDoc.id;
      
      const messages = await db.collection('messages')
        .where('customerId', '==', customerId)
        .orderBy('timestamp', 'desc')
        .get();
      
      if (messages.size <= 50) {
        continue;
      }
      
      const messagesToDelete = messages.docs.slice(50);
      
      if (messagesToDelete.length === 0) {
        continue;
      }
      
      const batchSize = 500;
      for (let i = 0; i < messagesToDelete.length; i += batchSize) {
        const batch = db.batch();
        const batchDocs = messagesToDelete.slice(i, i + batchSize);
        
        batchDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        
        await batch.commit();
        results.oldMessages += batchDocs.length;
      }
    }
    
  } catch (error) {
    console.error('Error cleaning up old messages:', error);
    results.errors++;
  }
}

async function cleanupOldSkinAnalysisRequests(results: any) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const oldRequests = await db.collection('skinAnalysisRequests')
      .where('createdAt', '<', sixMonthsAgo.toISOString())
      .limit(1000)
      .get();

    if (oldRequests.empty) {
      console.log('No old skin analysis requests to clean up');
      return;
    }

    const batchSize = 500;
    const docs = oldRequests.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      results.oldSkinAnalysisRequests += batchDocs.length;
    }
    
  } catch (error) {
    console.error('Error cleaning up old skin analysis requests:', error);
    results.errors++;
  }
}
