import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const clearAllHolds = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    console.log('🔍 Finding all active holds...');
    
    try {
      const holdsRef = db.collection('holds');
      const activeHoldsQuery = holdsRef.where('status', '==', 'active');
      const snapshot = await activeHoldsQuery.get();
      
      if (snapshot.empty) {
        console.log('✅ No active holds found');
        return { success: true, message: 'No active holds found', clearedCount: 0 };
      }
      
      console.log(`📋 Found ${snapshot.size} active holds`);
      
      const batch = db.batch();
      let count = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`🗑️ Clearing hold: ${doc.id} (${data.start} - ${data.end})`);
        batch.update(doc.ref, { 
          status: 'released', 
          expiresAt: new Date().toISOString() 
        });
        count++;
      });
      
      await batch.commit();
      console.log(`✅ Successfully cleared ${count} active holds`);
      
      return { 
        success: true, 
        message: `Successfully cleared ${count} active holds`, 
        clearedCount: count 
      };
      
    } catch (error: any) {
      console.error('❌ Error clearing holds:', error);
      throw new HttpsError('internal', `Failed to clear holds: ${error.message}`);
    }
  }
);
