# Email Verification Fix for Phone Auth Users

## Problem
When users signed in with a phone number and tried to add or update their email address via the Profile page, Firebase threw this error:

```
Firebase: Please verify the new email before changing email. (auth/operation-not-allowed)
```

This happened because the code was using `updateEmail()` directly, which Firebase doesn't allow without verification first - especially for phone-authenticated users.

## Solution
Updated the Profile page (`apps/booking/src/pages/Profile.tsx`) to use Firebase's `verifyBeforeUpdateEmail()` method instead of `updateEmail()`.

### Changes Made

1. **Added Import**: Added `verifyBeforeUpdateEmail` to the Firebase Auth imports

2. **Updated `handleSendEmailVerification` Function**: 
   - Now uses `verifyBeforeUpdateEmail()` which sends a verification email first
   - Only updates the email after the user clicks the verification link
   - Stores the pending email in localStorage to show a success message after verification

3. **Updated `handleUpdateEmail` Function**:
   - Also uses `verifyBeforeUpdateEmail()` for consistency
   - Provides better error handling for the `operation-not-allowed` error

### How It Works Now

1. **User enters their email** in the Profile page
2. **Clicks "Send Verification Email"**
3. **Receives an email** with a verification link
4. **Clicks the link** in their email
5. **Firebase automatically verifies and updates** the email
6. **User is redirected** back to their Profile page
7. **Success message displays** confirming the email was added/updated

### User Flow

#### For Phone Auth Users Adding Email:
1. Sign in with phone number
2. Go to Profile page
3. Enter email address
4. Click "Send Verification Email"
5. Check email inbox
6. Click verification link
7. Email is now added and verified ✓

#### For Users Updating Existing Email:
1. Go to Profile page (must have signed in recently)
2. Change email address
3. Click "Update Email"
4. Check new email inbox
5. Click verification link
6. Email is now updated and verified ✓

## Security Benefits

- **More Secure**: Ensures users own the email address before linking it to their account
- **Prevents Hijacking**: No one can add an email they don't control
- **Follows Best Practices**: Uses Firebase's recommended approach for email verification

## Technical Details

### Firebase Method Used
```typescript
await verifyBeforeUpdateEmail(user, newEmail, actionCodeSettings);
```

### Action Code Settings
```typescript
const actionCodeSettings = {
  url: `${window.location.origin}/profile`,
  handleCodeInApp: false,
};
```

This ensures users are redirected back to their Profile page after verification.

## Testing Recommendations

1. **Test Phone Auth → Email Addition**:
   - Sign in with phone number
   - Go to Profile
   - Add email address
   - Verify you receive the email
   - Click the verification link
   - Confirm email is added and verified

2. **Test Email Update**:
   - Sign in with existing account
   - Go to Profile
   - Change email address
   - Verify you receive the email at new address
   - Click the verification link
   - Confirm email is updated

3. **Test Error Cases**:
   - Try using an email already in use by another account
   - Try with invalid email format
   - Try without recent authentication (should prompt to re-authenticate)

## Files Modified

- `apps/booking/src/pages/Profile.tsx` - Main fix location

## Related Files (No Changes Needed)

- `apps/booking/src/pages/verify.tsx` - Already handles email verification properly
- `packages/shared/src/authHelpers.ts` - Magic link authentication (different flow)

## Status

✅ **Fixed** - Users can now successfully add email addresses to phone-authenticated accounts without errors.

