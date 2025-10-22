// functions/src/enhanced-auto-cleanup.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

/**
 * ENHANCED AUTO-CLEANUP FUNCTION
 * 
 * Runs daily at 2 AM to clean up unnecessary database clutter while preserving:
 * - Regulatory required data (customer info, consent forms, completed appointments)
 * - UX important data (recent messages, active conversations, customer history)
 * 
 * What gets cleaned:
 * 1. Old cancelled appointments (>30 days)
 * 2. Expired holds (>24 hours)
 * 3. Expired customer tokens (>90 days unused)
 * 4. Old messages (keep last 50 per customer)
 * 5. Old skin analysis requests (>6 months)
 * 6. SMS logs (>90 days)
 * 7. SMS conversations (keep last 50 per customer)
 * 8. AI SMS conversations (keep last 50 per customer)
 * 9. Expired verification codes
 * 10. Email logs (>90 days)
 * 11. Old AI cache entries (>30 days)
 * 12. Orphaned availability slots (expired held/pending)
 * 13. Old completed skin analyses (>1 year)
 * 14. Failed SMS/Email logs (>30 days)
 */
export const enhancedAutoCleanup = onSchedule(
  {
    schedule: '0 2 * * *', // Daily at 2 AM
    timeZone: 'America/Los_Angeles',
    memory: '2GiB',
    timeoutSeconds: 540, // 9 minutes
  },
  async (event) => {
    console.log('🧹 Starting enhanced automatic database cleanup...');
    
    const cleanupResults = {
      cancelledAppointments: 0,
      oldHolds: 0,
      expiredTokens: 0,
      oldMessages: 0,
      oldSkinAnalysisRequests: 0,
      smsLogs: 0,
      smsConversations: 0,
      aiSmsConversations: 0,
      verificationCodes: 0,
      emailLogs: 0,
      aiCacheEntries: 0,
      availabilitySlots: 0,
      oldSkinAnalyses: 0,
      failedNotifications: 0,
      oldCompletedAppointments: 0,
      errors: 0,
      timestamp: new Date().toISOString()
    };

    try {
      // Run all cleanup tasks
      await Promise.all([
        cleanupOldCancelledAppointments(cleanupResults),
        cleanupExpiredHolds(cleanupResults),
        cleanupExpiredTokens(cleanupResults),
        cleanupOldMessages(cleanupResults),
        cleanupOldSkinAnalysisRequests(cleanupResults),
        cleanupSMSLogs(cleanupResults),
        cleanupSMSConversations(cleanupResults),
        cleanupAISMSConversations(cleanupResults),
        cleanupExpiredVerificationCodes(cleanupResults),
        cleanupEmailLogs(cleanupResults),
        cleanupAICacheEntries(cleanupResults),
        cleanupOrphanedAvailabilitySlots(cleanupResults),
        cleanupOldSkinAnalyses(cleanupResults),
        cleanupFailedNotifications(cleanupResults),
        cleanupOldCompletedAppointments(cleanupResults)
      ]);
      
      console.log('✅ Enhanced auto-cleanup completed successfully:', cleanupResults);
      
    } catch (error) {
      console.error('❌ Enhanced auto-cleanup failed:', error);
      cleanupResults.errors++;
    }
  }
);

// 1. Clean up cancelled appointments older than 30 days
async function cleanupOldCancelledAppointments(results: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const cancelledAppointments = await db.collection('appointments')
      .where('status', '==', 'cancelled')
      .where('updatedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();

    if (cancelledAppointments.empty) return;

    await deleteBatch(cancelledAppointments.docs);
    results.cancelledAppointments = cancelledAppointments.size;
    console.log(`Deleted ${cancelledAppointments.size} old cancelled appointments`);
    
  } catch (error) {
    console.error('Error cleaning up cancelled appointments:', error);
    results.errors++;
  }
}

// 2. Clean up expired holds (older than 24 hours)
async function cleanupExpiredHolds(results: any) {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    
    const expiredHolds = await db.collection('holds')
      .where('createdAt', '<', oneDayAgo.toISOString())
      .limit(1000)
      .get();

    if (expiredHolds.empty) return;

    await deleteBatch(expiredHolds.docs);
    results.oldHolds = expiredHolds.size;
    console.log(`Deleted ${expiredHolds.size} expired holds`);
    
  } catch (error) {
    console.error('Error cleaning up expired holds:', error);
    results.errors++;
  }
}

// 3. Clean up expired customer tokens (older than 90 days unused)
async function cleanupExpiredTokens(results: any) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const expiredTokens = await db.collection('customer_tokens')
      .where('lastUsed', '<', ninetyDaysAgo.toISOString())
      .limit(1000)
      .get();

    if (expiredTokens.empty) return;

    await deleteBatch(expiredTokens.docs);
    results.expiredTokens = expiredTokens.size;
    console.log(`Deleted ${expiredTokens.size} expired tokens`);
    
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    results.errors++;
  }
}

