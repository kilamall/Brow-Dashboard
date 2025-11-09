// One-time function to fix totalVisits for existing customers
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const fixTotalVisits = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users to run this
    if (!req.auth || !req.auth.token.role || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admins can run this function');
    }

    console.log('🔍 Finding customers without totalVisits field...');
    
    const customersSnapshot = await db.collection('customers').get();
    
    let fixedCount = 0;
    const batch = db.batch();
    const results = [];
    
    for (const doc of customersSnapshot.docs) {
      const data = doc.data();
      
      // If totalVisits is undefined or null, set it to 0
      if (data.totalVisits === undefined || data.totalVisits === null) {
        console.log(`📝 Fixing customer: ${data.name || 'Unknown'} (${doc.id})`);
        batch.update(doc.ref, {
          totalVisits: 0,
          lastVisit: null,
          updatedAt: new Date().toISOString()
        });
        results.push({
          id: doc.id,
          name: data.name || 'Unknown',
          email: data.email || null
        });
        fixedCount++;
      }
    }
    
    if (fixedCount > 0) {
      await batch.commit();
      console.log(`✅ Fixed ${fixedCount} customer(s)`);
    } else {
      console.log('✅ All customers already have totalVisits field');
    }
    
    return {
      success: true,
      fixedCount,
      totalCustomers: customersSnapshot.size,
      customers: results,
      message: `Fixed ${fixedCount} customer(s) out of ${customersSnapshot.size} total. They can now see new user promotions!`
    };
  }
);





