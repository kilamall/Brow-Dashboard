# 🧪 Consent Form Testing Guide

## Quick Start

### 1. Start the Development Server

```bash
# Start the booking app (where consent forms appear)
pnpm dev:booking

# In another terminal, start the admin app (to view/manage consents)
pnpm dev:admin
```

The booking app will be available at: **http://localhost:5176**

---

## 🎯 Testing Scenarios

### Scenario 1: First Visit (Full Consent Form)

**Goal**: Test that new customers see the full consent form.

**Steps**:
1. Open http://localhost:5176 in an **incognito/private window** (or use a different browser)
2. Navigate to the booking page
3. Select a service (e.g., "Brow Shaping")
4. Choose a date and time slot
5. Fill in your information (use a **new email** you haven't used before)
6. Click "Book Appointment"

**Expected Result**:
- ✅ Full consent form modal appears
- ✅ Shows all consent sections with checkboxes
- ✅ Requires scrolling through all sections
- ✅ Requires full name signature
- ✅ After agreeing, booking proceeds

---

### Scenario 2: Returning Customer (Quick Update Form)

**Goal**: Test that returning customers see the one-question update form.

**Steps**:
1. **First, complete Scenario 1** with a test customer (or use an existing customer in your database)
2. Make sure that customer has at least one **completed or confirmed** appointment
3. Open http://localhost:5176 in the same browser (or sign in as that customer)
4. Select the **same service category** they've booked before
5. Choose a date and time slot
6. Fill in the same customer information
7. Click "Book Appointment"

**Expected Result**:
- ✅ Quick update form appears (NOT full consent form)
- ✅ Shows: "I confirm there have been no changes to my medical history..."
- ✅ Requires checkbox confirmation
- ✅ Requires initials (at least 2 characters)
- ✅ Shows current date
- ✅ After confirming, booking proceeds

---

### Scenario 3: New Service Category (Full Consent Form)

**Goal**: Test that returning customers booking a NEW service category see full consent.

**Steps**:
1. Use a customer who has completed appointments for "Brow Services"
2. Book a service from a **different category** (e.g., if they only did brows, now book "Lash Services")
3. Complete the booking flow

**Expected Result**:
- ✅ Full consent form appears (even though they're a returning customer)
- ✅ This is because it's a new service category they haven't consented to

---

## 🔍 How to Verify in Admin Dashboard

### View Consent Records

1. Open http://localhost:5173 (admin dashboard)
2. Go to **Settings** → **Consent Forms** tab
3. You should see all consent records with:
   - Customer name
   - Consent type (full vs quick update)
   - Date and time
   - Signature/initials

### Check Consent Details

- **Full Consent**: Will have full signature (typed name)
- **Quick Update**: Will have `isQuickUpdate: true` flag and initials in signature field

---

## 🐛 Troubleshooting

### Consent form doesn't appear

**Check**:
- Is there an active consent form template in Firestore?
- Check browser console for errors
- Verify `consentFormTemplates` collection exists with an active form

**Fix**:
```javascript
// In Firebase Console or via admin, ensure you have:
// Collection: consentFormTemplates
// Document with:
// - category: "brow_services"
// - active: true
```

### Quick update form shows for first-time customers

**Check**:
- Verify the customer has NO previous appointments in the database
- Check that `hasPreviousAppointments()` is working correctly

**Debug**:
- Open browser console
- Look for logs: "Showing quick update form" vs "Showing full consent form"
- Check the logic conditions in the console logs

### Full consent shows for returning customers

**Check**:
- Does the customer have a valid consent record in `customerConsents` collection?
- Is the consent for the correct category?
- Is the consent form version still active?

---

## 📊 Database Structure to Verify

### Firestore Collections

1. **`consentFormTemplates`**
   - Should have at least one document with `active: true`
   - `category: "brow_services"` (or your service category)

2. **`customerConsents`**
   - Records all consent submissions
   - Check for `isQuickUpdate: true` flag on quick updates

3. **`appointments`**
   - Should have at least one appointment with `status: "confirmed"` or `"completed"` for returning customer test

4. **`customers`**
   - Customer records with `customerId` matching consent records

---

## 🎨 Visual Testing Checklist

### Full Consent Form
- [ ] Modal appears centered on screen
- [ ] All sections are visible and scrollable
- [ ] Checkboxes work for required sections
- [ ] Signature field accepts text input
- [ ] "I Agree & Sign" button is disabled until all requirements met
- [ ] Date and time display correctly

### Quick Update Form
- [ ] Modal appears centered on screen
- [ ] Shows the one-question statement clearly
- [ ] Checkbox for confirmation works
- [ ] Initials field accepts text (auto-uppercase)
- [ ] Date displays correctly
- [ ] "Confirm & Continue" button is disabled until requirements met

---

## 🚀 Quick Test Script

Run this in your browser console on the booking page to check consent status:

```javascript
// Check if customer has previous appointments
// (This will be logged automatically when booking)

// To manually check consent status:
// 1. Open browser DevTools → Console
// 2. Look for logs starting with "Showing..." when you click "Book Appointment"
```

---

## 📝 Test Data Setup

### Create Test Customer with Previous Appointment

If you need to quickly create test data:

1. **Via Admin Dashboard**:
   - Go to Customers → Add Customer
   - Create a customer with email: `test-returning@example.com`
   - Go to Schedule → Add Appointment
   - Create a past appointment with status "completed"

2. **Via Firebase Console**:
   - Add to `appointments` collection:
     ```json
     {
       "customerId": "your-customer-id",
       "status": "completed",
       "start": "2024-01-01T10:00:00Z",
       "serviceIds": ["service-id"]
     }
     ```

---

## ✅ Success Criteria

Your consent form implementation is working correctly if:

1. ✅ **First-time customers** see full consent form
2. ✅ **Returning customers** (with existing consent) see quick update form
3. ✅ **Returning customers** booking new service category see full consent form
4. ✅ All consents are recorded in `customerConsents` collection
5. ✅ Quick updates are flagged with `isQuickUpdate: true`
6. ✅ Booking proceeds after consent is given

---

## 🆘 Need Help?

If something isn't working:

1. Check browser console for errors
2. Verify Firestore collections exist and have data
3. Check that consent form templates are active
4. Ensure customer has proper appointment history for returning customer test
5. Review the logic in `apps/booking/src/pages/Book.tsx` around line 1620-1645

---

*Last updated: Testing guide for consent form workflow implementation*

