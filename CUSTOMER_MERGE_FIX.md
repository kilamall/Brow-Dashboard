# Customer Merge Display Fix

## 🐛 **Issues Identified**

### Problem 1: Wrong `identityStatus` on Merged Customers
- **Issue**: When a guest customer was merged into an authenticated account, the NEW customer (the one that received the merge) was being marked with `identityStatus: 'merged'`
- **Expected**: The NEW customer should have `identityStatus: 'auth'` since it's the authenticated account
- **Impact**: Confusing status badges in the UI, customers showing "Merged" when they should show "Authenticated"

### Problem 2: Missing Visual Indicator for Merged Accounts
- **Issue**: Customers that received a merge (have `mergedFrom` array) had no visual indicator
- **Expected**: Show a "Merged Account" badge to indicate this customer received data from other accounts
- **Impact**: Admins couldn't tell which customers had received merges

### Problem 3: Filtering Logic Needed Clarification
- **Issue**: The filtering logic was correct but lacked clear comments and logging
- **Expected**: Better logging and comments to understand what's being filtered
- **Impact**: Harder to debug customer visibility issues

---

## ✅ **Fixes Applied**

### 1. Fixed `findOrCreateCustomer` Merge Logic
**File**: `functions/src/find-or-create-customer.ts`

**Change**: When creating the NEW customer document (the one that receives the merge):
- **Before**: `identityStatus: 'merged'`
- **After**: `identityStatus: 'auth'` (since it's the authenticated account)

**Code**:
```typescript
// Create new customer document with authUid as ID (within transaction)
// This is the NEW customer that received the merge - it should be 'auth', not 'merged'
const newCustomerRef = db.collection('customers').doc(authUid);
tx.set(newCustomerRef, {
  ...existingCustomer,
  authUid: authUid,
  identityStatus: 'auth', // NEW customer is authenticated, not 'merged'
  mergedFrom: [existingCustomer.id], // Track which customer(s) were merged into this one
  // ... rest of fields
});
```

### 2. Added "Merged Account" Badge to UI
**File**: `apps/admin/src/pages/Customers.tsx`

**Change**: Added a new badge that shows when a customer has `mergedFrom` array (meaning they received a merge)

**Code**:
```tsx
{/* Show "Merged Account" badge for customers that received a merge (have mergedFrom) */}
{(customer as any).mergedFrom && Array.isArray((customer as any).mergedFrom) && (customer as any).mergedFrom.length > 0 && (
  <span className="text-xs px-2 py-0.5 rounded border bg-purple-100 text-purple-700 border-purple-300" 
        title={`This account merged ${(customer as any).mergedFrom.length} previous account(s)`}>
    Merged Account
  </span>
)}
```

### 3. Enhanced Filtering Logic with Better Logging
**File**: `packages/shared/src/firestoreActions.ts`

**Change**: Added clearer comments and logging to understand what's being filtered

**Code**:
```typescript
// Filter out migrated customers to prevent confusion in admin UI
// Only hide customers that were migrated TO another customer that still exists
customers = customers.filter(customer => {
  // Hide customers that were merged FROM (migrated to another customer)
  // These are duplicates that should not be shown
  if (customer.migratedTo) {
    const targetExists = customerIds.has(customer.migratedTo);
    if (targetExists) {
      console.log(`[watchCustomers] Hiding migrated customer ${customer.id} (merged to ${customer.migratedTo})`);
      return false; // Hide this customer - it's a duplicate that was merged
    }
  }
  // Show all other customers (including 'auth' customers that received merges)
  return true;
});
```

---

## 📊 **How It Works Now**

### Customer Merge Flow:
1. **Guest books** → Creates customer with `identityStatus: 'guest'`
2. **Guest signs in with Google** → `findOrCreateCustomer` is called with `authUid`
3. **Merge happens**:
   - **OLD customer** (guest): Gets `identityStatus: 'migrated'` and `migratedTo: <authUid>`
   - **NEW customer** (authenticated): Gets `identityStatus: 'auth'` and `mergedFrom: [<oldId>]`
4. **Data migration**: All appointments, holds, etc. are moved to the NEW customer ID
5. **Display**:
   - **OLD customer**: Hidden from list (has `migratedTo`)
   - **NEW customer**: Shown with badges:
     - ✅ "Authenticated" (green badge)
     - ✅ "Merged Account" (purple badge) - if `mergedFrom` exists

---

## 🎯 **Status Badges Explained**

| Badge | Color | Meaning | When Shown |
|-------|-------|---------|------------|
| **Authenticated** | Green | Customer has authenticated account | `identityStatus === 'auth'` |
| **Merged** | Blue | Customer was merged FROM (old duplicate) | `identityStatus === 'migrated' && migratedTo` exists |
| **Merged Account** | Purple | Customer received a merge (has mergedFrom) | `mergedFrom` array exists and has items |

**Note**: Customers with "Merged" (blue) badge should be hidden from the list. If you see them, it's a bug.

---

## 🔍 **What to Look For**

### ✅ **Correct Behavior**:
- Customers with `identityStatus: 'migrated'` and `migratedTo` are **hidden** from the list
- Customers with `identityStatus: 'auth'` and `mergedFrom` show:
  - "Authenticated" badge (green)
  - "Merged Account" badge (purple) - indicates they received a merge
- Only one customer per email/phone appears in the list

### ❌ **Incorrect Behavior** (should not happen):
- Customers with "Merged" (blue) badge visible in the list
- Multiple customers with the same email/phone visible
- Customers with `identityStatus: 'merged'` (this status should not exist anymore)

---

## 🚀 **Next Steps**

1. **Deploy the changes** to fix existing merge logic
2. **Monitor** the customer list to ensure merged customers are properly hidden
3. **Check** that customers with `mergedFrom` show the purple "Merged Account" badge
4. **Verify** that no customers have `identityStatus: 'merged'` (should be 'auth' or 'migrated')

---

## 📝 **Files Modified**

1. ✅ `functions/src/find-or-create-customer.ts` - Fixed merge status
2. ✅ `apps/admin/src/pages/Customers.tsx` - Added "Merged Account" badge
3. ✅ `packages/shared/src/firestoreActions.ts` - Enhanced filtering with logging

---

## 🔧 **For Existing Data**

If you have existing customers with `identityStatus: 'merged'`, you may want to:
1. Find them: Query for `identityStatus === 'merged'`
2. Update them: Change to `identityStatus: 'auth'` if they have `authUid`, or investigate why they have this status

This fix ensures all future merges will have the correct status.


