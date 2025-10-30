// functions/src/create-customer-unique.ts
// Unique customer creation with reservation pattern to prevent duplicates
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';

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
    // SECURITY: Rate limit customer creation (10 per hour per IP/user)
    await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    const { name, email, phone, profilePictureUrl, notes, birthday, authUid } = req.data || {};
    
    console.log('🔍 createCustomerUnique called with:', { name, email, phone, hasProfilePicture: !!profilePictureUrl, notes, birthday });
    
    // Require at least email or phone for automatic creation
    // But allow name-only customers (for admin manual creation)
    if (!email && !phone && !name) {
      throw new HttpsError('invalid-argument', 'At least name is required');
    }

    const canonicalEmail = email ? normalizeEmail(email) : null;
    const canonicalPhone = phone ? normalizePhone(phone) : null;
    
    console.log('📋 Canonical fields:', { canonicalEmail, canonicalPhone });
    
    try {
      // Step 1: Check for existing reservations (only if we have contact info)
      const reservationKeys: string[] = [];
      if (canonicalEmail) reservationKeys.push(`email:${canonicalEmail}`);
      if (canonicalPhone) reservationKeys.push(`phone:${canonicalPhone}`);
      
      console.log('🔑 Reservation keys:', reservationKeys);
      
      // Only throw error if we have contact info but it already exists
      // If we have no contact info (name-only), we'll create a new customer without reservation checks

      // Use transaction to ensure atomicity
      const result = await db.runTransaction(async (tx) => {
        console.log('🔄 Starting transaction with', reservationKeys.length, 'reservation keys');
        
        // Check all reservation keys
        const reservationChecks = await Promise.all(
          reservationKeys.map(key => tx.get(db.doc(`uniqueContacts/${key}`)))
        );
        
        console.log('✅ Reservation checks completed:', reservationChecks.map((r, i) => ({ key: reservationKeys[i], exists: r.exists })));
        
        // If any reservation exists, return the existing customer
        for (let i = 0; i < reservationChecks.length; i++) {
          const reservation = reservationChecks[i];
          if (reservation.exists) {
            const existingCustomerId = reservation.data()?.customerId;
            if (existingCustomerId) {
              // Get the existing customer to return full data
              const existingCustomer = await tx.get(db.doc(`customers/${existingCustomerId}`));
              if (existingCustomer.exists) {
                console.log('✅ Customer already exists:', existingCustomerId, existingCustomer.data());
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
        console.log('🆕 No existing customer found, creating new one...');
        const customerRef = db.collection('customers').doc();
        const customerData = {
          name: name || 'Unnamed',
          email: email || null,
          phone: phone || null,
          birthday: birthday || null,
          canonicalEmail,
          canonicalPhone,
          profilePictureUrl: profilePictureUrl || null,
          notes: notes || null,
          status: 'pending',
          authUid: authUid || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log('📝 Customer data to create:', customerData);
        
        // Create customer document
        tx.set(customerRef, customerData);
        
        // Create reservations for uniqueness
        for (const key of reservationKeys) {
          console.log('🔒 Creating reservation for:', key);
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
