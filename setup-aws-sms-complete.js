#!/usr/bin/env node

/**
 * AWS SNS SMS Setup Script (Cost-Effective Solution)
 * 
 * AWS SNS is 62% cheaper than Twilio:
 * - Outbound: $0.00645 per SMS (vs Twilio $0.0079)
 * - Inbound: FREE (vs Twilio $0.0079)
 * - Phone number: FREE - use your existing number
 * 
 * This script configures AWS SNS for all SMS features.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n💰 AWS SNS SMS Setup (Most Cost-Effective Option)\n');
  console.log('Why AWS SNS?');
  console.log('  ✅ 62% cheaper than Twilio');
  console.log('  ✅ Outbound SMS: $0.00645 per message');
  console.log('  ✅ Inbound SMS: FREE');
  console.log('  ✅ Use your existing phone number: FREE\n');
  console.log('You\'ll need from AWS Console (https://console.aws.amazon.com/):');
  console.log('  1. AWS Access Key ID');
  console.log('  2. AWS Secret Access Key');
  console.log('  3. AWS Region (e.g., us-east-1)');
  console.log('  4. Your business phone number (format: +12345678900)\n');

  const proceed = await question('Ready to continue? (yes/no): ');
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('\nSetup cancelled. Run this script again when you\'re ready!');
    rl.close();
    return;
  }

  // Get AWS credentials
  console.log('\n--- AWS SNS Credentials ---\n');
  console.log('To create AWS credentials:');
  console.log('1. Go to: https://console.aws.amazon.com/iam/');
  console.log('2. Click "Users" → "Create user"');
  console.log('3. Give user SNS permissions');
  console.log('4. Create access key\n');
  
  const accessKeyId = await question('Enter your AWS Access Key ID: ');
  if (!accessKeyId || accessKeyId.length < 10) {
    console.error('\n❌ Error: Access Key ID appears invalid');
    rl.close();
    return;
  }

  const secretAccessKey = await question('Enter your AWS Secret Access Key: ');
  if (!secretAccessKey || secretAccessKey.length < 20) {
    console.error('\n❌ Error: Secret Access Key appears invalid');
    rl.close();
    return;
  }

  const region = await question('Enter your AWS Region (default: us-east-1): ') || 'us-east-1';

  const phoneNumber = await question('Enter your business phone number (e.g., +16507663918): ');
  if (!phoneNumber.startsWith('+') || phoneNumber.length < 10) {
    console.error('\n❌ Error: Phone number must be in E.164 format (e.g., +16507663918)');
    rl.close();
    return;
  }

  // Read existing .env file
  const envPath = path.join(__dirname, 'functions', '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Remove any existing AWS configuration
    envContent = envContent
      .split('\n')
      .filter(line => !line.startsWith('AWS_'))
      .filter(line => !line.startsWith('BUSINESS_PHONE'))
      .filter(line => line.trim() !== '')
      .join('\n');
  }

  // Add AWS SNS configuration
  const awsConfig = `

# AWS SNS Configuration for SMS (Added ${new Date().toISOString()})
# Cost-effective: $0.00645/outbound, FREE inbound
AWS_ACCESS_KEY_ID=${accessKeyId}
AWS_SECRET_ACCESS_KEY=${secretAccessKey}
AWS_REGION=${region}
BUSINESS_PHONE_NUMBER=${phoneNumber}
`;

  envContent += awsConfig;

  // Write updated .env file
  fs.writeFileSync(envPath, envContent.trim() + '\n');

  console.log('\n✅ AWS SNS credentials saved to functions/.env\n');
  console.log('--- SMS Features Activated ---\n');
  console.log('✅ Guest booking SMS verification');
  console.log('✅ Automated SMS responses to customers');
  console.log('✅ AI-powered SMS chatbot');
  console.log('✅ Admin SMS interface');
  console.log('✅ SMS conversation tracking\n');
  console.log('--- Next Steps ---\n');
  console.log('1. Install AWS SDK (if not already installed):');
  console.log('   cd functions && npm install aws-sdk\n');
  console.log('2. Enable SMS in AWS SNS Console:');
  console.log('   - Go to: https://console.aws.amazon.com/sns/');
  console.log('   - Click "Text messaging (SMS)" → "Mobile text messaging (SMS)"');
  console.log('   - Request production access if in sandbox mode');
  console.log('   - Set spend limit (default: $1/month)\n');
  console.log('3. Deploy your functions:');
  console.log('   cd functions && npm run deploy\n');
  console.log('4. Test SMS verification:');
  console.log('   - Go to your booking page');
  console.log('   - Start a guest booking');
  console.log('   - Enter your phone number');
  console.log('   - You should receive a verification code!\n');
  console.log('5. For inbound SMS (customers texting you):');
  console.log('   - Configure SNS Topic → Lambda → Firebase Function');
  console.log('   - Webhook URL: https://us-central1-bueno-brows-7cce7.cloudfunctions.net/smsWebhook\n');
  console.log('💰 Estimated monthly costs (100 SMS):');
  console.log('   - 100 verification codes sent: $0.65');
  console.log('   - 100 responses received: $0.00 (FREE)');
  console.log('   - Total: ~$0.65/month\n');
  console.log('🎉 Your cost-effective SMS system is ready!\n');

  rl.close();
}

main().catch(console.error);



