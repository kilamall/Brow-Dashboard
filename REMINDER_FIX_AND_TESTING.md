# Reminder System Fix and Testing Guide

## Issues Fixed

### 1. **Reminder Preference Logic**
- **Before**: Sent SMS first, then email (both methods, increasing cost)
- **After**: Prefers email (low cost), falls back to SMS only if email unavailable or fails
- **Impact**: Reduces SMS costs significantly

### 2. **Query Logic Improvements**
- **Before**: Narrow time windows that might miss appointments
- **After**: Wider time windows with buffers to catch all appointments
  - 7-day: 6 days 23 hours to 7 days 1 hour
  - 24-hour: 23 to 25 hours
  - 2-hour: 1.5 to 3 hours

### 3. **Error Handling**
- **Before**: Single try-catch that could hide individual failures
- **After**: Individual error handling for each reminder type and appointment
- **Impact**: Better visibility into what's failing

### 4. **Logging Improvements**
- Added detailed logging with emojis for easy scanning
- Logs show time windows, appointment counts, and success/failure status
- Performance metrics (duration) included

### 5. **Firestore Index**
- Added composite index: `status` + `start` (required for reminder queries)

## Quick Testing Guide (No Waiting!)

### Fastest Way to Test:

1. **Find an appointment ID** from your admin panel
2. **Run dry run** to see what would happen:
   ```javascript
   const functions = getFunctions();
   const sendManualReminder = httpsCallable(functions, 'sendManualReminder');
   const result = await sendManualReminder({ 
     appointmentId: 'YOUR_APPOINTMENT_ID',
     dryRun: true 
   });
   console.log(result.data);
   ```
3. **Actually send the reminder**:
   ```javascript
   const result = await sendManualReminder({ 
     appointmentId: 'YOUR_APPOINTMENT_ID',
     reminderType: '24-hour' // Force 24-hour reminder
   });
   console.log(result.data);
   ```
4. **Check email_logs or sms_logs** collections to verify it was sent

### Test Different Scenarios:

```javascript
// Test with email-only customer
await sendManualReminder({ 
  appointmentId: 'APPOINTMENT_WITH_EMAIL',
  reminderType: '24-hour'
});

// Test with phone-only customer  
await sendManualReminder({ 
  appointmentId: 'APPOINTMENT_WITH_PHONE',
  reminderType: '24-hour'
});

// Test with both email and phone (should use email)
await sendManualReminder({ 
  appointmentId: 'APPOINTMENT_WITH_BOTH',
  reminderType: '24-hour'
});
```

## Testing Before Deployment

### Step 1: Deploy Firestore Index
```bash
firebase deploy --only firestore:indexes
```
Wait for index to build (check Firebase Console → Firestore → Indexes)

### Step 2: Test Reminder System Status
Call the test function to see what reminders are needed:

```javascript
// In browser console or admin panel
const functions = getFunctions();
const testReminderSystem = httpsCallable(functions, 'testReminderSystem');
const result = await testReminderSystem();
console.log(result.data);
```

This will show:
- All upcoming appointments in next 8 days
- Which reminders are needed (7-day, 24-hour, 2-hour)
- Customer contact info (email/phone)
- Reminder status (sent/not sent)

### Step 3: Test Manual Reminder (BEST FOR TESTING!)
Test sending a reminder immediately for any appointment:

```javascript
const functions = getFunctions();
const sendManualReminder = httpsCallable(functions, 'sendManualReminder');

// Option 1: Dry run (see what would be sent without actually sending)
const dryRun = await sendManualReminder({ 
  appointmentId: 'YOUR_APPOINTMENT_ID',
  dryRun: true 
});
console.log('Dry run result:', dryRun.data);

// Option 2: Send specific reminder type
const result = await sendManualReminder({ 
  appointmentId: 'YOUR_APPOINTMENT_ID',
  reminderType: '24-hour' // or '7-day', '2-hour', or 'auto' (default)
});
console.log('Reminder sent:', result.data);

// Option 3: Auto-detect which reminder to send based on time
const autoResult = await sendManualReminder({ 
  appointmentId: 'YOUR_APPOINTMENT_ID'
  // reminderType defaults to 'auto'
});
console.log('Auto reminder:', autoResult.data);
```

### Step 4: Force Trigger Entire Reminder System
Trigger the entire reminder system immediately (runs all reminder checks):

```javascript
const triggerReminderSystem = httpsCallable(functions, 'triggerReminderSystem');
const result = await triggerReminderSystem();
console.log('Reminder system results:', result.data);
// Shows: how many reminders found, sent, errors for each type
```

### Step 5: Check Logs
After the scheduled function runs (every hour), check Firebase Console → Functions → Logs for:
- `⏰ Running appointment reminder check...`
- `📧 Found X appointments for Y reminders`
- `✅ Reminder sent via EMAIL` or `✅ Reminder sent via SMS`
- `✅ Appointment reminder check complete: X reminders sent`

### Step 6: Verify Email/SMS Delivery
- Check `email_logs` collection for email attempts
- Check `sms_logs` collection for SMS attempts
- Verify customers received reminders

## Expected Behavior

### Customer with Email Only
- ✅ Receives reminder via EMAIL
- ❌ No SMS sent

### Customer with Phone Only
- ❌ No email sent (no email on file)
- ✅ Receives reminder via SMS

### Customer with Both Email and Phone
- ✅ Receives reminder via EMAIL (preferred)
- ❌ No SMS sent (email succeeded)

### Customer with Email but Email Fails
- ❌ Email attempt fails
- ✅ Falls back to SMS (if phone available)

### Customer with Neither Email nor Phone
- ⚠️ Warning logged, reminder skipped
- Appointment marked appropriately

## Monitoring

### Key Metrics to Watch
1. **Reminder Success Rate**: Check logs for `reminders sent` vs `errors`
2. **Email vs SMS Ratio**: Should favor email (check logs)
3. **Query Performance**: Check function duration in logs
4. **Index Usage**: Verify Firestore index is being used (no query errors)

### Common Issues

#### "Index not found" error
- **Solution**: Deploy indexes and wait for build to complete
- **Check**: Firebase Console → Firestore → Indexes

#### "No appointments found"
- **Check**: Are there confirmed appointments in the time windows?
- **Check**: Are appointments using ISO string format for `start` field?

#### "Reminders not sending"
- **Check**: Customer has email or phone?
- **Check**: SendGrid/Twilio configured?
- **Check**: Function logs for specific errors

## Files Changed

1. `functions/src/appointment-reminders.ts`
   - Updated reminder preference logic
   - Improved query time windows
   - Enhanced error handling and logging
   - Added `testReminderSystem` function

2. `firestore.indexes.json`
   - Added composite index for `status` + `start` queries

3. `functions/src/mark-attendance.ts`
   - Updated receipt sending to prefer email with SMS fallback

## Deployment Checklist

- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Wait for indexes to build (check Firebase Console)
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Test reminder system status: Call `testReminderSystem`
- [ ] Test manual reminder: Call `sendManualReminder` with test appointment
- [ ] Monitor logs for next scheduled run (every hour)
- [ ] Verify customers receive reminders
- [ ] Check email_logs and sms_logs collections

## Next Steps After Deployment

1. Monitor first few scheduled runs
2. Verify email delivery rates
3. Check SMS fallback is working when needed
4. Review cost impact (should see reduced SMS usage)

