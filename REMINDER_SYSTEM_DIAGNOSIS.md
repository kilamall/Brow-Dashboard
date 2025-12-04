# Reminder System Diagnosis Guide

## Understanding Your Reminder System

You have **TWO different reminder functions**:

### 1. `sendAppointmentReminder` (Firestore Trigger)
- **Location**: `functions/src/messaging.ts`
- **Trigger**: Firestore document update
- **What it does**: Sends push notifications (FCM) when appointment status changes to 'confirmed'
- **Limitation**: Only sends if appointment is within 24 hours AND customer has FCM token
- **This is what you see in the screenshot**

### 2. `sendAppointmentReminders` (Scheduled - THE ONE THAT'S NOT WORKING)
- **Location**: `functions/src/appointment-reminders.ts`
- **Trigger**: Scheduled (every 1 hour)
- **What it does**: Sends email/SMS reminders (7-day, 24-hour, 2-hour before)
- **This is the one that should be sending periodic reminders**

## The Problem

The scheduled function `sendAppointmentReminders` may not be:
1. Deployed properly
2. Running on schedule
3. Finding appointments (index issue)
4. Sending reminders (email/SMS config issue)

## How to Check

### Step 1: Verify Scheduled Function Exists

In Firebase Console:
1. Go to **Functions** (not Cloud Run)
2. Look for `sendAppointmentReminders`
3. Check the "Trigger" tab - should show:
   - **Type**: Cloud Scheduler
   - **Schedule**: `every 1 hours`
   - **Timezone**: `America/Los_Angeles`

If you don't see it, the function isn't deployed.

### Step 2: Check Function Logs

1. Go to **Functions** → `sendAppointmentReminders`
2. Click **Logs** tab
3. Look for entries every hour
4. Check for errors

### Step 3: Run Diagnostic

Use the diagnostic function I created:

```javascript
// In browser console or Firebase Console
const functions = getFunctions();
const diagnose = httpsCallable(functions, 'diagnoseRemindersAndReceipts');
const result = await diagnose();
console.log(result.data);
```

This will show:
- How many appointments need reminders
- If receipts are being generated
- Any issues found

### Step 4: Manually Trigger Reminder System

```javascript
const triggerReminderSystem = httpsCallable(functions, 'triggerReminderSystem');
const result = await triggerReminderSystem();
console.log(result.data);
```

## Quick Fixes

### Fix 1: Deploy Functions
```bash
firebase deploy --only functions:sendAppointmentReminders
```

### Fix 2: Deploy Firestore Index
```bash
firebase deploy --only firestore:indexes
```

### Fix 3: Check Function Status
In Firebase Console → Functions, verify:
- Function is deployed
- Trigger is set to "Cloud Scheduler"
- Schedule shows "every 1 hours"

## Receipt Issue

Receipts are generated in `mark-attendance.ts` when attendance is marked as 'attended'. 

**Check if receipts are being generated:**
1. Mark an appointment as attended
2. Check the appointment document in Firestore:
   - Should have `receiptUrl` field
   - Should have `receiptGeneratedAt` field
3. Check `email_logs` collection for receipt email attempts
4. Check function logs for `markAttendance` errors

**Common issues:**
- Customer missing email/phone
- SendGrid not configured
- Receipt generation failing silently (now fixed with better error handling)

## Next Steps

1. **Run the diagnostic function** to see what's actually wrong
2. **Check Firebase Console** → Functions to see if `sendAppointmentReminders` exists
3. **Deploy the fixes** I made
4. **Test manually** using `triggerReminderSystem`

The diagnostic function will tell you exactly what's broken!


