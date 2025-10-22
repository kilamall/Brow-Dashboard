# How to Get Your Firebase Service Account Key

## Steps:

1. **Go to Firebase Console**:
   - Visit: https://console.firebase.google.com/project/bueno-brows-7cce7/settings/serviceaccounts/adminsdk

2. **Generate New Private Key**:
   - Click on the "Service accounts" tab
   - Click "Generate new private key"
   - Confirm by clicking "Generate key"
   - A JSON file will be downloaded

3. **Save the Key**:
   - Rename the downloaded file to `service-account-key.json`
   - Move it to your project root directory

4. **⚠️ Security Note**:
   - This file is already in `.gitignore` (should be)
   - NEVER commit this file to git
   - NEVER share this file publicly
   - It has full admin access to your Firebase project

## Then Run the Script:

```bash
# Set your admin email
node set-admin-role.js admin@yourdomain.com
```

