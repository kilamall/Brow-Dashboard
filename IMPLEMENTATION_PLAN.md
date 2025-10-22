# 🛠️ Security Fixes - Step-by-Step Implementation Plan

## 📊 Current State Analysis

### ✅ GOOD NEWS
1. **Booking app is already using Cloud Functions** for holds (no direct Firestore writes)
2. **All functionality is already secure** - just need to lock down the rules
3. **No breaking changes required** for the holds fix

### ⚠️ ACTION NEEDED
1. **No admin user exists yet** - need to create one first
2. **setAdminRole function is still active** - need to secure/remove after creating admin
3. **API keys are exposed** - need to revoke and replace
4. **Firestore rules are too permissive** - need to lock down

### 👥 Your Users
- `admin@yourdomain.com` - Should be admin
- `buenobrws@gmail.com` - Possibly admin
- 7 other users - Customers

---

## 🎯 Implementation Strategy

**We'll fix these in the safest order:**
1. Create first admin (so you don't lose access)
2. Secure API keys (immediate threat)
3. Lock down Firestore rules (already using Cloud Functions)
4. Remove/secure admin function (last, after admin exists)

---

## 🚀 Step-by-Step Implementation

### STEP 1: Create First Admin User ⏱️ 5 minutes

**Purpose:** Create your admin account BEFORE disabling the admin function

#### Option A: Use Current Function (Quick & Easy)

```javascript
// Open your website in browser
// Press F12 to open console
// Run this:

const setAdmin = firebase.functions().httpsCallable('setAdminRole');
const result = await setAdmin({ email: 'admin@yourdomain.com' });
console.log(result);

// You should see: "Successfully set admin role for admin@yourdomain.com"
```

**Verification:**
```bash
# Log out and log back in as admin@yourdomain.com
# Then check in browser console:
const user = firebase.auth().currentUser;
const token = await user.getIdTokenResult();
console.log(token.claims.role); // Should show "admin"
```

---

#### Option B: Use Firebase Admin SDK (More Secure)

```bash
# Create a one-time script
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard

cat > set-first-admin.js << 'EOF'
const admin = require('firebase-admin');

// Initialize with your service account
admin.initializeApp();

async function setAdmin(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ Successfully set admin role for ${email}`);
    console.log(`   UID: ${user.uid}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

// Set your admin email here
setAdmin('admin@yourdomain.com');
EOF

# Run it
node set-first-admin.js

# Clean up
rm set-first-admin.js
```

**Verification:**
```bash
# Export users and check
firebase auth:export /tmp/verify-admin.json
cat /tmp/verify-admin.json | grep -A2 "admin@yourdomain.com"
# Should show: "customClaims": "{\"role\":\"admin\"}"
```

---

### ✅ CHECKPOINT 1: Verify Admin Works

**Test these before proceeding:**
1. [ ] Log into admin panel as admin@yourdomain.com
2. [ ] Can view customers list
3. [ ] Can view appointments
4. [ ] Can view messages
5. [ ] Can modify settings

**If anything fails, STOP and debug before continuing**

---

### STEP 2: Secure API Keys ⏱️ 10 minutes

**Purpose:** Replace exposed Gemini API key with secure version

#### 2.1: Revoke Exposed Key

```bash
# Open Google Cloud Console
open "https://console.cloud.google.com/apis/credentials"

# Find this key: AIzaSyAsIbSKd9x7Gtn7KtHg5oIBG2zvV1_RgVc
# Click on it, then click "Delete" or "Regenerate"
```

#### 2.2: Create New Key

1. In Google Cloud Console, click **"Create Credentials"** → **"API Key"**
2. Copy the new key (you'll need it in the next step)
3. Click **"Restrict Key"**:
   - **API restrictions:** Select "Generative Language API" only
   - **Application restrictions:** Set IP addresses (your server IPs) or None for now
4. Click **"Save"**

#### 2.3: Store in Firebase Secrets

```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard

# Set the new key (paste when prompted)
firebase functions:secrets:set GEMINI_API_KEY
# Paste your NEW key, press Enter

# Verify it's set
firebase functions:secrets:access GEMINI_API_KEY --project=bueno-brows-7cce7
# Should show your new key
```

#### 2.4: Update Code

```bash
# Backup current files
cp functions/src/messaging.ts functions/src/messaging.ts.backup
cp functions/src/skin-analysis.ts functions/src/skin-analysis.ts.backup
```

Now update the files:

```typescript
// functions/src/messaging.ts - Line 12
// BEFORE:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAsIbSKd9x7Gtn7KtHg5oIBG2zvV1_RgVc';

// AFTER:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not configured');
}
```

```typescript
// functions/src/skin-analysis.ts - Line 13
// BEFORE:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAsIbSKd9x7Gtn7KtHg5oIBG2zvV1_RgVc';

// AFTER:
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not configured');
}
```

Let me create these changes for you:

