# 🔧 Fix Gemini API Restrictions for Skin Analysis

## ❌ Current Error

```
Gemini API error: 403
"Requests from referer <empty> are blocked."
"API_KEY_HTTP_REFERRER_BLOCKED"
```

**Cause:** Your Gemini API key has HTTP referrer restrictions that block Cloud Functions (which don't send a referrer header).

---

## ✅ Solution: Remove Referrer Restrictions

### Step 1: Go to Google AI Studio
1. Open: https://aistudio.google.com/app/apikey
2. Sign in with your Google account

### Step 2: Find Your API Key
1. Look for your existing Gemini API key
2. Click the **"Edit"** button (pencil icon)

### Step 3: Update Restrictions
1. Scroll to **"Application restrictions"**
2. Find **"HTTP referrers (web sites)"**
3. Select **"Don't restrict key"** OR
4. Add these referrers:
   - `*.cloudfunctions.net/*`
   - `*.run.app/*`
   - `*.web.app/*`
   - `localhost/*`

### Step 4: Save Changes
1. Click **"Save"**
2. Wait 1-2 minutes for changes to propagate

### Step 5: Update Firebase Secret
Run this command to update the secret:

```bash
firebase functions:secrets:set GEMINI_API_KEY
```

Then paste your API key when prompted.

---

## 🧪 Test the Fix

1. Go to your booking site
2. Log in as a customer
3. Navigate to Skin Analysis
4. Upload a test photo
5. Click "Analyze"
6. Should work now! ✅

---

## 🔐 Security Best Practice

**Option 1: No Restrictions (Easiest)**
- Allows requests from anywhere
- Monitor usage in Google AI Studio
- Set up usage quotas

**Option 2: IP Restrictions (Most Secure)**
- Get Cloud Functions IP ranges
- Restrict to those IPs
- More complex but more secure

**Option 3: Referrer Restrictions (Balanced)**
- Allow `*.cloudfunctions.net/*`
- Allow `*.run.app/*`
- Allow your domains
- Block everything else

---

## 📊 Check Current Restrictions

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find "API Keys" section
3. Click on your Gemini API key
4. Check "Application restrictions"
5. Should see current settings

---

## 🚨 Alternative: Create New API Key

If you don't want to modify the existing key:

### Step 1: Create New Key
1. Go to: https://aistudio.google.com/app/apikey
2. Click **"Create API key"**
3. Select your Google Cloud project
4. Choose **"Don't restrict key"**
5. Click **"Create"**

### Step 2: Copy the Key

### Step 3: Update Firebase Secret
```bash
firebase functions:secrets:set GEMINI_API_KEY
```
Paste the new key.

### Step 4: Deploy Functions
```bash
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts
```

---

## ⚡ Quick Fix (1 Minute)

**Fastest way to fix right now:**

1. **Open:** https://aistudio.google.com/app/apikey
2. **Edit** your API key
3. **Select:** "Don't restrict key"
4. **Save**
5. **Wait** 2 minutes
6. **Test** skin analysis

That's it! ✅

---

## 📝 Verify It's Working

After making changes, check the logs:

```bash
firebase functions:log --only analyzeSkinPhoto
```

You should see:
- ✅ No more "403" errors
- ✅ "Skin analysis completed"
- ✅ "Analysis cached"

---

## 💡 Why This Happened

Cloud Functions run on Google's servers and don't send HTTP referrer headers (they're server-to-server requests). If your API key has referrer restrictions, it blocks these requests.

**Cloud Function Request:**
```
Referer: <empty>  ← Blocked by restrictions
```

**Web Browser Request:**
```
Referer: https://bueno-brows-7cce7.web.app  ← Allowed
```

---

## 🎯 Recommended Settings

For Cloud Functions to work with Gemini API:

**Application restrictions:**
- ☑️ None (Don't restrict key)

OR

- ☑️ HTTP referrers
  - Add: `*.cloudfunctions.net/*`
  - Add: `*.run.app/*`

**API restrictions:**
- ☑️ Restrict key
  - Select: "Generative Language API"

---

## ✅ After Fixing

You should be able to:
- ✅ Upload skin photos
- ✅ Get AI analysis results
- ✅ See analysis in dashboard
- ✅ No more 403 errors

---

## 📞 Need Help?

If still not working:
1. Check API key is correct
2. Verify secret is set: `firebase functions:secrets:access GEMINI_API_KEY`
3. Check function logs for other errors
4. Try creating a completely new API key

---

**This is a configuration issue, not a code issue!**

Once you update the API key restrictions, skin analysis will work perfectly. 🎉

