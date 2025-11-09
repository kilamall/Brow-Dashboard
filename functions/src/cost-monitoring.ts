import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineString } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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
      const usageStats = await getCurrentUsageStats();
      const costMetrics = await calculateCosts(usageStats);
      const efficiency = await calculateEfficiency(costMetrics);
      const recommendations = await getOptimizationRecommendations(usageStats, costMetrics);
      
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
    } catch (error) {
      console.error('Error getting current usage:', error);
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
    
    // Get Firestore usage from tracking document (we'll create this)
    let firestoreStats = {
      reads: 0,
      writes: 0,
      deletes: 0,
      storage: 0
    };
    
    try {
      const usageDoc = await db.collection('_usage_tracking').doc(monthKey).get();
      if (usageDoc.exists) {
        const data = usageDoc.data();
        firestoreStats = {
          reads: data?.firestoreReads || 0,
          writes: data?.firestoreWrites || 0,
          deletes: data?.firestoreDeletes || 0,
          storage: data?.firestoreStorageGB || 0
        };
      }
    } catch (err) {
      console.log('Using estimated Firestore stats:', err);
      // Fallback: estimate from collection sizes
      const collections = ['appointments', 'customers', 'services', 'settings', 'bookingHolds'];
      let totalDocs = 0;
      
      for (const collName of collections) {
        const snapshot = await db.collection(collName).count().get();
        totalDocs += snapshot.data().count;
      }
      
      // Rough estimates based on typical usage patterns
      firestoreStats = {
        reads: totalDocs * 50, // assume ~50 reads per doc per month
        writes: totalDocs * 5,  // assume ~5 writes per doc per month
        deletes: Math.floor(totalDocs * 0.1), // assume 10% deletion rate
        storage: totalDocs * 0.001 // assume ~1KB per doc on average
      };
    }
    
    // Get function invocations from tracking
    let functionStats = { invocations: 0, computeTime: 0 };
    try {
      const funcDoc = await db.collection('_usage_tracking').doc(`${monthKey}_functions`).get();
      if (funcDoc.exists) {
        const data = funcDoc.data();
        functionStats = {
          invocations: data?.invocations || 0,
          computeTime: data?.computeTimeSeconds || 0
        };
      }
    } catch (err) {
      // Estimate from appointment count
      const apptSnapshot = await db.collection('appointments')
        .where('createdAt', '>=', startOfMonth)
        .count()
        .get();
      const monthlyAppts = apptSnapshot.data().count;
      
      functionStats = {
        invocations: monthlyAppts * 15, // ~15 function calls per appointment
        computeTime: monthlyAppts * 2    // ~2 seconds compute per appointment
      };
    }
    
    // Get storage usage - count profile pictures and consent forms
    let storageStats = { totalGB: 0, downloadsGB: 0 };
    try {
      const storageDoc = await db.collection('_usage_tracking').doc(`${monthKey}_storage`).get();
      if (storageDoc.exists) {
        const data = storageDoc.data();
        storageStats = {
          totalGB: data?.totalGB || 0,
          downloadsGB: data?.downloadsGB || 0
        };
      }
    } catch (err) {
      // Estimate from uploaded files
      const customersWithPhotos = await db.collection('customers')
        .where('profilePictureUrl', '!=', null)
        .count()
        .get();
      
      const consentForms = await db.collection('consentForms')
        .count()
        .get();
      
      const totalFiles = customersWithPhotos.data().count + (consentForms.data().count * 2);
      storageStats = {
        totalGB: (totalFiles * 0.5) / 1024, // assume 500KB per file
        downloadsGB: (totalFiles * 0.1) / 1024  // assume 10% download rate
      };
    }
    
    // Get Gemini AI usage
    let geminiStats = { requests: 0, tokens: 0 };
    try {
      const geminiDoc = await db.collection('_usage_tracking').doc(`${monthKey}_gemini`).get();
      if (geminiDoc.exists) {
        const data = geminiDoc.data();
        geminiStats = {
          requests: data?.requests || 0,
          tokens: data?.tokens || 0
        };
      }
    } catch (err) {
      // Estimate from AI conversations
      const aiConvos = await db.collection('aiConversations')
        .where('createdAt', '>=', startOfMonth)
        .count()
        .get();
      
      geminiStats = {
        requests: aiConvos.data().count * 3, // ~3 requests per conversation
        tokens: aiConvos.data().count * 500  // ~500 tokens per conversation
      };
    }
    
    // Get SendGrid email count
    let sendGridStats = { emails: 0 };
    try {
      const emailDoc = await db.collection('_usage_tracking').doc(`${monthKey}_sendgrid`).get();
      if (emailDoc.exists) {
        const data = emailDoc.data();
        sendGridStats = { emails: data?.emails || 0 };
      }
    } catch (err) {
      // Estimate from appointments (confirmations + reminders)
      const apptSnapshot = await db.collection('appointments')
        .where('createdAt', '>=', startOfMonth)
        .count()
        .get();
      
      sendGridStats = {
        emails: apptSnapshot.data().count * 3 // confirmation + 2 reminders per appt
      };
    }
    
    // Hosting bandwidth - rough estimate
    const hostingStats = {
      bandwidthGB: storageStats.downloadsGB + 0.5 // storage downloads + general traffic
    };
    
    return {
      firestore: firestoreStats,
      functions: functionStats,
      storage: storageStats,
      hosting: hostingStats,
      geminiAI: geminiStats,
      sendGrid: sendGridStats
    };
  } catch (error) {
    console.error('Error getting usage stats:', error);
    // Return minimal safe values rather than random
    return {
      firestore: { reads: 0, writes: 0, deletes: 0, storage: 0 },
      functions: { invocations: 0, computeTime: 0 },
      storage: { totalGB: 0, downloadsGB: 0 },
      hosting: { bandwidthGB: 0 },
      geminiAI: { requests: 0, tokens: 0 },
      sendGrid: { emails: 0 }
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

  const totalCost = firestoreCost + functionsCost + storageCost + hostingCost + geminiCost + sendGridCost;

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
    
    // Get appointment count for the month
    const appointmentsSnapshot = await db.collection('appointments')
      .where('createdAt', '>=', startOfMonth)
      .count()
      .get();
    const totalAppointments = appointmentsSnapshot.data().count;
    
    // Get completed appointments
    const completedSnapshot = await db.collection('appointments')
      .where('createdAt', '>=', startOfMonth)
      .where('status', '==', 'completed')
      .count()
      .get();
    const completedAppointments = completedSnapshot.data().count;
    
    // Get total revenue for the month
    const revenueSnapshot = await db.collection('appointments')
      .where('createdAt', '>=', startOfMonth)
      .where('status', '==', 'completed')
      .get();
    
    let totalRevenue = 0;
    revenueSnapshot.forEach(doc => {
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
