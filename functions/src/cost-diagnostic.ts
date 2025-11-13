import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

/**
 * Diagnostic function to check actual data formats in Firestore
 * This helps us understand why cost monitoring shows zeros
 */
export const diagnosticCostData = onCall(
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
      const results: any = {};
      
      // Check sms_conversations
      const smsConvoSample = await db.collection('sms_conversations').limit(3).get();
      results.sms_conversations = {
        totalDocs: smsConvoSample.size,
        sample: smsConvoSample.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          timestampType: typeof doc.data().timestamp,
          hasDirection: 'direction' in doc.data(),
          direction: doc.data().direction
        }))
      };
      
      // Check email_logs
      const emailLogsSample = await db.collection('email_logs').limit(3).get();
      results.email_logs = {
        totalDocs: emailLogsSample.size,
        sample: emailLogsSample.docs.map(doc => ({
          id: doc.id,
          data: doc.data(),
          timestampType: typeof doc.data().timestamp,
          hasStatus: 'status' in doc.data(),
          status: doc.data().status,
          type: doc.data().type
        }))
      };
      
      // Check appointments
      const apptSample = await db.collection('appointments').limit(3).get();
      results.appointments = {
        totalDocs: apptSample.size,
        sample: apptSample.docs.map(doc => ({
          id: doc.id,
          createdAtType: typeof doc.data().createdAt,
          createdAtValue: doc.data().createdAt,
          status: doc.data().status
        }))
      };
      
      // Check ai_conversations
      const aiSample = await db.collection('ai_conversations').limit(3).get();
      results.ai_conversations = {
        totalDocs: aiSample.size,
        sample: aiSample.docs.map(doc => ({
          id: doc.id,
          createdAtType: typeof doc.data().createdAt,
          createdAtValue: doc.data().createdAt
        }))
      };
      
      // Check skinAnalyses
      const skinSample = await db.collection('skinAnalyses').limit(3).get();
      results.skinAnalyses = {
        totalDocs: skinSample.size,
        sample: skinSample.docs.map(doc => ({
          id: doc.id,
          createdAtType: typeof doc.data().createdAt,
          createdAtValue: doc.data().createdAt,
          status: doc.data().status
        }))
      };
      
      // Check customers
      const customersSample = await db.collection('customers').limit(3).get();
      results.customers = {
        totalDocs: customersSample.size,
        hasProfilePictures: customersSample.docs.filter(d => d.data().profilePictureUrl).length
      };
      
      // Try querying with different methods
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Method 1: ISO String
      try {
        const testQuery1 = await db.collection('email_logs')
          .where('timestamp', '>=', startOfMonth.toISOString())
          .limit(5)
          .get();
        results.queryTest_isoString = testQuery1.size;
      } catch (e: any) {
        results.queryTest_isoString = `Error: ${e.message}`;
      }
      
      // Method 2: Date object
      try {
        const testQuery2 = await db.collection('email_logs')
          .where('timestamp', '>=', startOfMonth)
          .limit(5)
          .get();
        results.queryTest_dateObject = testQuery2.size;
      } catch (e: any) {
        results.queryTest_dateObject = `Error: ${e.message}`;
      }
      
      // Method 3: Get all and count
      try {
        const allEmails = await db.collection('email_logs').limit(100).get();
        const thisMonth = allEmails.docs.filter(doc => {
          const ts = doc.data().timestamp;
          if (typeof ts === 'string') {
            return new Date(ts) >= startOfMonth;
          }
          return false;
        });
        results.queryTest_manualFilter = {
          total: allEmails.size,
          thisMonth: thisMonth.length
        };
      } catch (e: any) {
        results.queryTest_manualFilter = `Error: ${e.message}`;
      }
      
      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Diagnostic error:', error);
      throw new HttpsError('internal', 'Failed to run diagnostic');
    }
  }
);

