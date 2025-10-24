// functions/src/on-user-created.ts
// Callable function to sync user accounts with customer records
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

try { initializeApp(); } catch {}
const db = getFirestore();
const auth = getAuth();

export const syncUserWithCustomer = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { uid, email, phoneNumber, displayName, photoURL } = req.data || {};
    
    if (!uid) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }
    
    console.log('🔔 Syncing user with customer record:', { uid, email, phoneNumber, displayName });
    
    try {
      // Create customer record directly since we're in a Cloud Function
      const customerRef = db.collection('customers').doc(uid);
      const customerData = {
        name: displayName || 'User',
        email: email || null,
        phone: phoneNumber || null,
        canonicalEmail: email ? email.toLowerCase().trim() : null,
        canonicalPhone: phoneNumber ? phoneNumber.replace(/\D/g, '').length === 10 ? `+1${phoneNumber.replace(/\D/g, '')}` : `+${phoneNumber.replace(/\D/g, '')}` : null,
        profilePictureUrl: photoURL || null,
        authUid: uid,
        identityStatus: 'auth',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Check if customer already exists
      const existingCustomer = await customerRef.get();
      
      if (existingCustomer.exists) {
        // Update existing customer with auth info
        await customerRef.update({
          authUid: uid,
          identityStatus: 'auth',
          updatedAt: new Date(),
        });
        console.log('✅ Updated existing customer with auth info');
        return { success: true, action: 'updated' };
      } else {
        // Create new customer
        await customerRef.set(customerData);
        console.log('✅ Created new customer record for auth user');
        return { success: true, action: 'created' };
      }
      
    } catch (error: any) {
      console.error('❌ Failed to sync user with customer record:', error);
      throw new HttpsError('internal', 'Failed to sync user with customer record');
    }
  }
);
