#!/usr/bin/env node

/**
 * Initialize Consent Forms
 * 
 * This script creates the default consent form template
 * 
 * Run from functions directory: node initialize-consent-forms.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = join(__dirname, '..', 'service-account.json');
let serviceAccount;

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('❌ Error: service-account.json not found!');
  console.error('   Please download it from Firebase Console:');
  console.error('   Project Settings → Service Accounts → Generate New Private Key');
  console.error(`   Save it as: ${serviceAccountPath}`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Default consent form template for brow services
const DEFAULT_BROW_CONSENT_TEMPLATE = {
  name: 'Brow & Lash Services Consent',
  version: '1.0',
  category: 'brow_services',
  title: 'Consent Form for Brow & Lash Services',
  content: 'Please read the following information carefully before proceeding with your service. This consent form explains the procedures, potential risks, and aftercare requirements for brow and lash treatments.',
  active: true,
  effectiveDate: new Date().toISOString(),
  sections: [
    {
      heading: 'Services Covered',
      content: `This consent form covers the following services:
• Eyebrow shaping, waxing, and tinting
• Lash lifts and tinting
• Brow lamination
• Microblading touch-ups (if applicable)
• Other superficial brow and lash enhancement procedures`,
      required: true,
    },
    {
      heading: 'Pre-Treatment Acknowledgment',
      content: `I acknowledge that:
• I have disclosed any allergies, skin sensitivities, or medical conditions
• I am not currently using Retin-A, Accutane, or other exfoliating products on the treatment area
• I do not have any active infections, open wounds, or skin conditions in the treatment area
• I am not pregnant or nursing (for certain treatments)
• I have not had recent sun exposure or chemical peels in the treatment area`,
      required: true,
    },
    {
      heading: 'Potential Risks & Side Effects',
      content: `I understand the following potential risks:
• Temporary redness, swelling, or irritation
• Allergic reaction to products used (patch test recommended)
• Temporary discomfort during the procedure
• Rare risk of infection if aftercare instructions are not followed
• Results may vary based on individual characteristics
• Color results from tinting may differ from expectations`,
      required: true,
    },
    {
      heading: 'Aftercare Responsibilities',
      content: `I agree to follow all aftercare instructions, including:
• Avoiding water, steam, and excessive sweating for 24-48 hours (service-specific)
• Not touching or rubbing the treated area
• Avoiding makeup application on treated area as directed
• Using recommended aftercare products only
• Scheduling follow-up appointments as recommended
• Contacting the salon immediately if any adverse reactions occur`,
      required: true,
    },
    {
      heading: 'Consent & Release',
      content: `I hereby consent to receive the brow/lash services I have selected. I understand that results are not guaranteed and may require multiple sessions. I release Bueno Brows, its staff, and practitioners from any liability for damages or injuries resulting from these services, except in cases of gross negligence. I confirm that all information provided is accurate and complete.`,
      required: true,
    },
    {
      heading: 'Photo Release (Optional)',
      content: `I give permission for before/after photos of my treatment to be used for marketing purposes, social media, and portfolio use. My identity will remain confidential unless I provide additional written consent.`,
      required: false,
    },
  ],
  createdAt: new Date().toISOString(),
};

async function initializeConsentForms() {
  try {
    console.log('🚀 Starting consent form initialization...\n');

    // Check if consent form already exists
    console.log('📋 Checking for existing consent forms...');
    const existingForms = await db.collection('consentFormTemplates')
      .where('category', '==', 'brow_services')
      .where('active', '==', true)
      .get();

    if (!existingForms.empty) {
      console.log('✅ Active consent form already exists!');
      console.log('\nExisting form details:');
      const existingForm = existingForms.docs[0].data();
      console.log(`   ID: ${existingForms.docs[0].id}`);
      console.log(`   Name: ${existingForm.name}`);
      console.log(`   Version: ${existingForm.version}`);
      console.log(`   Sections: ${existingForm.sections.length}`);
      console.log(`   Created: ${new Date(existingForm.createdAt).toLocaleString()}`);
      console.log('\n⚠️  Skipping creation to avoid duplicates.');
      console.log('   If you want to create a new version, deactivate the existing one in the admin panel.\n');
      return existingForm;
    }

    // Create the default consent form
    console.log('📝 Creating default consent form template...');
    const docRef = await db.collection('consentFormTemplates').add(DEFAULT_BROW_CONSENT_TEMPLATE);
    
    console.log('\n✅ Consent form created successfully!');
    console.log(`   Document ID: ${docRef.id}`);
    console.log(`   Name: ${DEFAULT_BROW_CONSENT_TEMPLATE.name}`);
    console.log(`   Version: ${DEFAULT_BROW_CONSENT_TEMPLATE.version}`);
    console.log(`   Sections: ${DEFAULT_BROW_CONSENT_TEMPLATE.sections.length}`);
    console.log(`   Required sections: ${DEFAULT_BROW_CONSENT_TEMPLATE.sections.filter(s => s.required).length}`);

    console.log('\n📊 Consent form template sections:');
    DEFAULT_BROW_CONSENT_TEMPLATE.sections.forEach((section, idx) => {
      console.log(`   ${idx + 1}. ${section.heading} ${section.required ? '(Required)' : '(Optional)'}`);
    });

    console.log('\n✨ Initialization complete!');
    console.log('\n📍 Next steps:');
    console.log('   1. Open your admin app at /consent-forms');
    console.log('   2. Review the consent form template');
    console.log('   3. Test with a booking to see it in action');
    console.log('   4. Customize content if needed');
    console.log('\n🎉 Your consent form system is now ready!');
    
    return DEFAULT_BROW_CONSENT_TEMPLATE;

  } catch (error) {
    console.error('❌ Error initializing consent forms:', error);
    throw error;
  }
}

// Run the initialization
initializeConsentForms()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    console.error(error.stack);
    process.exit(1);
  });

