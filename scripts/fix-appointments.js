const admin = require('firebase-admin');
const path = require('path');
const readline = require('readline');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'bueno-brows-7cce7-firebase-adminsdk-h5yx9-dd72e0eea8.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully\n');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\n💡 Please make sure your service account key file is in the project root.');
  console.log('   Expected location:', serviceAccountPath);
  process.exit(1);
}

const db = admin.firestore();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function deleteInvalidAppointments(invalidAppointments) {
  console.log(`\n🗑️  Preparing to delete ${invalidAppointments.length} invalid appointments...\n`);
  
  // Show what will be deleted
  console.log('The following appointments will be PERMANENTLY DELETED:');
  console.log('═══════════════════════════════════════════════');
  invalidAppointments.forEach((apt, index) => {
    console.log(`[${index + 1}] ${apt.id}`);
    console.log(`    Issue: ${apt.issue}`);
    console.log(`    Customer: ${apt.customerId || 'N/A'}`);
    console.log(`    Status: ${apt.status || 'N/A'}`);
  });
  console.log('═══════════════════════════════════════════════\n');
  
  const confirm = await askQuestion('⚠️  Are you SURE you want to delete these appointments? (yes/no): ');
  
  if (confirm.toLowerCase() !== 'yes') {
    console.log('❌ Deletion cancelled. No changes made.');
    return false;
  }
  
  console.log('\n🔄 Deleting appointments...');
  
  // Firestore has a limit of 500 operations per batch
  const batchSize = 500;
  let deleted = 0;
  
  for (let i = 0; i < invalidAppointments.length; i += batchSize) {
    const batch = db.batch();
    const chunk = invalidAppointments.slice(i, i + batchSize);
    
    chunk.forEach(apt => {
      const ref = db.collection('appointments').doc(apt.id);
      batch.delete(ref);
    });
    
    await batch.commit();
    deleted += chunk.length;
    console.log(`   Deleted ${deleted}/${invalidAppointments.length} appointments...`);
  }
  
  console.log(`\n✅ Successfully deleted ${deleted} invalid appointments!\n`);
  return true;
}

async function fixAppointments() {
  console.log('🔍 Loading invalid appointments from inspection results...\n');
  
  let invalidAppointments;
  try {
    const data = require('./invalid-appointments.json');
    invalidAppointments = data;
  } catch (error) {
    console.error('❌ Could not find invalid-appointments.json');
    console.log('💡 Please run "node scripts/inspect-appointments.js" first.\n');
    process.exit(1);
  }
  
  if (!invalidAppointments || invalidAppointments.length === 0) {
    console.log('🎉 No invalid appointments found! Nothing to fix.\n');
    process.exit(0);
  }
  
  console.log(`Found ${invalidAppointments.length} invalid appointment(s)\n`);
  
  console.log('Choose an action:');
  console.log('1. DELETE all invalid appointments (PERMANENT)');
  console.log('2. Show details and exit (no changes)');
  console.log('3. Cancel\n');
  
  const choice = await askQuestion('Enter your choice (1-3): ');
  
  switch (choice.trim()) {
    case '1':
      await deleteInvalidAppointments(invalidAppointments);
      break;
      
    case '2':
      console.log('\n📋 INVALID APPOINTMENTS DETAILS:');
      console.log('═══════════════════════════════════════════════');
      invalidAppointments.forEach((apt, index) => {
        console.log(`\n[${index + 1}] ID: ${apt.id}`);
        console.log(`    Issue: ${apt.issue}`);
        if (apt.startValue !== undefined) {
          console.log(`    Start Value: "${apt.startValue}"`);
          console.log(`    Type: ${apt.startType}`);
        }
        console.log(`    Customer ID: ${apt.customerId || 'N/A'}`);
        console.log(`    Service ID: ${apt.serviceId || 'N/A'}`);
        console.log(`    Status: ${apt.status || 'N/A'}`);
      });
      console.log('\n═══════════════════════════════════════════════\n');
      break;
      
    case '3':
      console.log('❌ Cancelled. No changes made.\n');
      break;
      
    default:
      console.log('❌ Invalid choice. No changes made.\n');
  }
  
  rl.close();
}

fixAppointments()
  .catch(err => {
    console.error('❌ Error:', err);
    rl.close();
    process.exit(1);
  });

