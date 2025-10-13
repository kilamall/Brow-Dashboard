#!/usr/bin/env node

// Setup script for AWS SNS SMS integration
// This will help you configure AWS SNS instead of Twilio

const { execSync } = require('child_process');

console.log('🚀 Setting up AWS SNS SMS Integration for Bueno Brows\n');
console.log('This will replace Twilio with AWS SNS to save money!\n');

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

async function setupAWSSMS() {
  try {
    console.log('📋 Prerequisites:');
    console.log('1. AWS Account (free tier available)');
    console.log('2. AWS IAM user with SNS permissions');
    console.log('3. Your existing phone number\n');

    const proceed = await askQuestion('Ready to proceed? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }

    console.log('\n🔧 Step 1: AWS Credentials Setup\n');
    console.log('Go to AWS Console → IAM → Users → Create User');
    console.log('1. Create user with "Programmatic access"');
    console.log('2. Attach policy: "AmazonSNSFullAccess"');
    console.log('3. Copy the Access Key ID and Secret Access Key\n');

    const accessKeyId = await askQuestion('Enter your AWS Access Key ID: ');
    const secretAccessKey = await askQuestion('Enter your AWS Secret Access Key: ');
    const region = await askQuestion('Enter AWS Region (us-east-1): ') || 'us-east-1';
    const businessPhone = await askQuestion('Enter your business phone number (+15551234567): ');

    if (!accessKeyId || !secretAccessKey || !businessPhone) {
      console.log('❌ All fields are required. Please try again.');
      rl.close();
      return;
    }

    console.log('\n🔧 Setting Firebase Functions configuration...');

    // Set Firebase Functions config
    execSync(`firebase functions:config:set aws.access_key_id="${accessKeyId}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set aws.secret_access_key="${secretAccessKey}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set aws.region="${region}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set business.phone_number="${businessPhone}"`, { stdio: 'inherit' });

    console.log('\n✅ AWS SNS configuration set successfully!');

    console.log('\n📋 Next steps:');
    console.log('1. Deploy your functions:');
    console.log('   firebase deploy --only functions');
    console.log('\n2. Test SMS sending:');
    console.log('   - Use the testSMS function in your admin interface');
    console.log('   - Or call the function directly');
    console.log('\n3. Set up your business phone number:');
    console.log('   - Customers will text your number: ' + businessPhone);
    console.log('   - You can respond manually or use the admin interface');
    console.log('\n4. Cost savings:');
    console.log('   - No monthly phone number fee');
    console.log('   - Only $0.0075 per SMS message');
    console.log('   - Same reliability as Twilio');

    console.log('\n🎉 AWS SNS setup complete! Your SMS integration is ready.');
    console.log('\n💡 Note: AWS SNS doesn\'t support incoming SMS webhooks,');
    console.log('   so customers will need to call or use your website for responses.');

  } catch (error) {
    console.error('❌ Error setting up AWS SNS:', error.message);
  } finally {
    rl.close();
  }
}

setupAWSSMS();
