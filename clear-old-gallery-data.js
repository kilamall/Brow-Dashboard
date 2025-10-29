const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "bueno-brows-7cce7.firebaseapp.com",
  projectId: "bueno-brows-7cce7",
  storageBucket: "bueno-brows-7cce7.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

async function clearOldGalleryData() {
  try {
    console.log('🚀 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('📄 Checking current homepage content...');
    const docRef = doc(db, 'homePageContent', 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('📊 Current homepage content:', JSON.stringify(data, null, 2));
      
      // Clear the old galleryPhotos array that contains the old string format
      console.log('🧹 Clearing old gallery photos...');
      await setDoc(doc(db, 'homePageContent', 'main'), {
        galleryPhotos: [],
        heroImageUrl: null,
        hero2ImageUrl: null
      }, { merge: true });
      
      console.log('✅ Old gallery data cleared successfully!');
      console.log('📝 Next steps:');
      console.log('1. Go to admin panel: https://bueno-brows-admin.web.app/settings');
      console.log('2. Click "Media Gallery" tab');
      console.log('3. Upload your photos to "Gallery Photos" category');
      console.log('4. Check that photos appear in "Our Space" section');
      
    } else {
      console.log('❌ No homepage content document found');
    }
    
  } catch (error) {
    console.error('❌ Error clearing old gallery data:', error);
  }
}

clearOldGalleryData();
