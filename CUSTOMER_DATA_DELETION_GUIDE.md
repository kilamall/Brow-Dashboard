# 🗑️ Customer Data Deletion Guide

## Overview

This guide explains how to comprehensively delete customer data from your Brow Admin Booking system, ensuring complete data removal for GDPR compliance and data management.

## What Gets Deleted

When you delete a customer using the **"Delete All Data"** button, the system automatically removes:

### Customer Records
- ✅ Customer profile (name, email, phone, notes, status)
- ✅ Customer preferences and settings

### Booking & Appointment Data
- ✅ All appointments (past, present, and future)
- ✅ Availability slots linked to appointments
- ✅ Temporary slot holds
- ✅ Appointment edit requests

### Communication Data
- ✅ In-app messages
- ✅ Conversation threads
- ✅ SMS conversations
- ✅ AI conversation history
- ✅ AI SMS conversations
- ✅ Push notification tokens

### Form & Analysis Data
- ✅ Customer consent records
- ✅ Skin analysis records
- ✅ Skin analysis requests

### Reviews & Feedback
- ✅ Customer reviews

### Optional: Authentication
- ⚠️ Firebase Authentication account (optional - you'll be asked)

---

## How to Delete a Customer

### Option 1: From Customer List

1. Navigate to **Customers** page in admin panel
2. Find the customer you want to delete
3. Click the **"Delete All Data"** button next to their name
4. **First confirmation dialog** will appear:
   ```
   ⚠️ PERMANENT DELETE: [Customer Name]
   
   This will permanently delete ALL customer data including:
   • Customer profile and contact information
   • All appointments and booking history
   • All messages and conversations
   • All SMS conversations
   • All consent forms
   • All skin analyses
   • All reviews
   
   This action cannot be undone!
   
   Click OK to proceed with deletion.
   ```
5. Click **OK** to confirm
6. **Second confirmation dialog** will appear:
   ```
   Do you also want to delete their Firebase Authentication account?
   
   Click OK to delete both data AND auth account.
   Click Cancel to delete only data (keep auth account).
   ```
7. Choose whether to delete their auth account:
   - **OK**: Deletes everything including their ability to log in
   - **Cancel**: Keeps their auth account (they could potentially create a new profile)
8. Wait for the deletion to complete
9. **Success dialog** will show what was deleted:
   ```
   ✅ Success!
   
   Successfully deleted customer [ID] and X related records
   
   Deleted items:
   • customers: 1
   • appointments: X
   • messages: X
   • conversations: X
   • ...
   ```

### Option 2: From Customer Details View

1. Click on a customer's name to open their details
2. Scroll down to the **Danger Zone** section
3. Click the **"Delete Customer"** button
4. Follow the same confirmation process as above

---

## Important Considerations

### ⚠️ This Action is Permanent!

Once you delete customer data:
- **Cannot be undone** - there is no "undo" or "restore from trash"
- **All related data is removed** - across all collections in Firebase
- **Immediate effect** - data is deleted instantly

### 🔐 GDPR Compliance

This comprehensive deletion feature helps you comply with:
- **Right to be forgotten** (GDPR Article 17)
- **Data minimization** (GDPR Article 5)
- **Data retention policies**

### 🤔 When to Delete vs Block

| Action | Use When | Customer Can... |
|--------|----------|-----------------|
| **Block** | Temporarily restrict access | Cannot book, but data is preserved |
| **Delete** | Permanent removal requested | Everything is gone forever |

**Recommendation**: Use "Block" for temporary restrictions (e.g., missed payments, spam). Use "Delete" only when:
- Customer requests data deletion
- Following your data retention policy
- Removing test/spam accounts

### 🔑 Firebase Auth Account

When asked about deleting the Firebase Auth account:

**Delete Auth Account (OK):**
- ✅ Customer cannot log in anymore
- ✅ Complete removal from the system
- ✅ Best for: GDPR requests, permanent removal
- ⚠️ They would need to create a brand new account to return

**Keep Auth Account (Cancel):**
- ✅ Data is deleted but login still works
- ✅ They could potentially create a new customer profile
- ✅ Best for: Data cleanup while allowing future bookings
- ⚠️ They retain access to the authentication system

---

## Technical Details

### How It Works

The deletion process is handled by a secure Cloud Function that:

1. **Validates permissions** - Only admins can delete customer data
2. **Cascades through collections** - Deletes from all related collections
3. **Handles relationships** - Removes linked availability slots
4. **Logs operations** - Records what was deleted for audit
5. **Provides feedback** - Shows detailed results of deletion

### Collections Affected

```javascript
{
  customers: 1,              // The customer record
  appointments: X,           // All bookings
  availability: X,           // Linked availability slots
  messages: X,              // In-app messages
  conversations: X,         // Message threads
  sms_conversations: X,     // SMS threads
  ai_conversations: X,      // AI chat history
  ai_sms_conversations: X,  // AI SMS history
  skinAnalyses: X,          // Skin analysis records
  skinAnalysisRequests: X,  // Skin analysis requests
  customerConsents: X,      // Consent form records
  customer_tokens: X,       // Push notification tokens
  reviews: X,               // Customer reviews
  holds: X,                 // Temporary holds
  appointmentEditRequests: X // Edit requests
}
```

### Security

- ✅ **Admin-only** - Requires admin role in Firebase
- ✅ **Authenticated** - Must be logged in
- ✅ **Audited** - All deletions are logged
- ✅ **Atomic** - Either all data deletes or none (error handling)

---

## Troubleshooting

### "Failed to delete customer"

**Possible causes:**
1. **Not logged in** - Refresh and log in again
2. **Not an admin** - Contact system administrator
3. **Network issue** - Check internet connection
4. **Cloud Function timeout** - Try again (large datasets may take time)

**Solution:**
- Check browser console for error details
- Ensure you have admin privileges
- Try again in a few moments
- Contact support if issue persists

### "Auth account not found"

This is **normal** and not an error. It means:
- Customer doesn't have a Firebase Auth account
- They may have booked as a guest
- No action needed, data deletion still succeeds

### Deletion takes a long time

For customers with lots of data:
- Large appointment histories
- Many messages/conversations
- Extensive skin analysis records

**This is normal** - the function processes all related data. Wait for the success dialog.

---

## Best Practices

### 1. **Verify Before Deleting**
- Double-check you have the right customer
- Review their data in the customer details view
- Consider exporting important information first

### 2. **Document Deletions**
- Keep a record of who was deleted and why
- Note the deletion date
- Save the success dialog details

### 3. **Data Retention Policy**
- Create a policy for how long to keep customer data
- Set reminders to review inactive customers
- Document your GDPR compliance procedures

### 4. **Regular Cleanup**
- Review blocked customers monthly
- Remove test accounts after testing
- Clean up duplicate or spam accounts

### 5. **Customer Requests**
- Respond to deletion requests within 30 days (GDPR requirement)
- Verify identity before deleting
- Provide confirmation when complete

---

## Development Notes

### Cloud Function Location
```
functions/src/delete-customer-data.ts
```

### Frontend Implementation
```
apps/admin/src/pages/Customers.tsx
packages/shared/src/functionsClient.ts
```

### To Deploy Changes
```bash
cd functions
npm run build
firebase deploy --only functions:deleteCustomerData
```

### To Test Locally
1. Run Firebase emulators
2. Create test customer data
3. Test deletion in local admin panel
4. Verify all collections are cleaned

---

## Support

If you encounter issues with customer data deletion:

1. Check browser console for errors
2. Verify admin permissions
3. Review Firebase Cloud Functions logs
4. Contact system administrator

---

**Last Updated**: October 19, 2025
**Feature Version**: 1.0.0
**GDPR Compliant**: Yes ✅

