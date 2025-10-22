# 📧 Setup: Admin Email Notifications

## Prerequisites for Email Notifications to Work

For the booking request emails to work, you need:

1. ✅ **Admin email configured** in Firestore
2. ✅ **SendGrid API key** set in Firebase Functions config
3. ✅ **From email verified** in SendGrid

---

## 🔧 Step 1: Configure Admin Email

The admin email is where booking request notifications are sent.

### Option A: Using Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `bueno-brows-7cce7`
3. Click **Firestore Database** in left menu
4. Navigate to collection: `settings`
5. Check if document `admin` exists:
   - **If it exists**: Edit it and ensure `email` field is set
   - **If it doesn't exist**: Create new document with ID: `admin`
6. Add/update field:
   ```
   Field: email
   Type: string
   Value: your-admin-email@example.com
   ```
7. Click **Save**

### Option B: Using a Script

Create and run this script:

```bash
# In project root
node <<EOF
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function setupAdminEmail() {
  await db.collection('settings').doc('admin').set({
    email: 'your-admin-email@example.com'
  }, { merge: true });
  console.log('✅ Admin email configured!');
  process.exit(0);
}

setupAdminEmail();
EOF
```

---

## 🔧 Step 2: Configure SendGrid (If Not Already Done)

### Check if SendGrid is configured:

```bash
firebase functions:config:get SENDGRID_API_KEY
```

If empty, set it up:

### A. Get SendGrid API Key

1. Sign up at [SendGrid.com](https://sendgrid.com)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Full Access**
5. Copy the API key (starts with `SG.`)

### B. Set in Firebase Functions

```bash
# Set the API key
firebase functions:config:set SENDGRID_API_KEY="SG.your_api_key_here"

# Verify it's set
firebase functions:config:get SENDGRID_API_KEY

# Redeploy functions to use the new config
firebase deploy --only functions:onAppointmentCreatedNotifyAdmin
```

### C. Verify Sender Email in SendGrid

1. Go to SendGrid → **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Add `hello@buenobrows.com` (or your domain)
4. Check your email and click verification link

**Important:** The email in `functions/src/admin-notifications.ts` is:
```typescript
const FROM_EMAIL = 'hello@buenobrows.com';
```

If you want to use a different email, update this file and redeploy.

---

## 🧪 Step 3: Test Email Notifications

### Quick Test:

1. **Create a booking:**
   - Go to: https://bueno-brows-7cce7.web.app
   - Book any appointment

2. **Check admin email:**
   - Look for email with subject: "🔔 New Appointment Request"
   - Should arrive within seconds

3. **Click the link:**
   - Click "Review & Confirm Appointment" button
   - Should open admin dashboard with appointment details

### If emails aren't arriving:

1. **Check Firebase Functions logs:**
   ```bash
   firebase functions:log --only onAppointmentCreatedNotifyAdmin
   ```

2. **Look for:**
   - ✅ "📧 New appointment created, sending admin notification..."
   - ✅ "✅ Admin notification sent successfully"
   - ❌ "No admin email configured" = Need to set admin email
   - ❌ "SENDGRID_API_KEY not set" = Need to configure SendGrid

3. **Check spam folder:**
   - Sometimes first emails go to spam
   - Mark as "Not Spam" to train filter

---

## 📋 Configuration Checklist

Use this to verify your setup:

### Firestore Configuration:
- [ ] Document exists: `settings/admin`
- [ ] Field exists: `email`
- [ ] Value is correct admin email address

### SendGrid Configuration:
- [ ] SendGrid account created
- [ ] API key generated
- [ ] API key set in Firebase: `SENDGRID_API_KEY`
- [ ] Sender email verified: `hello@buenobrows.com`
- [ ] Functions redeployed after config change

### Functions Deployment:
- [ ] Function deployed: `onAppointmentCreatedNotifyAdmin`
- [ ] No errors in deployment logs
- [ ] Function shows in Firebase Console → Functions

### Email Link Fix (Already Done ✅):
- [x] Email URL points to: `https://bueno-brows-admin.web.app/schedule`
- [x] Schedule page handles `?appointmentId=` parameter
- [x] Appointment opens automatically when clicking link

---

## 🔍 Troubleshooting

### "No admin email configured"

**Solution:**
```bash
# Verify email is set in Firestore
firebase firestore:get settings/admin

# If not, set it:
firebase firestore:set settings/admin --data '{"email":"your@email.com"}'
```

### "SENDGRID_API_KEY not set"

**Solution:**
```bash
# Set the key
firebase functions:config:set SENDGRID_API_KEY="SG.your_key_here"

# Redeploy functions
firebase deploy --only functions:onAppointmentCreatedNotifyAdmin
```

### "Email sent but not received"

**Possible causes:**
1. Check spam folder
2. Verify sender email in SendGrid
3. Check SendGrid Activity Feed for delivery status
4. Ensure admin email doesn't have typos

**Check SendGrid logs:**
1. Go to SendGrid → Email Activity
2. Search for recipient email
3. Check delivery status

### "Link opens but appointment doesn't show"

**Possible causes:**
1. Appointment might be old (try creating a new one)
2. Browser cache (try incognito/private mode)
3. URL parameter was cleared (try clicking link again)

**Debug steps:**
```bash
# Check if appointment exists
firebase firestore:get appointments/APPOINTMENT_ID

# Check browser console for errors
# Open DevTools (F12) → Console tab
```

---

## 📝 Email Template Customization

Want to customize the email template?

**File:** `functions/src/admin-notifications.ts`

**What you can customize:**
- Line 19: `FROM_EMAIL` - Change sender email
- Line 20: `FROM_NAME` - Change sender name  
- Lines 61-265: HTML template - Change design, colors, text

**After making changes:**
```bash
cd functions
npm run build
cd ..
firebase deploy --only functions:onAppointmentCreatedNotifyAdmin
```

---

## 🎯 Summary

For booking email notifications to work:

1. **Admin email** must be set in Firestore (`settings/admin` → `email`)
2. **SendGrid API key** must be configured in Functions
3. **Sender email** must be verified in SendGrid
4. **Functions** must be deployed with these configs

**Already fixed (deployed today):**
- ✅ Email links point to correct admin dashboard URL
- ✅ Schedule page opens appointments from email links
- ✅ URL parameters handled correctly

---

## 📞 Need Help?

**Check logs:**
```bash
# Functions logs
firebase functions:log

# Specific function logs
firebase functions:log --only onAppointmentCreatedNotifyAdmin
```

**Test email manually:**
See `test-admin-email.ts` in functions for a test email function.

---

*Configuration Guide Created: October 22, 2025*  
*Email Link Fix Deployed: October 22, 2025*