// 4. Clean up old messages (keep last 50 per customer)
async function cleanupOldMessages(results: any) {
  try {
    const customers = await db.collection('customers').select().limit(100).get();
    
    for (const customerDoc of customers.docs) {
      const messages = await db.collection('messages')
        .where('customerId', '==', customerDoc.id)
        .orderBy('timestamp', 'desc')
        .get();
      
      if (messages.size <= 50) continue;
      
      const messagesToDelete = messages.docs.slice(50);
      await deleteBatch(messagesToDelete);
      results.oldMessages += messagesToDelete.length;
    }
    
    console.log(`Cleaned up ${results.oldMessages} old messages`);
    
  } catch (error) {
    console.error('Error cleaning up old messages:', error);
    results.errors++;
  }
}

// 5. Clean up old skin analysis requests (older than 6 months)
async function cleanupOldSkinAnalysisRequests(results: any) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const oldRequests = await db.collection('skinAnalysisRequests')
      .where('createdAt', '<', sixMonthsAgo.toISOString())
      .limit(1000)
      .get();

    if (oldRequests.empty) return;

    await deleteBatch(oldRequests.docs);
    results.oldSkinAnalysisRequests = oldRequests.size;
    console.log(`Deleted ${oldRequests.size} old skin analysis requests`);
    
  } catch (error) {
    console.error('Error cleaning up old skin analysis requests:', error);
    results.errors++;
  }
}

// 6. Clean up SMS logs (older than 90 days)
async function cleanupSMSLogs(results: any) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldLogs = await db.collection('sms_logs')
      .where('timestamp', '<', ninetyDaysAgo.toISOString())
      .limit(1000)
      .get();

    if (oldLogs.empty) return;

    await deleteBatch(oldLogs.docs);
    results.smsLogs = oldLogs.size;
    console.log(`Deleted ${oldLogs.size} old SMS logs`);
    
  } catch (error) {
    console.error('Error cleaning up SMS logs:', error);
    results.errors++;
  }
}

// 7. Clean up SMS conversations (keep last 50 per customer)
async function cleanupSMSConversations(results: any) {
  try {
    // Get unique customer phone numbers from SMS conversations
    const conversations = await db.collection('sms_conversations')
      .orderBy('timestamp', 'desc')
      .limit(5000)
      .get();
    
    const customerPhones = new Set<string>();
    conversations.docs.forEach(doc => {
      const data = doc.data();
      if (data.phoneNumber) customerPhones.add(data.phoneNumber);
    });
    
    for (const phoneNumber of customerPhones) {
      const messages = await db.collection('sms_conversations')
        .where('phoneNumber', '==', phoneNumber)
        .orderBy('timestamp', 'desc')
        .get();
      
      if (messages.size <= 50) continue;
      
      const messagesToDelete = messages.docs.slice(50);
      await deleteBatch(messagesToDelete);
      results.smsConversations += messagesToDelete.length;
    }
    
    console.log(`Cleaned up ${results.smsConversations} old SMS conversations`);
    
  } catch (error) {
    console.error('Error cleaning up SMS conversations:', error);
    results.errors++;
  }
}

// 8. Clean up AI SMS conversations (keep last 50 per customer)
async function cleanupAISMSConversations(results: any) {
  try {
    const conversations = await db.collection('ai_sms_conversations')
      .orderBy('timestamp', 'desc')
      .limit(5000)
      .get();
    
    const customerPhones = new Set<string>();
    conversations.docs.forEach(doc => {
      const data = doc.data();
      if (data.phoneNumber) customerPhones.add(data.phoneNumber);
    });
    
    for (const phoneNumber of customerPhones) {
      const messages = await db.collection('ai_sms_conversations')
        .where('phoneNumber', '==', phoneNumber)
        .orderBy('timestamp', 'desc')
        .get();
      
      if (messages.size <= 50) continue;
      
      const messagesToDelete = messages.docs.slice(50);
      await deleteBatch(messagesToDelete);
      results.aiSmsConversations += messagesToDelete.length;
    }
    
    console.log(`Cleaned up ${results.aiSmsConversations} old AI SMS conversations`);
    
  } catch (error) {
    console.error('Error cleaning up AI SMS conversations:', error);
    results.errors++;
  }
}

// 9. Clean up expired verification codes
async function cleanupExpiredVerificationCodes(results: any) {
  try {
    const now = new Date();
    
    const expiredCodes = await db.collection('verification_codes')
      .where('expiresAt', '<', now.toISOString())
      .limit(1000)
      .get();

    if (expiredCodes.empty) return;

    await deleteBatch(expiredCodes.docs);
    results.verificationCodes = expiredCodes.size;
    console.log(`Deleted ${expiredCodes.size} expired verification codes`);
    
  } catch (error) {
    console.error('Error cleaning up verification codes:', error);
    results.errors++;
  }
}

// 10. Clean up email logs (older than 90 days)
async function cleanupEmailLogs(results: any) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const oldLogs = await db.collection('email_logs')
      .where('timestamp', '<', ninetyDaysAgo.toISOString())
      .limit(1000)
      .get();

    if (oldLogs.empty) return;

    await deleteBatch(oldLogs.docs);
    results.emailLogs = oldLogs.size;
    console.log(`Deleted ${oldLogs.size} old email logs`);
    
  } catch (error) {
    console.error('Error cleaning up email logs:', error);
    results.errors++;
  }
}

