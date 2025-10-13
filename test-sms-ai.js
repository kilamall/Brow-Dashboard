#!/usr/bin/env node

const { initializeApp } = require('firebase-admin/app');
const { getFunctions, httpsCallable } = require('firebase-admin/functions');

// Initialize Firebase Admin
try { 
  initializeApp(); 
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.log('⚠️  Firebase already initialized');
}

async function testSMSAI() {
  console.log('🧪 Testing SMS + AI Integration');
  console.log('================================\n');

  try {
    // Test different customer scenarios
    const testCases = [
      {
        phoneNumber: '+1234567890',
        message: 'Hi, what services do you offer?',
        description: 'Service inquiry'
      },
      {
        phoneNumber: '+1234567890', 
        message: 'Do you have availability this week?',
        description: 'Availability check'
      },
      {
        phoneNumber: '+1234567890',
        message: 'How much does brow shaping cost?',
        description: 'Pricing inquiry'
      },
      {
        phoneNumber: '+1234567890',
        message: 'What are your hours?',
        description: 'Business hours'
      },
      {
        phoneNumber: '+1234567890',
        message: 'I want to book an appointment',
        description: 'Booking request'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📱 Testing: ${testCase.description}`);
      console.log(`   Customer: ${testCase.phoneNumber}`);
      console.log(`   Message: "${testCase.message}"`);
      
      try {
        // Call the testSMSAI function
        const response = await fetch('https://us-central1-bueno-brows-7cce7.cloudfunctions.net/testSMSAI', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              phoneNumber: testCase.phoneNumber,
              message: testCase.message
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`   ✅ AI Response: "${result.result?.response || 'No response'}"`);
          console.log(`   📊 SMS Sent: ${result.result?.smsSent ? 'Yes' : 'No'}`);
        } else {
          console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 SMS + AI Integration Test Complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Set up Gemini API key: node setup-gemini-ai.js');
    console.log('2. Configure your phone number for SMS reception');
    console.log('3. Test with real SMS messages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSMSAI();

