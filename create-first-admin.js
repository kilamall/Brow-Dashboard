#!/usr/bin/env node

/**
 * One-time script to create the first admin user
 * Uses the existing setAdminRole function before we disable it
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
try {
  admin.initializeApp();
  console.log('✅ Firebase Admin initialized');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

async function createAdmin(email) {
  console.log(`\n🔧 Setting admin role for: ${email}`);
  
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    console.log(`✅ Found user with UID: ${user.uid}`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ Successfully set admin role for ${email}`);
    
    // Verify it worked
    const updatedUser = await admin.auth().getUser(user.uid);
    console.log(`\n📋 Custom claims:`, updatedUser.customClaims);
    
    if (updatedUser.customClaims && updatedUser.customClaims.role === 'admin') {
      console.log(`\n🎉 SUCCESS! ${email} is now an admin!`);
      console.log(`\nNext steps:`);
      console.log(`1. Log in to your admin panel as ${email}`);
      console.log(`2. Verify you can access admin features`);
      console.log(`3. Then we'll continue with the remaining security fixes`);
    } else {
      console.log(`\n⚠️  Warning: Claims may not have been set correctly`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error:`, error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log(`\nTroubleshooting:`);
      console.log(`- The email ${email} doesn't exist in Firebase Auth`);
      console.log(`- Make sure the user has logged in at least once`);
      console.log(`- Check spelling of email address`);
    }
    
    process.exit(1);
  }
}

// Main execution
const adminEmail = 'regina@buenobrows.com';

console.log(`\n${'='.repeat(60)}`);
console.log(`🔒 Creating First Admin User`);
console.log(`${'='.repeat(60)}`);

createAdmin(adminEmail)
  .then(() => {
    console.log(`\n${'='.repeat(60)}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

