# 🔄 Running the Migration Script

## ✅ Main Fix Already Deployed!
The core fix is **live** - all **new appointments** will automatically include customer details.

## 📋 Migration for Existing Appointments

The migration script needs Firebase Admin credentials to update existing appointments. Here's how to run it:

### Option 1: Use Firebase Functions (Recommended)

Deploy as a one-time callable function:

```bash
# The function is already in your codebase
firebase deploy --only functions:fixAppointmentCustomerDetails
```

Then call it from Firebase Console or your admin dashboard.

### Option 2: Local Script with Service Account

1. **Download Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/bueno-brows-7cce7/settings/serviceaccounts/adminsdk)
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in your project root

2. **Set Environment Variable:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   ```

3. **Run Migration:**
   ```bash
   node fix-appointment-customer-details.js
   ```

4. **Clean Up:**
   ```bash
   rm serviceAccountKey.json  # Delete for security
   unset GOOGLE_APPLICATION_CREDENTIALS
   ```

### Option 3: Manual Fix (For Small Number of Appointments)

If you only have a few appointments missing customer details:

1. Go to your admin dashboard
2. Click on each appointment
3. Click "Edit Appointment"
4. Re-select the customer (this will trigger the update)
5. Save

The customer details will be automatically populated.

## 🎯 Do I Need to Run the Migration?

**You can check by:**
1. Opening your admin dashboard
2. Clicking on an existing appointment
3. If customer details show up → ✅ No migration needed
4. If customer section is blank → Run migration

## ⚡ Quick Check

Most likely, your existing appointments already have customer details if they were:
- Created through the public booking page
- Created after a customer was selected in the admin dashboard

The migration is only needed for appointments where the customer details were somehow not saved.

## 🚀 Bottom Line

**Your fix is live!** All new appointments from now on will have customer details. The migration is just for backfilling any old appointments that might be missing this data.

You can run the migration later if needed - the main functionality is already working!

