// Simple script to clear homepage data
// Run this in the browser console on the admin page

async function clearAllHomepageData() {
  try {
    console.log('🧹 Clearing ALL homepage data...');
    
    // Import Firebase functions
    const { doc, deleteDoc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    
    // Firebase config
    const firebaseConfig = {
      apiKey: "AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ",
      authDomain: "bueno-brows-7cce7.firebaseapp.com",
      projectId: "bueno-brows-7cce7",
      storageBucket: "bueno-brows-7cce7.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:abcdef123456789"
    };
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    // Delete the entire document
    await deleteDoc(doc(db, 'settings', 'homePageContent'));
    console.log('✅ Deleted settings/homePageContent document');
    
    // Also delete the old collection if it exists
    try {
      await deleteDoc(doc(db, 'homePageContent', 'main'));
      console.log('✅ Deleted homePageContent/main document');
    } catch (error) {
      console.log('ℹ️ homePageContent/main document did not exist');
    }
    
    // Create a completely clean document with only essential fields
    const cleanData = {
      heroTitle: 'Refined. Natural. You.',
      heroSubtitle: 'Filipino-inspired beauty studio specializing in brows & lashes. Thoughtfully scheduled, never rushed.',
      ctaPrimary: 'Book now',
      ctaSecondary: 'See services',
      aboutText: 'At BUENO BROWS, we believe beauty is personal. Our Filipino-inspired approach combines precision with warmth, creating results that enhance your natural features.',
      buenoCircleEnabled: true,
      buenoCircleTitle: 'Join the Bueno Circle',
      buenoCircleDescription: 'Get 10% off your first appointment and exclusive updates!',
      buenoCircleDiscount: 10,
      skinAnalysisEnabled: false,
      skinAnalysisTitle: 'AI Skin Analysis',
      skinAnalysisSubtitle: 'Discover your skin\'s unique needs with our advanced AI technology',
      skinAnalysisDescription: 'Get personalized skincare recommendations based on AI analysis of your skin type and concerns.',
      skinAnalysisCTA: 'Try Skin Analysis',
      galleryPhotos: [], // Empty array - ready for new photos
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(db, 'settings', 'homePageContent'), cleanData);
    console.log('✅ Created clean settings/homePageContent document');
    
    console.log('🎉 ALL homepage data cleared successfully!');
    alert('✅ All homepage data cleared! You can now upload fresh photos.');
    
  } catch (error) {
    console.error('❌ Error clearing homepage data:', error);
    alert('❌ Error clearing homepage data');
  }
}

// Run the function
clearAllHomepageData();
