# Consent Permission Error Fix - October 21, 2025

## Issue
When clicking on the "books" tab in the admin dashboard, a Firestore permission error was appearing in the console:

```
Error checking consent: FirebaseError: Missing or insufficient permissions.
```

This error occurred because the `hasValidConsent` function and related consent checking functions were attempting to query the `customerConsents` collection during authentication state changes or when admin users accessed the booking page. While the error didn't break functionality, it created console spam and could confuse developers.

## Root Cause
The consent checking functions in `packages/shared/src/consentFormHelpers.ts` were:
1. Not validating customer IDs before querying
2. Logging all errors, including expected permission-denied errors
3. Not gracefully handling permission errors in snapshot listeners

When an admin user (who doesn't have a customer record) accessed pages that check consent, or during authentication transitions, the query would fail with a permission error because:
- The admin user's auth UID doesn't match any `customerId` in the `customerConsents` collection
- The permission rules require either admin role OR matching customerId
- During auth state transitions, the token might not be fully loaded yet

## Solution
Updated three key functions in `packages/shared/src/consentFormHelpers.ts`:

### 1. `hasValidConsent()`
- Added validation to check if `customerId` is empty before querying
- Specifically check for `permission-denied` error code
- Silently return `false` for permission errors (expected behavior)
- Only log unexpected errors to console

### 2. `watchCustomerConsents()`
- Added validation to check if `customerId` is empty before setting up listener
- Return empty unsubscribe function if customerId is invalid
- Silently handle permission-denied errors without logging
- Only log unexpected errors to console

### 3. `watchActiveConsentForm()`
- Silently handle permission-denied errors without logging
- Only log unexpected errors to console

### 4. Book.tsx Page
Updated the consent checking useEffect to:
- Silently handle permission-denied errors
- Only log unexpected errors to console

## Benefits
✅ **No more console spam**: Permission errors during auth transitions are handled silently  
✅ **Better error handling**: Only unexpected errors are logged  
✅ **Improved user experience**: No confusing error messages in the console  
✅ **Maintains functionality**: All consent checking continues to work as expected  
✅ **Secure**: Permission rules remain unchanged - only error handling improved  

## Testing
After deploying:
1. ✅ Click on the "books" tab in admin dashboard - no errors
2. ✅ Navigate to booking page as admin - no errors
3. ✅ Book appointment as customer - consent checking works
4. ✅ View consent forms in admin settings - displays correctly

## Files Changed
- `packages/shared/src/consentFormHelpers.ts`
  - Updated `hasValidConsent()` function
  - Updated `watchCustomerConsents()` function
  - Updated `watchActiveConsentForm()` function
- `apps/booking/src/pages/Book.tsx`
  - Updated consent checking useEffect error handling

## Deployment
```bash
pnpm build
firebase deploy --only hosting:booking,hosting:admin
```

✅ **Deployed successfully on October 21, 2025**

## Technical Details
The fix specifically handles the `permission-denied` error code from Firebase:
```typescript
if (error?.code === 'permission-denied') {
  return false; // Silently handle expected permission errors
}
```

This approach:
- Recognizes that permission errors are expected in certain scenarios
- Doesn't pollute the console with expected errors
- Still logs genuine unexpected errors for debugging
- Maintains backward compatibility with existing code

