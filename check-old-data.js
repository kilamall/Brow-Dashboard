// Script to check both Firestore collections for old homepage data
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'bueno-brows-7cce7'
  });
}

const db = admin.firestore();

async function checkOldData() {
  try {
    console.log('🔍 Checking for old homepage data...\n');
    
    // Check homePageContent/main collection
    console.log('1. Checking homePageContent/main collection:');
    try {
      const homePageDoc = await db.collection('homePageContent').doc('main').get();
      if (homePageDoc.exists) {
        const data = homePageDoc.data();
        console.log('✅ Found homePageContent/main document:');
        console.log('   Fields:', Object.keys(data));
        if (data.heroImageUrl) {
          console.log('   heroImageUrl:', data.heroImageUrl);
        }
        if (data.galleryPhotos) {
          console.log('   galleryPhotos:', data.galleryPhotos);
        }
        console.log('   Full data:', JSON.stringify(data, null, 2));
      } else {
        console.log('❌ homePageContent/main document does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking homePageContent/main:', error.message);
    }
    
    console.log('\n2. Checking settings/homePageContent collection:');
    try {
      const settingsDoc = await db.collection('settings').doc('homePageContent').get();
      if (settingsDoc.exists) {
        const data = settingsDoc.data();
        console.log('✅ Found settings/homePageContent document:');
        console.log('   Fields:', Object.keys(data));
        if (data.heroImageUrl) {
          console.log('   heroImageUrl:', data.heroImageUrl);
        }
        if (data.galleryPhotos) {
          console.log('   galleryPhotos:', data.galleryPhotos);
        }
        console.log('   Full data:', JSON.stringify(data, null, 2));
      } else {
        console.log('❌ settings/homePageContent document does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking settings/homePageContent:', error.message);
    }
    
    console.log('\n3. Checking other possible collections:');
    
    // Check businessInfo collection
    try {
      const businessInfoDoc = await db.collection('businessInfo').doc('main').get();
      if (businessInfoDoc.exists) {
        const data = businessInfoDoc.data();
        console.log('✅ Found businessInfo/main document:');
        console.log('   Fields:', Object.keys(data));
        if (data.heroImageUrl || data.heroImage || data.mainImage) {
          console.log('   Image fields found:', Object.keys(data).filter(key => key.includes('Image')));
        }
      } else {
        console.log('❌ businessInfo/main document does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking businessInfo/main:', error.message);
    }
    
    // Check admin collection
    try {
      const adminDoc = await db.collection('admin').doc('main').get();
      if (adminDoc.exists) {
        const data = adminDoc.data();
        console.log('✅ Found admin/main document:');
        console.log('   Fields:', Object.keys(data));
        if (data.heroImageUrl || data.heroImage || data.mainImage) {
          console.log('   Image fields found:', Object.keys(data).filter(key => key.includes('Image')));
        }
      } else {
        console.log('❌ admin/main document does not exist');
      }
    } catch (error) {
      console.log('❌ Error checking admin/main:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOldData();
