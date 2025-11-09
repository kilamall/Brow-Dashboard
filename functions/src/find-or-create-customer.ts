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

    const { email, name, phone, profilePictureUrl, authUid, birthday } = req.data || {};
    
    // Require at least email, phone, or name
    if (!email && !phone && !name) {
      throw new HttpsError('invalid-argument', 'Either email, phone, or name is required');
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
      
      // ENHANCED: Also search by raw phone/email to catch customers created before canonical fields
      if (!existingCustomer && phone) {
        const rawPhoneQuery = await db.collection('customers')
          .where('phone', '==', phone)
          .limit(1)
          .get();
        
        if (!rawPhoneQuery.empty) {
          existingCustomer = { id: rawPhoneQuery.docs[0].id, ...rawPhoneQuery.docs[0].data() } as any;
          console.log('✅ Found customer by raw phone:', phone);
        }
      }
      
      if (!existingCustomer && email) {
        const rawEmailQuery = await db.collection('customers')
          .where('email', '==', email)
          .limit(1)
          .get();
        
        if (!rawEmailQuery.empty) {
          existingCustomer = { id: rawEmailQuery.docs[0].id, ...rawEmailQuery.docs[0].data() } as any;
          console.log('✅ Found customer by raw email:', email);
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
        
        // Clean up any duplicate customers automatically
        if (canonicalEmail || canonicalPhone) {
          try {
            const duplicateQueries = [];
            if (canonicalEmail) {
              duplicateQueries.push(
                db.collection('customers')
                  .where('canonicalEmail', '==', canonicalEmail)
                  .where('__name__', '!=', existingCustomer.id)
                  .get(),
                db.collection('customers')
                  .where('email', '==', email)
                  .where('__name__', '!=', existingCustomer.id)
                  .get()
              );
            }
            if (canonicalPhone) {
              duplicateQueries.push(
                db.collection('customers')
                  .where('canonicalPhone', '==', canonicalPhone)
                  .where('__name__', '!=', existingCustomer.id)
                  .get(),
                db.collection('customers')
                  .where('phone', '==', phone)
                  .where('__name__', '!=', existingCustomer.id)
                  .get()
              );
            }
            
            const duplicateResults = await Promise.all(duplicateQueries);
            const duplicates = new Set<string>();
            duplicateResults.forEach(snapshot => {
              snapshot.forEach(doc => {
                const data = doc.data();
                // Only merge customers that aren't already migrated
                if (data.identityStatus !== 'migrated' && !data.migratedTo) {
                  duplicates.add(doc.id);
                }
              });
            });
            
            // Mark duplicates as migrated
            if (duplicates.size > 0) {
              console.log(`🧹 Found ${duplicates.size} duplicate(s) to merge`);
              const batch = db.batch();
              duplicates.forEach(dupId => {
                batch.update(db.collection('customers').doc(dupId), {
                  migratedTo: existingCustomer.id,
                  identityStatus: 'migrated',
                  updatedAt: new Date().toISOString()
                });
              });
              await batch.commit();
              console.log(`✅ Marked ${duplicates.size} duplicate(s) as migrated`);
            }
          } catch (cleanupError) {
            console.error('⚠️ Error cleaning up duplicates:', cleanupError);
            // Don't fail the main operation if cleanup fails
          }
        }
        
        // Check if customer exists but caller isn't authenticated (needsSignIn scenario)
        const needsSignIn = !authUid && existingCustomer.authUid;
        
        // Link Auth UID if provided and not already linked (merge scenario)
        const wasMerged = authUid && !existingCustomer.authUid && existingCustomer.id !== authUid;
        if (wasMerged) {
          console.log('🔗 MERGING: Moving customer from', existingCustomer.id, 'to', authUid);
          
          // CRITICAL: Migrate to authUid document to match ClientDashboard lookup
          // Copy existing customer to new document with authUid as ID
          await db.collection('customers').doc(authUid).set({
            ...existingCustomer,
            authUid: authUid,
            identityStatus: 'merged',
            mergedFrom: [existingCustomer.id],
            canonicalEmail: canonicalEmail || existingCustomer.canonicalEmail || null,
            canonicalPhone: canonicalPhone || existingCustomer.canonicalPhone || null,
            email: email || existingCustomer.email,
            phone: phone || existingCustomer.phone,
            name: name || existingCustomer.name,
            profilePictureUrl: profilePictureUrl || existingCustomer.profilePictureUrl,
            totalVisits: existingCustomer.totalVisits || 0, // Ensure totalVisits is set
            lastVisit: existingCustomer.lastVisit || null,
            updatedAt: new Date().toISOString()
          });
          
          // Update all appointments from old customerId to new authUid
          const appointmentsQuery = await db.collection('appointments')
            .where('customerId', '==', existingCustomer.id)
            .get();
          
          console.log(`📦 Migrating ${appointmentsQuery.size} appointments to new customer ID`);
          
          if (appointmentsQuery.size > 0) {
            // Use batch writes for better performance and atomicity
            const batch = db.batch();
            const batchSize = 500; // Firestore batch limit
            let currentBatch = db.batch();
            let batchCount = 0;
            
            appointmentsQuery.forEach(doc => {
              currentBatch.update(doc.ref, { 
                customerId: authUid,
                updatedAt: new Date().toISOString()
              });
              batchCount++;
              
              // Commit batch when it reaches the limit
              if (batchCount >= batchSize) {
                batch.commit();
                currentBatch = db.batch();
                batchCount = 0;
              }
            });
            
            // Commit any remaining updates
            if (batchCount > 0) {
              await currentBatch.commit();
            }
            
            console.log(`✅ Migrated ${appointmentsQuery.size} appointments`);
          }
          
          // Also migrate any related data (availability, holds, etc.)
          try {
            // Migrate availability records
            const availabilityQuery = await db.collection('availability')
              .where('customerId', '==', existingCustomer.id)
              .get();
            
            if (availabilityQuery.size > 0) {
              const availabilityBatch = db.batch();
              availabilityQuery.forEach(doc => {
                availabilityBatch.update(doc.ref, { 
                  customerId: authUid,
                  updatedAt: new Date().toISOString()
                });
              });
              await availabilityBatch.commit();
              console.log(`✅ Migrated ${availabilityQuery.size} availability records`);
            }
            
            // Migrate holds
            const holdsQuery = await db.collection('holds')
              .where('userId', '==', existingCustomer.id)
              .get();
            
            if (holdsQuery.size > 0) {
              const holdsBatch = db.batch();
              holdsQuery.forEach(doc => {
                holdsBatch.update(doc.ref, { 
                  userId: authUid,
                  updatedAt: new Date().toISOString()
                });
              });
              await holdsBatch.commit();
              console.log(`✅ Migrated ${holdsQuery.size} holds`);
            }
            
            // Migrate skin analyses
            const skinAnalysesQuery = await db.collection('skinAnalyses')
              .where('customerId', '==', existingCustomer.id)
              .get();
            
            if (skinAnalysesQuery.size > 0) {
              const skinAnalysesBatch = db.batch();
              skinAnalysesQuery.forEach(doc => {
                skinAnalysesBatch.update(doc.ref, { 
                  customerId: authUid,
                  updatedAt: new Date().toISOString()
                });
              });
              await skinAnalysesBatch.commit();
              console.log(`✅ Migrated ${skinAnalysesQuery.size} skin analyses`);
            }
            
            // Migrate consent forms
            const consentFormsQuery = await db.collection('consentForms')
              .where('customerId', '==', existingCustomer.id)
              .get();
            
            if (consentFormsQuery.size > 0) {
              const consentFormsBatch = db.batch();
              consentFormsQuery.forEach(doc => {
                consentFormsBatch.update(doc.ref, { 
                  customerId: authUid,
                  updatedAt: new Date().toISOString()
                });
              });
              await consentFormsBatch.commit();
              console.log(`✅ Migrated ${consentFormsQuery.size} consent forms`);
            }
            
          } catch (migrationError) {
            console.error('⚠️ Error migrating related data:', migrationError);
            // Don't fail the merge if related data migration fails
          }
          
          // Mark old customer document as migrated (keep for audit trail)
          await db.collection('customers').doc(existingCustomer.id).update({
            migratedTo: authUid,
            identityStatus: 'migrated',
            updatedAt: new Date().toISOString()
          });
          
          console.log('✅ Merge complete: Old ID', existingCustomer.id, '→ New ID', authUid);
          
          return {
            customerId: authUid,
            isNew: false,
            merged: true,
            needsSignIn: false
          };
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
          merged: wasMerged,
          needsSignIn: needsSignIn
        };
      }

      // Step 3: Create new customer with Auth UID as document ID (if provided)
      // This ensures Firebase Auth UID matches Firestore document ID
      const customerId = authUid || db.collection('customers').doc().id;
      
      await db.collection('customers').doc(customerId).set({
        name: name || 'Guest',
        email: email || null,
        phone: phone || null,
        birthday: birthday || null,
        profilePictureUrl: profilePictureUrl || null,
        canonicalEmail: canonicalEmail || null,
        canonicalPhone: canonicalPhone || null,
        authUid: authUid || null,
        identityStatus: authUid ? 'auth' : 'guest',
        status: 'active',
        totalVisits: 0, // Initialize for new customer promotions
        lastVisit: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Created new customer:', customerId, authUid ? '(with auth)' : '(guest)');

      return { 
        customerId,
        isNew: true,
        merged: false,
        needsSignIn: false
      };
    } catch (error: any) {
      console.error('❌ findOrCreateCustomer error:', error);
      throw new HttpsError('internal', `Failed to find or create customer: ${error.message}`);
    }
  }
);


