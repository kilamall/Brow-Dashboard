import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import sgMail from '@sendgrid/mail';
// Define types locally since shared types may not be available in functions
interface CostMonitoringSettings {
  projectId: string;
  budgetThresholds: {
    warning: number;
    critical: number;
    max: number;
  };
  alertEmails: string[];
  autoSync: boolean;
  currency: string;
  lastSyncAt: string;
  sendGridApiKey?: string;
}

interface CostMetrics {
  date: string;
  totalCost: number;
  services: {
    firestore: { reads: number; writes: number; cost: number };
    functions: { invocations: number; cost: number };
    storage: { gb: number; bandwidth: number; cost: number };
    hosting: { bandwidth: number; cost: number };
    geminiAI: { calls: number; cost: number };
    sendGrid: { emails: number; cost: number };
    twilio: { smsSent: number; smsReceived: number; cost: number };
  };
  projectedMonthly: number;
  createdAt: string;
}

interface UsageStats {
  firestore: {
    reads: number;
    writes: number;
    deletes: number;
    storage: number;
  };
  functions: {
    invocations: number;
    computeTime: number;
  };
  storage: {
    totalGB: number;
    downloadsGB: number;
  };
  hosting: {
    bandwidthGB: number;
  };
  geminiAI: {
    requests: number;
    tokens: number;
  };
  sendGrid: {
    emails: number;
  };
  twilio: {
    smsSent: number;
    smsReceived: number;
  };
}

interface CostAlert {
  id: string;
  type: 'warning' | 'critical' | 'exceeded';
  threshold: number;
  currentCost: number;
  projectedCost: number;
  message: string;
  sentAt: string;
  emails: string[];
}

try { initializeApp(); } catch {}
const db = getFirestore();

// Configuration
const sendGridApiKey = defineString('SENDGRID_API_KEY', {
  description: 'SendGrid API key for sending cost alert emails',
  default: ''
});
const googleCloudProjectId = defineString('GOOGLE_CLOUD_PROJECT_ID', {
  description: 'Google Cloud Project ID for cost monitoring',
  default: 'bueno-brows-7cce7'
});

// Firebase pricing (as of October 2025)
const FIREBASE_PRICING = {
  firestore: {
    reads: 0.06 / 100000,    // $0.06 per 100K reads
    writes: 0.18 / 100000,   // $0.18 per 100K writes
    deletes: 0.02 / 100000,  // $0.02 per 100K deletes
    storage: 0.18 / 1024     // $0.18 per GB per month
  },
  functions: {
    invocations: 0.40 / 1000000,  // $0.40 per million
    compute: 0.0000025           // $0.0000025 per GB-second
  },
  storage: {
    storage: 0.026 / 1024,       // $0.026 per GB per month
    downloads: 0.12 / 1024        // $0.12 per GB downloads
  },
  hosting: {
    bandwidth: 0.15 / 1024        // $0.15 per GB bandwidth
  },
  geminiAI: {
    requests: 0.00025,           // $0.00025 per request (Flash)
    tokens: 0.000075 / 1000     // $0.000075 per 1K tokens
  },
  sendGrid: {
    emails: 0.0006               // $0.0006 per email (Essentials plan)
  },
  twilio: {
    smsSent: 0.0079,             // $0.0079 per outgoing SMS (US)
    smsReceived: 0.0075,         // $0.0075 per incoming SMS (US)
    carrierFee: 0.003,           // $0.003 per SMS segment (carrier fees)
    phoneNumber: 1.15 / 30,      // $1.15 per month / 30 days (actual cost)
    a2pRegistration: 8.00 / 30   // $8.00 per month A2P registration (prorated, varies)
  }
};

// Free tier limits
const FREE_TIER_LIMITS = {
  firestore: {
    reads: 50000,      // per day
    writes: 20000,     // per day
    deletes: 20000,    // per day
    storage: 1         // GB
  },
  functions: {
    invocations: 2000000,        // per month
    compute: 400000,             // GB-seconds per month
    networking: 5                // GB per month
  },
  storage: {
    storage: 5,                  // GB
    downloads: 1                 // GB per day
  },
  hosting: {
    storage: 10,                 // GB
    bandwidth: 360               // MB per day
  },
  geminiAI: {
    requests: 1500              // per day
  }
};

/**
 * Sync Firebase costs and usage data (scheduled daily at 2 AM)
 */
export const syncFirebaseCosts = onSchedule({
  schedule: 'every day 02:00',
  timeZone: 'America/Los_Angeles',
  region: 'us-central1'
}, async () => {
  try {
    console.log('🔄 Starting daily cost sync...');
    
    // Get cost monitoring settings
    const settingsDoc = await db.collection('settings').doc('costMonitoring').get();
    if (!settingsDoc.exists) {
      console.log('⚠️ Cost monitoring not configured, skipping sync');
      return;
    }
    
    const settings = settingsDoc.data() as CostMonitoringSettings;
    
    // Calculate current usage and costs
    const usageStats = await getCurrentUsageStats();
    const costMetrics = await calculateCosts(usageStats);
    
    // Store daily metrics
    const today = new Date().toISOString().slice(0, 10);
    await db.collection('costMetrics').doc(today).set({
      ...costMetrics,
      date: today,
      createdAt: new Date().toISOString()
    });
    
    // Check for budget alerts
    await checkBudgetAlerts(settings, costMetrics);
    
    // Update last sync time
    await db.collection('settings').doc('costMonitoring').update({
      lastSyncAt: new Date().toISOString()
    });
    
    console.log('✅ Cost sync completed successfully');
  } catch (error) {
    console.error('❌ Error in cost sync:', error);
  }
});

