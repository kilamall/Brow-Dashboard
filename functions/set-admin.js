/**
 * Quick script to set admin role for users
 * Run from functions directory: node set-admin.js
 */

import admin from 'firebase-admin';

// Initialize with Application Default Credentials
admin.initializeApp({
  projectId: 'bueno-brows-7cce7'
});

async function setAdminRole(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    console.log(`Found user: ${user.email} (UID: ${user.uid})`);
    
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ Set role: "admin" for ${email}`);
    
    const updated = await admin.auth().getUser(user.uid);
    console.log('Custom claims:', updated.customClaims);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Set both users as admin
async function run() {
  await setAdminRole('regina@buenobrows.com');
  await setAdminRole('malikgriffin1@gmail.com');
  
  console.log('\n✅ Done! Users need to sign out and back in for changes to take effect.');
  process.exit(0);
}

run();

