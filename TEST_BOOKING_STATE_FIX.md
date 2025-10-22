# 🧪 Testing Guide: Booking State Restoration Fix

## Quick Test Instructions

### Test 1: Sign-In Flow (Main Issue)
This tests that the date and time selection persists after sign-in.

1. **Open the booking page** (not signed in)
   - Go to: https://your-site.web.app/book

2. **Select a service**
   - Click on any service (e.g., "Brow Shaping")
   - Service should show as selected with checkmark

3. **Select a date** (IMPORTANT: Pick a future date)
   - Click the date picker
   - Select a date **3-5 days from now** (this makes it easier to verify it wasn't reset)
   - Note the selected date

4. **Select a time slot**
   - Scroll through the available time slots
   - Click on a specific time (e.g., 2:00 PM)
   - Time should highlight in terracotta color
   - You should see "You're holding" section appear with countdown

5. **Click "Sign in to book"**
   - Scroll down to the booking form section
   - Click the orange "Sign in to book" button
   - You'll be redirected to the login page

6. **Sign in**
   - Enter your credentials and sign in
   - OR use phone authentication
   - After signing in, you'll be redirected back to /book

7. **VERIFY THE FIX** ✅
   - **Check the date:** Should still show the date you selected in step 3 (NOT today's date)
   - **Check the time:** Should still show the time you selected in step 4
   - **Look for the blue banner:** "Restoring your selection..." should appear briefly
   - **Auto-scroll:** Page should automatically scroll to the booking form
   - **Countdown timer:** Should show time remaining on your hold
   - **"You're holding" section:** Should be visible with your service and time

### What to Look For:
- ✅ **PASS:** Date matches what you selected (e.g., 3 days from now)
- ✅ **PASS:** Time matches what you selected (e.g., 2:00 PM)
- ✅ **PASS:** Blue "Restoring..." banner appears and disappears smoothly
- ✅ **PASS:** Page scrolls to booking form automatically
- ❌ **FAIL:** Date resets to today or "next available date"
- ❌ **FAIL:** Time slot is not selected
- ❌ **FAIL:** "Creating hold…" shows indefinitely without context

---

## Test 2: Guest Booking (Should Still Work)
This verifies we didn't break the guest booking flow.

1. Go to /book (not signed in)
2. Select service, date, and time
3. Click "Book as guest" (NOT "Sign in to book")
4. Fill out guest form with name, email, phone
5. Verify your contact info (email or phone)
6. Click "Confirm guest booking"
7. **Expected:** Booking should complete successfully

---

## Test 3: Multiple Services
Tests state persistence with multiple services selected.

1. Go to /book (not signed in)
2. Select **2-3 services** (e.g., Brow Shaping + Brow Tint)
3. Select a date and time
4. Note the total duration shown (e.g., "75 minutes")
5. Click "Sign in to book"
6. Sign in and return
7. **Verify:**
   - ✅ All selected services still selected
   - ✅ Total duration still correct
   - ✅ Date and time still selected

---

## Test 4: Page Refresh (State Persistence)
Tests that state survives a page refresh.

1. Go to /book
2. Select service, date, and time
3. **Refresh the page** (Cmd+R or Ctrl+R)
4. **Verify:**
   - ✅ Service selections preserved
   - ✅ Date preserved
   - ✅ Hold is re-created for the time slot
   - ✅ Blue "Restoring..." banner appears

---

## Test 5: Hold Expiration
Tests that expired holds are handled correctly.

1. Go to /book
2. Select service, date, and time
3. Wait **5 minutes** (or whatever your hold timeout is)
4. **Verify:**
   - ✅ Countdown reaches "0:00"
   - ✅ Message changes to "Hold expired"
   - ✅ Buttons become disabled
   - ✅ User can select a new time slot

---

## Test 6: Mobile View
Tests that the fix works on mobile devices.

1. Open /book on mobile or use Chrome DevTools mobile emulation
2. Follow Test 1 steps on mobile
3. **Verify:**
   - ✅ State persists after sign-in
   - ✅ Auto-scroll works on mobile
   - ✅ Blue banner fits properly on small screen
   - ✅ Booking form is visible and usable

---

## Common Issues & Troubleshooting

### Issue: Date still resets to today
**Cause:** Browser cached old JavaScript
**Fix:** Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

### Issue: No hold is created after sign-in
**Cause:** Time slot may have been booked by someone else
**Fix:** Select a different time slot

### Issue: "Your previously selected time is no longer available"
**Cause:** The time slot was booked during your sign-in process
**Expected Behavior:** This is correct! Select a new time.

### Issue: Blue banner appears but then error
**Cause:** Hold creation failed (possibly network issue)
**Fix:** Check console logs for error details

---

## Browser Console Checks

Open browser console (F12) and look for these messages:

### Good Signs ✅
```
🔄 Restoring hold for previously selected slot after navigation
🔄 Auto-restoring hold for slot: 2024-10-24T14:00:00.000Z
✅ Hold created/updated: hold123 status: active
```

### Warning Signs ⚠️
```
❌ Previously chosen slot is no longer available
```
This is OK - it means someone else booked the slot. User will be prompted to pick a new time.

### Bad Signs ❌
```
Failed to restore hold: [error message]
Hold creation error: [error message]
```
These indicate actual problems that need investigation.

---

## Performance Checks

1. **Restoration Speed:**
   - Blue banner should appear for ~500ms
   - Should not feel sluggish or delayed

2. **Scroll Behavior:**
   - Should scroll smoothly (not jump)
   - Should center the booking form on screen

3. **No Flickering:**
   - Time slots should not flicker or jump around
   - Selected time should stay highlighted

---

## Automated Testing Commands

To run automated tests (if available):

```bash
# Run unit tests
pnpm --filter booking test

# Run e2e tests
pnpm --filter booking test:e2e

# Check TypeScript compilation
pnpm --filter booking build
```

---

## Deployment Verification

After deploying to production:

1. Test on the live site
2. Clear browser cache/cookies to simulate new user
3. Test with different user accounts
4. Test on multiple browsers (Chrome, Firefox, Safari)
5. Test on mobile devices

---

## Success Criteria

All tests should pass with these results:

- ✅ Test 1: Date and time persist after sign-in
- ✅ Test 2: Guest booking still works
- ✅ Test 3: Multiple services work correctly
- ✅ Test 4: Page refresh preserves state
- ✅ Test 5: Expired holds handled properly
- ✅ Test 6: Mobile view works correctly

If all tests pass, the fix is working correctly! 🎉

---

## Reporting Issues

If you find any issues during testing:

1. Note the exact steps to reproduce
2. Take screenshots or screen recording
3. Check browser console for errors (F12)
4. Note browser version and device type
5. Document expected vs. actual behavior

Open an issue with all this information for fastest resolution.