/**
 * Get current usage statistics
 */
export const getCurrentUsage = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    try {
      console.error(`🚀 [COST] getCurrentUsage called, starting...`);
      const usageStats = await getCurrentUsageStats();
      console.error(`✅ [COST] getCurrentUsageStats returned, calculating costs...`);
      const costMetrics = await calculateCosts(usageStats);
      console.error(`✅ [COST] Costs calculated, calculating efficiency...`);
      const efficiency = await calculateEfficiency(costMetrics);
      console.error(`✅ [COST] Efficiency calculated, getting recommendations...`);
      const recommendations = await getOptimizationRecommendations(usageStats, costMetrics);
      console.error(`✅ [COST] ALL DONE! Returning response...`);
      
      return {
        success: true,
        data: {
          usage: usageStats,
          costs: costMetrics,
          efficiency,
          recommendations,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error(`❌ [COST] FATAL ERROR in getCurrentUsage: ${error.message}`);
      console.error(`❌ [COST] Error stack: ${error.stack}`);
      throw new HttpsError('internal', 'Failed to fetch usage data');
    }
  }
);

/**
 * Get historical cost data for charts
 */
export const getCostHistory = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { startDate, endDate, period = 'daily' } = req.data || {};
    
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const end = endDate || new Date().toISOString().slice(0, 10);
      
      const metrics = await db.collection('costMetrics')
        .where('date', '>=', start)
        .where('date', '<=', end)
        .orderBy('date', 'asc')
        .get();
      
      const history = metrics.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date,
          totalCost: data.totalCost,
          services: data.services,
          projectedMonthly: data.projectedMonthly,
          createdAt: data.createdAt
        } as CostMetrics;
      });
      
      return {
        success: true,
        data: {
          history,
          period,
          startDate: start,
          endDate: end
        }
      };
    } catch (error) {
      console.error('Error getting cost history:', error);
      throw new HttpsError('internal', 'Failed to fetch cost history');
    }
  }
);

/**
 * Send cost monitoring alerts via SendGrid
 */
