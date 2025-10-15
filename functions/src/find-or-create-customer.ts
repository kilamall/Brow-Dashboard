// functions/src/find-or-create-customer.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const findOrCreateCustomer = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { email, name, phone } = req.data || {};
    
    if (!email) {
      throw new HttpsError('invalid-argument', 'Email is required');
    }
    
    try {
      // Check if customer exists
      const existingCustomers = await db.collection('customers')
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (!existingCustomers.empty) {
        // Customer exists, return their ID
        const customerId = existingCustomers.docs[0].id;
        return { customerId, isNew: false };
      }
      
      // Customer doesn't exist, create new one
      const newCustomerRef = await db.collection('customers').add({
        name: name || 'Guest',
        email,
        phone: phone || null,
        status: 'guest',
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


