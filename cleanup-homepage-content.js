const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ",
  authDomain: "bueno-brows-7cce7.firebaseapp.com",
  projectId: "bueno-brows-7cce7",
  storageBucket: "bueno-brows-7cce7.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupHomepageContent() {
  try {
    console.log('🔍 Checking homepage content...');
    
    const docRef = doc(db, 'homePageContent', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📄 Current homepage content:', JSON.stringify(data, null, 2));
      
      // Check if there are any invalid photo URLs
      const galleryPhotos = data.galleryPhotos || [];
      const validPhotos = galleryPhotos.filter(photo => {
        if (!photo.url || photo.url.includes('deleted') || photo.url.includes('undefined')) {
          console.log('❌ Invalid photo found:', photo);
          return false;
        }
        return true;
      });
      
      if (validPhotos.length !== galleryPhotos.length) {
        console.log(`🧹 Cleaning up ${galleryPhotos.length - validPhotos.length} invalid photos...`);
        
        const cleanedData = {
          ...data,
          galleryPhotos: validPhotos,
          // Clear hero images if they're invalid
          heroImageUrl: data.heroImageUrl && !data.heroImageUrl.includes('deleted') ? data.heroImageUrl : null,
          hero2ImageUrl: data.hero2ImageUrl && !data.hero2ImageUrl.includes('deleted') ? data.hero2ImageUrl : null
        };
        
        await setDoc(docRef, cleanedData, { merge: true });
        console.log('✅ Homepage content cleaned up successfully!');
      } else {
        console.log('✅ No cleanup needed - all photos are valid');
      }
    } else {
      console.log('❌ No homepage content document found');
    }
  } catch (error) {
    console.error('❌ Error cleaning up homepage content:', error);
  }
}

// Run the cleanup
cleanupHomepageContent().then(() => {
  console.log('🏁 Cleanup complete');
  process.exit(0);
});


