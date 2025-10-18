import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

try { admin.initializeApp(); } catch {}

export const createCustomConsentForm = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be authenticated to create consent forms'
    );
  }

  // Check if user is admin
  const isAdmin = ((context.auth.token as any)?.role === 'admin');
  if (!isAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Must be an admin to create consent forms'
    );
  }

  const db = getFirestore();

  try {
    const {
      name,
      version = '1.0',
      category = 'custom',
      title,
      content,
      sections,
      assignedServices = [],
      assignedCategories = [],
    } = data;

    // Validate required fields
    if (!name || !title || !sections || sections.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Name, title, and at least one section are required'
      );
    }

    // Validate sections
    for (const section of sections) {
      if (!section.heading || !section.content) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'All sections must have a heading and content'
        );
      }
    }

    // Check if a form with the same name already exists
    const existingForms = await db.collection('consentFormTemplates')
      .where('name', '==', name.trim())
      .get();

    if (!existingForms.empty) {
      throw new functions.https.HttpsError(
        'already-exists',
        'A consent form with this name already exists'
      );
    }

    // Create the consent form template
    const template = {
      name: name.trim(),
      version,
      category,
      title: title.trim(),
      content: content?.trim() || 'Please read the following information carefully before proceeding with your service.',
      active: true,
      effectiveDate: new Date().toISOString(),
      sections: sections.map((section: { heading: string; content: string; required: boolean }) => ({
        heading: section.heading.trim(),
        content: section.content.trim(),
        required: Boolean(section.required),
      })),
      assignedServices,
      assignedCategories,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('consentFormTemplates').add(template);
    
    return {
      success: true,
      message: 'Consent form created successfully',
      form: {
        id: docRef.id,
        name: template.name,
        version: template.version,
        category: template.category,
        sections: template.sections.length,
        requiredSections: template.sections.filter((s: { required: boolean }) => s.required).length,
        assignedServices: assignedServices.length,
        assignedCategories: assignedCategories.length,
        createdAt: template.createdAt,
      }
    };

  } catch (error: any) {
    console.error('Error creating custom consent form:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create consent form',
      error.message
    );
  }
});
