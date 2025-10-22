#!/usr/bin/env node

/**
 * Initialize Skin Analysis Content Fields
 * 
 * This script adds the new skin analysis fields to your homePageContent document
 * if they don't already exist. Safe to run multiple times.
 * 
 * Usage:
 *   node initialize-skin-analysis-content.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

const db = admin.firestore();

async function initializeSkinAnalysisContent() {
  console.log('🚀 Initializing Skin Analysis Content Fields...\n');
  
  try {
    const docRef = db.collection('config').doc('homePageContent');
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log('❌ Error: homePageContent document does not exist.');
      console.log('   Please ensure you have run the initial setup first.');
      process.exit(1);
    }
    
    const currentData = doc.data();
    
    // Check if skin analysis fields already exist
    if (currentData.skinAnalysisEnabled !== undefined) {
      console.log('✅ Skin analysis fields already exist!');
      console.log('\nCurrent values:');
      console.log(`   - Enabled: ${currentData.skinAnalysisEnabled}`);
      console.log(`   - Title: ${currentData.skinAnalysisTitle || 'Not set'}`);
      console.log(`   - Subtitle: ${currentData.skinAnalysisSubtitle || 'Not set'}`);
      console.log(`   - CTA: ${currentData.skinAnalysisCTA || 'Not set'}`);
      console.log('\n💡 You can edit these values in the Admin Settings → Skin Analysis tab.');
      return;
    }
    
    // Add the new fields
    const newFields = {
      skinAnalysisEnabled: true,
      skinAnalysisTitle: 'Discover Your Perfect Look with AI',
      skinAnalysisSubtitle: 'Get personalized beauty recommendations powered by AI',
      skinAnalysisDescription: 'Upload a photo and let our advanced AI analyze your skin type, tone, and facial features to recommend the perfect services and products tailored just for you.',
      skinAnalysisImageUrl: '',
      skinAnalysisCTA: 'Try Free Skin Analysis'
    };
    
    await docRef.update(newFields);
    
    console.log('✅ Successfully added skin analysis fields!\n');
    console.log('Added fields:');
    Object.entries(newFields).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value || '(empty)'}`);
    });
    
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Admin → Settings → Skin Analysis tab');
    console.log('   2. Upload a feature image (optional)');
    console.log('   3. Customize the text to match your brand');
    console.log('   4. Save your changes');
    console.log('\n✨ The AI Skin Analysis section will now appear on your homepage!');
    
  } catch (error) {
    console.error('❌ Error initializing skin analysis content:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSkinAnalysisContent()
  .then(() => {
    console.log('\n🎉 Done!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });

