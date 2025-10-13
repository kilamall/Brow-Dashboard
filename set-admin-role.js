#!/usr/bin/env node

/**
 * Script to set admin role custom claims for Firebase users
 * Usage: node set-admin-role.js <email>
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bueno-brows-7cce7'
});

async function setAdminRole(email) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ Successfully set role: "admin" for ${email}`);

    // Verify the claim was set
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log('Custom claims:', updatedUser.customClaims);

    console.log('\n⚠️  Note: User needs to sign out and sign back in for changes to take effect.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node set-admin-role.js <email>');
  console.log('\nExample:');
  console.log('  node set-admin-role.js regina@buenobrows.com');
  process.exit(1);
}

setAdminRole(email);

