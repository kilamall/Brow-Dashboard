// Quick script to check current Firestore data
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'bueno-brows-7cce7'
  });
}

const db = admin.firestore();

async function checkCurrentData() {
  try {
    console.log('🔍 Checking current Firestore data...\n');
    
    // Check settings/homePageContent
    console.log('1. Checking settings/homePageContent:');
    const settingsDoc = await db.collection('settings').doc('homePageContent').get();
    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      console.log('✅ Found settings/homePageContent document');
      console.log('   Fields:', Object.keys(data));
      if (data.galleryPhotos) {
        console.log('   galleryPhotos:', data.galleryPhotos);
        console.log('   galleryPhotos type:', typeof data.galleryPhotos);
        console.log('   galleryPhotos length:', data.galleryPhotos.length);
      } else {
        console.log('   ❌ No galleryPhotos field found');
      }
    } else {
      console.log('❌ settings/homePageContent document does not exist');
    }
    
    // Check reviews collection
    console.log('\n2. Checking reviews collection:');
    const reviewsSnapshot = await db.collection('reviews').get();
    console.log(`   Total reviews: ${reviewsSnapshot.size}`);
    
    if (reviewsSnapshot.size > 0) {
      const reviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('   Reviews:', reviews.map(r => ({
        id: r.id,
        isApproved: r.isApproved,
        isFeatured: r.isFeatured,
        customerName: r.customerName
      })));
      
      const approvedReviews = reviews.filter(r => r.isApproved);
      const featuredReviews = reviews.filter(r => r.isApproved && r.isFeatured);
      
      console.log(`   Approved reviews: ${approvedReviews.length}`);
      console.log(`   Featured reviews: ${featuredReviews.length}`);
    } else {
      console.log('   ❌ No reviews found in collection');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCurrentData();
