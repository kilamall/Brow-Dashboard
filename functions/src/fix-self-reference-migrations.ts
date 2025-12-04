// functions/src/fix-self-reference-migrations.ts
// Fix customers with migratedTo pointing to themselves (self-references)
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const fixSelfReferenceMigrations = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run this fix');
    }

    try {
      console.log('🔧 Starting fix for self-reference migrations...');

      // Get all customers
      const allCustomersSnapshot = await db.collection('customers').limit(1000).get();
      const selfReferencingCustomers: any[] = [];

      allCustomersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.migratedTo === doc.id) {
          // Self-reference detected
          selfReferencingCustomers.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            migratedTo: data.migratedTo
          });
        }
      });

      console.log(`✅ Found ${selfReferencingCustomers.length} customers with self-referencing migratedTo`);

      if (selfReferencingCustomers.length === 0) {
        return {
          success: true,
          message: 'No self-referencing migrations found',
          fixed: 0
        };
      }

      // Fix them by clearing the migratedTo field
      const batch = db.batch();
      let batchCount = 0;

      for (const customer of selfReferencingCustomers) {
        const customerRef = db.collection('customers').doc(customer.id);
        batch.update(customerRef, {
          migratedTo: null,
          identityStatus: 'auth', // Assume authenticated since they have appointments
          updatedAt: new Date().toISOString()
        });
        batchCount++;

        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      console.log(`✅ Fixed ${selfReferencingCustomers.length} self-referencing migrations`);

      return {
        success: true,
        message: `Fixed ${selfReferencingCustomers.length} customers with self-referencing migratedTo`,
        fixed: selfReferencingCustomers.length,
        customers: selfReferencingCustomers.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone
        }))
      };
    } catch (error: any) {
      console.error('Error in fixSelfReferenceMigrations:', error);
      throw new HttpsError('internal', `Failed to fix self-reference migrations: ${error.message}`);
    }
  }
);


