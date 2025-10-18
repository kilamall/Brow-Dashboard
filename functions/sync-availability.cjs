#!/usr/bin/env node

/**
 * One-time migration script to sync existing appointments to availability collection
 * Run this once after deploying the availability system
 * 
 * Usage: node sync-availability.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
try {
  admin.initializeApp({
    projectId: 'bueno-brows-7cce7'
  });
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  // Already initialized, that's fine
  if (!error.message?.includes('already exists')) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    process.exit(1);
  }
  console.log('✅ Firebase Admin already initialized');
}

const db = admin.firestore();

async function syncAvailability() {
  console.log('\n🔄 Starting availability sync...\n');
  
  try {
    // Get all appointments
    const appointmentsSnapshot = await db.collection('appointments').get();
    console.log(`📋 Found ${appointmentsSnapshot.size} total appointments`);
    
    let synced = 0;
    let skipped = 0;
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500; // Firestore batch limit
    
    for (const doc of appointmentsSnapshot.docs) {
      const appt = doc.data();
      
      // Skip cancelled appointments
      if (appt.status === 'cancelled') {
        skipped++;
        continue;
      }
      
      // Calculate end time
      const startMs = new Date(appt.start).getTime();
      const endMs = startMs + (appt.duration * 60 * 1000);
      const end = new Date(endMs).toISOString();
      
      // Create availability slot
      const availRef = db.collection('availability').doc(doc.id);
      const availSlot = {
        start: appt.start,
        end: end,
        status: 'booked',
        createdAt: appt.createdAt || new Date().toISOString(),
      };
      
      batch.set(availRef, availSlot);
      synced++;
      batchCount++;
      
      // Commit batch if we hit the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`   ✅ Committed batch of ${batchCount} slots`);
        batchCount = 0;
      }
    }
    
    // Commit any remaining items
    if (batchCount > 0) {
      await batch.commit();
      console.log(`   ✅ Committed final batch of ${batchCount} slots`);
    }
    
    console.log('\n✨ Sync complete!');
    console.log(`   ✅ Synced: ${synced} appointments`);
    console.log(`   ⏭️  Skipped: ${skipped} cancelled appointments`);
    console.log(`\n🎉 Availability collection is now up to date!\n`);
    
  } catch (error) {
    console.error('\n❌ Error syncing availability:', error);
    process.exit(1);
  }
}

// Run the migration
syncAvailability()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

