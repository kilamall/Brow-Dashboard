# Booking Email & Dashboard Fix - October 21, 2025

## Issues Fixed

### 1. **Confirmation Emails Sent Immediately (FIXED)**
**Problem:** When customers booked appointments via phone/SMS auth, they received confirmation emails immediately after booking, even though appointments should be pending admin approval.

**Root Cause:** 
- `functions/src/email.ts` had `onAppointmentCreatedSendEmail` that triggered on `onDocumentCreated('appointments/{appointmentId}')`
- This sent emails whenever an appointment document was created, regardless of status
- Appointments are created with `status: 'pending'` and should only notify customers when status changes to `'confirmed'`

**Fix:**
- ✅ Replaced `onAppointmentCreatedSendEmail` with `onAppointmentConfirmedSendEmail`
- ✅ Changed trigger from `onDocumentCreated` to `onDocumentUpdated`
- ✅ Added check: only send email when `status` changes from `'pending'` to `'confirmed'`
- ✅ Emails now only sent AFTER admin confirms the appointment

**Files Modified:**
- `functions/src/email.ts` (lines 463-527)

---

### 2. **Push Notifications Sent Immediately (FIXED)**
**Problem:** Similar to emails, push notifications were sent immediately on appointment creation instead of after admin confirmation.

**Root Cause:**
- `functions/src/messaging.ts` had `onAppointmentCreated` that triggered on `onDocumentCreated('appointments/{appointmentId}')`
- This sent push notifications immediately when appointments were created

**Fix:**
- ✅ Replaced `onAppointmentCreated` with `onAppointmentConfirmedNotification`
- ✅ Changed trigger from `onDocumentCreated` to `onDocumentUpdated`
- ✅ Added check: only send notification when `status` changes from `'pending'` to `'confirmed'`
- ✅ Push notifications now only sent AFTER admin confirms the appointment

**Files Modified:**
- `functions/src/messaging.ts` (lines 110-160)

---

### 3. **My Bookings Not Showing for Phone Auth Users (FIXED)**
**Problem:** When customers signed in via phone/SMS authentication, their appointments didn't show in the "My Bookings" tab.

**Root Cause:**
- `apps/booking/src/pages/ClientDashboard.tsx` only searched for customers by email: `where('email', '==', user.email)`
- Phone auth users have `user.phoneNumber` but not `user.email`
- Customer records created via phone auth have `phone` but might not have `email`
- Query couldn't find customer record, so no appointments were loaded

**Fix:**
- ✅ Updated `ClientDashboard.tsx` to search by BOTH email and phone
- ✅ Logic: If user has email, search by email; otherwise search by phone
- ✅ Added better logging to debug customer lookup
- ✅ Now supports both email-authenticated and phone-authenticated users

**Files Modified:**
- `apps/booking/src/pages/ClientDashboard.tsx` (lines 39-93)

---

## How It Works Now

### Booking Flow (Correct Behavior)
1. **Customer books appointment** → Appointment created with `status: 'pending'`
2. **NO email or push notification sent** (this is correct!)
3. **Admin reviews appointment** in admin dashboard
4. **Admin clicks "Confirm" or "Reject"**
5. **If confirmed:**
   - Status changes to `'confirmed'`
   - `onAppointmentConfirmedSendEmail` triggers → **Email sent** ✅
   - `onAppointmentConfirmedNotification` triggers → **Push notification sent** ✅
   - `sendBookingConfirmation` in `appointment-reminders.ts` also sends SMS if configured
6. **Customer receives confirmation** only after admin approval

### My Bookings (Correct Behavior)
1. **Customer logs in** (via email OR phone)
2. **Dashboard searches for customer** by email (if available) or phone (if no email)
3. **Customer record found** → Customer ID retrieved
4. **Appointments loaded** using `where('customerId', '==', custId)`
5. **All appointments displayed** in "My Bookings" tab

---

## Testing Checklist

### Email Confirmation Testing
- [ ] Book appointment as guest (with email)
- [ ] Verify NO email received immediately
- [ ] Admin confirms appointment
- [ ] Verify email received AFTER confirmation
- [ ] Check email contains correct appointment details

### Phone Auth Testing
- [ ] Sign in via phone number
- [ ] Book an appointment
- [ ] Verify NO notification immediately
- [ ] Admin confirms appointment  
- [ ] Verify notification received AFTER confirmation
- [ ] Navigate to "My Bookings"
- [ ] Verify appointment shows in dashboard

### Mixed Auth Testing
- [ ] Book as guest with email
- [ ] Book as guest with phone only
- [ ] Sign in with each method
- [ ] Verify both users see their appointments in "My Bookings"

---

## Admin Workflow Unchanged

The admin confirmation workflow in `functions/src/confirm-appointment.ts` remains the same:

```typescript
// Admin confirms appointment
confirmAppointment({ appointmentId, action: 'confirm' })
  ↓
Status updated to 'confirmed'
  ↓
Auto-triggers:
  - onAppointmentConfirmedSendEmail (email)
  - onAppointmentConfirmedNotification (push)
  - sendBookingConfirmation (SMS)
```

---

## Key Technical Details

### Firestore Triggers Used

**Email Function:**
```typescript
export const onAppointmentConfirmedSendEmail = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    // Only send when status changes from pending → confirmed
    if (beforeData.status === 'pending' && afterData.status === 'confirmed') {
      // Send email...
    }
  }
);
```

**Push Notification Function:**
```typescript
export const onAppointmentConfirmedNotification = onDocumentUpdated(
  'appointments/{appointmentId}',
  async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();
    
    // Only send when status changes from pending → confirmed
    if (beforeData.status === 'pending' && afterData.status === 'confirmed') {
      // Send push notification...
    }
  }
);
```

### Customer Lookup Logic

**ClientDashboard.tsx:**
```typescript
// Try email first, fallback to phone
const searchField = user.email ? 'email' : 'phone';
const searchValue = user.email || user.phoneNumber;
const customerQuery = query(customersRef, where(searchField, '==', searchValue));
```

---

## Related Files

### Cloud Functions
- `functions/src/email.ts` - Email notifications
- `functions/src/messaging.ts` - Push notifications
- `functions/src/confirm-appointment.ts` - Admin confirmation logic
- `functions/src/appointment-reminders.ts` - SMS reminders
- `functions/src/holds.ts` - Booking creation logic

### Frontend
- `apps/booking/src/pages/Book.tsx` - Booking flow
- `apps/booking/src/pages/ClientDashboard.tsx` - My Bookings dashboard
- `apps/admin/src/pages/Appointments.tsx` - Admin appointment management

---

## Deployment

To deploy these fixes:

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Frontend (if needed)
cd apps/booking && npm run build
firebase deploy --only hosting:booking

cd ../admin && npm run build
firebase deploy --only hosting:admin
```

---

## Summary

✅ **All issues resolved:**
1. Emails only sent after admin confirmation (not immediately)
2. Push notifications only sent after admin confirmation (not immediately)  
3. My Bookings works for both email and phone auth users

The system now correctly implements a **pending → admin review → confirmed** workflow with appropriate customer notifications only after approval.

