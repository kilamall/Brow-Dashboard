# Enhanced Customer Identity System - Testing Guide

## Pre-Deployment Checklist

### 1. Build & Deploy Functions
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:findOrCreateCustomer,functions:migrateCustomerIdentities
```

### 2. Deploy Firestore Indexes
```bash
firebase deploy --only firestore:indexes
```
Wait 5-10 minutes for indexes to build before testing.

### 3. Run Data Migration
```javascript
// From browser console on admin panel
const functions = getFunctions();
const migrate = httpsCallable(functions, 'migrateCustomerIdentities');
const result = await migrate();
console.log(result.data);
```

Expected output:
```json
{
  "success": true,
  "message": "Customer identity migration complete",
  "total": 50,
  "migrated": 45,
  "skipped": 5,
  "errors": 0
}
```

### 4. Deploy Frontend
```bash
pnpm run build
firebase deploy --only hosting
```

## Test Scenarios

### Test 1: Admin Creates Appointment → Customer Signs Up (Primary Use Case)

**Goal**: Verify automatic account merging when customer signs up after admin creates appointment.

**Steps**:
1. As **Admin**:
   - Go to Schedule page
   - Create appointment for email: `test+merge@example.com`
   - Name: "Merge Test Customer"
   - Phone: "5551234567"
   - Service: Any service
   - Confirm appointment created

2. **Verify Firestore** (before sign up):
   ```
   customers/{randomId}:
     email: "test+merge@example.com"
     canonicalEmail: "test+merge@example.com"
     phone: "5551234567"
     canonicalPhone: "+15551234567"
     identityStatus: "guest"
     authUid: null
   ```

3. As **Customer**:
   - Go to booking site
   - Click "Sign Up"
   - Email: `test+merge@example.com`
   - Password: anything
   - Name: "Merge Test Customer"
   - Submit

4. **Expected Results**:
   - Alert: "Welcome back! Your previous bookings have been linked to your account."
   - Console log: "✅ Merged existing customer record with new auth account"
   - Redirected to /book page
   - Sign in successful

5. **Verify Firestore** (after sign up):
   ```
   customers/{authUid}:  ← Same customer, but doc ID now matches Auth UID
     email: "test+merge@example.com"
     canonicalEmail: "test+merge@example.com"
     phone: "5551234567"
     canonicalPhone: "+15551234567"
     identityStatus: "merged"  ← Changed from "guest"
     authUid: "{authUid}"      ← Now populated
   ```

6. **Verify My Bookings**:
   - Navigate to "My Bookings" tab
   - Should see admin-created appointment
   - Should NOT see "You haven't made a booking yet"

**Success Criteria**:
- ✅ Customer sees admin-created appointment
- ✅ Alert shown about linked bookings
- ✅ identityStatus changed to "merged"
- ✅ authUid field populated
- ✅ No duplicate customer records created

---

### Test 2: Google Auth with Existing Customer

**Goal**: Verify Google sign-in merges with existing customer.

**Steps**:
1. As **Admin**:
   - Create appointment for Gmail address: `yourname@gmail.com`

2. As **Customer**:
   - Click "Continue with Google"
   - Select Google account matching the email

3. **Expected Results**:
   - Signed in successfully
   - Console log: "✅ Merged existing customer record with Google account"
   - "My Bookings" shows admin-created appointment

**Success Criteria**:
- ✅ Google auth works
- ✅ Existing appointment visible
- ✅ No duplicate customer created

---

### Test 3: Duplicate Prevention (Same Email, Different Casing)

**Goal**: Verify canonical email prevents duplicates.

**Steps**:
1. As **Admin**:
   - Create appointment for: `test@example.com`

2. As **Admin** (again):
   - Create another appointment for: `TEST@EXAMPLE.COM`

3. **Expected Results**:
   - Console log: "✅ Found existing customer record"
   - Both appointments linked to SAME customer
   - Only ONE customer document in Firestore

**Success Criteria**:
- ✅ No duplicate customer created
- ✅ Both appointments on same customer
- ✅ canonicalEmail normalized to lowercase

---

### Test 4: Phone Normalization

**Goal**: Verify phone normalization prevents duplicates.

**Steps**:
1. As **Admin**:
   - Create appointment with phone: `(555) 123-4567`

2. As **Admin** (again):
   - Create appointment with phone: `555-123-4567`

3. As **Admin** (third time):
   - Create appointment with phone: `15551234567`

4. **Expected Results**:
   - All three use SAME customer
   - canonicalPhone: `+15551234567` for all

**Success Criteria**:
- ✅ One customer record, not three
- ✅ Phone normalized to E.164 format
- ✅ All appointments on same customer

---

### Test 5: New Customer Flow (No Existing Record)

**Goal**: Verify new customer creation still works.

**Steps**:
1. As **Customer**:
   - Sign up with completely new email: `newuser@example.com`
   - Password: anything
   - Name: "New User"

2. **Expected Results**:
   - Account created successfully
   - Console log: "✅ Created new customer"
   - NO merge alert (this is a new customer)

3. **Verify Firestore**:
   ```
   customers/{authUid}:
     email: "newuser@example.com"
     canonicalEmail: "newuser@example.com"
     identityStatus: "auth"
     authUid: "{authUid}"
   ```

**Success Criteria**:
- ✅ New customer created with Auth UID as document ID
- ✅ identityStatus: "auth"
- ✅ canonicalEmail populated
- ✅ No errors

---

### Test 6: Admin Creates Customer Then Admin Creates Another Appointment

**Goal**: Verify subsequent appointments link correctly.

**Steps**:
1. As **Admin**:
   - Create appointment for `repeat@example.com`
   - Note the customer ID created

2. As **Admin** (next day/week):
   - Create another appointment for same email: `repeat@example.com`
   
3. **Expected Results**:
   - Console log: "✅ Found existing customer record"
   - Second appointment linked to SAME customer
   - Customer dropdown shows existing customer

**Success Criteria**:
- ✅ Single customer with multiple appointments
- ✅ No duplicate customer created

---

### Test 7: Email + Phone Combined Lookup

**Goal**: Verify customer found by either email OR phone.

**Steps**:
1. As **Admin**:
   - Create appointment with:
     - Email: `combo@example.com`
     - Phone: `5559876543`

2. As **Admin** (later):
   - Create appointment with:
     - Email: (leave blank)
     - Phone: `555-987-6543` (same phone, different format)

3. **Expected Results**:
   - Console log: "✅ Found customer by phone: +15559876543"
   - Appointment linked to existing customer
   - Customer now has both email AND phone

**Success Criteria**:
- ✅ Found by phone even without email
- ✅ Single customer record
- ✅ Both email and phone on customer

---

### Test 8: Migration Function (Existing Data)

**Goal**: Verify migration adds canonical fields to old customers.

**Steps**:
1. **Check Existing Customer** (before migration):
   - Find customer in Firestore without `canonicalEmail`
   - Note their ID

2. **Run Migration**:
   ```javascript
   const result = await migrate();
   ```

3. **Check Same Customer** (after migration):
   - Should now have:
     - `canonicalEmail`: lowercase, trimmed
     - `canonicalPhone`: E.164 format (if phone existed)
     - `identityStatus`: "guest" or "auth"
     - `authUid`: populated if had userId

**Success Criteria**:
- ✅ All customers have canonical fields
- ✅ No errors in migration
- ✅ identityStatus set correctly

---

## Common Issues & Troubleshooting

### Issue: "Index not found" error

**Cause**: Firestore indexes not built yet

**Solution**: 
1. Run: `firebase deploy --only firestore:indexes`
2. Wait 5-10 minutes
3. Check Firebase Console → Firestore → Indexes
4. Wait for "Building..." to change to "Enabled"

---

### Issue: Customer not found after sign up

**Cause**: Possible auth UID mismatch

**Debug**:
1. Check browser console for Auth UID
2. Check Firestore customers collection
3. Verify document ID matches Auth UID
4. Check if `authUid` field is populated

---

### Issue: Duplicate customers created

**Cause**: Indexes not deployed or email/phone not normalized

**Debug**:
1. Check if indexes are enabled
2. Verify `canonicalEmail` is lowercase
3. Verify `canonicalPhone` is E.164 format
4. Check function logs for errors

---

### Issue: "merged" alert shown for new customer

**Cause**: Customer record already exists (not actually new)

**Debug**:
1. Search Firestore for email/phone
2. Check if admin created appointment first
3. This is actually correct behavior!

---

## Success Metrics

After full deployment and testing, verify:

- [ ] Zero duplicate customer records created in 24 hours
- [ ] All new sign-ups show "merged" or "created new customer" logs
- [ ] "My Bookings" shows appointments immediately after sign up
- [ ] Admin appointments correctly link to auth accounts
- [ ] No 404 or index errors in function logs
- [ ] Migration completed with 0 errors
- [ ] All indexes showing "Enabled" status

---

## Rollback Plan

If issues occur:

### Quick Rollback (Frontend Only)
```bash
git checkout homepage
pnpm run build
firebase deploy --only hosting
```

### Full Rollback (Functions + Frontend)
```bash
git checkout homepage
cd functions && npm run build && cd ..
firebase deploy --only functions,hosting
```

**Note**: Firestore indexes are safe to keep (they don't break old code).

---

## Post-Deployment Monitoring

### Check Function Logs
```bash
firebase functions:log --only findOrCreateCustomer
```

Look for:
- ✅ "Found customer by phone/email/authUid"
- ✅ "Merged existing customer record"
- ✅ "Created new customer"
- ❌ No "Internal Error" messages

### Check Firestore Metrics
Firebase Console → Firestore → Usage:
- Read operations should be similar (maybe +10%)
- Write operations should be similar
- Index usage should show new indexes active

---

**Last Updated**: October 22, 2025  
**Version**: 1.0  
**Status**: Ready for Testing