export const sendCostAlert = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { alertType, currentCost, threshold, emails } = req.data || {};
    
    if (!alertType || !emails || !Array.isArray(emails)) {
      throw new HttpsError('invalid-argument', 'Missing required parameters');
    }

    try {
      const apiKey = sendGridApiKey.value();
      if (!apiKey) {
        throw new HttpsError('failed-precondition', 'SendGrid API key not configured');
      }

      sgMail.setApiKey(apiKey);

      const alertMessages = {
        warning: {
          subject: '⚠️ Cost Alert: Approaching Budget Threshold',
          content: `Your Firebase costs are approaching the warning threshold. Current: $${currentCost.toFixed(2)}, Threshold: $${threshold.toFixed(2)}`
        },
        critical: {
          subject: '🚨 Cost Alert: Critical Budget Level',
          content: `Your Firebase costs have reached a critical level. Current: $${currentCost.toFixed(2)}, Threshold: $${threshold.toFixed(2)}`
        },
        exceeded: {
          subject: '💸 Cost Alert: Budget Exceeded',
          content: `Your Firebase costs have exceeded the maximum budget. Current: $${currentCost.toFixed(2)}, Threshold: $${threshold.toFixed(2)}`
        }
      };

      const alert = alertMessages[alertType as keyof typeof alertMessages];
      
      const msg = {
        to: emails,
        from: 'alerts@buenobrows.com',
        subject: alert.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">${alert.subject}</h2>
            <p>${alert.content}</p>
            <p>Please review your Firebase usage and consider optimizing your application.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <h3>Quick Actions:</h3>
              <ul>
                <li><a href="https://console.firebase.google.com/project/${googleCloudProjectId.value()}/usage">View Firebase Usage</a></li>
                <li><a href="https://console.cloud.google.com/billing">Google Cloud Billing</a></li>
                <li><a href="https://bueno-brows-admin.web.app/cost-monitoring">Cost Monitoring Dashboard</a></li>
              </ul>
            </div>
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              This is an automated alert from your Bueno Brows cost monitoring system.
            </p>
          </div>
        `
      };

      await sgMail.send(msg);
      
      // Log the alert
      await db.collection('costAlerts').add({
        type: alertType,
        threshold,
        currentCost,
        emails,
        sentAt: new Date().toISOString(),
        message: alert.content
      });

      return {
        success: true,
        message: `Alert sent to ${emails.length} recipient(s)`
      };
    } catch (error) {
      console.error('Error sending cost alert:', error);
      throw new HttpsError('internal', 'Failed to send cost alert');
    }
  }
);

// Helper Functions

async function getCurrentUsageStats(): Promise<UsageStats> {
  // Get actual usage data from Firestore statistics and tracking collections
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthKey = startOfMonth.toISOString().slice(0, 7); // YYYY-MM format
    
    console.error(`📊 [COST] Calculating costs for ${monthKey} (from ${startOfMonth.toISOString()})`);
    
    // For querying: most collections use ISO string timestamps
    const startOfMonthISO = startOfMonth.toISOString();
    
    // Get Firestore usage from tracking document (we'll create this)
    let firestoreStats = {
      reads: 0,
      writes: 0,
      deletes: 0,
      storage: 0
    };
    
    console.error('💾 [COST] Step 1: Checking Firestore usage...');
    // Always query actual collections for accurate tracking
    try {
      console.error('🔍 [COST] Querying all major collections for accurate counts...');
      const collections = [
        'appointments', 'customers', 'services', 'settings', 'bookingHolds',
        'email_logs', 'sms_logs', 'sms_conversations', 'ai_conversations',
        'ai_sms_conversations', 'skinAnalyses', 'customerConsents', 'slideshow'
      ];
      let totalDocs = 0;
      const collectionCounts: Record<string, number> = {};
      
      for (const collName of collections) {
        try {
          const snapshot = await db.collection(collName).count().get();
          const count = snapshot.data().count;
          totalDocs += count;
          collectionCounts[collName] = count;
          console.error(`  [COST] ${collName}: ${count} docs`);
        } catch (countErr: any) {
          console.error(`  [COST] ${collName}: count failed - ${countErr.message}`);
          collectionCounts[collName] = 0;
        }
      }
      
      // More accurate estimates based on actual document counts and typical usage patterns
      // Reads: Each document is read multiple times per month (queries, fetches, etc.)
      // Writes: Documents are updated/created regularly
      // Storage: Estimate based on document size (average ~1-2KB per doc)
      const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);
      
      // Count documents created this month for more accurate write estimates
      let monthlyWrites = 0;
      const writeCollections = ['appointments', 'email_logs', 'sms_logs', 'sms_conversations', 'ai_conversations', 'ai_sms_conversations', 'skinAnalyses'];
      for (const collName of writeCollections) {
        try {
          const field = collName === 'sms_conversations' || collName === 'ai_sms_conversations' ? 'timestamp' : 'createdAt';
          const snapshot = await db.collection(collName)
            .where(field, '>=', collName.includes('sms') || collName.includes('email') ? startOfMonthISO : startOfMonthTimestamp)
            .count()
            .get();
          monthlyWrites += snapshot.data().count;
        } catch (err) {
          // Skip if query fails
        }
      }
      
      firestoreStats = {
        reads: totalDocs * 30 + monthlyWrites * 10, // ~30 reads per doc per month + 10 reads per new write
        writes: monthlyWrites || Math.floor(totalDocs * 0.2), // Use actual monthly writes or estimate 20% of docs written
        deletes: Math.floor(totalDocs * 0.05), // ~5% deletion rate
        storage: totalDocs * 0.002 // ~2KB per document average (more accurate)
      };
      console.error(`✅ [COST] Firestore stats: ${totalDocs} total docs, ${monthlyWrites} monthly writes`);
      console.error(`  [COST] Estimated: ${firestoreStats.reads} reads, ${firestoreStats.writes} writes, ${firestoreStats.storage.toFixed(3)} GB storage`);
    } catch (err: any) {
      console.error(`❌ [COST] Firestore tracking failed: ${err.message}`);
    }
    
    console.error('⚡ [COST] Step 2: Checking function invocations...');
    let functionStats = { invocations: 0, computeTime: 0 };
    try {
      const funcDoc = await db.collection('_usage_tracking').doc(`${monthKey}_functions`).get();
      if (funcDoc.exists) {
        const data = funcDoc.data();
        functionStats = {
          invocations: data?.invocations || 0,
          computeTime: data?.computeTimeSeconds || 0
        };
        console.error('✅ [COST] Using manual function tracking');
      } else {
        throw new Error('No manual tracking');
      }
    } catch (err: any) {
      console.error('⚠️ [COST] Estimating from appointments:', err.message);
      try {
        // Estimate from appointment count using Timestamp (createdAt is stored as Firestore Timestamp)
        const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);
        const apptSnapshot = await db.collection('appointments')
          .where('createdAt', '>=', startOfMonthTimestamp)
          .count()
          .get();
        const monthlyAppts = apptSnapshot.data().count;
        console.error(`📅 [COST] Appointments this month: ${monthlyAppts}`);
        
        functionStats = {
          invocations: monthlyAppts * 15,
          computeTime: monthlyAppts * 2
        };
      } catch (apptErr: any) {
        console.error(`❌ [COST] Appointment count failed: ${apptErr.message}`);
      }
    }
    
    console.error('💾 [COST] Step 3: Checking storage usage...');
    // Get storage usage - count profile pictures, consent forms, and images
    let storageStats = { totalGB: 0, downloadsGB: 0 };
    // Always query actual collections for accurate tracking
    try {
      console.error('🔍 [COST] Querying collections for storage files...');
      let totalSizeMB = 0;
      let downloadsMB = 0;
      
      // Customer profile pictures (~1MB each, compressed)
      try {
        const customersWithPhotos = await db.collection('customers')
          .where('profilePictureUrl', '!=', null)
          .count()
          .get();
        const photoCount = customersWithPhotos.data().count;
        totalSizeMB += photoCount * 1;
        downloadsMB += photoCount * 0.1; // 10% downloaded per month
        console.error(`  [COST] Customer photos: ${photoCount} files (~${photoCount} MB)`);
      } catch (err: any) {
        console.error(`  [COST] Customer photos query failed: ${err.message}`);
      }
      
      // Consent forms (~200KB each, 2 files per form: before + after)
      try {
        const consentForms = await db.collection('customerConsents')
          .count()
          .get();
        const consentCount = consentForms.data().count;
        totalSizeMB += consentCount * 0.2 * 2; // 2 files per consent
        downloadsMB += consentCount * 0.2 * 0.05; // 5% downloaded
        console.error(`  [COST] Consent forms: ${consentCount} forms (~${(consentCount * 0.4).toFixed(2)} MB)`);
      } catch (err: any) {
        console.error(`  [COST] Consent forms query failed: ${err.message}`);
      }
      
      // Skin analysis images (~2MB each, auto-deleted after 30 days)
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgoTimestamp = Timestamp.fromDate(thirtyDaysAgo);
        const skinAnalysesSnapshot = await db.collection('skinAnalyses')
          .where('createdAt', '>=', thirtyDaysAgoTimestamp)
          .count()
          .get();
        const skinCount = skinAnalysesSnapshot.data().count;
        totalSizeMB += skinCount * 2;
        downloadsMB += skinCount * 0.5; // 25% downloaded
        console.error(`  [COST] Skin analyses (last 30 days): ${skinCount} images (~${(skinCount * 2).toFixed(2)} MB)`);
      } catch (err: any) {
        console.error(`  [COST] Skin analyses query failed: ${err.message}`);
      }
      
      // Service images (~500KB each)
      try {
        const services = await db.collection('services')
          .where('imageUrl', '!=', null)
          .count()
          .get();
        const serviceCount = services.data().count;
        totalSizeMB += serviceCount * 0.5;
        downloadsMB += serviceCount * 1; // Frequently accessed (viewed often)
        console.error(`  [COST] Service images: ${serviceCount} images (~${(serviceCount * 0.5).toFixed(2)} MB)`);
      } catch (err: any) {
        console.error(`  [COST] Service images query failed: ${err.message}`);
      }
      
      // Gallery/slideshow images (~3MB each, high quality)
      try {
        const slideshow = await db.collection('slideshow')
          .count()
          .get();
        const galleryCount = slideshow.data().count;
        totalSizeMB += galleryCount * 3;
        downloadsMB += galleryCount * 2; // Frequently accessed (shown on website)
        console.error(`  [COST] Gallery images: ${galleryCount} images (~${(galleryCount * 3).toFixed(2)} MB)`);
      } catch (err: any) {
        console.error(`  [COST] Gallery images query failed: ${err.message}`);
      }
      
      storageStats = {
        totalGB: totalSizeMB / 1024,
        downloadsGB: downloadsMB / 1024
      };
      
      console.error(`✅ [COST] Storage usage: ${(totalSizeMB / 1024).toFixed(3)} GB total, ${(downloadsMB / 1024).toFixed(3)} GB downloads`);
    } catch (storageErr: any) {
      console.error(`❌ [COST] Storage tracking failed: ${storageErr.message}`);
    }
    
    console.error('🤖 [COST] Step 4: Checking Gemini AI usage...');
    // Get Gemini AI usage
    let geminiStats = { requests: 0, tokens: 0 };
    // Always query actual collections, ignore manual tracking
    try {
      let totalRequests = 0;
      const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);
      
      console.error(`🤖 [COST] Querying ai_conversations...`);
      // Count AI chatbot conversations (uses Timestamp)
      const aiChatbotSnapshot = await db.collection('ai_conversations')
        .where('createdAt', '>=', startOfMonthTimestamp)
        .count()
        .get();
      totalRequests += aiChatbotSnapshot.data().count;
      console.error(`🤖 [COST] AI chatbot conversations: ${aiChatbotSnapshot.data().count}`);
      
      console.error(`💬 [COST] Querying ai_sms_conversations...`);
      // Count SMS AI conversations (uses Date, stored as Timestamp)
      const smsAiSnapshot = await db.collection('ai_sms_conversations')
        .where('timestamp', '>=', startOfMonthTimestamp)
        .count()
        .get();
      totalRequests += smsAiSnapshot.data().count;
      console.error(`💬 [COST] SMS AI conversations: ${smsAiSnapshot.data().count}`);
      
      console.error(`🧴 [COST] Querying skinAnalyses...`);
      // Count skin analyses (uses Timestamp) - filter status in memory
      const skinAnalysesSnapshot = await db.collection('skinAnalyses')
        .where('createdAt', '>=', startOfMonthTimestamp)
        .get();
      const completedAnalyses = skinAnalysesSnapshot.docs.filter(doc => 
        doc.data().status === 'completed'
      ).length;
      totalRequests += completedAnalyses * 2; // Usually 2 API calls per analysis
      console.error(`🧴 [COST] Skin analyses: ${completedAnalyses}`);
      
      geminiStats = {
        requests: totalRequests,
        tokens: totalRequests * 500  // ~500 tokens average per request
      };
      
      console.error(`🤖 [COST] Gemini AI usage this month: ${totalRequests} requests`);
      console.error(`✅ [COST] Step 4 completed successfully`);
    } catch (aiErr: any) {
      console.error(`❌ [COST] Could not fetch AI usage, using zero values: ${aiErr.message}`);
      console.error(`❌ [COST] AI error stack: ${aiErr.stack}`);
    }
    
    console.error('📧 [COST] Step 5: Checking SendGrid email usage...');
    // Get SendGrid email count from actual email_logs collection
    let sendGridStats = { emails: 0 };
    // Always query actual collections, ignore manual tracking
    try {
      console.error(`🔍 [COST] Querying email_logs where timestamp >= ${startOfMonthISO}`);
      
      // Query without compound index - get all this month, filter status in memory
      const emailLogsSnapshot = await db.collection('email_logs')
        .where('timestamp', '>=', startOfMonthISO)
        .get();
      
      console.error(`📊 [COST] Query returned ${emailLogsSnapshot.size} documents`);
      
      // Filter by status in memory (avoids need for compound index)
      const sentEmails = emailLogsSnapshot.docs.filter(doc => doc.data().status === 'sent');
      const totalEmails = sentEmails.length;
      console.error(`✅ [COST] Filtered to ${totalEmails} sent emails`);
      
      // Break down by type for debugging
      const byType: Record<string, number> = {};
      emailLogsSnapshot.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'unknown';
        byType[type] = (byType[type] || 0) + 1;
      });
      
      sendGridStats = { emails: totalEmails };
      
      console.error(`📧 [COST] SendGrid emails this month: ${totalEmails} emails`);
      console.error(`📧 [COST] Breakdown:`, JSON.stringify(byType));
    } catch (emailErr: any) {
      console.error(`❌ [COST] Could not fetch email_logs, using appointment estimate: ${emailErr.message}`);
      // Fallback to appointment-based estimate only if email_logs fails
      try {
        let totalEmails = 0;
        const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);
        
        // Count appointments (uses Timestamp) - single where clause, filter status in memory
        const appts = await db.collection('appointments')
          .where('createdAt', '>=', startOfMonthTimestamp)
          .get();
        
        const confirmedCount = appts.docs.filter(doc => 
          ['confirmed', 'completed'].includes(doc.data().status)
        ).length;
        const cancelledCount = appts.docs.filter(doc => 
          doc.data().status === 'cancelled'
        ).length;
        
        totalEmails += confirmedCount * 3; // confirmation + 2 reminders
        totalEmails += cancelledCount; // 1 cancellation email
        
        sendGridStats = { emails: totalEmails };
        console.error(`📧 [COST] SendGrid (estimated) emails this month: ${totalEmails} emails`);
      } catch (fallbackErr) {
        console.error('❌ [COST] Complete email tracking failure:', fallbackErr);
      }
    }
    
    console.error('📱 [COST] Step 6: Checking Twilio SMS usage...');
    // Get Twilio SMS usage from both sms_logs AND sms_conversations collections
    let twilioStats = { smsSent: 0, smsReceived: 0 };
    // Always query actual collections, ignore manual tracking
    try {
      let sentCount = 0;
      let receivedCount = 0;
      console.error(`📱 [COST] Starting SMS queries...`);
      
      // Check sms_logs collection (uses ISO string timestamps)
      try {
        const smsLogsSnapshot = await db.collection('sms_logs')
          .where('timestamp', '>=', startOfMonthISO)
          .get();
        
        smsLogsSnapshot.forEach(doc => {
          const data = doc.data();
          // Count Twilio messages only (provider === 'twilio')
          if (data.provider === 'twilio') {
            if (data.type === 'admin_message' || data.direction === 'outbound') {
              sentCount++;
            } else if (data.direction === 'inbound') {
              receivedCount++;
            }
          }
        });
        
        console.error(`📱 [COST] SMS from sms_logs: ${sentCount} sent, ${receivedCount} received`);
      } catch (logsErr: any) {
        console.error(`❌ [COST] Could not fetch sms_logs: ${logsErr.message}`);
      }
      
      // Check sms_conversations collection (uses ISO string timestamps)
      try {
        console.error(`🔍 [COST] Querying sms_conversations where timestamp >= ${startOfMonthISO}`);
        
        const conversationsSnapshot = await db.collection('sms_conversations')
          .where('timestamp', '>=', startOfMonthISO)
          .get();
        
        console.error(`📊 [COST] Query returned ${conversationsSnapshot.size} documents`);
        
        let outboundCount = 0, inboundCount = 0;
        conversationsSnapshot.forEach(doc => {
          const data = doc.data();
          
          if (data.direction === 'outbound') {
            sentCount++;
            outboundCount++;
          } else if (data.direction === 'inbound') {
            receivedCount++;
            inboundCount++;
          }
        });
        
        console.error(`📱 [COST] SMS from sms_conversations: ${outboundCount} outbound, ${inboundCount} inbound (total sent: ${sentCount}, received: ${receivedCount})`);
      } catch (convoErr: any) {
        console.error(`❌ [COST] Could not fetch sms_conversations: ${convoErr.message}`);
      }
      
      twilioStats = {
        smsSent: sentCount,
        smsReceived: receivedCount
      };
      
      console.error(`📱 [COST] TOTAL Twilio SMS usage this month: ${sentCount} sent, ${receivedCount} received`);
    } catch (smsErr: any) {
      console.error(`❌ [COST] Could not fetch SMS data, using zero values: ${smsErr.message}`);
    }
    
    // Hosting bandwidth - rough estimate
    const hostingStats = {
      bandwidthGB: storageStats.downloadsGB + 0.5 // storage downloads + general traffic
    };
    
    console.error(`✅ [COST] getCurrentUsageStats COMPLETED! Returning data:`);
    console.error(`  - SendGrid: ${sendGridStats.emails} emails`);
    console.error(`  - Twilio: ${twilioStats.smsSent} sent, ${twilioStats.smsReceived} received`);
    
    return {
      firestore: firestoreStats,
      functions: functionStats,
      storage: storageStats,
      hosting: hostingStats,
      geminiAI: geminiStats,
      sendGrid: sendGridStats,
      twilio: twilioStats
    };
  } catch (error: any) {
    console.error(`❌ [COST] FATAL ERROR in getCurrentUsageStats: ${error.message}`);
    console.error(`❌ [COST] Error stack: ${error.stack}`);
    // Return minimal safe values rather than random
    return {
      firestore: { reads: 0, writes: 0, deletes: 0, storage: 0 },
      functions: { invocations: 0, computeTime: 0 },
      storage: { totalGB: 0, downloadsGB: 0 },
      hosting: { bandwidthGB: 0 },
      geminiAI: { requests: 0, tokens: 0 },
      sendGrid: { emails: 0 },
      twilio: { smsSent: 0, smsReceived: 0 }
    };
  }
}

async function calculateCosts(usage: UsageStats): Promise<Omit<CostMetrics, 'date' | 'createdAt'>> {
  // Calculate Firestore costs
  const firestoreCost = 
    (Math.max(0, usage.firestore.reads - FREE_TIER_LIMITS.firestore.reads * 30) * FIREBASE_PRICING.firestore.reads) +
    (Math.max(0, usage.firestore.writes - FREE_TIER_LIMITS.firestore.writes * 30) * FIREBASE_PRICING.firestore.writes) +
    (usage.firestore.storage * FIREBASE_PRICING.firestore.storage);

  // Calculate Functions costs
  const functionsCost = 
    (Math.max(0, usage.functions.invocations - FREE_TIER_LIMITS.functions.invocations) * FIREBASE_PRICING.functions.invocations) +
    (usage.functions.computeTime * FIREBASE_PRICING.functions.compute);

  // Calculate Storage costs
  const storageCost = 
    (usage.storage.totalGB * FIREBASE_PRICING.storage.storage) +
    (usage.storage.downloadsGB * FIREBASE_PRICING.storage.downloads);

  // Calculate Hosting costs
  const hostingCost = usage.hosting.bandwidthGB * FIREBASE_PRICING.hosting.bandwidth;

  // Calculate Gemini AI costs
  const geminiCost = usage.geminiAI.requests * FIREBASE_PRICING.geminiAI.requests;

  // Calculate SendGrid costs
  const sendGridCost = usage.sendGrid.emails * FIREBASE_PRICING.sendGrid.emails;

  // Calculate Twilio SMS costs (including carrier fees and A2P registration)
  const totalSmsSegments = usage.twilio.smsSent + usage.twilio.smsReceived;
  const twilioCost = 
    (usage.twilio.smsSent * FIREBASE_PRICING.twilio.smsSent) +              // Outbound message cost
    (usage.twilio.smsReceived * FIREBASE_PRICING.twilio.smsReceived) +      // Inbound message cost
    (totalSmsSegments * FIREBASE_PRICING.twilio.carrierFee) +               // Carrier fees per segment
    (new Date().getDate() * FIREBASE_PRICING.twilio.phoneNumber) +          // Phone number daily cost
    (new Date().getDate() * FIREBASE_PRICING.twilio.a2pRegistration);       // A2P registration daily cost

  const totalCost = firestoreCost + functionsCost + storageCost + hostingCost + geminiCost + sendGridCost + twilioCost;

  return {
    totalCost,
    services: {
      firestore: {
        reads: usage.firestore.reads,
        writes: usage.firestore.writes,
        cost: firestoreCost
      },
      functions: {
        invocations: usage.functions.invocations,
        cost: functionsCost
      },
      storage: {
        gb: usage.storage.totalGB,
        bandwidth: usage.storage.downloadsGB,
        cost: storageCost
      },
      hosting: {
        bandwidth: usage.hosting.bandwidthGB,
        cost: hostingCost
      },
      geminiAI: {
        calls: usage.geminiAI.requests,
        cost: geminiCost
      },
      sendGrid: {
        emails: usage.sendGrid.emails,
        cost: sendGridCost
      },
      twilio: {
        smsSent: usage.twilio.smsSent,
        smsReceived: usage.twilio.smsReceived,
        cost: twilioCost
      }
    },
    projectedMonthly: totalCost * (30 / new Date().getDate())
  };
}

async function checkBudgetAlerts(settings: CostMonitoringSettings, costs: Omit<CostMetrics, 'date' | 'createdAt'>) {
  const { budgetThresholds, alertEmails } = settings;
  
  if (!alertEmails || alertEmails.length === 0) return;
  
  const currentCost = costs.totalCost;
  const projectedCost = costs.projectedMonthly;
  
  let alertType: 'warning' | 'critical' | 'exceeded' | null = null;
  
  if (projectedCost >= budgetThresholds.max) {
    alertType = 'exceeded';
  } else if (projectedCost >= budgetThresholds.critical) {
    alertType = 'critical';
  } else if (projectedCost >= budgetThresholds.warning) {
    alertType = 'warning';
  }
  
  if (alertType) {
    // Check if we've already sent an alert today
    const today = new Date().toISOString().slice(0, 10);
    const existingAlert = await db.collection('costAlerts')
      .where('type', '==', alertType)
      .where('sentAt', '>=', today)
      .limit(1)
      .get();
    
    if (existingAlert.empty) {
      // Send alert
      const apiKey = sendGridApiKey.value();
      if (apiKey) {
        sgMail.setApiKey(apiKey);
        
        const alertMessages = {
          warning: {
            subject: '⚠️ Cost Alert: Approaching Budget Threshold',
            content: `Your projected monthly Firebase costs are approaching the warning threshold. Projected: $${projectedCost.toFixed(2)}, Threshold: $${budgetThresholds.warning.toFixed(2)}`
          },
          critical: {
            subject: '🚨 Cost Alert: Critical Budget Level',
            content: `Your projected monthly Firebase costs have reached a critical level. Projected: $${projectedCost.toFixed(2)}, Threshold: $${budgetThresholds.critical.toFixed(2)}`
          },
          exceeded: {
            subject: '💸 Cost Alert: Budget Exceeded',
            content: `Your projected monthly Firebase costs have exceeded the maximum budget. Projected: $${projectedCost.toFixed(2)}, Threshold: $${budgetThresholds.max.toFixed(2)}`
          }
        };

        const alert = alertMessages[alertType];
        
        const msg = {
          to: alertEmails,
          from: 'alerts@buenobrows.com',
          subject: alert.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">${alert.subject}</h2>
              <p>${alert.content}</p>
              <p>Please review your Firebase usage and consider optimizing your application.</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                <h3>Quick Actions:</h3>
                <ul>
                  <li><a href="https://console.firebase.google.com/project/${googleCloudProjectId.value()}/usage">View Firebase Usage</a></li>
                  <li><a href="https://console.cloud.google.com/billing">Google Cloud Billing</a></li>
                  <li><a href="https://bueno-brows-admin.web.app/cost-monitoring">Cost Monitoring Dashboard</a></li>
                </ul>
              </div>
              <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
                This is an automated alert from your Bueno Brows cost monitoring system.
              </p>
            </div>
          `
        };

        await sgMail.send(msg);
        
        // Log the alert
        const thresholdValue = alertType === 'exceeded' ? budgetThresholds.max : budgetThresholds[alertType];
        await db.collection('costAlerts').add({
          type: alertType,
          threshold: thresholdValue,
          currentCost,
          projectedCost,
          emails: alertEmails,
          sentAt: new Date().toISOString(),
          message: alert.content
        });
        
        console.log(`📧 Cost alert sent: ${alertType} ($${projectedCost.toFixed(2)})`);
      }
    }
  }
}

