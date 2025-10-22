// functions/src/auto-cleanup.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Auto-cleanup function that runs daily at 2 AM
export const autoCleanup = onSchedule(
  {
    schedule: '0 2 * * *', // Daily at 2 AM
    timeZone: 'America/Los_Angeles',
    memory: '1GiB',
    timeoutSeconds: 540, // 9 minutes
  },
  async (event) => {
    console.log('Starting automatic database cleanup...');
    
    const cleanupResults = {
      cancelledAppointments: 0,
      oldHolds: 0,
      expiredTokens: 0,
      oldMessages: 0,
      oldSkinAnalysisRequests: 0,
      errors: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Clean up cancelled appointments older than 30 days
      await cleanupOldCancelledAppointments(cleanupResults);
      
      // 2. Clean up expired holds (older than 24 hours)
      await cleanupExpiredHolds(cleanupResults);
      
      // 3. Clean up expired customer tokens (older than 90 days)
      await cleanupExpiredTokens(cleanupResults);
      
      // 4. Clean up old messages (older than 1 year, keep last 50 per customer)
      await cleanupOldMessages(cleanupResults);
      
      // 5. Clean up old skin analysis requests (older than 6 months)
      await cleanupOldSkinAnalysisRequests(cleanupResults);
      
      console.log('Auto-cleanup completed:', cleanupResults);
      
    } catch (error) {
      console.error('Auto-cleanup failed:', error);
      cleanupResults.errors++;
    }
  }
);

// Clean up cancelled appointments older than 30 days
async function cleanupOldCancelledAppointments(results: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cancelledAppointments = await db.collection('appointments')
      .where('status', '==', 'cancelled')
      .where('updatedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000) // Process max 1000 at a time
      .get();

    if (cancelledAppointments.empty) {
      console.log('No old cancelled appointments to clean up');
      return;
    }

    // Delete in batches
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
      console.log(`Deleted batch of ${batchDocs.length} old cancelled appointments`);
    }
    
  } catch (error) {
    console.error('Error cleaning up cancelled appointments:', error);
    results.errors++;
  }
}

// Clean up expired holds (older than 24 hours)
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

    // Delete in batches
    const batchSize = 500;
    const docs = expiredHolds.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      results.oldHolds += batchDocs.length;
      console.log(`Deleted batch of ${batchDocs.length} expired holds`);
    }
    
  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    results.errors++;
  }
}

// Clean up expired customer tokens (older than 90 days)
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

    // Delete in batches
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
      console.log(`Deleted batch of ${batchDocs.length} expired tokens`);
    }
    
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    results.errors++;
  }
}

// Clean up old messages (older than 1 year, keep last 50 per customer)
async function cleanupOldMessages(results: any) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    // Get all customers
    const customers = await db.collection('customers').get();
    
    for (const customerDoc of customers.docs) {
      const customerId = customerDoc.id;
      
      // Get all messages for this customer, ordered by timestamp desc
      const messages = await db.collection('messages')
        .where('customerId', '==', customerId)
        .orderBy('timestamp', 'desc')
        .get();
      
      if (messages.size <= 50) {
        continue; // Keep all messages if 50 or fewer
      }
      
      // Keep the first 50 (most recent) and delete the rest
      const messagesToDelete = messages.docs.slice(50);
      
      if (messagesToDelete.length === 0) {
        continue;
      }
      
      // Delete old messages in batches
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
      
      console.log(`Cleaned up ${messagesToDelete.length} old messages for customer ${customerId}`);
    }
    
  } catch (error) {
    console.error('Error cleaning up old messages:', error);
    results.errors++;
  }
}

// Clean up old skin analysis requests (older than 6 months)
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

    // Delete in batches
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
      console.log(`Deleted batch of ${batchDocs.length} old skin analysis requests`);
    }
    
  } catch (error) {
    console.error('Error cleaning up old skin analysis requests:', error);
    results.errors++;
  }
}
