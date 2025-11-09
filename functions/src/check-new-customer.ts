import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Normalize phone number to digits only
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Normalize email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Check if a guest (by email/phone) is a new customer or has booked before
 * Returns: { isNewCustomer: boolean }
 */
export const checkNewCustomerStatus = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    const { email, phone } = req.data || {};
    
    if (!email && !phone) {
      throw new HttpsError('invalid-argument', 'Email or phone required');
    }
    
    try {
      const normalizedEmail = email ? normalizeEmail(email) : null;
      const normalizedPhone = phone ? normalizePhone(phone) : null;
      
      // STEP 1: Check customers table (most reliable)
      if (normalizedEmail) {
        // Check by canonical email
        const customerByCanonicalEmail = await db.collection('customers')
          .where('canonicalEmail', '==', normalizedEmail)
          .limit(1)
          .get();
        
        if (!customerByCanonicalEmail.empty) {
          const customer = customerByCanonicalEmail.docs[0].data();
          if ((customer.totalVisits || 0) > 0) {
            return { isNewCustomer: false, reason: 'Customer has previous visits' };
          }
        }
        
        // Check by regular email field (fallback)
        const customerByEmail = await db.collection('customers')
          .where('email', '==', normalizedEmail)
          .limit(1)
          .get();
        
        if (!customerByEmail.empty) {
          const customer = customerByEmail.docs[0].data();
          if ((customer.totalVisits || 0) > 0) {
            return { isNewCustomer: false, reason: 'Customer has previous visits' };
          }
        }
      }
      
      if (normalizedPhone) {
        // Check by canonical phone
        const digitsOnly = normalizedPhone;
        const withPlus1 = digitsOnly.length === 10 ? `+1${digitsOnly}` : `+${digitsOnly}`;
        
        const customerByCanonicalPhone = await db.collection('customers')
          .where('canonicalPhone', '==', withPlus1)
          .limit(1)
          .get();
        
        if (!customerByCanonicalPhone.empty) {
          const customer = customerByCanonicalPhone.docs[0].data();
          if ((customer.totalVisits || 0) > 0) {
            return { isNewCustomer: false, reason: 'Customer has previous visits' };
          }
        }
        
        // Check by regular phone field (fallback)
        const customerByPhone = await db.collection('customers')
          .where('phone', '==', phone)
          .limit(1)
          .get();
        
        if (!customerByPhone.empty) {
          const customer = customerByPhone.docs[0].data();
          if ((customer.totalVisits || 0) > 0) {
            return { isNewCustomer: false, reason: 'Customer has previous visits' };
          }
        }
      }
      
      // STEP 2: Check appointments directly (fallback)
      const appointmentChecks = [];
      
      if (normalizedEmail) {
        appointmentChecks.push(
          db.collection('appointments')
            .where('customerEmail', '==', normalizedEmail)
            .limit(1)
            .get()
        );
        
        if (email !== normalizedEmail) {
          appointmentChecks.push(
            db.collection('appointments')
              .where('customerEmail', '==', email)
              .limit(1)
              .get()
          );
        }
      }
      
      if (phone && normalizedPhone) {
        const phoneFormats = [
          phone,
          normalizedPhone,
          normalizedPhone.length === 10 ? `(${normalizedPhone.slice(0,3)}) ${normalizedPhone.slice(3,6)}-${normalizedPhone.slice(6)}` : phone,
        ];
        
        for (const phoneFormat of phoneFormats) {
          appointmentChecks.push(
            db.collection('appointments')
              .where('customerPhone', '==', phoneFormat)
              .limit(1)
              .get()
          );
        }
      }
      
      const results = await Promise.all(appointmentChecks);
      const hasAppointments = results.some(snap => !snap.empty);
      
      if (hasAppointments) {
        return { isNewCustomer: false, reason: 'Customer has previous appointments' };
      }
      
      return { isNewCustomer: true, reason: 'No previous bookings found' };
      
    } catch (error: any) {
      console.error('Error checking new customer status:', error);
      throw new HttpsError('internal', `Failed to check customer status: ${error.message}`);
    }
  }
);

