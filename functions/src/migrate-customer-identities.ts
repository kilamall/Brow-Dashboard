// functions/src/migrate-customer-identities.ts
// One-time migration to add canonical identifiers to existing customers
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Normalize phone to E.164 format
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`; // US number
  if (digits.length === 11 && digits[0] === '1') return `+${digits}`;
  return `+${digits}`;
}

// Normalize email
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export const migrateCustomerIdentities = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Require admin role
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const userToken = req.auth.token;
    if (!userToken || userToken.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    try {
      console.log('🔄 Starting customer identity migration...');
      
      const customers = await db.collection('customers').get();
      let migratedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      for (const doc of customers.docs) {
        try {
          const data = doc.data();
          const updates: any = {};
          
          // Add canonical email if missing
          if (data.email && !data.canonicalEmail) {
            updates.canonicalEmail = normalizeEmail(data.email);
          }
          
          // Add canonical phone if missing
          if (data.phone && !data.canonicalPhone) {
            updates.canonicalPhone = normalizePhone(data.phone);
          }
          
          // Set identity status if missing
          if (!data.identityStatus) {
            // Check if customer has a matching auth UID
            // (document ID matches auth UID means they have an auth account)
            const hasAuth = data.userId === doc.id || data.authUid;
            updates.identityStatus = hasAuth ? 'auth' : 'guest';
          }
          
          // Set authUid if missing but userId exists
          if (!data.authUid && data.userId) {
            updates.authUid = data.userId;
          }
          
          // Update updatedAt timestamp
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = new Date().toISOString();
            await doc.ref.update(updates);
            migratedCount++;
            console.log(`✅ Migrated customer ${doc.id}:`, updates);
          } else {
            skippedCount++;
          }
        } catch (error: any) {
          errorCount++;
          console.error(`❌ Failed to migrate customer ${doc.id}:`, error);
        }
      }
      
      const summary = {
        total: customers.size,
        migrated: migratedCount,
        skipped: skippedCount,
        errors: errorCount
      };
      
      console.log('✅ Migration complete:', summary);
      
      return {
        success: true,
        message: 'Customer identity migration complete',
        ...summary
      };
    } catch (error: any) {
      console.error('❌ Migration error:', error);
      throw new HttpsError('internal', `Migration failed: ${error.message}`);
    }
  }
);

