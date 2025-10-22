#!/usr/bin/env node

/**
 * Script to fix existing appointments that are missing customer details
 * This will populate customerName, customerEmail, and customerPhone for appointments
 * that have a customerId but are missing these fields.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  // Try to load service account from .runtimeconfig.json or default paths
  let serviceAccount = null;
  
  const configPaths = [
    '.runtimeconfig.json',
    'functions/.runtimeconfig.json',
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  ].filter(Boolean);
  
  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (config.serviceAccountKey) {
          serviceAccount = config.serviceAccountKey;
          console.log('✅ Using service account from', configPath);
          break;
        }
      } catch (e) {
        // Continue to next path
      }
    }
  }
  
  // Initialize with or without service account
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Use application default credentials
    console.log('⚠️  No service account found, using application default credentials');
    console.log('   Make sure you\'re logged in with: firebase login');
    admin.initializeApp({
      projectId: 'bueno-brows-7cce7'
    });
  }
}

const db = admin.firestore();

async function fixAppointmentCustomerDetails() {
  console.log('🔍 Scanning appointments for missing customer details...\n');
  
  try {
    // Get all appointments
    const appointmentsRef = db.collection('appointments');
    const snapshot = await appointmentsRef.get();
    
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    
    console.log(`Found ${snapshot.size} total appointments to check\n`);
    
    // Process in batches for better performance
    const batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    for (const doc of snapshot.docs) {
      const appointment = doc.data();
      
      // Skip if no customerId
      if (!appointment.customerId) {
        skipped++;
        continue;
      }
      
      // Check if customer details are missing
      const missingDetails = !appointment.customerName || 
                            !appointment.customerEmail || 
                            !appointment.customerPhone;
      
      if (!missingDetails) {
        skipped++;
        continue;
      }
      
      try {
        // Fetch customer details
        const customerDoc = await db.collection('customers').doc(appointment.customerId).get();
        
        if (!customerDoc.exists) {
          console.log(`⚠️  Customer ${appointment.customerId} not found for appointment ${doc.id}`);
          errors++;
          continue;
        }
        
        const customer = customerDoc.data();
        
        // Prepare updates
        const updates = {
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        if (!appointment.customerName && customer.name) {
          updates.customerName = customer.name;
        }
        if (!appointment.customerEmail && customer.email) {
          updates.customerEmail = customer.email;
        }
        if (!appointment.customerPhone && customer.phone) {
          updates.customerPhone = customer.phone;
        }
        
        // Add to batch
        batch.update(doc.ref, updates);
        batchCount++;
        fixed++;
        
        console.log(`✅ Fixed appointment ${doc.id} - Added customer details for ${customer.name}`);
        
        // Commit batch if it reaches the limit
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`\n📦 Committed batch of ${batchCount} updates\n`);
          batchCount = 0;
        }
        
      } catch (error) {
        console.error(`❌ Error processing appointment ${doc.id}:`, error.message);
        errors++;
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n📦 Committed final batch of ${batchCount} updates\n`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixed} appointments`);
    console.log(`⏭️  Skipped: ${skipped} appointments (already have details or no customerId)`);
    console.log(`❌ Errors: ${errors} appointments`);
    console.log('='.repeat(60));
    
    if (fixed > 0) {
      console.log('\n✨ Customer details have been successfully populated in appointments!');
      console.log('   Appointments now show customer name, email, and phone in modals.\n');
    } else {
      console.log('\n✨ All appointments already have customer details!\n');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
fixAppointmentCustomerDetails()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

