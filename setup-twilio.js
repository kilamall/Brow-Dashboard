#!/usr/bin/env node

// Setup script for Twilio SMS integration
// Run this after getting your Twilio credentials

const { execSync } = require('child_process');

console.log('🚀 Setting up Twilio SMS Integration for Bueno Brows\n');

// Get credentials from user
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function setupTwilio() {
  try {
    console.log('📱 Please get these from your Twilio Console:');
    console.log('   1. Account SID (starts with AC...)');
    console.log('   2. Auth Token (long string)');
    console.log('   3. Phone Number (format: +15551234567)\n');

    const accountSid = await askQuestion('Enter your Twilio Account SID: ');
    const authToken = await askQuestion('Enter your Twilio Auth Token: ');
    const phoneNumber = await askQuestion('Enter your Twilio Phone Number (+15551234567): ');

    if (!accountSid || !authToken || !phoneNumber) {
      console.log('❌ All fields are required. Please try again.');
      rl.close();
      return;
    }

    console.log('\n🔧 Setting Firebase Functions configuration...');

    // Set Firebase Functions config
    execSync(`firebase functions:config:set twilio.account_sid="${accountSid}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set twilio.auth_token="${authToken}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set twilio.phone_number="${phoneNumber}"`, { stdio: 'inherit' });

    console.log('\n✅ Twilio configuration set successfully!');

    console.log('\n📋 Next steps:');
    console.log('1. Deploy your functions:');
    console.log('   firebase deploy --only functions');
    console.log('\n2. Set up webhook in Twilio Console:');
    console.log('   - Go to Phone Numbers > Manage > Active numbers');
    console.log('   - Click on your phone number');
    console.log('   - Set webhook URL to:');
    console.log(`   https://us-central1-bueno-brows.cloudfunctions.net/handleIncomingSMS`);
    console.log('   - Set HTTP method to POST');
    console.log('\n3. Verify a test phone number in Twilio Console');
    console.log('4. Test by texting "AVAILABLE" to your Twilio number');

    console.log('\n🎉 Setup complete! Your SMS integration is ready for testing.');

  } catch (error) {
    console.error('❌ Error setting up Twilio:', error.message);
  } finally {
    rl.close();
  }
}

setupTwilio();
