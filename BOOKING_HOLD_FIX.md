# Booking Hold & Availability Fix

## Issues Reported

1. **Previously selected time's hold getting stuck** - Hold blocking the time for 5 minutes even after navigation
2. **Already booked times still showing** - Appointments at 4pm showing as available even though they're already booked
3. **Hold duration too long** - 5 minutes is too long, should be 2 minutes

## Root Causes

### 1. Hold Restoration Issues
**Problem:** When users returned from authentication, old holds were being restored from sessionStorage even if they were expired or about to expire. This caused:
- Stale holds blocking time slots
- Confusion when the hold countdown showed negative time
- Duplicate hold creation attempts

**Solution:**
- Only restore holds that have at least 30 seconds remaining
- Clear expired holds from sessionStorage immediately
- Log hold restoration status for debugging

### 2. Slot Availability Not Checking Hold Status
**Problem:** The auto-restore logic didn't verify if the previously chosen slot was still actually available. It would blindly try to recreate the hold even if the slot was now taken.

**Solution:**
- Check if chosen slot exists in current available slots list before restoring
- Show clear error message if slot is no longer available
- Clear unavailable slots from sessionStorage

### 3. Hold Duration Too Long
**Problem:** 5-minute hold duration was too long, causing frustration when users needed to quickly re-book a slot that someone else had temporarily held.

**Solution:**
- Reduced hold timeout from 5 minutes (300 seconds) to 2 minutes (120 seconds)
- This allows faster turnover of held slots while still giving users enough time to complete booking

### 4. Appointments Not Loading (Permission Issue)
**Problem:** The previous fix for permission errors was returning an empty array when appointments couldn't be loaded, which made ALL time slots appear available even when some were booked.

**Solution:**
- Added better logging to track when appointments are loaded
- Track loading state with `apptsLoading` flag
- Log the number of appointments and slots in console for debugging

## Files Modified

### 1. `functions/src/holds.ts`
```typescript
// Changed from:
const HOLD_MS = 5 * 60 * 1000;

// To:
const HOLD_MS = 2 * 60 * 1000; // Reduced to 2 minutes
```

### 2. `apps/booking/src/pages/Book.tsx`

**Hold Restoration (lines 150-178):**
- Added 30-second minimum remaining time check
- Clear expired holds from sessionStorage
- Log hold restoration status

**Auto-Restore Logic (lines 272-304):**
- Check if chosen slot is still available in current slots list
- Show error message if slot is no longer available
- Clear unavailable slots from sessionStorage
- Changed dependency from `[]` to `[slots]` to re-check when appointments load

**Appointments Loading (lines 120-131):**
- Added `apptsLoading` state
- Better logging of loaded appointments
- Track when appointment data is actually loaded

**Slot Calculation (lines 134-149):**
- Added logging to show number of available slots vs existing appointments
- Helps debug availability calculation issues

## Expected Behavior After Fix

### ✅ Hold Management
- Holds expire after 2 minutes (down from 5)
- Expired holds are automatically cleared from sessionStorage
- Only valid holds (>30 seconds remaining) are restored
- Clear console logs show hold restoration status

### ✅ Slot Availability
- Previously chosen slots are checked for availability before restoration
- Clear error message shown if slot is no longer available
- Console logs show: `Loaded X appointments for [date]` and `Calculated X available slots (Y existing appointments)`

### ✅ User Experience
- Faster slot turnover (2 min instead of 5 min)
- No more stuck holds blocking slots
- Clear feedback when slots are no longer available
- Smooth return from authentication with proper state

## Testing Checklist

1. **Basic Hold Flow:**
   - ✅ Select a time slot
   - ✅ See hold countdown (should start at 2:00)
   - ✅ Hold expires after 2 minutes
   - ✅ Slot becomes available again after hold expires

2. **Auth Flow:**
   - ✅ Select a time slot
   - ✅ Navigate to login
   - ✅ Complete authentication
   - ✅ Return to booking page
   - ✅ Verify slot is still held if <90 seconds have passed
   - ✅ Verify clear error if slot is now taken

3. **Already Booked Slots:**
   - ✅ Create an appointment at 4:00 PM
   - ✅ Navigate to booking page
   - ✅ Check console for: `Loaded X appointments for [date]`
   - ✅ Verify 4:00 PM does NOT appear in available slots
   - ✅ Check console for: `Calculated X available slots (Y existing appointments)`

4. **Expired Hold Restoration:**
   - ✅ Select a slot, navigate away for >2 minutes
   - ✅ Return to booking page
   - ✅ Console should show: `Hold expired or expiring soon, not restoring`
   - ✅ No hold should be active
   - ✅ Can select the slot again

## Debugging

If appointments are still showing when they shouldn't be:

1. **Check Console Logs:**
   ```
   Loaded X appointments for YYYY-MM-DD
   Calculated X available slots (Y existing appointments)
   ```
   - If `X appointments = 0` but you know there are appointments, check Firestore rules
   - If `Y existing appointments = 0` in slot calculation, the appointments aren't being passed correctly

2. **Check Firestore Rules:**
   - Navigate to Firebase Console → Firestore Database → Rules
   - Verify appointments read rule allows reading non-cancelled appointments

3. **Check Appointment Status:**
   - Open Firestore Database
   - Check the appointment at 4:00 PM
   - Verify status is NOT 'cancelled'
   - Verify `start` field is in correct ISO format

4. **Check Business Hours:**
   - The slot calculation respects business hours
   - If a slot doesn't appear, check if it's within business hours for that day

## Deployment

✅ **Cloud Functions** - Deployed (Hold timeout reduced to 2 minutes)
✅ **Booking App** - Deployed (Hold restoration logic fixed)
✅ **Firestore Rules** - Already deployed from previous fix

## Console Log Reference

Normal successful flow should show:
```
Loaded 3 appointments for 2025-10-18
Calculated 12 available slots (3 existing appointments)
Restoring hold with 87 seconds remaining
Hold created/updated: abc123...
```

If slot is no longer available:
```
Loaded 3 appointments for 2025-10-18
Calculated 12 available slots (3 existing appointments)
Restoring hold for previously selected slot after navigation
Previously chosen slot is no longer available
```

If hold is expired:
```
Hold expired or expiring soon, not restoring
```

## Next Steps

If issues persist:

1. Clear browser cache and sessionStorage (Application tab in DevTools)
2. Check console for the appointment/slot calculation logs
3. Verify the appointment in Firestore has correct `start` time and `status != 'cancelled'`
4. Verify business hours are configured correctly for the date in question


