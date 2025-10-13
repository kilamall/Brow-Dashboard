#!/usr/bin/env node

// Complete Firebase setup script for Bueno Brows
// This will set up hosting, functions, and domain configuration

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Complete Firebase Setup for Bueno Brows\n');
console.log('This will set up:');
console.log('• Firebase Hosting for buenobrow.com');
console.log('• Cloud Functions in TypeScript');
console.log('• Firestore Database');
console.log('• Domain configuration\n');

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

async function setupFirebase() {
  try {
    console.log('📋 Prerequisites:');
    console.log('1. You should be logged into Firebase CLI');
    console.log('2. You should have a Firebase project created');
    console.log('3. You should have your Twilio credentials ready\n');

    const proceed = await askQuestion('Ready to proceed? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }

    console.log('\n🔧 Step 1: Initialize Firebase Services...\n');

    // Initialize Firestore
    console.log('📊 Setting up Firestore...');
    try {
      execSync('firebase init firestore --project default', { stdio: 'inherit' });
      console.log('✅ Firestore initialized');
    } catch (error) {
      console.log('⚠️  Firestore setup may need manual configuration');
    }

    // Initialize Functions
    console.log('\n⚡ Setting up Cloud Functions...');
    try {
      execSync('firebase init functions --project default', { stdio: 'inherit' });
      console.log('✅ Functions initialized');
    } catch (error) {
      console.log('⚠️  Functions setup may need manual configuration');
    }

    // Initialize Hosting
    console.log('\n🌐 Setting up Hosting...');
    try {
      execSync('firebase init hosting --project default', { stdio: 'inherit' });
      console.log('✅ Hosting initialized');
    } catch (error) {
      console.log('⚠️  Hosting setup may need manual configuration');
    }

    console.log('\n🔧 Step 2: Configure Domain Settings...\n');

    // Get domain configuration
    const domain = await askQuestion('Enter your domain (buenobrow.com): ') || 'buenobrow.com';
    const adminSubdomain = await askQuestion('Admin subdomain (admin.buenobrow.com): ') || 'admin.buenobrow.com';
    const bookingSubdomain = await askQuestion('Booking subdomain (book.buenobrow.com): ') || 'book.buenobrow.com';

    console.log('\n🔧 Step 3: Set up Twilio Configuration...\n');

    const setupTwilio = await askQuestion('Do you want to set up Twilio SMS now? (y/n): ');
    if (setupTwilio.toLowerCase() === 'y') {
      const accountSid = await askQuestion('Enter your Twilio Account SID: ');
      const authToken = await askQuestion('Enter your Twilio Auth Token: ');
      const phoneNumber = await askQuestion('Enter your Twilio Phone Number (+15551234567): ');

      if (accountSid && authToken && phoneNumber) {
        console.log('\n🔧 Setting Twilio configuration...');
        execSync(`firebase functions:config:set twilio.account_sid="${accountSid}"`, { stdio: 'inherit' });
        execSync(`firebase functions:config:set twilio.auth_token="${authToken}"`, { stdio: 'inherit' });
        execSync(`firebase functions:config:set twilio.phone_number="${phoneNumber}"`, { stdio: 'inherit' });
        console.log('✅ Twilio configuration set');
      }
    }

    console.log('\n🔧 Step 4: Create Configuration Files...\n');

    // Create firebase.json with proper configuration
    const firebaseConfig = {
      "firestore": {
        "rules": "firebase.rules",
        "indexes": "firestore.indexes.json"
      },
      "functions": {
        "source": "functions",
        "runtime": "nodejs18"
      },
      "hosting": {
        "public": "dist",
        "ignore": [
          "firebase.json",
          "**/.*",
          "**/node_modules/**"
        ],
        "rewrites": [
          {
            "source": "/admin/**",
            "destination": "/admin/index.html"
          },
          {
            "source": "/book/**",
            "destination": "/book/index.html"
          },
          {
            "source": "**",
            "destination": "/index.html"
          }
        ],
        "headers": [
          {
            "source": "**/*.@(js|css)",
            "headers": [
              {
                "key": "Cache-Control",
                "value": "max-age=31536000"
              }
            ]
          }
        ]
      }
    };

    fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
    console.log('✅ firebase.json created');

    // Create hosting configuration
    const hostingConfig = {
      "target": "bueno-brows",
      "public": "dist",
      "ignore": [
        "firebase.json",
        "**/.*",
        "**/node_modules/**"
      ],
      "rewrites": [
        {
          "source": "/admin/**",
          "destination": "/admin/index.html"
        },
        {
          "source": "/book/**", 
          "destination": "/book/index.html"
        },
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    };

    console.log('\n📋 Next Steps:');
    console.log('1. Deploy your functions:');
    console.log('   firebase deploy --only functions');
    console.log('\n2. Build and deploy your apps:');
    console.log('   pnpm build');
    console.log('   firebase deploy --only hosting');
    console.log('\n3. Configure your domain in Firebase Console:');
    console.log('   - Go to Hosting in Firebase Console');
    console.log('   - Add custom domain: ' + domain);
    console.log('   - Add subdomains: ' + adminSubdomain + ', ' + bookingSubdomain);
    console.log('   - Update DNS records in GoDaddy');
    console.log('\n4. Set up Twilio webhook:');
    console.log('   - Go to Twilio Console > Phone Numbers');
    console.log('   - Set webhook URL to:');
    console.log('   https://us-central1-[your-project-id].cloudfunctions.net/handleIncomingSMS');

    console.log('\n🎉 Firebase setup complete!');
    console.log('\nYour apps will be available at:');
    console.log('• Main site: https://' + domain);
    console.log('• Admin: https://' + adminSubdomain);
    console.log('• Booking: https://' + bookingSubdomain);

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

setupFirebase();
