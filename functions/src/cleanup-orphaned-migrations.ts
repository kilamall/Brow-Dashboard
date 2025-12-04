// functions/src/cleanup-orphaned-migrations.ts
// Clean up customers with migratedTo pointing to non-existent targets
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

export const cleanupOrphanedMigrations = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    if (!req.auth || req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Only admin users can run this cleanup');
    }

    try {
      console.log('🧹 Starting cleanup of orphaned migrations...');

      // Get ALL customers (no limit) to properly check for orphaned migrations
      console.log('📋 Fetching all customers...');
      const allCustomersSnapshot = await db.collection('customers').get();
      const allCustomers: any[] = allCustomersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`📋 Found ${allCustomers.length} total customers`);
      const customerIds = new Set(allCustomers.map(c => c.id));
      const orphanedCustomers: any[] = [];

      // Find customers with migratedTo pointing to non-existent targets
      for (const customer of allCustomers) {
        if (customer.migratedTo) {
          // Skip self-references (invalid data)
          if (customer.migratedTo === customer.id) {
            orphanedCustomers.push({
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              migratedTo: customer.migratedTo,
              reason: 'self-reference'
            });
            continue;
          }
          
          // Check if target exists in the batch
          if (!customerIds.has(customer.migratedTo)) {
            // Double-check if target exists in database (might be outside batch)
            const targetDoc = await db.collection('customers').doc(customer.migratedTo).get();
            if (!targetDoc.exists) {
              orphanedCustomers.push({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                migratedTo: customer.migratedTo,
                reason: 'target-not-found'
              });
            }
          }
        }
      }

      console.log(`✅ Found ${orphanedCustomers.length} orphaned migrated customers`);

      if (orphanedCustomers.length === 0) {
        return {
          success: true,
          message: 'No orphaned migrations found',
          cleaned: 0
        };
      }

      // Option to clear migratedTo field (fix the data)
      const { action } = req.data || {};
      
      if (action === 'clear_migratedTo') {
        let cleanedCount = 0;
        let skippedCount = 0;
        const skipped: any[] = [];
        let batch = db.batch();
        let batchCount = 0;

        // Process in batches, checking document existence first
        for (const customer of orphanedCustomers) {
          try {
            // Check if document exists before trying to update
            const customerRef = db.collection('customers').doc(customer.id);
            const customerDoc = await customerRef.get();
            
            if (!customerDoc.exists) {
              console.warn(`⚠️ Customer ${customer.id} (${customer.name}) no longer exists - skipping`);
              skippedCount++;
              skipped.push({
                id: customer.id,
                name: customer.name,
                reason: 'document-not-found'
              });
              continue;
            }

            // Document exists, add to batch for update
            batch.update(customerRef, {
              migratedTo: null,
              identityStatus: 'guest', // Reset to guest since merge didn't complete
              updatedAt: new Date().toISOString()
            });
            batchCount++;
            cleanedCount++;

            // Commit batch when it reaches 500 operations
            if (batchCount >= 500) {
              await batch.commit();
              batch = db.batch(); // Start new batch
              batchCount = 0;
            }
          } catch (error: any) {
            console.error(`❌ Error processing customer ${customer.id}:`, error);
            skippedCount++;
            skipped.push({
              id: customer.id,
              name: customer.name,
              reason: error.message || 'unknown-error'
            });
          }
        }

        // Commit any remaining batch
        if (batchCount > 0) {
          await batch.commit();
        }

        console.log(`✅ Cleared migratedTo field for ${cleanedCount} orphaned customers (skipped ${skippedCount} that no longer exist)`);

        return {
          success: true,
          message: `Cleared migratedTo field for ${cleanedCount} orphaned customers${skippedCount > 0 ? ` (skipped ${skippedCount} that no longer exist)` : ''}`,
          cleaned: cleanedCount,
          skipped: skippedCount,
          orphanedCustomers: orphanedCustomers.filter(c => !skipped.some(s => s.id === c.id)).map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone
          })),
          skippedCustomers: skipped
        };
      }

      // Return list of orphaned customers (don't fix yet)
      return {
        success: true,
        message: `Found ${orphanedCustomers.length} orphaned migrated customers`,
        orphanedCount: orphanedCustomers.length,
        orphanedCustomers: orphanedCustomers.map(c => ({
          id: c.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          migratedTo: c.migratedTo
        }))
      };
    } catch (error: any) {
      console.error('Error in cleanupOrphanedMigrations:', error);
      throw new HttpsError('internal', `Failed to cleanup orphaned migrations: ${error.message}`);
    }
  }
);