/**
 * Calculate business efficiency metrics
 */
async function calculateEfficiency(costs: Omit<CostMetrics, 'date' | 'createdAt'>) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);
    
    // Get appointment count for the month (uses Timestamp)
    const appointmentsSnapshot = await db.collection('appointments')
      .where('createdAt', '>=', startOfMonthTimestamp)
      .count()
      .get();
    const totalAppointments = appointmentsSnapshot.data().count;
    
    // Get appointments this month - filter status in memory to avoid compound index
    const appointmentsThisMonth = await db.collection('appointments')
      .where('createdAt', '>=', startOfMonthTimestamp)
      .get();
    
    // Filter by status in memory
    const completedApptDocs = appointmentsThisMonth.docs.filter(doc => 
      doc.data().status === 'completed'
    );
    const completedAppointments = completedApptDocs.length;
    
    // Calculate revenue from completed appointments
    let totalRevenue = 0;
    completedApptDocs.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.totalPrice || 0;
      totalRevenue += data.tipAmount || 0;
    });
    
    // Calculate metrics
    const costPerAppointment = totalAppointments > 0 ? costs.totalCost / totalAppointments : 0;
    const costPerCompletedAppointment = completedAppointments > 0 ? costs.totalCost / completedAppointments : 0;
    const revenueToCostratio = totalRevenue > 0 ? (costs.totalCost / totalRevenue) * 100 : 0;
    const efficiencyScore = totalRevenue > 0 ? Math.max(0, Math.min(100, 100 - revenueToCostratio)) : 0;
    
    // Get customer count
    const customersSnapshot = await db.collection('customers')
      .where('status', '==', 'active')
      .count()
      .get();
    const activeCustomers = customersSnapshot.data().count;
    
    const costPerCustomer = activeCustomers > 0 ? costs.totalCost / activeCustomers : 0;
    
    return {
      totalAppointments,
      completedAppointments,
      totalRevenue,
      costPerAppointment,
      costPerCompletedAppointment,
      costPerCustomer,
      revenueToCostratio,
      efficiencyScore: Math.round(efficiencyScore),
      activeCustomers
    };
  } catch (error) {
    console.error('Error calculating efficiency:', error);
    return {
      totalAppointments: 0,
      completedAppointments: 0,
      totalRevenue: 0,
      costPerAppointment: 0,
      costPerCompletedAppointment: 0,
      costPerCustomer: 0,
      revenueToCostratio: 0,
      efficiencyScore: 0,
      activeCustomers: 0
    };
  }
}

