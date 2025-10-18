import { collection, query, where, getDocs, addDoc, updateDoc, doc, Firestore, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { ConsentFormTemplate, CustomerConsent } from './types';

/**
 * Get the active consent form for a specific category
 */
export async function getActiveConsentForm(
  db: Firestore,
  category: string
): Promise<ConsentFormTemplate | null> {
  try {
    const formsRef = collection(db, 'consentFormTemplates');
    const q = query(
      formsRef,
      where('category', '==', category),
      where('active', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ConsentFormTemplate;
  } catch (error) {
    console.error('Error fetching active consent form:', error);
    return null;
  }
}

/**
 * Watch active consent form for a category (real-time)
 */
export function watchActiveConsentForm(
  db: Firestore,
  category: string,
  callback: (form: ConsentFormTemplate | null) => void
): () => void {
  const formsRef = collection(db, 'consentFormTemplates');
  const q = query(
    formsRef,
    where('category', '==', category),
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  
  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }
    const doc = snapshot.docs[0];
    callback({ id: doc.id, ...doc.data() } as ConsentFormTemplate);
  }, (error) => {
    console.error('Error watching consent form:', error);
    callback(null);
  });
}

/**
 * Record customer consent
 */
export async function recordCustomerConsent(
  db: Firestore,
  consent: Omit<CustomerConsent, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const consentsRef = collection(db, 'customerConsents');
    const docRef = await addDoc(consentsRef, {
      ...consent,
      createdAt: new Date().toISOString(),
    });
    
    // Also update customer record with consent reference
    if (consent.customerId) {
      const customerRef = doc(db, 'customers', consent.customerId);
      try {
        // We'll use array union in the actual implementation
        // For now, just note that the consent was recorded
        console.log('Consent recorded for customer:', consent.customerId);
      } catch (err) {
        console.error('Error updating customer consent reference:', err);
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error recording consent:', error);
    throw new Error('Failed to record consent');
  }
}

/**
 * Check if customer has valid consent for a category
 */
export async function hasValidConsent(
  db: Firestore,
  customerId: string,
  category: string
): Promise<boolean> {
  try {
    // Get active consent form for this category
    const activeForm = await getActiveConsentForm(db, category);
    if (!activeForm) {
      return false; // No active form means no consent required
    }
    
    // Check if customer has consented to this version
    const consentsRef = collection(db, 'customerConsents');
    const q = query(
      consentsRef,
      where('customerId', '==', customerId),
      where('consentFormId', '==', activeForm.id),
      where('agreed', '==', true),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking consent:', error);
    return false;
  }
}

/**
 * Get all consents for a customer
 */
export async function getCustomerConsents(
  db: Firestore,
  customerId: string
): Promise<CustomerConsent[]> {
  try {
    const consentsRef = collection(db, 'customerConsents');
    const q = query(
      consentsRef,
      where('customerId', '==', customerId),
      orderBy('consentedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerConsent));
  } catch (error) {
    console.error('Error fetching customer consents:', error);
    return [];
  }
}

/**
 * Watch customer consents (real-time)
 */
export function watchCustomerConsents(
  db: Firestore,
  customerId: string,
  callback: (consents: CustomerConsent[]) => void
): () => void {
  const consentsRef = collection(db, 'customerConsents');
  const q = query(
    consentsRef,
    where('customerId', '==', customerId),
    orderBy('consentedAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const consents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerConsent));
    callback(consents);
  }, (error) => {
    console.error('Error watching customer consents:', error);
    callback([]);
  });
}

/**
 * Flag consents as needing renewal when a new version is published
 */
export async function flagConsentsForRenewal(
  db: Firestore,
  oldFormId: string,
  category: string
): Promise<void> {
  try {
    const consentsRef = collection(db, 'customerConsents');
    const q = query(
      consentsRef,
      where('consentFormId', '==', oldFormId),
      where('agreed', '==', true)
    );
    
    const snapshot = await getDocs(q);
    const updates = snapshot.docs.map(docSnapshot => 
      updateDoc(doc(db, 'customerConsents', docSnapshot.id), {
        needsRenewal: true,
        updatedAt: new Date().toISOString(),
      })
    );
    
    await Promise.all(updates);
    console.log(`Flagged ${updates.length} consents for renewal`);
  } catch (error) {
    console.error('Error flagging consents for renewal:', error);
    throw error;
  }
}

/**
 * Default consent form templates for brow services
 */
export const DEFAULT_BROW_CONSENT_TEMPLATE: Omit<ConsentFormTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
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
};

/**
 * Initialize default consent forms in the database
 */
export async function initializeDefaultConsentForms(db: Firestore): Promise<void> {
  try {
    // Check if default form already exists
    const existing = await getActiveConsentForm(db, 'brow_services');
    if (existing) {
      console.log('Default consent form already exists');
      return;
    }
    
    // Create default form
    const formsRef = collection(db, 'consentFormTemplates');
    await addDoc(formsRef, {
      ...DEFAULT_BROW_CONSENT_TEMPLATE,
      createdAt: new Date().toISOString(),
    });
    
    console.log('Default consent form created');
  } catch (error) {
    console.error('Error initializing default consent forms:', error);
    throw error;
  }
}

