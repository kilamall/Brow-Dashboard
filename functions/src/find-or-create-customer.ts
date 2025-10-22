// functions/src/find-or-create-customer.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';

try { initializeApp(); } catch {}
const db = getFirestore();

export const findOrCreateCustomer = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit customer creation (10 per hour per IP/user)
    await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    const { email, name, phone, profilePictureUrl } = req.data || {};
    
    // Require at least email or phone
    if (!email && !phone) {
      throw new HttpsError('invalid-argument', 'Either email or phone is required');
    }
    
    try {
      // Check if customer exists by email or phone
      let existingCustomers;
      
      if (email) {
        // Try to find by email first
        existingCustomers = await db.collection('customers')
          .where('email', '==', email)
          .limit(1)
          .get();
      }
      
      // If not found by email and phone is provided, try phone
      if ((!existingCustomers || existingCustomers.empty) && phone) {
        existingCustomers = await db.collection('customers')
          .where('phone', '==', phone)
          .limit(1)
          .get();
      }
      
      if (existingCustomers && !existingCustomers.empty) {
        // Customer exists, update if new info provided
        const customerId = existingCustomers.docs[0].id;
        const existingData = existingCustomers.docs[0].data();
        
        // Update customer data if new fields provided
        const updates: any = {
          updatedAt: new Date().toISOString(),
        };
        
        if (profilePictureUrl) updates.profilePictureUrl = profilePictureUrl;
        
        if (email && !existingData.email) {
          updates.email = email;
        }
        if (phone && !existingData.phone) {
          updates.phone = phone;
        }
        if (name && !existingData.name) {
          updates.name = name;
        }
        
        // Only update if there are actual changes
        if (Object.keys(updates).length > 1) {
          await db.collection('customers').doc(customerId).update(updates);
        }
        
        return { customerId, isNew: false };
      }
      
      // Customer doesn't exist, create new one
      const newCustomerRef = await db.collection('customers').add({
        name: name || 'Guest',
        email: email || null,
        phone: phone || null,
        profilePictureUrl: profilePictureUrl || null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return { customerId: newCustomerRef.id, isNew: true };
    } catch (error: any) {
      console.error('findOrCreateCustomer error:', error);
      throw new HttpsError('internal', 'Failed to find or create customer');
    }
  }
);


