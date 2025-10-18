import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

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

/**
 * HTTPS Callable Function to initialize consent forms
 * Requires admin authentication
 */
export const initializeConsentForms = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to initialize consent forms'
    );
  }

  // Check if user is admin
  const isAdmin = ((context.auth.token as any)?.role === 'admin');
  if (!isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Must be an admin to initialize consent forms'
    );
  }

  const db = getFirestore();

  try {
    // Check if consent form already exists
    const existingForms = await db.collection('consentFormTemplates')
      .where('category', '==', 'brow_services')
      .where('active', '==', true)
      .get();

    if (!existingForms.empty) {
      const existingForm = existingForms.docs[0].data();
      return {
        success: true,
        alreadyExists: true,
        message: 'Active consent form already exists',
        form: {
          id: existingForms.docs[0].id,
          name: existingForm.name,
          version: existingForm.version,
          sections: existingForm.sections?.length || 0,
          createdAt: existingForm.createdAt,
        }
      };
    }

    // Create the default consent form
    const docRef = await db.collection('consentFormTemplates').add(DEFAULT_BROW_CONSENT_TEMPLATE);
    
    return {
      success: true,
      alreadyExists: false,
      message: 'Consent form created successfully',
      form: {
        id: docRef.id,
        name: DEFAULT_BROW_CONSENT_TEMPLATE.name,
        version: DEFAULT_BROW_CONSENT_TEMPLATE.version,
        sections: DEFAULT_BROW_CONSENT_TEMPLATE.sections.length,
        requiredSections: DEFAULT_BROW_CONSENT_TEMPLATE.sections.filter(s => s.required).length,
        createdAt: DEFAULT_BROW_CONSENT_TEMPLATE.createdAt,
      }
    };

  } catch (error: any) {
    console.error('Error initializing consent forms:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Failed to initialize consent forms',
      error.message
    );
  }
});

