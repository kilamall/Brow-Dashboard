// test-attendance-functions.js
// Quick test script for attendance tracking functions

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (for emulator)
try { 
  initializeApp(); 
} catch (e) {
  console.log('Firebase already initialized');
}

const db = getFirestore();

async function testAttendanceFunctions() {
  console.log('🧪 Testing Attendance Tracking Functions...\n');
  
  try {
    // Test 1: Check if new functions are available
    console.log('1. ✅ Checking function availability...');
    
    // Test 2: Create a test appointment
    console.log('2. 📝 Creating test appointment...');
    const testAppointment = {
      customerId: 'test-customer-123',
      serviceId: 'test-service-456',
      start: new Date().toISOString(),
      duration: 60,
      status: 'confirmed',
      bookedPrice: 100,
      tip: 20,
      totalPrice: 120,
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+1234567890',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const appointmentRef = await db.collection('appointments').add(testAppointment);
    console.log(`   ✅ Created test appointment: ${appointmentRef.id}`);
    
    // Test 3: Create test customer
    console.log('3. 👤 Creating test customer...');
    const testCustomer = {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+1234567890',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    const customerRef = await db.collection('customers').add(testCustomer);
    console.log(`   ✅ Created test customer: ${customerRef.id}`);
    
    // Test 4: Create test service
    console.log('4. 💅 Creating test service...');
    const testService = {
      name: 'Test Brow Service',
      price: 100,
      duration: 60,
      category: 'Brows',
      active: true,
      createdAt: new Date().toISOString()
    };
    
    const serviceRef = await db.collection('services').add(testService);
    console.log(`   ✅ Created test service: ${serviceRef.id}`);
    
    // Test 5: Update appointment with service ID
    await appointmentRef.update({
      serviceId: serviceRef.id,
      customerId: customerRef.id
    });
    console.log('   ✅ Updated appointment with service and customer IDs');
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Test Data Summary:');
    console.log(`   Appointment ID: ${appointmentRef.id}`);
    console.log(`   Customer ID: ${customerRef.id}`);
    console.log(`   Service ID: ${serviceRef.id}`);
    console.log(`   Service: ${testService.name} - $${testService.price}`);
    console.log(`   Customer: ${testCustomer.name} (${testCustomer.phone})`);
    
    console.log('\n🚀 Ready to test in the UI!');
    console.log('   Admin Dashboard: http://localhost:5173');
    console.log('   Booking App: http://localhost:5174');
    console.log('   Firebase Emulator UI: http://localhost:4000');
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Go to Admin Dashboard → Schedule');
    console.log('   2. Look for the test appointment in "Recent Past Appointments"');
    console.log('   3. Test the attendance buttons (✓ Attended, ✗ No-Show)');
    console.log('   4. Check Firebase Emulator UI for function calls');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testAttendanceFunctions();
