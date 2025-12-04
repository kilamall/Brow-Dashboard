// functions/src/fix-luis-duplicate.ts
// Fix Luis Zuniga duplicate - find which one has appointments and merge/clean up
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const fixLuisDuplicate = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run this fix');
    }

    try {
      // Search for all Luis customers by name, email, or phone
      const allCustomersSnapshot = await db.collection('customers').limit(1000).get();
      const luisCustomers: any[] = [];
      
      allCustomersSnapshot.forEach(doc => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const phone = (data.phone || '').replace(/\D/g, '');
        
        // Match by name, email, or phone
        if (name.includes('luis') || 
            email.includes('manuzuniga88') || 
            phone.includes('6504778140')) {
          luisCustomers.push({ id: doc.id, ...data });
        }
      });

      if (luisCustomers.length === 0) {
        throw new Error('No Luis customers found. They may have been deleted or merged already.');
      }
      
      if (luisCustomers.length === 1) {
        // Only one Luis found - just fix any invalid migratedTo references
        const luis = luisCustomers[0];
        const updates: any = {};
        
        if (luis.migratedTo) {
          // Check if target exists
          const targetDoc = await db.collection('customers').doc(luis.migratedTo).get();
          if (!targetDoc.exists || luis.migratedTo === luis.id) {
            // Invalid or self-reference - clear it
            updates.migratedTo = null;
            updates.identityStatus = luis.identityStatus === 'migrated' ? 'auth' : luis.identityStatus || 'auth';
            updates.updatedAt = new Date().toISOString();
            
            await db.collection('customers').doc(luis.id).update(updates);
            
            return {
              success: true,
              message: 'Fixed Luis customer - cleared invalid migratedTo reference',
              action: 'Cleared invalid migratedTo',
              kept: {
                id: luis.id,
                name: luis.name,
                appointments: 0
              },
              deleted: null
            };
          }
        }
        
        return {
          success: true,
          message: 'Only one Luis customer found - no duplicates to fix',
          action: 'No action needed',
          kept: {
            id: luis.id,
            name: luis.name,
            appointments: 0
          },
          deleted: null
        };
      }
      
      // If more than 2, use the first 2
      if (luisCustomers.length > 2) {
        console.warn(`Found ${luisCustomers.length} Luis customers, will fix the first 2`);
      }

      // Sort by creation date or ID to have consistent ordering
      luisCustomers.sort((a, b) => {
        const aDate = a.createdAt || a.id;
        const bDate = b.createdAt || b.id;
        return aDate.localeCompare(bDate);
      });

      const luis1: any = luisCustomers[0];
      const luis2: any = luisCustomers[1];
      const luis1Id = luis1.id;
      const luis2Id = luis2.id;

      // Check which one has appointments
      const [appts1, appts2] = await Promise.all([
        db.collection('appointments').where('customerId', '==', luis1Id).get(),
        db.collection('appointments').where('customerId', '==', luis2Id).get()
      ]);

      const luis1Appts = appts1.size;
      const luis2Appts = appts2.size;

      // Check the target customer for luis1
      const targetId = luis1.migratedTo;
      let targetExists = false;
      let targetData = null;
      if (targetId) {
        const targetDoc = await db.collection('customers').doc(targetId).get();
        targetExists = targetDoc.exists;
        if (targetDoc.exists) {
          targetData = { id: targetDoc.id, ...targetDoc.data() };
        }
      }

      // Determine which customer to keep
      // Keep the one with appointments, or the one that's not self-referencing
      let keepId: string;
      let deleteId: string;
      let action: string;

      if (luis1Appts > 0 && luis2Appts === 0) {
        // Keep luis1 (has appointments)
        keepId = luis1Id;
        deleteId = luis2Id;
        action = 'Keep luis1 (has appointments), delete luis2 (self-referencing)';
      } else if (luis2Appts > 0 && luis1Appts === 0) {
        // Keep luis2 (has appointments)
        keepId = luis2Id;
        deleteId = luis1Id;
        action = 'Keep luis2 (has appointments), delete luis1';
      } else if (luis1.migratedTo === luis1Id || luis2.migratedTo === luis2Id) {
        // One is self-referencing - delete that one
        if (luis1.migratedTo === luis1Id) {
          keepId = luis2Id;
          deleteId = luis1Id;
          action = 'Keep luis2, delete luis1 (self-referencing)';
        } else {
          keepId = luis1Id;
          deleteId = luis2Id;
          action = 'Keep luis1, delete luis2 (self-referencing)';
        }
      } else {
        // Default: keep luis1, delete luis2
        keepId = luis1Id;
        deleteId = luis2Id;
        action = 'Keep luis1 (default), delete luis2';
      }

      // If we're keeping luis1, we need to fix its migratedTo if target doesn't exist
      if (keepId === luis1Id && luis1.migratedTo && !targetExists) {
        // Clear the migratedTo field
        await db.collection('customers').doc(luis1Id).update({
          migratedTo: null,
          identityStatus: 'auth', // Assume authenticated since he has appointments
          updatedAt: new Date().toISOString()
        });
        action += ' and cleared invalid migratedTo';
      }

      // If we're keeping luis2, we need to fix its self-reference
      if (keepId === luis2Id && luis2.migratedTo === luis2Id) {
        await db.collection('customers').doc(luis2Id).update({
          migratedTo: null,
          identityStatus: 'auth',
          updatedAt: new Date().toISOString()
        });
        action += ' and cleared self-reference';
      }

      // Migrate appointments from deleteId to keepId if needed
      if (luis1Appts > 0 && keepId === luis2Id) {
        const batch = db.batch();
        appts1.forEach(doc => {
          batch.update(doc.ref, {
            customerId: keepId,
            updatedAt: new Date().toISOString()
          });
        });
        await batch.commit();
        action += ` and migrated ${luis1Appts} appointments`;
      } else if (luis2Appts > 0 && keepId === luis1Id) {
        const batch = db.batch();
        appts2.forEach(doc => {
          batch.update(doc.ref, {
            customerId: keepId,
            updatedAt: new Date().toISOString()
          });
        });
        await batch.commit();
        action += ` and migrated ${luis2Appts} appointments`;
      }

      // Delete the duplicate
      await db.collection('customers').doc(deleteId).delete();

      return {
        success: true,
        message: `Fixed Luis duplicate`,
        action: action,
        kept: {
          id: keepId,
          name: keepId === luis1Id ? luis1.name : luis2.name,
          appointments: keepId === luis1Id ? luis1Appts : luis2Appts
        },
        deleted: {
          id: deleteId,
          name: deleteId === luis1Id ? luis1.name : luis2.name,
          appointments: deleteId === luis1Id ? luis1Appts : luis2Appts
        }
      };
    } catch (error: any) {
      console.error('Error in fixLuisDuplicate:', error);
      throw new HttpsError('internal', `Failed to fix Luis duplicate: ${error.message}`);
    }
  }
);

