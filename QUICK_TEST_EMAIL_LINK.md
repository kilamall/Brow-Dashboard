# 🧪 Quick Test: Email Link Fix

## Test the Booking Email Link (2 Minutes)

### Step 1: Create a Test Booking
1. Open: https://bueno-brows-7cce7.web.app
2. Click "Book Now"
3. Select any service
4. Choose a date and time
5. Fill in your info (use a real email you can check)
6. Complete the booking

### Step 2: Check the Admin Email
1. Open the admin email inbox
2. Look for "🔔 New Appointment Request" email
3. You should see:
   - ⚠️ ACTION REQUIRED badge
   - Customer details
   - Service details
   - Date and time
   - "Review & Confirm Appointment" button

### Step 3: Click the Email Button
1. Click "Review & Confirm Appointment"
2. **Expected behavior:**
   - ✅ Opens https://bueno-brows-admin.web.app/schedule
   - ✅ Automatically opens appointment details modal
   - ✅ Shows all appointment information
   - ✅ You can confirm or deny the appointment

### Step 4: Verify the Fix
Check that:
- ✅ Correct appointment is displayed
- ✅ All details match the booking
- ✅ Calendar navigates to the appointment date
- ✅ You can take actions (Confirm/Deny/Edit)

---

## ✅ Success Criteria

The fix works if:
1. Email link opens the admin dashboard
2. Appointment modal opens automatically
3. You can see all appointment details
4. You can confirm or deny the appointment

---

## 🚨 Troubleshooting

### Issue: Email doesn't arrive
- Check: Admin email configured in Firebase settings
- Check: SendGrid API key is set
- Check: Email isn't in spam folder

### Issue: Link doesn't open appointment
- Check: Appointment exists in database
- Check: Browser allows popups from email
- Try: Copy link and paste in browser manually

### Issue: Wrong appointment opens
- This shouldn't happen - report if it does
- Check the URL has correct appointmentId parameter

---

## 📧 Admin Email Configuration

To set/check admin email:
1. Go to Firebase Console
2. Firestore Database
3. Collection: `settings`
4. Document: `admin`
5. Field: `email` should be set to your admin email

---

**Need Help?**
See BOOKING_EMAIL_LINK_FIXED.md for full technical details.


