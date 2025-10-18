# Availability Collection Migration

## Overview

We've created a separate `availability` collection to improve privacy and security. Instead of exposing customer data (names, emails, phone numbers) to calculate available time slots, the booking page now reads from a lightweight `availability` collection that contains ONLY:

- `start` - ISO timestamp
- `end` - ISO timestamp  
- `status` - 'booked'
- `createdAt` - ISO timestamp

## What Changed

### 1. New Collection: `availability`
- **Public read access** - Anyone can see which time slots are taken
- **No customer data** - Only time slot information
- **Write-only via Cloud Functions** - Protected by server-side logic

### 2. Secure Appointments Collection
- **Private read access** - Only admins and appointment owners can read
- **Customer data protected** - Names, emails, phones are secure
- **Still used for everything else** - Just not for public availability checking

### 3. Automatic Sync
Two new Cloud Functions keep availability in sync:

#### `syncAvailabilityOnAppointmentChange`
- **Trigger:** Fires when any appointment document is written (created/updated)
- **Action:** Creates or updates the corresponding availability slot
- **Handles:** Cancelled appointments (removes from availability)

#### `cleanupAvailabilityOnAppointmentDelete`
- **Trigger:** Fires when an appointment is deleted
- **Action:** Removes the availability slot

### 4. Booking Flow Updates
The booking page now:
- Reads from `availability` collection (not `appointments`)
- Gets same functionality without exposing customer data
- Console logs show: `Loaded X booked slots` instead of `Loaded X appointments`

## Migration Steps

### ✅ Already Completed:
1. Created `availability` helpers and types
2. Updated Cloud Functions to write to availability when booking
3. Added triggers to sync availability on appointment changes
4. Updated booking page to read from availability
5. Updated Firestore security rules
6. Deployed everything to production

### 📋 One-Time Migration Needed:

**Sync existing appointments to availability:**

1. **Open the admin dashboard** and log in
2. **Open `sync-availability.html`** in your browser:
   ```
   file:///Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard/sync-availability.html
   ```
3. **Click "Sync Now"**
4. Wait for confirmation message

This will create availability slots for all existing appointments.

## Verification

After migration, check the booking page:

1. **Open browser console** (F12)
2. **Navigate to booking page**
3. **Look for logs:**
   ```
   Loaded X booked slots for YYYY-MM-DD
   Calculated Y available slots (X booked slots)
   ```
4. **Verify:**
   - Booked times (like 4pm if you have an appointment) should NOT appear
   - No permission errors
   - No customer data exposed

## Firestore Rules

### Before (Insecure):
```javascript
match /appointments/{id} {
  allow read: if true; // ❌ Exposes customer data
}
```

### After (Secure):
```javascript
match /appointments/{id} {
  allow read: if isAdmin() || 
    (request.auth != null && request.auth.uid == resource.data.customerId);
  // ✅ Only admins and owners can read
}

match /availability/{id} {
  allow read: if true; // ✅ No customer data exposed
  allow write: if false; // ✅ Cloud Functions only
}
```

## Benefits

### 🔒 Security
- Customer data no longer exposed to public
- Appointments collection properly secured
- Only time slot info is public

### ⚡ Performance
- Smaller documents to read (no customer data)
- Faster queries for availability
- Same functionality, better architecture

### 🎯 Maintainability
- Clear separation of concerns
- Automatic sync via triggers
- Easy to audit what's public vs private

## Troubleshooting

### If booked times still show as available:

1. **Check if sync completed:**
   - Open Firestore Database in Firebase Console
   - Look for `availability` collection
   - Should have entries matching your appointments

2. **Check console logs:**
   ```
   Loaded 0 booked slots for YYYY-MM-DD
   ```
   - If 0 slots but appointments exist, run the sync

3. **Re-run the sync:**
   - Open `sync-availability.html`
   - Log in as admin
   - Click "Sync Now"

### If permission errors occur:

1. **Check you're logged in as admin** in the browser
2. **Check Firestore rules deployed:**
   ```bash
   firebase deploy --only firestore:rules
   ```

### If booking page breaks:

1. **Clear browser cache** and reload
2. **Check console for errors**
3. **Verify `availability` collection exists** in Firestore

## Files Modified

- `packages/shared/src/availabilityHelpers.ts` - New
- `packages/shared/src/slotUtils.ts` - Added availability functions
- `functions/src/holds.ts` - Create availability on booking
- `functions/src/availability-sync.ts` - New triggers
- `functions/src/sync-availability-function.ts` - New admin function
- `apps/booking/src/pages/Book.tsx` - Read from availability
- `firebase.rules` - Secure appointments, public availability
- `sync-availability.html` - One-time migration tool

## Next Steps

1. ✅ Run the one-time sync (open `sync-availability.html`)
2. ✅ Verify booking page works correctly
3. ✅ Check that 4pm appointment doesn't show as available
4. ✅ Monitor console for any errors
5. ✅ All future appointments will sync automatically

## Questions?

- **Do I need to run the sync every time?** No, only once. Future appointments sync automatically.
- **What if I add an appointment manually in Firestore?** The trigger will sync it automatically.
- **Can I delete the availability collection and start over?** Yes, just re-run the sync.
- **Will this break my admin dashboard?** No, admin still reads from `appointments` collection.


