// functions/src/find-or-create-customer.ts
// Enhanced customer identity system with canonical identifiers and automatic merging
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

export const findOrCreateCustomer = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit customer creation (10 per hour per IP/user)
    await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    const { email, name, phone, profilePictureUrl, authUid } = req.data || {};
    
    // Require at least email or phone
    if (!email && !phone) {
      throw new HttpsError('invalid-argument', 'Either email or phone is required');
    }

    const canonicalEmail = email ? normalizeEmail(email) : null;
    const canonicalPhone = phone ? normalizePhone(phone) : null;
    
    try {
      // Step 1: Search for existing customer by canonical identifiers
      let existingCustomer = null;
      
      // Try phone first (most reliable for A2P SMS booking)
      if (canonicalPhone) {
        const phoneQuery = await db.collection('customers')
          .where('canonicalPhone', '==', canonicalPhone)
          .limit(1)
          .get();
        
        if (!phoneQuery.empty) {
          existingCustomer = { id: phoneQuery.docs[0].id, ...phoneQuery.docs[0].data() } as any;
          console.log('✅ Found customer by phone:', canonicalPhone);
        }
      }
      
      // Try email if no phone match
      if (!existingCustomer && canonicalEmail) {
        const emailQuery = await db.collection('customers')
          .where('canonicalEmail', '==', canonicalEmail)
          .limit(1)
          .get();
        
        if (!emailQuery.empty) {
          existingCustomer = { id: emailQuery.docs[0].id, ...emailQuery.docs[0].data() } as any;
          console.log('✅ Found customer by email:', canonicalEmail);
        }
      }
      
      // Try Auth UID if provided (for web auth flow)
      if (!existingCustomer && authUid) {
        const authDoc = await db.collection('customers').doc(authUid).get();
        if (authDoc.exists) {
          existingCustomer = { id: authDoc.id, ...authDoc.data() } as any;
          console.log('✅ Found customer by authUid:', authUid);
        }
      }

      // Step 2: If found, update and return
      if (existingCustomer) {
        const updates: any = {
          updatedAt: new Date().toISOString(),
        };
        
        // Update canonical fields if missing
        if (canonicalEmail && !existingCustomer.canonicalEmail) {
          updates.canonicalEmail = canonicalEmail;
          updates.email = email;
        }
        if (canonicalPhone && !existingCustomer.canonicalPhone) {
          updates.canonicalPhone = canonicalPhone;
          updates.phone = phone;
        }
        
        // Link Auth UID if provided and not already linked (merge scenario)
        const wasMerged = authUid && !existingCustomer.authUid;
        if (wasMerged) {
          updates.authUid = authUid;
          updates.identityStatus = 'merged';
          console.log('🔗 Linking authUid to existing customer:', authUid);
        }
        
        // Update name if better quality provided
        if (name && (!existingCustomer.name || existingCustomer.name === 'Guest')) {
          updates.name = name;
        }
        
        // Update profile picture if provided
        if (profilePictureUrl && !existingCustomer.profilePictureUrl) {
          updates.profilePictureUrl = profilePictureUrl;
        }

        // Only update if there are actual changes
        if (Object.keys(updates).length > 1) {
          await db.collection('customers').doc(existingCustomer.id).update(updates);
          console.log('✅ Updated existing customer:', existingCustomer.id);
        }
        
        return { 
          customerId: existingCustomer.id,
          isNew: false,
          merged: wasMerged
        };
      }

      // Step 3: Create new customer with Auth UID as document ID (if provided)
      // This ensures Firebase Auth UID matches Firestore document ID
      const customerId = authUid || db.collection('customers').doc().id;
      
      await db.collection('customers').doc(customerId).set({
        name: name || 'Guest',
        email: email || null,
        phone: phone || null,
        profilePictureUrl: profilePictureUrl || null,
        canonicalEmail: canonicalEmail,
        canonicalPhone: canonicalPhone,
        authUid: authUid || null,
        identityStatus: authUid ? 'auth' : 'guest',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Created new customer:', customerId, authUid ? '(with auth)' : '(guest)');

      return { 
        customerId,
        isNew: true,
        merged: false
      };
    } catch (error: any) {
      console.error('❌ findOrCreateCustomer error:', error);
      throw new HttpsError('internal', `Failed to find or create customer: ${error.message}`);
    }
  }
);


