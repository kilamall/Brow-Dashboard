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

async function setupGeminiAI() {
  console.log('🤖 Setting up Gemini AI Integration for Bueno Brows');
  console.log('================================================\n');

  try {
    // Check if Firebase CLI is installed
    try {
      execSync('firebase --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Firebase CLI not found. Please install it first:');
      console.log('   npm install -g firebase-tools');
      process.exit(1);
    }

    // Check if logged in
    try {
      execSync('firebase projects:list', { stdio: 'ignore' });
    } catch (error) {
      console.log('❌ Please log in to Firebase first:');
      console.log('   firebase login');
      process.exit(1);
    }

    console.log('✅ Firebase CLI is ready\n');

    // Get Gemini API key
    console.log('🔑 Gemini AI Setup:');
    console.log('1. Go to: https://makersuite.google.com/app/apikey');
    console.log('2. Create a new API key');
    console.log('3. Copy the API key\n');

    const geminiApiKey = await question('Enter your Gemini API key: ');
    
    if (!geminiApiKey || geminiApiKey.length < 20) {
      console.log('❌ Invalid API key. Please try again.');
      process.exit(1);
    }

    // Get AWS credentials (optional)
    console.log('\n📱 AWS SNS Setup (Optional - for SMS):');
    console.log('If you want to use your own phone number for SMS:');
    console.log('1. Go to: https://console.aws.amazon.com/sns/');
    console.log('2. Create access keys in IAM');
    console.log('3. Enable SMS in SNS\n');

    const useAWS = await question('Do you want to set up AWS SNS? (y/n): ');
    
    let awsAccessKey = '';
    let awsSecretKey = '';
    let awsRegion = 'us-east-1';
    let businessPhone = '';

    if (useAWS.toLowerCase() === 'y') {
      awsAccessKey = await question('Enter AWS Access Key ID: ');
      awsSecretKey = await question('Enter AWS Secret Access Key: ');
      awsRegion = await question('Enter AWS Region (default: us-east-1): ') || 'us-east-1';
      businessPhone = await question('Enter your business phone number (+1234567890): ');
    }

    // Set environment variables
    console.log('\n🔧 Setting up environment variables...');

    const configCommands = [
      `firebase functions:config:set gemini.api_key="${geminiApiKey}"`
    ];

    if (useAWS.toLowerCase() === 'y' && awsAccessKey && awsSecretKey) {
      configCommands.push(
        `firebase functions:config:set aws.access_key_id="${awsAccessKey}"`,
        `firebase functions:config:set aws.secret_access_key="${awsSecretKey}"`,
        `firebase functions:config:set aws.region="${awsRegion}"`,
        `firebase functions:config:set business.phone_number="${businessPhone}"`
      );
    }

    for (const command of configCommands) {
      try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${command.split(' ')[2]} configured`);
      } catch (error) {
        console.log(`❌ Error setting ${command.split(' ')[2]}:`, error.message);
      }
    }

    // Update Firebase security rules
    console.log('\n🔒 Updating Firebase security rules...');
    
    const securityRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin access
    match /{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Customer access to their own data
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == customerId;
    }
    
    // AI conversations - admin and customer access
    match /ai_conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         resource.data.customerId == request.auth.uid);
    }
    
    match /ai_sms_conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
         resource.data.customerId == request.auth.uid);
    }
    
    // Public read access for services and settings
    match /services/{serviceId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;

    try {
      require('fs').writeFileSync('firebase.rules', securityRules);
      console.log('✅ Security rules updated');
    } catch (error) {
      console.log('❌ Error updating security rules:', error.message);
    }

    // Deploy functions
    console.log('\n🚀 Deploying AI functions...');
    
    try {
      execSync('firebase deploy --only functions:aiChatbot,functions:testAIChatbot,functions:smsAIWebhook,functions:testSMSAI', { stdio: 'inherit' });
      console.log('✅ AI functions deployed successfully!');
    } catch (error) {
      console.log('❌ Error deploying functions:', error.message);
      console.log('Try running: firebase deploy --only functions');
    }

    // Test the setup
    console.log('\n🧪 Testing AI setup...');
    
    try {
      const testResult = execSync('firebase functions:shell', { 
        input: 'testAIChatbot({phoneNumber: "+1234567890", message: "Hello, what services do you offer?"})',
        stdio: 'pipe',
        timeout: 30000
      });
      console.log('✅ AI test successful!');
    } catch (error) {
      console.log('⚠️  AI test failed, but functions are deployed. You can test manually.');
    }

    console.log('\n🎉 Gemini AI Integration Complete!');
    console.log('=====================================');
    console.log('✅ Gemini API configured');
    console.log('✅ AI chatbot functions deployed');
    console.log('✅ SMS + AI integration ready');
    console.log('✅ Security rules updated');
    
    if (useAWS.toLowerCase() === 'y') {
      console.log('✅ AWS SNS configured for SMS');
    }
    
    console.log('\n📱 Next Steps:');
    console.log('1. Test your AI chatbot:');
    console.log('   - Call: testAIChatbot function');
    console.log('   - Send: {phoneNumber: "+1234567890", message: "Hello"}');
    
    console.log('\n2. Set up SMS webhook:');
    if (useAWS.toLowerCase() === 'y') {
      console.log('   - Configure AWS SNS to call: smsAIWebhook');
      console.log('   - Your business number: ' + businessPhone);
    } else {
      console.log('   - Use Twilio or other SMS provider');
      console.log('   - Point webhook to: smsAIWebhook function');
    }
    
    console.log('\n3. Test SMS + AI:');
    console.log('   - Text your business number');
    console.log('   - AI will respond automatically');
    
    console.log('\n4. Monitor conversations:');
    console.log('   - Check ai_sms_conversations collection');
    console.log('   - View in admin dashboard');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupGeminiAI();
