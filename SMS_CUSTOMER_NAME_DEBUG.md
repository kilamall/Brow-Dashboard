# SMS Booking - Customer Name Not Showing Issue

## Current Behavior
User reports that after SMS booking, the customer name isn't displaying properly and may be appearing in the notes field instead.

## Expected Flow
1. Customer texts to book via SMS
2. System asks for name (e.g., "Malik Griffin")
3. Customer document is updated: `name: "Malik Griffin"`
4. Appointment is created with: `customerName: "Malik Griffin"`
5. Appointment notes: `"Booked via SMS"`
6. Frontend displays `appointment.customerName` in the calendar view
7. Detail modal shows customer name and notes separately

## Code Review

### Customer Creation (lines 1287-1296)
```typescript
if (customer.empty) {
  const newCustomer = await db.collection('customers').add({
    phone: from,
    name: 'SMS Customer',  // ← Initial placeholder name
    email: null,
    status: 'sms_customer',
    createdAt: new Date().toISOString(),
    smsOptIn: true
  });
  customerId = newCustomer.id;
}
```

### Customer Update (lines 1682-1693)
```typescript
const updateData: any = { 
  name: customerName, // ← Should update to actual name
  updatedAt: new Date().toISOString() 
};
await db.collection('customers').doc(customerId).update(updateData);
```

### Appointment Creation (lines 1739-1756)
```typescript
transaction.set(appointmentRef, {
  customerId: customerId,
  customerName: customerName,  // ← Uses the name from user input
  customerEmail: conversationState.customerEmail || customerData?.email || '',
  customerPhone: from,
  serviceId: conversationState.serviceId,
  serviceIds: [conversationState.serviceId],
  start: startISO,
  end: endISO,
  duration: conversationState.serviceDuration,
  status: 'pending',
  notes: `Booked via SMS`,  // ← Should only be this text
  // ...
});
```

## Possible Issues

### Issue 1: Customer Name Not Set
If `customerName` variable is undefined or empty when creating the appointment.

**Check**: Look at line 1652 where `customerName` is set from `parsed.data.name`

### Issue 2: Frontend Display Issue
Frontend might be displaying the wrong field or not showing `customerName` properly.

**Check**: CalendarWeekView line 414 uses `appointment.customerName` correctly

### Issue 3: Race Condition
The customer update (line 1693) happens before the appointment creation, but if there's an error, the appointment might still be created.

**Debug Steps**:
1. Check Firebase Console logs for any errors during SMS booking
2. Check the actual appointment document in Firestore to see what's in `customerName` and `notes` fields
3. Check if the customer document was properly updated with the name

## Enhanced Logging Deployed ✅

I've added detailed logging to track exactly what's happening during SMS bookings. 

### How to Debug This Issue

**Step 1: Make a Test Booking**
1. Text your SMS number: `+1 (650) 683-9181`
2. Complete a full booking (date, time, service, email if needed, name)
3. Note the exact time when you provide your name

**Step 2: Check Firebase Functions Logs**
1. Go to: https://console.firebase.google.com/project/bueno-brows-7cce7/functions/logs
2. Filter by `smsWebhook` function
3. Look for these log entries (in order):
   - `📝 Customer provided name:` → **Should show the name you entered**
   - `📋 Current conversation state:` → Shows the conversation data
   - `👤 Updating customer:` → Shows what's being updated
   - `✅ Customer updated successfully` → Confirms customer update worked
   - `📅 Creating SMS appointment:` → **Should show customerName field**
   - `💾 Setting appointment data:` → **Shows the EXACT data being saved**
   - `✅ Appointment created via SMS:` → Confirms appointment was created

**Step 3: Check Firestore Data**
1. Go to: https://console.firebase.google.com/project/bueno-brows-7cce7/firestore/data
2. Find the appointment in the `appointments` collection
3. Check these specific fields:
   - `customerName`: **Should have your name**
   - `notes`: **Should only say "Booked via SMS"**
   - `customerId`: Note this ID
4. Go to `customers` collection and find the customer with that ID
5. Check the customer's `name` field - **Should have your name**

**Step 4: Check Admin Dashboard**
1. Open the schedule in your admin dashboard
2. Find the SMS appointment
3. Take a screenshot showing:
   - The appointment card on the schedule
   - The appointment detail modal when you click it
4. Specifically look at where the customer name should appear

### What to Report Back
Please share:
1. Screenshot of the Functions logs showing the log entries above
2. Screenshot of the Firestore appointment document fields
3. Screenshot of the appointment in the admin dashboard
4. Exactly what you see vs. what you expect to see

This will help me identify exactly where the issue is occurring.

