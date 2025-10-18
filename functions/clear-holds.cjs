// Simple script to clear all active holds
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'bueno-brows-7cce7'
});

const db = admin.firestore();

async function clearAllHolds() {
  try {
    console.log('🔍 Finding all active holds...');
    
    const holdsRef = db.collection('holds');
    const activeHoldsQuery = holdsRef.where('status', '==', 'active');
    const snapshot = await activeHoldsQuery.get();
    
    if (snapshot.empty) {
      console.log('✅ No active holds found');
      return;
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
    
  } catch (error) {
    console.error('❌ Error clearing holds:', error);
  } finally {
    process.exit(0);
  }
}

clearAllHolds();
