# Google Auth Fix Plan - Customer Record Creation

## ✅ ROOT CAUSE IDENTIFIED

**The Issue**: The account `malikgriffin1@gmail.com` has **Multi-Factor Authentication (MFA) enabled** for the admin site. When trying to sign in to the booking site with Google Auth, Firebase returns `auth/multi-factor-auth-required` error.

**Why it works for admin but not booking:**
- Admin site has MFA handling implemented (can resolve MFA and verify TOTP codes)
- Booking site does NOT have MFA implemented
- Booking site should NOT support MFA (by design decision)

## Current Situation

1. **Google Auth works for Admin site** ✅ (has MFA support)
2. **Google Auth NOT working for Booking site** ❌ (no MFA support, account has MFA enabled)
3. **Current behavior**: Error message tells user to use email/password instead

## Problem Analysis

### Current Flow (Login.tsx):
```
1. User clicks "Sign in with Google"
2. Google popup authenticates ✅
3. Firebase auth succeeds ✅
4. Try to create/find customer record
   - If SUCCESS → navigate to booking
   - If FAILS → log error but STILL navigate ❌ PROBLEM
```

### The Issue:
- If customer creation fails, user is signed in but no customer record exists
- When they try to book, the booking flow might create a duplicate customer
- This leads to data integrity issues
- Also need to understand WHY it's failing for this specific account

## Questions to Answer First

1. **Why is it failing for `malikgriffin1@gmail.com` specifically?**
   - Rate limiting?
   - Transaction conflict?
   - Permissions issue?
   - Existing customer record with issues?
   - Network error?

2. **What error is actually being thrown?**
   - Need to see the actual error in console
   - Check Cloud Function logs

3. **Does the account work for admin but not booking?**
   - Same Firebase project?
   - Different permissions?
   - Different auth flow?

## Plan of Action

### Phase 1: Diagnose the Issue
1. ✅ Add detailed error logging (already done)
2. ⏳ Check browser console when signing in with `malikgriffin1@gmail.com`
3. ⏳ Check Firebase Cloud Function logs for `findOrCreateCustomer`
4. ⏳ Check if customer record already exists in Firestore
5. ⏳ Check for rate limiting or transaction conflicts

### Phase 2: Fix Customer Creation Strategy

**Option A: Make Customer Creation Required (Recommended)**
- If customer creation fails → Sign user out immediately
- Show clear error message
- Block navigation until customer record is created
- Pros: Prevents duplicate customers, ensures data integrity
- Cons: User experience is stricter

**Option B: Retry with Exponential Backoff**
- If customer creation fails → Retry up to 3 times
- If still fails → Sign out and show error
- Pros: Handles transient errors gracefully
- Cons: Slower failure case

**Option C: Allow Sign-in, Block Booking**
- Sign in succeeds
- But check customer record before allowing any booking
- If missing, show error and force retry
- Pros: Better UX for transient errors
- Cons: More complex state management

### Phase 3: Implementation

Based on diagnosis, implement one of the strategies:

**If it's a transient error (network, rate limit):**
- Implement retry logic with backoff
- Show loading state during retries
- After 3 retries, show error and sign out

**If it's a data conflict (existing customer):**
- Check if customer record exists but has issues
- Fix the existing record
- Implement merge logic properly

**If it's a permissions issue:**
- Check Firestore security rules
- Check Cloud Function permissions
- Ensure authenticated users can create customer records

### Phase 4: Prevent Duplicate Customers

Regardless of the fix:
1. Ensure `findOrCreateCustomer` is transaction-safe (already is ✅)
2. Ensure booking flow checks for existing customer before creating
3. Add validation to prevent duplicate customer creation
4. Add monitoring/alerting for duplicate detection

## Recommended Approach

**Go with Option A (Make Customer Creation Required)** because:
- Simplest and most reliable
- Prevents all duplicate customer scenarios
- Clear error messages to user
- Forces resolution of underlying issue

**Implementation:**
```typescript
// In handleGoogleAuth:
1. Google sign-in succeeds
2. Try to create customer record
3. If fails:
   - Sign user out immediately
   - Set error message with retry button
   - DO NOT navigate
   - Show clear error: "Failed to create your account. Please try again."
4. If succeeds:
   - Navigate normally
```

## Next Steps

1. **Get error details** - Run sign-in with `malikgriffin1@gmail.com` and capture:
   - Browser console errors
   - Network tab errors
   - Firebase Function logs

2. **Check existing data** - Query Firestore for:
   - Existing customer record for this email
   - Any conflicts in uniqueContacts collection
   - Rate limiting records

3. **Fix the root cause** - Based on what we find

4. **Implement the chosen strategy** - Make customer creation required

## Files to Modify

1. `apps/booking/src/pages/Login.tsx` - Handle customer creation failure
2. `apps/booking/src/App.tsx` - Maybe remove duplicate customer creation attempt
3. `functions/src/find-or-create-customer.ts` - Add better error handling/logging