// 11. Clean up AI cache entries (older than 30 days)
async function cleanupAICacheEntries(results: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Clean AI chatbot cache
    const chatbotCache = await db.collection('ai_response_cache')
      .where('cachedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    if (!chatbotCache.empty) {
      await deleteBatch(chatbotCache.docs);
      results.aiCacheEntries += chatbotCache.size;
    }
    
    // Clean SMS AI cache
    const smsCache = await db.collection('sms_ai_cache')
      .where('cachedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    if (!smsCache.empty) {
      await deleteBatch(smsCache.docs);
      results.aiCacheEntries += smsCache.size;
    }
    
    // Clean skin analysis cache
    const skinCache = await db.collection('skin_analysis_cache')
      .where('cachedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    if (!skinCache.empty) {
      await deleteBatch(skinCache.docs);
      results.aiCacheEntries += skinCache.size;
    }
    
    console.log(`Deleted ${results.aiCacheEntries} old AI cache entries`);
    
  } catch (error) {
    console.error('Error cleaning up AI cache entries:', error);
    results.errors++;
  }
}

// 12. Clean up orphaned availability slots (expired held/pending)
async function cleanupOrphanedAvailabilitySlots(results: any) {
  try {
    const now = new Date();
    
    // Clean expired held slots
    const expiredHeld = await db.collection('availability')
      .where('status', '==', 'held')
      .where('expiresAt', '<', now.toISOString())
      .limit(1000)
      .get();

    if (!expiredHeld.empty) {
      await deleteBatch(expiredHeld.docs);
      results.availabilitySlots = expiredHeld.size;
    }
    
    console.log(`Deleted ${results.availabilitySlots} orphaned availability slots`);
    
  } catch (error) {
    console.error('Error cleaning up availability slots:', error);
    results.errors++;
  }
}

// 13. Clean up old completed skin analyses (older than 1 year)
// Note: We keep these longer as they may have medical/regulatory value
async function cleanupOldSkinAnalyses(results: any) {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const oldAnalyses = await db.collection('skinAnalyses')
      .where('status', '==', 'completed')
      .where('createdAt', '<', oneYearAgo.toISOString())
      .limit(500) // Fewer at a time since these are larger
      .get();

    if (oldAnalyses.empty) return;

    await deleteBatch(oldAnalyses.docs);
    results.oldSkinAnalyses = oldAnalyses.size;
    console.log(`Deleted ${oldAnalyses.size} old skin analyses`);
    
  } catch (error) {
    console.error('Error cleaning up old skin analyses:', error);
    results.errors++;
  }
}

// 14. Clean up failed notification logs (older than 30 days)
async function cleanupFailedNotifications(results: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Clean failed SMS logs
    const failedSMS = await db.collection('sms_logs')
      .where('status', '==', 'failed')
      .where('timestamp', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    if (!failedSMS.empty) {
      await deleteBatch(failedSMS.docs);
      results.failedNotifications += failedSMS.size;
    }
    
    // Clean failed email logs
    const failedEmail = await db.collection('email_logs')
      .where('status', '==', 'failed')
      .where('timestamp', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    if (!failedEmail.empty) {
      await deleteBatch(failedEmail.docs);
      results.failedNotifications += failedEmail.size;
    }
    
    console.log(`Deleted ${results.failedNotifications} failed notification logs`);
    
  } catch (error) {
    console.error('Error cleaning up failed notifications:', error);
    results.errors++;
  }
}

// 15. Clean up old completed appointments (keep for 90 days, then remove detailed tracking)
async function cleanupOldCompletedAppointments(results: any) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    // Find completed/no-show appointments older than 90 days
    const oldCompleted = await db.collection('appointments')
      .where('status', 'in', ['completed', 'no-show'])
      .where('completedAt', '<', ninetyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    if (oldCompleted.empty) {
      console.log('No old completed appointments to clean up');
      return;
    }
    
    // Remove detailed attendance tracking fields but keep basic appointment record
    const batch = db.batch();
    for (const doc of oldCompleted.docs) {
      const appointment = doc.data();
      
      // Keep essential fields, remove detailed tracking
      const fieldsToRemove = {
        attendance: null,
        attendanceMarkedAt: null,
        attendanceMarkedBy: null,
        completedAt: null,
        completedBy: null,
        receiptSent: null,
        receiptSentAt: null
      };
      
      batch.update(doc.ref, fieldsToRemove);
    }
    
    await batch.commit();
    results.oldCompletedAppointments += oldCompleted.size;
    
    console.log(`Cleaned up detailed tracking for ${oldCompleted.size} old completed appointments`);
    
  } catch (error) {
    console.error('Error cleaning up old completed appointments:', error);
    results.errors++;
  }
}

// Helper function to delete documents in batches
async function deleteBatch(docs: FirebaseFirestore.QueryDocumentSnapshot[]) {
  const batchSize = 500;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = db.batch();
    const batchDocs = docs.slice(i, i + batchSize);
    
    batchDocs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

