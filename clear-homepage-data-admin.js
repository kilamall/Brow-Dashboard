// Simple script to clear homepage data via Firebase Admin SDK
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'bueno-brows-7cce7'
  });
}

const db = admin.firestore();

async function clearHomepageData() {
  try {
    console.log('🧹 Clearing all homepage data...');
    
    // Clear the settings/homePageContent document
    await db.collection('settings').doc('homePageContent').delete();
    console.log('✅ Deleted settings/homePageContent document');
    
    // Also clear the old homePageContent/main document if it exists
    try {
      await db.collection('homePageContent').doc('main').delete();
      console.log('✅ Deleted homePageContent/main document');
    } catch (error) {
      console.log('ℹ️ homePageContent/main document did not exist');
    }
    
    // Create a clean settings/homePageContent document
    const cleanHomepageContent = {
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('settings').doc('homePageContent').set(cleanHomepageContent);
    console.log('✅ Created clean settings/homePageContent document');
    
    console.log('🎉 Homepage data cleared successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Go to admin panel: https://bueno-brows-admin.web.app/settings');
    console.log('   2. Upload photos to Gallery category');
    console.log('   3. Check booking site: https://buenobrows.com');
    
  } catch (error) {
    console.error('❌ Error clearing homepage data:', error);
  }
}

clearHomepageData();
