// functions/src/create-customer-unique.ts
// Unique customer creation with reservation pattern to prevent duplicates
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';

try { initializeApp(); } catch {}
const db = getFirestore();

// Normalize phone to E.164 format for consistent querying
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // US number
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}

// Normalize email for consistent querying
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export const createCustomerUnique = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit customer creation (10 per hour per IP/user) - temporarily disabled for testing
    // await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    const { name, email, phone, profilePictureUrl, notes, authUid } = req.data || {};
    
    // Require at least email or phone
    if (!email && !phone) {
      throw new HttpsError('invalid-argument', 'Either email or phone is required');
    }

    const canonicalEmail = email ? normalizeEmail(email) : null;
    const canonicalPhone = phone ? normalizePhone(phone) : null;
    
    try {
      // Step 1: Check for existing reservations
      const reservationKeys: string[] = [];
      if (canonicalEmail) reservationKeys.push(`email:${canonicalEmail}`);
      if (canonicalPhone) reservationKeys.push(`phone:${canonicalPhone}`);
      
      if (reservationKeys.length === 0) {
        throw new HttpsError('invalid-argument', 'No valid contact information provided');
      }

      // Use transaction to ensure atomicity
      const result = await db.runTransaction(async (tx) => {
        // Check all reservation keys
        const reservationChecks = await Promise.all(
          reservationKeys.map(key => tx.get(db.doc(`uniqueContacts/${key}`)))
        );
        
        // If any reservation exists, return the existing customer
        for (let i = 0; i < reservationChecks.length; i++) {
          const reservation = reservationChecks[i];
          if (reservation.exists) {
            const existingCustomerId = reservation.data()?.customerId;
            if (existingCustomerId) {
              // Get the existing customer to return full data
              const existingCustomer = await tx.get(db.doc(`customers/${existingCustomerId}`));
              if (existingCustomer.exists) {
                console.log('✅ Customer already exists:', existingCustomerId);
                return {
                  customerId: existingCustomerId,
                  alreadyExists: true,
                  customer: { id: existingCustomerId, ...existingCustomer.data() }
                };
              }
            }
          }
        }
        
        // No existing customer found, create new one
        const customerRef = db.collection('customers').doc();
        const customerData = {
          name: name || 'Unnamed',
          email: email || null,
          phone: phone || null,
          canonicalEmail,
          canonicalPhone,
          profilePictureUrl: profilePictureUrl || null,
          notes: notes || null,
          status: 'pending',
          authUid: authUid || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        // Create customer document
        tx.set(customerRef, customerData);
        
        // Create reservations for uniqueness
        for (const key of reservationKeys) {
          tx.set(db.doc(`uniqueContacts/${key}`), {
            customerId: customerRef.id,
            createdAt: new Date(),
            contactType: key.startsWith('email:') ? 'email' : 'phone',
            contactValue: key.startsWith('email:') ? canonicalEmail : canonicalPhone,
          });
        }
        
        console.log('✅ Created new unique customer:', customerRef.id);
        return {
          customerId: customerRef.id,
          alreadyExists: false,
          customer: { id: customerRef.id, ...customerData }
        };
      });
      
      return result;
      
    } catch (error: any) {
      console.error('❌ createCustomerUnique error:', error);
      
      if (error instanceof HttpsError) {
        throw error;
      }
      
      // Handle Firestore transaction errors
      if (error.code === 'failed-precondition') {
        throw new HttpsError('failed-precondition', 'Customer creation failed due to concurrent modification. Please try again.');
      }
      
      throw new HttpsError('internal', 'Failed to create customer');
    }
  }
);
