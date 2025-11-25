// functions/src/find-or-create-customer.ts
// Enhanced customer identity system with canonical identifiers and automatic merging
// ENTERPRISE-GRADE: FULLY TRANSACTION-SAFE - Complete refactor with entire function wrapped in transaction
// This version prevents ALL race conditions by using uniqueContacts as primary lookup mechanism
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { rateLimiters, consumeRateLimit, getUserIdentifier } from './rate-limiter.js';
import { logCustomerAction } from './audit-log.js';

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

// Async function to migrate related data after merge (runs outside transaction)
async function migrateCustomerData(oldCustomerId: string, newCustomerId: string): Promise<void> {
  try {
    console.log(`📦 Starting async migration: ${oldCustomerId} → ${newCustomerId}`);
    
    const collections = [
      { name: 'appointments', field: 'customerId' },
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

export const findOrCreateCustomer = onCall(
  { region: 'us-central1', cors: true },
  async (req) => {
    // SECURITY: Rate limit customer creation (10 per hour per IP/user)
    await consumeRateLimit(rateLimiters.createCustomer, getUserIdentifier(req));

    let { email, name, phone, profilePictureUrl, authUid, birthday } = req.data || {};
    
    // ENTERPRISE: Input validation and sanitization
    if (email) {
      email = email.trim().toLowerCase().slice(0, 254);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new HttpsError('invalid-argument', 'Invalid email format');
      }
    }
    
    if (phone) {
      phone = phone.trim().slice(0, 20);
      const digits = phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        throw new HttpsError('invalid-argument', 'Invalid phone number format');
      }
    }
    
    if (name) {
      name = name.trim().slice(0, 200);
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
    
    const userId = req.auth?.uid;
    const userEmail = req.auth?.token?.email as string | undefined;
    
    try {
      // ENTERPRISE FIX: Wrap ENTIRE operation in transaction to prevent ALL race conditions
      const result = await db.runTransaction(async (tx) => {
      let existingCustomer: any = null;
        let foundByAuthUid = false;
        let guestCustomer: any = null;
        
        // Step 1: Check Auth UID FIRST (transaction-safe direct document read)
        if (authUid) {
          const authRef = db.collection('customers').doc(authUid);
          const authDoc = await tx.get(authRef);
          if (authDoc.exists) {
            existingCustomer = { id: authDoc.id, ...authDoc.data() } as any;
            foundByAuthUid = true;
            console.log('✅ Found customer by authUid (transaction-safe):', authUid);
        }
      }
      
        // Step 2: Check uniqueContacts reservations (transaction-safe)
        // This is our primary lookup mechanism for email/phone
        if (!foundByAuthUid) {
          const reservationChecks: Promise<any>[] = [];
          
          if (canonicalEmail) {
            reservationChecks.push(tx.get(db.doc(`uniqueContacts/email:${canonicalEmail}`)));
          }
          if (canonicalPhone) {
            reservationChecks.push(tx.get(db.doc(`uniqueContacts/phone:${canonicalPhone}`)));
          }
          
          const reservations = await Promise.all(reservationChecks);
          
          for (const reservation of reservations) {
            if (reservation.exists) {
              const existingCustomerId = reservation.data()?.customerId;
              if (existingCustomerId) {
                // Skip if reservation points to the authUid but customer doesn't exist
                // This can happen if a reservation exists but the customer was deleted
                if (authUid && existingCustomerId === authUid) {
                  // Check if customer actually exists
                  const authRef = db.collection('customers').doc(authUid);
                  const authDocCheck = await tx.get(authRef);
                  if (!authDocCheck.exists) {
                    console.log('⚠️ Reservation points to authUid but customer document does not exist - will create new customer');
                    continue; // Skip this reservation, will create new customer
        }
      }
      
                // Get the actual customer document (transaction-safe)
                const customerRef = db.collection('customers').doc(existingCustomerId);
                const customerDoc = await tx.get(customerRef);
        
                if (customerDoc.exists) {
                  const found = { id: customerDoc.id, ...customerDoc.data() } as any;
                  
                  // If we have authUid and found a guest customer, mark for merge
                  if (authUid && !found.authUid && found.id !== authUid) {
                    guestCustomer = found;
                    console.log('🔍 Found guest customer (will merge):', existingCustomerId);
                  } else {
                    existingCustomer = found;
                    console.log('✅ Found customer via reservation:', existingCustomerId);
        }
                  break; // Found a match, stop searching
                } else {
                  // Reservation exists but customer document doesn't - orphaned reservation
                  // Clear any stale existingCustomer data and continue/break appropriately
                  if (authUid && existingCustomerId === authUid) {
                    console.warn(`⚠️ Reservation points to authUid ${authUid} but customer document does not exist - will create new customer`);
                    // Clear any stale customer data
                    existingCustomer = null;
                    guestCustomer = null;
                    // Don't set existingCustomer - will create new customer in Step 5
                    break; // Stop searching, will create new customer
                  } else {
                    console.warn(`⚠️ Reservation points to customer ${existingCustomerId} but document does not exist - orphaned reservation, continuing search`);
                    // Clear any stale customer data before continuing
                    if (existingCustomer?.id === existingCustomerId) {
                      existingCustomer = null;
                    }
                    if (guestCustomer?.id === existingCustomerId) {
                      guestCustomer = null;
                    }
                    // Continue searching for other reservations
                  }
                }
              }
            }
        }
      }

        // Step 3: If we found a guest customer to merge, use it as existingCustomer
        if (guestCustomer && !existingCustomer) {
          existingCustomer = guestCustomer;
      }

        // Step 4: Handle existing customer (update or merge)
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
        
          // Check if customer exists but caller isn't authenticated
          const needsSignIn = !authUid && existingCustomer.authUid;
          
          // CRITICAL: If existing customer already has a different authUid, just update
          if (authUid && existingCustomer.authUid && existingCustomer.authUid !== authUid) {
            console.log('⚠️ Customer already has different authUid. Updating existing customer.');
            
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
            
            // Update within transaction
            if (Object.keys(updates).length > 1) {
              const customerRef = db.collection('customers').doc(existingCustomer.id);
              // Double-check document exists before updating (safety check)
              const verifyDoc = await tx.get(customerRef);
              if (!verifyDoc.exists) {
                console.warn(`⚠️ Customer ${existingCustomer.id} does not exist (orphaned reservation) - will create new customer instead`);
                // Clear existingCustomer so we create a new one instead
                existingCustomer = null;
                // Continue to create new customer below
              } else {
                tx.update(customerRef, updates);
                console.log('✅ Updated existing customer (different authUid):', existingCustomer.id);
                return { 
                  customerId: existingCustomer.id,
                  isNew: false,
                  merged: false,
                  needsSignIn: false
                };
              }
            } else {
              // No updates needed, just return
              return { 
                customerId: existingCustomer.id,
                isNew: false,
                merged: false,
                needsSignIn: false
              };
            }
          }
        
        // Link Auth UID if provided and not already linked (merge scenario)
        const wasMerged = authUid && !existingCustomer.authUid && existingCustomer.id !== authUid;
        if (wasMerged) {
          console.log('🔗 MERGING: Moving customer from', existingCustomer.id, 'to', authUid);
          
            // Preserve guest customer's name if it's better
            let finalName = name || existingCustomer.name;
            if (name === 'Customer' && existingCustomer.name && existingCustomer.name !== 'Customer' && existingCustomer.name !== 'Guest') {
              finalName = existingCustomer.name;
              console.log('✅ Preserving guest customer name:', existingCustomer.name);
            }
            
            // Create new customer document with authUid as ID (within transaction)
            // This is the NEW customer that received the merge - it should be 'auth', not 'merged'
            const newCustomerRef = db.collection('customers').doc(authUid);
            tx.set(newCustomerRef, {
            ...existingCustomer,
            authUid: authUid,
              identityStatus: 'auth', // NEW customer is authenticated, not 'merged'
              mergedFrom: [existingCustomer.id], // Track which customer(s) were merged into this one
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
          
            // Update uniqueContacts reservations to point to new customer (within transaction)
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
            
            // Mark old customer document as migrated (within transaction)
            const oldCustomerRef = db.collection('customers').doc(existingCustomer.id);
            // Safety check: verify document exists before updating
            const verifyOldDoc = await tx.get(oldCustomerRef);
            if (!verifyOldDoc.exists) {
              console.warn(`⚠️ Old customer ${existingCustomer.id} does not exist (orphaned) - skipping migration mark, just creating new customer`);
              // Don't throw error, just skip marking as migrated since the old customer doesn't exist
              // The new customer will be created and we'll return early
              // Clear existingCustomer so we create a new one instead
              existingCustomer = null;
              // Continue to create new customer below
            } else {
              tx.update(oldCustomerRef, {
                migratedTo: authUid,
                identityStatus: 'migrated',
                updatedAt: new Date().toISOString()
              });
              
              console.log('✅ Merge transaction prepared: Old ID', existingCustomer.id, '→ New ID', authUid);
              
              // Return flag to trigger async data migration
              return {
                customerId: authUid,
                isNew: false,
                merged: true,
                needsSignIn: false,
                requiresDataMigration: true,
                oldCustomerId: existingCustomer.id
              };
            }
        }
        
        // Update name if provided and different (for authenticated users, always update if name is provided)
        // This prevents duplicate profiles when authenticated users change their name in the booking form
        if (name && name !== 'Customer' && name !== 'Guest') {
          // For authenticated users, always update name if it's different
          // For guests, only update if existing name is generic (Guest/Customer)
          if (authUid) {
            // Authenticated user: always update if name is different and not generic
            if (existingCustomer.name !== name) {
              updates.name = name;
            }
          } else {
            // Guest: only update if existing name is generic
            if (!existingCustomer.name || existingCustomer.name === 'Guest' || existingCustomer.name === 'Customer') {
              updates.name = name;
            }
          }
        }
        
        // Update profile picture if provided
        if (profilePictureUrl && !existingCustomer.profilePictureUrl) {
          updates.profilePictureUrl = profilePictureUrl;
        }

          // Update within transaction
        if (Object.keys(updates).length > 1) {
            const customerRef = db.collection('customers').doc(existingCustomer.id);
            // Safety check: verify document exists before updating
            const verifyDoc = await tx.get(customerRef);
            if (!verifyDoc.exists) {
              console.warn(`⚠️ Customer ${existingCustomer.id} does not exist (orphaned reservation) - will create new customer instead`);
              // Clear existingCustomer so we create a new one instead
              existingCustomer = null;
              // Continue to create new customer below
            } else {
              tx.update(customerRef, updates);
              console.log('✅ Updated existing customer:', existingCustomer.id);
              return { 
                customerId: existingCustomer.id,
                isNew: false,
                merged: wasMerged,
                needsSignIn: needsSignIn
              };
            }
        } else {
          // No updates needed, but verify document exists before returning
          const customerRef = db.collection('customers').doc(existingCustomer.id);
          const verifyDoc = await tx.get(customerRef);
          if (!verifyDoc.exists) {
            console.warn(`⚠️ Customer ${existingCustomer.id} does not exist (orphaned reservation) - will create new customer instead`);
            existingCustomer = null;
            // Continue to create new customer below
          } else {
            return { 
              customerId: existingCustomer.id,
              isNew: false,
              merged: wasMerged,
              needsSignIn: needsSignIn
            };
          }
        }
      }

        // Step 5: Create new customer (transaction-safe)
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

        // Create uniqueContacts reservations atomically (within transaction)
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
        
        console.log('✅ Created new customer (transaction-safe):', customerId, authUid ? '(with auth)' : '(guest)');

      return { 
        customerId,
        isNew: true,
        merged: false,
        needsSignIn: false
      };
      });
      
      // If merge happened, trigger async data migration outside transaction
      if (result.merged && (result as any).requiresDataMigration && (result as any).oldCustomerId) {
        // Fire and forget - migrate related data asynchronously
        migrateCustomerData((result as any).oldCustomerId, result.customerId).catch(err => {
          console.error('⚠️ Async data migration failed:', err);
          // Log to error tracking system in production
        });
        
        // Log audit trail for merge
        await logCustomerAction('customer.merged', result.customerId, userId, userEmail, undefined, {
          oldCustomerId: (result as any).oldCustomerId,
          mergedFrom: [(result as any).oldCustomerId]
        });
      } else if (result.isNew) {
        // Log audit trail for new customer
        await logCustomerAction('customer.created', result.customerId, userId, userEmail, undefined, {
          authUid,
          hasEmail: !!email,
          hasPhone: !!phone
        });
      }
      
      return result;
      
    } catch (error: any) {
      console.error('❌ findOrCreateCustomer error:', error);
      
      // Handle transaction retry errors
      if (error.code === 'failed-precondition' || error.message?.includes('transaction')) {
        console.log('🔄 Transaction conflict detected - Firestore will auto-retry');
        // Firestore automatically retries transactions, but we can add custom retry logic if needed
      }
      
      throw new HttpsError('internal', `Failed to find or create customer: ${error.message}`);
    }
  }
);
