# Quick Test Instructions

## Appointment ID: `3DN74PpczWDjHpq1gh6G`

### Option 1: Browser Console (Easiest)

1. Open your admin panel in the browser
2. Open browser console (F12 or Cmd+Option+I)
3. Paste and run:

```javascript
const functions = getFunctions();
const sendManualReminder = httpsCallable(functions, 'sendManualReminder');

// First, see what would happen (dry run)
const dryRun = await sendManualReminder({ 
  appointmentId: '3DN74PpczWDjHpq1gh6G',
  dryRun: true 
});
console.log('📋 Dry Run Result:', dryRun.data);

// Then actually send it
const result = await sendManualReminder({ 
  appointmentId: '3DN74PpczWDjHpq1gh6G',
  reminderType: '24-hour'  // or '7-day', '2-hour', or 'auto'
});
console.log('✅ Reminder Sent:', result.data);
```

### Option 2: Firebase Functions Shell

```bash
firebase functions:shell
```

Then in the shell:
```javascript
sendManualReminder({ 
  appointmentId: '3DN74PpczWDjHpq1gh6G',
  dryRun: true 
})

sendManualReminder({ 
  appointmentId: '3DN74PpczWDjHpq1gh6G',
  reminderType: '24-hour'
})
```

### Option 3: Direct HTTP Call (if you have admin token)

```bash
curl -X POST \
  https://us-central1-YOUR-PROJECT.cloudfunctions.net/sendManualReminder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "data": {
      "appointmentId": "3DN74PpczWDjHpq1gh6G",
      "reminderType": "24-hour"
    }
  }'
```

## What to Check After Running

1. **Console output** - Should show:
   - Dry run preview
   - Success message
   - Method used (email or SMS)
   - Customer contact info

2. **Firebase Console**:
   - `email_logs` collection - Check if email was sent
   - `sms_logs` collection - Check if SMS was sent
   - `appointments/{id}` - Check if reminder flags were updated

3. **Customer inbox/phone** - Verify they received the reminder




