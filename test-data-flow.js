// Test script to check if photos are being saved correctly
console.log('🔍 Testing gallery photo data flow...');

// Simulate what should happen when you assign a photo to gallery
const testPhoto = {
  id: 'photo_123',
  url: 'https://firebasestorage.googleapis.com/v0/b/bueno-brows-7cce7.firebasestorage.app/o/gallery%2Fgallery_1761614693008_IMG_1608.jpeg?alt=media&token=e6c448ce-44cc-4e92-8a02-3d4abd3ebe2e',
  alt: 'IMG_1608',
  category: 'gallery',
  homepageElements: {
    gallery: true
  }
};

// This is what should be saved to Firestore
const expectedFirestoreData = {
  galleryPhotos: [testPhoto.url] // Array of URL strings
};

console.log('✅ Expected Firestore data:', expectedFirestoreData);

// This is what the booking site should receive
const expectedBookingSiteData = {
  galleryPhotos: ['https://firebasestorage.googleapis.com/v0/b/bueno-brows-7cce7.firebasestorage.app/o/gallery%2Fgallery_1761614693008_IMG_1608.jpeg?alt=media&token=e6c448ce-44cc-4e92-8a02-3d4abd3ebe2e']
};

console.log('✅ Expected booking site data:', expectedBookingSiteData);

console.log('\n📋 Next steps:');
console.log('1. Check if photos are being saved to settings/homePageContent');
console.log('2. Verify the data format is array of URL strings');
console.log('3. Check if booking site is reading from correct collection');
console.log('4. Clear browser cache and test again');
