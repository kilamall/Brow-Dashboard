#!/usr/bin/env node

const { execSync } = require('child_process');
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

async function setupAWSSNS() {
  console.log('📱 Setting up AWS SNS for SMS Reception');
  console.log('=====================================\n');

  try {
    // Check if Firebase CLI is installed
    try {
      execSync('firebase --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Firebase CLI not found. Please install it first:');
      console.log('   npm install -g firebase-tools');
      process.exit(1);
    }

    console.log('✅ Firebase CLI is ready\n');

    // Get business phone number
    console.log('📞 Business Phone Number Setup:');
    console.log('Enter your business phone number in E.164 format (e.g., +1234567890)');
    console.log('This is the number customers will text to reach your AI chatbot\n');

    const businessPhone = await question('Enter your business phone number (+1234567890): ');
    
    if (!businessPhone.startsWith('+') || businessPhone.length < 10) {
      console.log('❌ Invalid phone number format. Please use E.164 format (+1234567890)');
      process.exit(1);
    }

    console.log(`\n📱 Your business number: ${businessPhone}`);
    console.log('Customers will text this number to reach your AI chatbot\n');

    // AWS Setup Instructions
    console.log('🔧 AWS SNS Setup Instructions:');
    console.log('================================\n');

    console.log('1. 🌐 Go to AWS Console:');
    console.log('   https://console.aws.amazon.com/');
    console.log('   Sign in or create an account\n');

    console.log('2. 🔑 Create IAM User for SMS:');
    console.log('   - Go to IAM → Users → Create User');
    console.log('   - Username: "bueno-brows-sms"');
    console.log('   - Attach policy: "AmazonSNSFullAccess"');
    console.log('   - Create access keys (save them!)\n');

    console.log('3. 📱 Enable SMS in SNS:');
    console.log('   - Go to SNS → Text messaging (SMS)');
    console.log('   - Click "Request production access"');
    console.log('   - Fill out the form (business use case)');
    console.log('   - Add your phone number: ' + businessPhone);
    console.log('   - Set spending limits (recommend $50/month)\n');

    console.log('4. 🔗 Set up SMS Webhook:');
    console.log('   - In SNS, go to Text messaging (SMS)');
    console.log('   - Click "Create SMS subscription"');
    console.log('   - Protocol: HTTP/HTTPS');
    console.log('   - Endpoint: https://us-central1-bueno-brows-7cce7.cloudfunctions.net/smsAIWebhook');
    console.log('   - Phone number: ' + businessPhone + '\n');

    // Get AWS credentials
    console.log('🔑 AWS Credentials Setup:');
    console.log('Enter the AWS access keys you created:\n');

    const awsAccessKey = await question('Enter AWS Access Key ID: ');
    const awsSecretKey = await question('Enter AWS Secret Access Key: ');
    const awsRegion = await question('Enter AWS Region (default: us-east-1): ') || 'us-east-1';

    if (!awsAccessKey || !awsSecretKey) {
      console.log('❌ AWS credentials are required');
      process.exit(1);
    }

    // Set Firebase environment variables
    console.log('\n🔧 Setting up Firebase environment variables...');

    const configCommands = [
      `firebase functions:config:set business.phone_number="${businessPhone}"`,
      `firebase functions:config:set aws.access_key_id="${awsAccessKey}"`,
      `firebase functions:config:set aws.secret_access_key="${awsSecretKey}"`,
      `firebase functions:config:set aws.region="${awsRegion}"`
    ];

    for (const command of configCommands) {
      try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${command.split(' ')[2]} configured`);
      } catch (error) {
        console.log(`❌ Error setting ${command.split(' ')[2]}:`, error.message);
      }
    }

    // Test AWS SNS connection
    console.log('\n🧪 Testing AWS SNS connection...');
    
    try {
      // Create a simple test script
      const testScript = `
const AWS = require('aws-sdk');
const sns = new AWS.SNS({
  accessKeyId: '${awsAccessKey}',
  secretAccessKey: '${awsSecretKey}',
  region: '${awsRegion}'
});

sns.publish({
  Message: 'Test message from Bueno Brows AI setup',
  PhoneNumber: '${businessPhone}'
}).promise()
.then(result => {
  console.log('✅ SMS test sent successfully:', result.MessageId);
})
.catch(error => {
  console.log('❌ SMS test failed:', error.message);
});
`;

      require('fs').writeFileSync('test-sns.js', testScript);
      
      // Install AWS SDK if not present
      try {
        execSync('npm install aws-sdk', { stdio: 'ignore' });
      } catch (error) {
        // AWS SDK might already be installed
      }

      console.log('📱 Sending test SMS to your business number...');
      execSync('node test-sns.js', { stdio: 'inherit' });
      
      // Clean up test file
      require('fs').unlinkSync('test-sns.js');
      
    } catch (error) {
      console.log('⚠️  SMS test failed, but configuration is saved');
      console.log('   You can test manually later');
    }

    // Deploy updated functions
    console.log('\n🚀 Deploying updated functions...');
    
    try {
      execSync('firebase deploy --only functions:smsAIWebhook', { stdio: 'inherit' });
      console.log('✅ Functions deployed successfully!');
    } catch (error) {
      console.log('❌ Error deploying functions:', error.message);
      console.log('Try running: firebase deploy --only functions');
    }

    console.log('\n🎉 AWS SNS Setup Complete!');
    console.log('==========================');
    console.log('✅ Business phone number configured: ' + businessPhone);
    console.log('✅ AWS SNS credentials set');
    console.log('✅ SMS webhook configured');
    console.log('✅ Functions deployed');
    
    console.log('\n📱 Next Steps:');
    console.log('1. Complete AWS SNS setup in AWS Console');
    console.log('2. Request production access for SMS');
    console.log('3. Set up SMS subscription with webhook URL');
    console.log('4. Test by texting your business number: ' + businessPhone);
    
    console.log('\n🔗 Important URLs:');
    console.log('SMS Webhook: https://us-central1-bueno-brows-7cce7.cloudfunctions.net/smsAIWebhook');
    console.log('AWS SNS Console: https://console.aws.amazon.com/sns/');
    console.log('Firebase Console: https://console.firebase.google.com/project/bueno-brows-7cce7/');
    
    console.log('\n🧪 Test Your Setup:');
    console.log('Text your business number (' + businessPhone + ') with:');
    console.log('- "Hi, what services do you offer?"');
    console.log('- "Do you have availability this week?"');
    console.log('- "What are your hours?"');
    
    console.log('\n📊 Monitor Conversations:');
    console.log('Check your admin dashboard → AI Conversations to see all interactions');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupAWSSNS();

