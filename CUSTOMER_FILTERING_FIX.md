# Customer Filtering Fix - Comprehensive Solution

## 🎯 **Problem Summary**

1. **Duplicates showing**: Customers with "Merged" (blue) badge were appearing in the list
2. **Appointment modal broken**: Not finding customers because it used `orderBy('name')` which excludes customers without names
3. **Inconsistent filtering**: Different filtering logic in different places
4. **Luis missing**: Customer with appointment not showing up

## ✅ **Solution: Shared Filtering Logic**

Created a **single source of truth** for customer filtering that both the customer list and appointment modal use.

### **New File: `packages/shared/src/customerFilters.ts`**

This file contains three shared functions:
1. `filterActiveCustomers()` - Filters out truly merged customers
2. `sortCustomersByName()` - Sorts customers, handling missing names
3. `filterCustomersBySearch()` - Searches customers by name/email/phone

### **Key Changes:**

1. **Consistent Filtering Logic**
   - Only hides customers with `migratedTo` AND the target exists
   - If target doesn't exist, shows the customer (might be incorrectly marked)
   - Same logic used everywhere

2. **Fixed Appointment Modal**
   - Removed `orderBy('name')` which was excluding customers without names
   - Now uses the same filtering logic as the customer list
   - Fetches all customers, then filters client-side

3. **Fixed Customer List**
   - Uses shared filtering functions
   - Consistent behavior across the app

## 📋 **How It Works**

### Filtering Rules:
- ✅ **Show**: Customers with no `migratedTo`
- ✅ **Show**: Customers with `migratedTo` but target doesn't exist (incorrectly marked)
- ❌ **Hide**: Customers with `migratedTo` AND target exists (truly merged)

### Sorting:
- Customers with names sorted alphabetically
- Customers without names placed at the end

### Search:
- Searches name, email, and phone
- Case-insensitive
- Works on filtered list

## 🔧 **Files Modified**

1. ✅ `packages/shared/src/customerFilters.ts` - **NEW** - Shared filtering functions
2. ✅ `packages/shared/src/firestoreActions.ts` - Uses shared filters
3. ✅ `apps/admin/src/components/AddAppointmentModal.tsx` - Uses shared filters, removed `orderBy('name')`

## 🚀 **What This Fixes**

1. ✅ **Duplicates hidden**: Customers with valid `migratedTo` are now properly hidden
2. ✅ **Appointment modal works**: Can find all customers, including those without names
3. ✅ **Luis appears**: If he's not truly merged, he'll show up
4. ✅ **Consistent behavior**: Same filtering everywhere
5. ✅ **No breaking changes**: Existing functionality preserved

## 🧪 **Testing**

After deployment:
1. **Customer List**: Should not show duplicates with "Merged" badge
2. **Appointment Modal**: Should find all customers when typing
3. **Luis**: Should appear if he has an appointment and isn't truly merged
4. **Search**: Should work consistently in both places

## 📊 **Debug Query**

The debug query now:
- Shows which customers are filtered
- Finds customers via appointments
- Shows `identityStatus` and `migratedTo` for each customer

Use "Debug Query" button and search for "Luis" to see his status.


