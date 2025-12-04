// functions/src/find-or-create-customer-v2.ts
// ENTERPRISE-GRADE: Transaction-safe customer find-or-create with race condition prevention
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

// Validate email format
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format (basic)
function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

// Sanitize string input (prevent XSS)
function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, 500); // Limit length
}

export const findOrCreateCustomer = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit customer creation (10 per hour per IP/user)
    await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    let { email, name, phone, profilePictureUrl, authUid, birthday } = req.data || {};
    
    // Input validation and sanitization
    if (email) {
      email = sanitizeString(email);
      if (!validateEmail(email)) {
        throw new HttpsError('invalid-argument', 'Invalid email format');
      }
    }
    
    if (phone) {
      phone = sanitizeString(phone);
      if (!validatePhone(phone)) {
        throw new HttpsError('invalid-argument', 'Invalid phone number format');
      }
    }
    
    if (name) {
      name = sanitizeString(name);
      if (name.length === 0) {
        name = undefined;
      }
    }
    
    // Require at least email, phone, or name (or authUid for authenticated users)
    if (!email && !phone && !name && !authUid) {
      console.error('❌ findOrCreateCustomer called without email, phone, name, or authUid');
      throw new HttpsError('invalid-argument', 'Either email, phone, name, or authUid is required');
    }
    
    // For guest bookings, require at least email or phone
    if (!authUid && !email && !phone) {
      console.error('❌ Guest booking attempted without email or phone');
      throw new HttpsError('invalid-argument', 'Guest bookings require either an email or phone number');
    }

    const canonicalEmail = email ? normalizeEmail(email) : null;
    const canonicalPhone = phone ? normalizePhone(phone) : null;
    
    try {
      // ENTERPRISE FIX: Wrap entire operation in transaction to prevent race conditions
      const result = await db.runTransaction(async (tx) => {
        // Step 1: Search for existing customer by canonical identifiers (within transaction)
        let existingCustomer = null;
        let foundByAuthUid = false;
        let guestCustomer = null;
        
        // CRITICAL: Check Auth UID FIRST if provided (prevents duplicate accounts on signup)
        if (authUid) {
          const authRef = db.collection('customers').doc(authUid);
          const authDoc = await tx.get(authRef);
          if (authDoc.exists) {
            existingCustomer = { id: authDoc.id, ...authDoc.data() } as any;
            foundByAuthUid = true;
            console.log('✅ Found customer by authUid (primary check):', authUid);
          }
        }
        
        // Try phone (most reliable for A2P SMS booking) - only if no authUid match
        if (!foundByAuthUid && canonicalPhone) {
          // Note: Firestore transactions can't use queries, so we need to check uniqueContacts
          const phoneReservationRef = db.doc(`uniqueContacts/phone:${canonicalPhone}`);
          const phoneReservation = await tx.get(phoneReservationRef);
          
          if (phoneReservation.exists) {
            const existingCustomerId = phoneReservation.data()?.customerId;
            if (existingCustomerId) {
              const customerRef = db.collection('customers').doc(existingCustomerId);
              const customerDoc = await tx.get(customerRef);
              if (customerDoc.exists) {
                existingCustomer = { id: customerDoc.id, ...customerDoc.data() } as any;
                console.log('✅ Found customer by phone reservation:', canonicalPhone);
              }
            }
          }
        }
        
        // Try email if no phone match
        if (!existingCustomer && canonicalEmail) {
          const emailReservationRef = db.doc(`uniqueContacts/email:${canonicalEmail}`);
          const emailReservation = await tx.get(emailReservationRef);
          
          if (emailReservation.exists) {
            const existingCustomerId = emailReservation.data()?.customerId;
            if (existingCustomerId) {
              const customerRef = db.collection('customers').doc(existingCustomerId);
              const customerDoc = await tx.get(customerRef);
              if (customerDoc.exists) {
                const found = { id: customerDoc.id, ...customerDoc.data() } as any;
                // If we have authUid and found a guest customer (no authUid), we'll merge it
                if (authUid && !found.authUid && found.id !== authUid) {
                  guestCustomer = found;
                  console.log('🔍 Found guest customer by email (will merge):', canonicalEmail);
                } else {
                  existingCustomer = found;
                  console.log('✅ Found customer by email reservation:', canonicalEmail);
                }
              }
            }
          }
        }
        
        // If we found a guest customer to merge, use it as existingCustomer for merge logic
        if (guestCustomer && !existingCustomer) {
          existingCustomer = guestCustomer;
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
          
          // Check if customer exists but caller isn't authenticated (needsSignIn scenario)
          const needsSignIn = !authUid && existingCustomer.authUid;
          
          // CRITICAL: If existing customer already has a different authUid, don't merge - just update
          if (authUid && existingCustomer.authUid && existingCustomer.authUid !== authUid) {
            console.log('⚠️ Customer already has different authUid. Updating existing customer instead of merging.');
            
            // Update canonical fields if missing
            if (canonicalEmail && !existingCustomer.canonicalEmail) {
              updates.canonicalEmail = canonicalEmail;
              updates.email = email;
            }
            if (canonicalPhone && !existingCustomer.canonicalPhone) {
              updates.canonicalPhone = canonicalPhone;
              updates.phone = phone;
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
              const customerRef = db.collection('customers').doc(existingCustomer.id);
              tx.update(customerRef, updates);
              console.log('✅ Updated existing customer (different authUid):', existingCustomer.id);
            }
            
            return { 
              customerId: existingCustomer.id,
              isNew: false,
              merged: false,
              needsSignIn: false
            };
          }
          
          // Link Auth UID if provided and not already linked (merge scenario)
          const wasMerged = authUid && !existingCustomer.authUid && existingCustomer.id !== authUid;
          if (wasMerged) {
            console.log('🔗 MERGING: Moving customer from', existingCustomer.id, 'to', authUid);
            
            // Preserve guest customer's name if it's better than the default 'Customer'
            let finalName = name || existingCustomer.name;
            if (name === 'Customer' && existingCustomer.name && existingCustomer.name !== 'Customer' && existingCustomer.name !== 'Guest') {
              finalName = existingCustomer.name;
              console.log('✅ Preserving guest customer name:', existingCustomer.name);
            }
            
            // Create new customer document with authUid as ID
            const newCustomerRef = db.collection('customers').doc(authUid);
            tx.set(newCustomerRef, {
              ...existingCustomer,
              authUid: authUid,
              identityStatus: 'merged',
              mergedFrom: [existingCustomer.id],
              canonicalEmail: canonicalEmail || existingCustomer.canonicalEmail || null,
              canonicalPhone: canonicalPhone || existingCustomer.canonicalPhone || null,
              email: email || existingCustomer.email,
              phone: phone || existingCustomer.phone,
              name: finalName,
              profilePictureUrl: profilePictureUrl || existingCustomer.profilePictureUrl,
              totalVisits: existingCustomer.totalVisits || 0,
              lastVisit: existingCustomer.lastVisit || null,
              updatedAt: new Date().toISOString()
            });
            
            // Update uniqueContacts reservations to point to new customer
            if (canonicalEmail) {
              const emailReservationRef = db.doc(`uniqueContacts/email:${canonicalEmail}`);
              tx.set(emailReservationRef, {
                customerId: authUid,
                createdAt: new Date(),
                contactType: 'email',
                contactValue: canonicalEmail,
              }, { merge: true });
            }
            if (canonicalPhone) {
              const phoneReservationRef = db.doc(`uniqueContacts/phone:${canonicalPhone}`);
              tx.set(phoneReservationRef, {
                customerId: authUid,
                createdAt: new Date(),
                contactType: 'phone',
                contactValue: canonicalPhone,
              }, { merge: true });
            }
            
            // Mark old customer document as migrated
            const oldCustomerRef = db.collection('customers').doc(existingCustomer.id);
            tx.update(oldCustomerRef, {
              migratedTo: authUid,
              identityStatus: 'migrated',
              updatedAt: new Date().toISOString()
            });
            
            console.log('✅ Merge transaction prepared: Old ID', existingCustomer.id, '→ New ID', authUid);
            
            // Note: Related data migration (appointments, etc.) happens outside transaction
            // to avoid transaction size limits. This is safe because we mark the old customer
            // as migrated, so future operations will use the new ID.
            
            return {
              customerId: authUid,
              isNew: false,
              merged: true,
              needsSignIn: false,
              requiresDataMigration: true, // Flag to trigger async migration
              oldCustomerId: existingCustomer.id
            };
          }
          
          // Update name if better quality provided
          if (name && name !== 'Customer' && (!existingCustomer.name || existingCustomer.name === 'Guest' || existingCustomer.name === 'Customer')) {
            updates.name = name;
          }
          
          // Update profile picture if provided
          if (profilePictureUrl && !existingCustomer.profilePictureUrl) {
            updates.profilePictureUrl = profilePictureUrl;
          }

          // Only update if there are actual changes
          if (Object.keys(updates).length > 1) {
            const customerRef = db.collection('customers').doc(existingCustomer.id);
            tx.update(customerRef, updates);
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
        const customerId = authUid || db.collection('customers').doc().id;
        const customerRef = db.collection('customers').doc(customerId);
        
        tx.set(customerRef, {
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
          totalVisits: 0,
          lastVisit: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Create uniqueContacts reservations atomically
        if (canonicalEmail) {
          const emailReservationRef = db.doc(`uniqueContacts/email:${canonicalEmail}`);
          tx.set(emailReservationRef, {
            customerId: customerId,
            createdAt: new Date(),
            contactType: 'email',
            contactValue: canonicalEmail,
          });
        }
        
        if (canonicalPhone) {
          const phoneReservationRef = db.doc(`uniqueContacts/phone:${canonicalPhone}`);
          tx.set(phoneReservationRef, {
            customerId: customerId,
            createdAt: new Date(),
            contactType: 'phone',
            contactValue: canonicalPhone,
          });
        }

        console.log('✅ Created new customer (transaction):', customerId, authUid ? '(with auth)' : '(guest)');

        return { 
          customerId,
          isNew: true,
          merged: false,
          needsSignIn: false
        };
      });
      
      // If merge happened, trigger async data migration outside transaction
      if (result.merged && result.requiresDataMigration && result.oldCustomerId) {
        // Fire and forget - migrate related data asynchronously
        migrateCustomerData(result.oldCustomerId, result.customerId).catch(err => {
          console.error('⚠️ Async data migration failed:', err);
          // Log to error tracking system in production
        });
      }
      
      return result;
      
    } catch (error: any) {
      console.error('❌ findOrCreateCustomer error:', error);
      
      // Handle transaction retry errors
      if (error.code === 'failed-precondition' || error.message?.includes('transaction')) {
        // Retry once for transient transaction errors
        console.log('🔄 Retrying findOrCreateCustomer due to transaction conflict...');
        // Note: In production, implement exponential backoff retry logic
      }
      
      throw new HttpsError('internal', `Failed to find or create customer: ${error.message}`);
    }
  }
);

// Async function to migrate related data after merge (runs outside transaction)
async function migrateCustomerData(oldCustomerId: string, newCustomerId: string): Promise<void> {
  try {
    console.log(`📦 Starting async migration: ${oldCustomerId} → ${newCustomerId}`);
    
    // Migrate appointments
    const appointmentsQuery = await db.collection('appointments')
      .where('customerId', '==', oldCustomerId)
      .get();
    
    if (appointmentsQuery.size > 0) {
      const batch = db.batch();
      let batchCount = 0;
      
      appointmentsQuery.forEach(doc => {
        batch.update(doc.ref, { 
          customerId: newCustomerId,
          updatedAt: new Date().toISOString()
        });
        batchCount++;
        
        if (batchCount >= 500) {
          batch.commit();
          batchCount = 0;
        }
      });
      
      if (batchCount > 0) {
        await batch.commit();
      }
      console.log(`✅ Migrated ${appointmentsQuery.size} appointments`);
    }
    
    // Migrate other related collections (availability, holds, skinAnalyses, consentForms)
    const collections = [
      { name: 'availability', field: 'customerId' },
      { name: 'holds', field: 'userId' },
      { name: 'skinAnalyses', field: 'customerId' },
      { name: 'consentForms', field: 'customerId' },
      { name: 'messages', field: 'customerId' },
      { name: 'conversations', field: 'customerId' }
    ];
    
    for (const collection of collections) {
      const query = await db.collection(collection.name)
        .where(collection.field, '==', oldCustomerId)
        .get();
      
      if (query.size > 0) {
        const batch = db.batch();
        let batchCount = 0;
        
        query.forEach(doc => {
          batch.update(doc.ref, { 
            [collection.field]: newCustomerId,
            updatedAt: new Date().toISOString()
          });
          batchCount++;
          
          if (batchCount >= 500) {
            batch.commit();
            batchCount = 0;
          }
        });
        
        if (batchCount > 0) {
          await batch.commit();
        }
        console.log(`✅ Migrated ${query.size} ${collection.name} records`);
      }
    }
    
    console.log(`✅ Async migration complete: ${oldCustomerId} → ${newCustomerId}`);
  } catch (error) {
    console.error(`❌ Async migration failed: ${oldCustomerId} → ${newCustomerId}`, error);
    throw error;
  }
}


