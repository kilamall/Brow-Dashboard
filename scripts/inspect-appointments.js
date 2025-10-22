const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '..', 'bueno-brows-7cce7-firebase-adminsdk-h5yx9-dd72e0eea8.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\n💡 Please make sure your service account key file is in the project root.');
  console.log('   Expected location:', serviceAccountPath);
  process.exit(1);
}

const db = admin.firestore();

async function inspectAppointments() {
  console.log('\n🔍 Starting appointment inspection...\n');
  
  const appointmentsRef = db.collection('appointments');
  const snapshot = await appointmentsRef.get();
  
  console.log(`📊 Total appointments in database: ${snapshot.size}`);
  
  const invalid = [];
  const valid = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const apt = { id: doc.id, ...data };
    
    // Check if start date is valid
    if (!apt.start) {
      invalid.push({ 
        id: doc.id, 
        issue: 'Missing start field', 
        customerId: apt.customerId,
        serviceId: apt.serviceId,
        status: apt.status,
        createdAt: apt.createdAt,
        data: apt 
      });
    } else {
      const testDate = new Date(apt.start);
      if (isNaN(testDate.getTime())) {
        invalid.push({ 
          id: doc.id, 
          issue: 'Invalid start value', 
          startValue: apt.start,
          startType: typeof apt.start,
          customerId: apt.customerId,
          serviceId: apt.serviceId,
          status: apt.status,
          createdAt: apt.createdAt,
          data: apt 
        });
      } else {
        valid.push({ 
          id: doc.id, 
          start: apt.start,
          customerId: apt.customerId,
          status: apt.status
        });
      }
    }
  });
  
  console.log('\n📊 APPOINTMENT AUDIT RESULTS:');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Valid appointments: ${valid.length}`);
  console.log(`❌ Invalid appointments: ${invalid.length}`);
  console.log('═══════════════════════════════════════════════\n');
  
  if (invalid.length > 0) {
    console.log('🚨 INVALID APPOINTMENTS DETAILS:');
    console.log('═══════════════════════════════════════════════\n');
    
    invalid.forEach((apt, index) => {
      console.log(`[${index + 1}] Appointment ID: ${apt.id}`);
      console.log(`    Issue: ${apt.issue}`);
      if (apt.startValue !== undefined) {
        console.log(`    Start Value: "${apt.startValue}" (type: ${apt.startType})`);
      }
      console.log(`    Customer ID: ${apt.customerId || 'N/A'}`);
      console.log(`    Service ID: ${apt.serviceId || 'N/A'}`);
      console.log(`    Status: ${apt.status || 'N/A'}`);
      console.log(`    Created At: ${apt.createdAt || 'N/A'}`);
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════\n');
  } else {
    console.log('🎉 Great news! All appointments have valid dates.\n');
  }
  
  // Group by customer to see which customers are affected
  if (invalid.length > 0) {
    const byCustomer = {};
    invalid.forEach(apt => {
      const custId = apt.customerId || 'unknown';
      if (!byCustomer[custId]) {
        byCustomer[custId] = [];
      }
      byCustomer[custId].push(apt.id);
    });
    
    console.log('👥 AFFECTED CUSTOMERS:');
    console.log('═══════════════════════════════════════════════');
    Object.entries(byCustomer).forEach(([custId, aptIds]) => {
      console.log(`Customer ${custId}: ${aptIds.length} invalid appointment(s)`);
      console.log(`  Appointment IDs: ${aptIds.join(', ')}`);
    });
    console.log('═══════════════════════════════════════════════\n');
  }
  
  return { valid, invalid };
}

inspectAppointments()
  .then(({ valid, invalid }) => {
    if (invalid.length > 0) {
      console.log('💾 Writing invalid appointments to file...');
      require('fs').writeFileSync(
        path.join(__dirname, 'invalid-appointments.json'), 
        JSON.stringify(invalid, null, 2)
      );
      console.log('✅ Results saved to: scripts/invalid-appointments.json\n');
      
      console.log('🔧 NEXT STEPS:');
      console.log('1. Review the invalid appointments above');
      console.log('2. Run the cleanup script to fix or delete them:');
      console.log('   node scripts/fix-appointments.js\n');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error during inspection:', err);
    process.exit(1);
  });

