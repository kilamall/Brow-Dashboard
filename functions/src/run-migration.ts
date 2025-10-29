// functions/src/run-migration.ts
// Cloud Function to run the canonical fields migration
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

export const runCanonicalFieldsMigration = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Only allow admin users to run migration
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run migrations');
    }

    console.log('🚀 Starting canonical fields migration...');
    
    try {
      // Get all customers
      const customersSnapshot = await db.collection('customers').get();
      console.log(`📊 Found ${customersSnapshot.size} customers to migrate`);
      
      const batch = db.batch();
      let batchCount = 0;
      const batchSize = 500; // Firestore batch limit
      let processedCount = 0;
      let duplicateCount = 0;
      const duplicates: any[] = [];
      
      for (const doc of customersSnapshot.docs) {
        const customerData = doc.data();
        const customer = { id: doc.id, ...customerData } as any;
        
        // Skip if already has canonical fields
        if (customer.canonicalEmail || customer.canonicalPhone) {
          console.log(`⏭️ Skipping ${customer.id} - already has canonical fields`);
          continue;
        }
        
        const updates: any = {};
        const reservations: any[] = [];
        
        // Add canonical email if present
        if (customer.email) {
          const canonicalEmail = normalizeEmail(customer.email);
          updates.canonicalEmail = canonicalEmail;
          reservations.push({
            key: `email:${canonicalEmail}`,
            data: {
              customerId: customer.id,
              contactType: 'email',
              contactValue: canonicalEmail,
              createdAt: new Date()
            }
          });
        }
        
        // Add canonical phone if present
        if (customer.phone) {
          const canonicalPhone = normalizePhone(customer.phone);
          updates.canonicalPhone = canonicalPhone;
          reservations.push({
            key: `phone:${canonicalPhone}`,
            data: {
              customerId: customer.id,
              contactType: 'phone',
              contactValue: canonicalPhone,
              createdAt: new Date()
            }
          });
        }
        
        // Add updatedAt timestamp
        updates.updatedAt = new Date();
        
        // Update customer document
        if (Object.keys(updates).length > 1) { // More than just updatedAt
          batch.update(doc.ref, updates);
          batchCount++;
          
          // Create reservation documents
          for (const reservation of reservations) {
            const reservationRef = db.doc(`uniqueContacts/${reservation.key}`);
            batch.set(reservationRef, reservation.data);
            batchCount++;
          }
          
          processedCount++;
          console.log(`✅ Updated customer ${customer.id} with canonical fields`);
        }
        
        // Check for potential duplicates
        if (customer.email || customer.phone) {
          const emailQuery = customer.email ? 
            await db.collection('customers')
              .where('email', '==', customer.email)
              .where('canonicalEmail', '==', null)
              .get() : null;
              
          const phoneQuery = customer.phone ?
            await db.collection('customers')
              .where('phone', '==', customer.phone)
              .where('canonicalPhone', '==', null)
              .get() : null;
              
          if (emailQuery && emailQuery.size > 1) {
            duplicateCount++;
            duplicates.push({
              type: 'email',
              value: customer.email,
              customers: emailQuery.docs.map(d => d.id)
            });
          }
          
          if (phoneQuery && phoneQuery.size > 1) {
            duplicateCount++;
            duplicates.push({
              type: 'phone',
              value: customer.phone,
              customers: phoneQuery.docs.map(d => d.id)
            });
          }
        }
        
        // Commit batch when it reaches the limit
        if (batchCount >= batchSize) {
          await batch.commit();
          console.log(`📦 Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
      
      // Commit any remaining operations
      if (batchCount > 0) {
        await batch.commit();
        console.log(`📦 Committed final batch of ${batchCount} operations`);
      }
      
      console.log('✅ Migration completed!');
      console.log(`📊 Processed ${processedCount} customers`);
      console.log(`⚠️ Found ${duplicateCount} potential duplicates`);
      
      const result = {
        success: true,
        processedCount,
        duplicateCount,
        duplicates: duplicates.slice(0, 10), // Limit to first 10 duplicates
        message: `Migration completed! Processed ${processedCount} customers. Found ${duplicateCount} potential duplicates.`
      };
      
      if (duplicates.length > 0) {
        console.log('\n🔍 Potential duplicates found:');
        duplicates.forEach((dup, index) => {
          console.log(`${index + 1}. ${dup.type}: ${dup.value} - Customers: ${dup.customers.join(', ')}`);
        });
        console.log('\n⚠️ Please review these duplicates manually in the admin panel.');
      }
      
      return result;
      
    } catch (error: any) {
      console.error('❌ Migration failed:', error);
      throw new HttpsError('internal', `Migration failed: ${error.message}`);
    }
  }
);
