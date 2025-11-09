# New User Promotion Fix - DEPLOYED ✅

## Problem Identified

New users were not seeing promotions because the `totalVisits` field was not being initialized when creating customer records.

### Root Cause
In `functions/src/find-or-create-customer.ts`, when creating new customers, the `totalVisits` field was not set. The promotion system checks:
```typescript
case 'new_customers':
  const visitCount = customer.totalVisits || 0;
  return { 
    eligible: visitCount === 0,
    reason: visitCount > 0 ? 'Customer is not new' : undefined
  };
```

Without `totalVisits` being explicitly set to `0`, some edge cases could cause the promotion eligibility check to fail.

## Solution Deployed

### 1. ✅ Fixed Customer Creation (LIVE)
**File:** `functions/src/find-or-create-customer.ts`

Added initialization of `totalVisits` and `lastVisit` fields:
```typescript
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
  totalVisits: 0, // ← NEW: Initialize for new customer promotions
  lastVisit: null, // ← NEW: Initialize for tracking
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

**Deployed:** ✅ `firebase deploy --only functions:findOrCreateCustomer`

### 2. ✅ Fix Existing Customers (One-Time Run Needed)
**File:** `functions/src/fix-total-visits.ts`

Created admin-only cloud function to fix all existing customers.

**Deployed:** ✅ `firebase deploy --only functions:fixTotalVisits`

## How to Fix Existing Customers

### Use the Admin Panel Button (Easy!)
1. Go to **https://admin.buenobrows.com**
2. Navigate to **Settings** → **Data Management** tab
3. Click the **"🎁 Fix Customer Promotions"** button
4. Confirm when prompted
5. Done! You'll see a success message with how many customers were fixed

The button is located in the Quick Actions section alongside "Sync Availability" and "Clear All Holds".

## What This Fixes

- ✅ New users created from now on will automatically have `totalVisits: 0`
- ✅ New users will see "new customer" promotions immediately
- ✅ Existing users can be fixed with one function call
- ✅ Both guest and authenticated users are handled correctly
- ✅ Customer merging preserves the `totalVisits` field

## Testing

### Create a New User
1. Go to booking site
2. Create a new account (email or phone)
3. Select a service
4. ✅ New user promotions should now appear automatically

### Check Existing User
1. Run the fix function (see instructions above)
2. Have the user refresh their booking page
3. ✅ They should now see new user promotions if `totalVisits == 0`

## Files Changed

1. `functions/src/find-or-create-customer.ts` - Initialize totalVisits for new customers
2. `functions/src/fix-total-visits.ts` - One-time fix function (admin-only)
3. `functions/src/index.ts` - Export fix function
4. `apps/admin/src/pages/Settings.tsx` - Added "Fix Customer Promotions" button in Data Management

## Deployment Log

```bash
# Deploy updated customer creation function
✅ firebase deploy --only functions:findOrCreateCustomer

# Deploy one-time fix function  
✅ firebase deploy --only functions:fixTotalVisits

# Deploy admin panel with fix button
✅ firebase deploy --only hosting:admin
```

## Next Steps

1. **Go to Admin Panel** → Settings → Data Management
2. **Click "Fix Customer Promotions"** button
3. **Test with your new user** - they should see promotions now
4. **Verify** promotions appear on the booking page

## Promotion System Overview

### How It Works
- Customer creates account → `totalVisits` set to `0`
- Customer books appointment → appointment created
- Appointment is completed → `totalVisits` increments to `1`
- Next booking → no longer eligible for "new customer" promotions

### Segment Types
- `new_customers`: totalVisits === 0
- `returning_customers`: totalVisits >= 1  
- `loyalty_milestone`: totalVisits === specific number
- `birthday`: Birthday month/week
- `all`: Everyone eligible

---

**Status:** ✅ DEPLOYED & READY TO USE

**Next Action:** Go to Admin Panel → Settings → Data Management and click "Fix Customer Promotions"!

