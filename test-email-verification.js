const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./functions/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bueno-brows-7cce7'
});

async function testEmailVerification() {
  try {
    console.log('🔍 Testing email verification...');
    
    // Get unverified users
    const listUsersResult = await admin.auth().listUsers();
    const unverifiedUsers = listUsersResult.users.filter(user => 
      user.email && !user.emailVerified
    );
    
    console.log(`📧 Found ${unverifiedUsers.length} unverified users:`);
    unverifiedUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.displayName || 'No name'})`);
    });
    
    if (unverifiedUsers.length === 0) {
      console.log('✅ All users are verified!');
      return;
    }
    
    // Test sending verification to first unverified user
    const testUser = unverifiedUsers[0];
    console.log(`\n📤 Sending verification email to: ${testUser.email}`);
    
    // Generate verification link
    const actionCodeSettings = {
      url: 'https://bueno-brows-7cce7.web.app/verify',
      handleCodeInApp: false
    };
    
    const link = await admin.auth().generateEmailVerificationLink(
      testUser.email,
      actionCodeSettings
    );
    
    console.log('✅ Verification link generated successfully!');
    console.log('🔗 Link:', link);
    console.log('\n📧 This link should be sent via email automatically by Firebase');
    console.log('💡 If you\'re not receiving emails, check:');
    console.log('   1. Firebase Console → Authentication → Templates');
    console.log('   2. Spam folder');
    console.log('   3. Email provider blocking Firebase emails');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmailVerification();
