#!/usr/bin/env node

/**
 * Simple script to set admin role using Firebase CLI Auth Import
 * This method doesn't require service account keys!
 */

const { execSync } = require('child_process');
const fs = require('fs');

const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node set-admin-simple.js <email>');
  console.log('\nExample:');
  console.log('  node set-admin-simple.js regina@buenobrows.com');
  process.exit(1);
}

console.log(`🔍 Looking for user: ${email}`);

// Export current users
try {
  execSync('firebase auth:export users-temp.json --format=json', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to export users');
  process.exit(1);
}

// Read and modify users
const usersData = JSON.parse(fs.readFileSync('users-temp.json', 'utf8'));
const user = usersData.users.find(u => u.email === email);

if (!user) {
  console.error(`❌ User not found: ${email}`);
  fs.unlinkSync('users-temp.json');
  process.exit(1);
}

console.log(`✅ Found user: ${user.email} (UID: ${user.localId})`);

// Set custom claims
user.customAttributes = JSON.stringify({ role: 'admin' });

// Write modified users back
fs.writeFileSync('users-temp.json', JSON.stringify(usersData, null, 2));

console.log('📝 Updating user with admin role...');

// Import back with --replace flag
try {
  execSync('firebase auth:import users-temp.json --hash-algo=SCRYPT --hash-key="" --replace', { stdio: 'inherit' });
  console.log(`\n✅ Successfully set role: "admin" for ${email}`);
  console.log('\n⚠️  Note: User needs to sign out and sign back in for changes to take effect.');
} catch (error) {
  console.error('❌ Failed to import users');
} finally {
  // Cleanup
  fs.unlinkSync('users-temp.json');
}

