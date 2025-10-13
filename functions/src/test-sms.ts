// Test script for SMS integration
// Run this to test SMS functionality locally

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Test data for SMS integration
const testData = {
  // Test customer
  customer: {
    name: 'Test Customer',
    phone: '+15551234567',
    email: 'test@example.com',
    status: 'active'
  },
  
  // Test business hours
  businessHours: {
    monday: { open: null, close: null },
    tuesday: { open: '09:00', close: '18:00' },
    wednesday: { open: '09:00', close: '18:00' },
    thursday: { open: '09:00', close: '18:00' },
    friday: { open: '09:00', close: '18:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '10:00', close: '16:00' }
  },
  
  // Test services
  services: [
    {
      name: 'Basic Brow Shaping',
      price: 45,
      duration: 60,
      category: 'brows',
      description: 'Basic eyebrow shaping and cleanup',
      active: true
    },
    {
      name: 'Premium Brow Shaping',
      price: 55,
      duration: 75,
      category: 'brows',
      description: 'Premium eyebrow shaping with tinting',
      active: true
    },
    {
      name: 'Brow Tinting',
      price: 25,
      duration: 30,
      category: 'brows',
      description: 'Eyebrow tinting service',
      active: true
    }
  ],
  
  // Test appointments
  appointments: [
    {
      serviceId: 'service1',
      customerId: 'customer1',
      start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      duration: 60,
      status: 'confirmed',
      customerName: 'Existing Customer',
      customerEmail: 'existing@example.com'
    }
  ]
};

async function setupTestData() {
  console.log('Setting up test data for SMS integration...');
  
  try {
    // Create test customer
    const customerRef = await db.collection('customers').add(testData.customer);
    console.log('✅ Created test customer:', customerRef.id);
    
    // Set business hours
    await db.collection('settings').doc('businessHours').set(testData.businessHours);
    console.log('✅ Set business hours');
    
    // Create test services
    for (let i = 0; i < testData.services.length; i++) {
      const serviceRef = await db.collection('services').add(testData.services[i]);
      console.log(`✅ Created service ${i + 1}:`, serviceRef.id);
    }
    
    // Create test appointment
    const appointmentRef = await db.collection('appointments').add(testData.appointments[0]);
    console.log('✅ Created test appointment:', appointmentRef.id);
    
    console.log('\n🎉 Test data setup complete!');
    console.log('\nYou can now test SMS integration by:');
    console.log('1. Setting up Twilio webhook');
    console.log('2. Sending test messages to your Twilio number');
    console.log('3. Checking the admin interface for conversations');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  }
}

// Test SMS parsing logic
function testSMSParsing() {
  console.log('\n🧪 Testing SMS parsing logic...');
  
  const testMessages = [
    'AVAILABLE',
    'available',
    'What are your hours?',
    'hours',
    'How much does it cost?',
    'pricing',
    'BOOK 12/15 2:00 PM',
    'book tomorrow at 3pm',
    'help',
    'random message'
  ];
  
  // Import parsing function (simplified version)
  function parseSMSMessage(message: string): { type: string; data: any } {
    const text = message.toLowerCase().trim();
    
    if (text.includes('available') || text.includes('open') || text.includes('free')) {
      return { type: 'availability_request', data: null };
    }
    
    if (text.includes('hours')) {
      return { type: 'faq', data: { question: 'hours', answer: 'We\'re open Tuesday-Saturday 9AM-6PM, Sunday 10AM-4PM. Closed Mondays.' } };
    }
    
    if (text.includes('pricing') || text.includes('cost') || text.includes('price')) {
      return { type: 'faq', data: { question: 'pricing', answer: 'Brow services start at $45. Full pricing: Basic $45, Shaping $55, Tinting $25, Waxing $15.' } };
    }
    
    if (text.includes('book') || text.includes('schedule') || text.includes('appointment')) {
      const dateMatch = text.match(/(\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}|\d{1,2}\s+\d{1,2})/);
      const timeMatch = text.match(/(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))/i);
      
      if (dateMatch && timeMatch) {
        return {
          type: 'booking_request',
          data: { date: dateMatch[1], time: timeMatch[0] }
        };
      }
      return { type: 'booking_help', data: null };
    }
    
    if (text.includes('help') || text.includes('info') || text.includes('menu')) {
      return { type: 'help', data: null };
    }
    
    return { type: 'error', data: null };
  }
  
  testMessages.forEach(message => {
    const result = parseSMSMessage(message);
    console.log(`📱 "${message}" → ${result.type}`, result.data ? `(${JSON.stringify(result.data)})` : '');
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting SMS Integration Tests\n');
  
  testSMSParsing();
  await setupTestData();
  
  console.log('\n✅ All tests completed!');
}

// Export for use in other files
export { setupTestData, testSMSParsing, runTests };

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}
