#!/usr/bin/env node

/**
 * Setup script for SendGrid email service
 * 
 * This script helps you configure SendGrid for sending email confirmations
 * from hello@buenobrows.com
 */

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

function execCommand(cmd) {
  try {
    const output = execSync(cmd, { encoding: 'utf8' });
    return output.trim();
  } catch (error) {
    console.error(`Error executing: ${cmd}`);
    console.error(error.message);
    return null;
  }
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     📧 SendGrid Email Setup for Bueno Brows       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  console.log('This script will help you set up email confirmations from hello@buenobrows.com\n');

  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'ignore' });
  } catch {
    console.error('❌ Firebase CLI not found. Please install it first:');
    console.error('   npm install -g firebase-tools\n');
    process.exit(1);
  }

  console.log('📋 **Before you begin:**');
  console.log('   1. Sign up at https://signup.sendgrid.com/ (free tier available)');
  console.log('   2. Verify your domain (buenobrows.com) in SendGrid');
  console.log('   3. Create an API key in SendGrid Settings → API Keys\n');

  const proceed = await question('Have you completed the above steps? (yes/no): ');
  
  if (proceed.toLowerCase() !== 'yes' && proceed.toLowerCase() !== 'y') {
    console.log('\n📖 **Setup Instructions:**\n');
    console.log('1. Go to https://signup.sendgrid.com/');
    console.log('2. Create a free account');
    console.log('3. Go to Settings → Sender Authentication → Domain Authentication');
    console.log('4. Add "buenobrows.com" and follow DNS verification steps');
    console.log('5. Go to Settings → API Keys → Create API Key');
    console.log('6. Select "Full Access" and copy the API key');
    console.log('7. Run this script again\n');
    rl.close();
    return;
  }

  const apiKey = await question('\n🔑 Enter your SendGrid API Key: ');

  if (!apiKey || !apiKey.startsWith('SG.')) {
    console.error('\n❌ Invalid API key. SendGrid keys start with "SG."\n');
    rl.close();
    return;
  }

  console.log('\n⚙️  Configuring Firebase Functions...\n');

  // Set the SendGrid API key in Firebase config
  const setConfigCmd = `firebase functions:config:set sendgrid.api_key="${apiKey}"`;
  const result = execCommand(setConfigCmd);

  if (result) {
    console.log('✅ SendGrid API key configured successfully!\n');
    
    console.log('📝 **What happens now:**');
    console.log('   • Emails will be sent from: hello@buenobrows.com');
    console.log('   • Customers will receive confirmation emails when booking');
    console.log('   • Emails are logged in the email_logs Firestore collection\n');

    console.log('🚀 **Next steps:**');
    console.log('   1. Deploy your functions:');
    console.log('      cd functions && npm run deploy');
    console.log('   2. Test the email system by creating a test appointment');
    console.log('   3. Check email_logs collection in Firestore for delivery status\n');

    console.log('💡 **Tips:**');
    console.log('   • SendGrid free tier: 100 emails/day');
    console.log('   • Check spam folder for test emails');
    console.log('   • Monitor sending in SendGrid dashboard\n');

    const deploy = await question('Would you like to deploy the functions now? (yes/no): ');
    
    if (deploy.toLowerCase() === 'yes' || deploy.toLowerCase() === 'y') {
      console.log('\n🚀 Deploying functions...\n');
      execSync('cd functions && npm run build && firebase deploy --only functions', { stdio: 'inherit' });
      console.log('\n✅ Deployment complete!\n');
    }
  } else {
    console.error('\n❌ Failed to configure SendGrid. Please try manually:');
    console.error(`   firebase functions:config:set sendgrid.api_key="YOUR_API_KEY"\n`);
  }

  rl.close();
}

main().catch((error) => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});