/**
 * Get optimization recommendations based on usage patterns
 */
async function getOptimizationRecommendations(usage: UsageStats, costs: Omit<CostMetrics, 'date' | 'createdAt'>) {
  const recommendations: Array<{
    category: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    potentialSavings?: number;
  }> = [];
  
  // Check Firestore usage
  if (usage.firestore.reads > FREE_TIER_LIMITS.firestore.reads * 30 * 2) {
    const potentialSavings = (usage.firestore.reads - FREE_TIER_LIMITS.firestore.reads * 30) * FIREBASE_PRICING.firestore.reads * 0.3;
    recommendations.push({
      category: 'Firestore',
      severity: 'warning',
      title: 'High Firestore Read Operations',
      description: 'Consider implementing caching strategies or reducing real-time listeners to minimize reads.',
      potentialSavings
    });
  }
  
  if (usage.firestore.writes > FREE_TIER_LIMITS.firestore.writes * 30 * 2) {
    recommendations.push({
      category: 'Firestore',
      severity: 'warning',
      title: 'High Firestore Write Operations',
      description: 'Review write operations and batch updates where possible to reduce costs.'
    });
  }
  
  // Check Functions usage
  if (usage.functions.invocations > FREE_TIER_LIMITS.functions.invocations * 1.5) {
    recommendations.push({
      category: 'Functions',
      severity: 'warning',
      title: 'High Function Invocations',
      description: 'Consider optimizing function triggers or implementing rate limiting.'
    });
  }
  
  // Check Gemini AI usage
  if (usage.geminiAI.requests > FREE_TIER_LIMITS.geminiAI.requests * 30 * 0.8) {
    const potentialSavings = costs.services.geminiAI.cost * 0.2;
    recommendations.push({
      category: 'Gemini AI',
      severity: 'info',
      title: 'Approaching AI Free Tier Limit',
      description: 'You\'re using a significant portion of the Gemini AI free tier. Consider caching responses for common queries.',
      potentialSavings
    });
  }
  
  // Check Storage usage
  if (usage.storage.totalGB > FREE_TIER_LIMITS.storage.storage) {
    recommendations.push({
      category: 'Storage',
      severity: 'info',
      title: 'Storage Usage Above Free Tier',
      description: 'Consider implementing image compression or cleanup policies for old files.'
    });
  }
  
  // Check Twilio SMS usage
  if (usage.twilio.smsSent > 100) {
    const potentialSavings = costs.services.twilio.cost * 0.1;
    recommendations.push({
      category: 'Twilio SMS',
      severity: 'info',
      title: 'SMS Usage Detected',
      description: `You've sent ${usage.twilio.smsSent} SMS messages this month. Consider implementing SMS response templates and caching to reduce redundant messages.`,
      potentialSavings
    });
  }
  
  // Check if SMS costs are high relative to total
  if (costs.services.twilio.cost > costs.totalCost * 0.3 && costs.services.twilio.cost > 5) {
    recommendations.push({
      category: 'Twilio SMS',
      severity: 'warning',
      title: 'High SMS Costs',
      description: `SMS costs account for ${Math.round((costs.services.twilio.cost / costs.totalCost) * 100)}% of your total costs. Review your SMS usage patterns and consider consolidating messages.`,
      potentialSavings: costs.services.twilio.cost * 0.2
    });
  }
  
  // Check overall cost efficiency
  if (costs.totalCost > 0) {
    const highestCost = Object.entries(costs.services)
      .reduce((max, [key, service]: [string, any]) => 
        service.cost > max.cost ? { name: key, cost: service.cost } : max,
        { name: '', cost: 0 }
      );
    
    if (highestCost.cost > costs.totalCost * 0.5) {
      recommendations.push({
        category: highestCost.name,
        severity: 'info',
        title: `${highestCost.name} is your highest cost`,
        description: `${highestCost.name} accounts for ${Math.round((highestCost.cost / costs.totalCost) * 100)}% of your total costs. Focus optimization efforts here.`
      });
    }
  }
  
  // If no recommendations, add a positive message
  if (recommendations.length === 0) {
    recommendations.push({
      category: 'General',
      severity: 'info',
      title: 'Excellent Cost Management',
      description: 'Your usage is well within optimal ranges. Keep up the good work!'
    });
  }
  
  return recommendations;
}
