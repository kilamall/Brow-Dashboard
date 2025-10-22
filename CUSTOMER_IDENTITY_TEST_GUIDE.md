# 🧪 Customer Identity System - Testing Guide

## ✅ Deployment Complete!

**URLs**:
- **Booking Site**: https://bueno-brows-7cce7.web.app
- **Admin Panel**: https://bueno-brows-admin.web.app

**Deployed Functions**:
- ✅ `findOrCreateCustomer` - Customer identity system
- ✅ `migrateCustomerIdentities` - Data migration
- ✅ `trainAIFromAdminMessages` - AI training
- ✅ `generateAIResponse` - AI messaging
- ✅ `getFlaggedMessages` - AI review
- ✅ `markMessageReviewed` - AI review

**Deployed Indexes**:
- ✅ Firestore composite indexes
- ✅ Single-field indexes (auto-created)

---

## 🧪 Test Scenarios

### Test 1: Admin Creates Appointment → Customer Signs Up (Email)

**Goal**: Verify automatic account merging when customer signs up after admin creates appointment.

**Steps**:

1. **As Admin** (https://bueno-brows-admin.web.app):
   ```
   Login → Schedule → Click on date/time
   Create appointment:
   - Email: test1@example.com
   - Name: Test Customer One
   - Service: Any service
   - Click "Create Appointment"
   ```

2. **Verify in Firestore**:
   ```
   Firebase Console → Firestore → customers collection
   
   You should see a new customer:
   - email: "test1@example.com"
   - canonicalEmail: "test1@example.com"
   - identityStatus: "guest"
   - authUid: null
   ```

3. **As Customer** (https://bueno-brows-7cce7.web.app):
   ```
   Click "Sign Up"
   Enter:
   - Email: test1@example.com (SAME EMAIL!)
   - Password: password123
   - Name: Test Customer One
   - Click "Sign Up"
   
   Expected: Alert "Welcome back! Your previous bookings have been linked..."
   ```

4. **Verify Merge**:
   ```
   Browser console should show:
   "✅ Merged existing customer record with new auth account"
   
   Firestore → customers → find customer
   - email: "test1@example.com"
   - canonicalEmail: "test1@example.com"
   - identityStatus: "merged" ← Changed!
   - authUid: "abc123..." ← Now populated!
   ```

5. **Check My Bookings**:
   ```
   Navigate to "My Bookings" tab
   
   Expected: Admin-created appointment appears!
   If you see "You haven't made a booking yet" → TEST FAILED
   ```

**✅ Success Criteria**:
- Customer sees merge alert
- identityStatus changed to "merged"
- authUid field populated
- Appointment visible in "My Bookings"

---

### Test 2: Admin Creates Appointment → Customer Signs Up (Google)

**Goal**: Verify Google Auth also triggers automatic merging.

**Steps**:

1. **As Admin**:
   ```
   Create appointment:
   - Email: yourgmail@gmail.com (USE YOUR ACTUAL GMAIL!)
   - Name: Your Name
   - Service: Any service
   ```

2. **As Customer**:
   ```
   Click "Continue with Google"
   Select your Google account
   
   Expected: Merge alert if email matches
   ```

3. **Verify**:
   ```
   Check "My Bookings" → Should see admin-created appointment
   Check console → Should see "✅ Merged existing customer record"
   ```

**✅ Success Criteria**:
- Google auth works
- Merge happens if email matches
- Appointment visible

---

### Test 3: Customer Books First → Admin Creates Another

**Goal**: Verify customer can self-book then admin can add more.

**Steps**:

1. **As Customer**:
   ```
   Sign up: test2@example.com / password123
   Book an appointment through normal flow
   Navigate to "My Bookings" → See your appointment
   ```

2. **As Admin**:
   ```
   Create appointment for: test2@example.com
   (SAME EMAIL as customer used)
   ```

3. **As Customer** (refresh page):
   ```
   Check "My Bookings"
   
   Expected: BOTH appointments visible
   - The one you booked yourself
   - The one admin created for you
   ```

**✅ Success Criteria**:
- Both appointments on same customer
- No duplicate customer records
- All appointments visible in dashboard

---

### Test 4: Phone Auth Creates Customer Record

**Goal**: Verify phone/SMS verification properly creates customer.

**Steps**:

1. **As Customer**:
   ```
   Go to booking site
   Click "Sign Up"
   Switch to "Phone" tab
   Enter: Your actual phone number
   Enter name
   Click "Send Code"
   
   Check your phone for SMS code
   Enter code
   Click "Verify"
   
   Expected: Signed in successfully
   ```

2. **Verify in Firestore**:
   ```
   Firestore → customers
   
   Should see customer with:
   - phone: "5551234567"
   - canonicalPhone: "+15551234567"
   - authUid: "abc123..."
   - identityStatus: "auth"
   ```

3. **Book Appointment**:
   ```
   Book an appointment
   Navigate to "My Bookings"
   
   Expected: Appointment appears!
   ```

**✅ Success Criteria**:
- Phone auth works
- Customer record created
- canonicalPhone normalized
- Appointments tracked correctly

---

### Test 5: Duplicate Prevention (Same Email, Different Casing)

**Goal**: Verify canonical email prevents duplicates.

**Steps**:

1. **As Admin**:
   ```
   Create appointment for: test@example.com
   ```

2. **As Admin** (again):
   ```
   Create appointment for: TEST@EXAMPLE.COM
   (Different casing, same email)
   ```

3. **Verify in Firestore**:
   ```
   Firestore → customers
   
   Expected: Only ONE customer with canonicalEmail: "test@example.com"
   
   Both appointments should have same customerId
   ```

4. **As Customer**:
   ```
   Sign up with: TeSt@ExAmPlE.cOm
   (Mixed casing)
   
   Expected: Merge alert
   Check "My Bookings" → See BOTH appointments
   ```

**✅ Success Criteria**:
- Only one customer record created
- canonicalEmail normalized to lowercase
- Both appointments linked to same customer

---

### Test 6: Phone Normalization

**Goal**: Verify phone number normalization prevents duplicates.

**Steps**:

1. **As Admin**:
   ```
   Create appointment with phone: (555) 123-4567
   ```

2. **As Admin** (again):
   ```
   Create appointment with phone: 555-123-4567
   (Different format, same number)
   ```

3. **Verify in Firestore**:
   ```
   Should be same customer:
   - canonicalPhone: "+15551234567"
   - Both appointments on same customer
   ```

**✅ Success Criteria**:
- Single customer record
- Phone normalized to E.164 format
- Both appointments linked

---

## 🔍 How to Debug

### Check Browser Console

Look for these logs:

**Good Signs** ✅:
```javascript
"✅ Found customer by phone: +15551234567"
"✅ Merged existing customer record with new auth account"
"✅ Created new customer: abc123 (with auth)"
"✅ Fetched 1 appointments for customer abc123"
```

**Bad Signs** ❌:
```javascript
"No customer record found for uid: abc123"
"Failed to create customer record"
"Error calling findOrCreateCustomer"
```

### Check Firestore

**Navigate to**:
```
Firebase Console → Firestore Database
```

**Check `customers` collection**:
- Each customer should have:
  - `canonicalEmail` (lowercase) OR `canonicalPhone` (+15551234567)
  - `authUid` (if signed up) OR null (if admin-created)
  - `identityStatus`: "guest", "auth", or "merged"

**Check `appointments` collection**:
- Each appointment should have:
  - `customerId` matching a customer document
  - `customerEmail` and/or `customerPhone`

### Check Cloud Functions Logs

```bash
firebase functions:log --only findOrCreateCustomer
```

Look for:
```
"✅ Found customer by phone: +15551234567"
"✅ Updated existing customer: abc123"
"✅ Created new customer: xyz789 (guest)"
```

---

## ❌ Common Issues & Fixes

### Issue: "No customer record found for uid"

**Cause**: Customer document not created during sign-up

**Fix**: 
- Check browser console for errors
- Verify `findOrCreateCustomer` function deployed
- Check Cloud Functions logs for errors

### Issue: Duplicate customers created

**Cause**: Canonical normalization not working

**Fix**:
- Check Firestore indexes deployed
- Verify `canonicalEmail` and `canonicalPhone` fields exist
- Redeploy functions

### Issue: Appointments not showing in "My Bookings"

**Cause**: Customer ID mismatch

**Fix**:
- Check Firestore: appointment `customerId` matches customer document ID
- Verify customer has `authUid` field
- Check console logs for "No customer record found"

### Issue: Phone auth doesn't create customer

**Cause**: `findOrCreateCustomer` not called in phone auth flow

**Fix**:
- Check `Login.tsx` line ~310 for `findOrCreateCustomer` call
- Verify function deployed
- Check browser console for errors

---

## 📊 Success Indicators

After testing, you should see:

**In Firestore**:
- ✅ Customers have canonical fields (canonicalEmail/canonicalPhone)
- ✅ identityStatus accurately reflects state (guest/auth/merged)
- ✅ authUid populated for signed-up customers
- ✅ No duplicate customers with same email/phone

**In Browser**:
- ✅ Merge alerts shown when appropriate
- ✅ "My Bookings" shows all appointments
- ✅ No "Invalid time value" errors
- ✅ Console logs show successful customer operations

**In Cloud Functions Logs**:
- ✅ "Found customer by..." messages
- ✅ "Created/Updated customer" confirmations
- ✅ No 500 errors or exceptions

---

## 🎯 Next Steps After Testing

Once all tests pass:

1. **Merge to Main**:
   ```bash
   git checkout main
   git merge feature/enhanced-customer-identity
   git push origin main
   ```

2. **Monitor Production**:
   - Watch Cloud Functions logs for errors
   - Check for duplicate customer creation
   - Verify appointment tracking working

3. **Optional Enhancements**:
   - Implement multi-criteria dashboard query
   - Add A2P SMS booking integration
   - Train AI on admin messages

---

## 📞 Quick Test Commands

### Check deployed functions:
```bash
firebase functions:list
```

### Check recent logs:
```bash
firebase functions:log --lines 50
```

### Check Firestore data:
```bash
# In Firebase Console
https://console.firebase.google.com/project/bueno-brows-7cce7/firestore
```

---

**Happy Testing!** 🎉

If you find any issues, check:
1. Browser console
2. Cloud Functions logs
3. Firestore data structure
4. This guide's troubleshooting section

