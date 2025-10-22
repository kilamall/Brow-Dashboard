# 🔧 HTTP Referer Fix - Complete Guide & Tools

## 📦 What I've Created for You

I've set up everything you need to fix the HTTP referer blocking issue that's preventing your AI analytics from working.

---

## 🎯 The Problem

Your **Gemini API key has HTTP referrer restrictions** enabled. This blocks Cloud Functions from accessing the API because:

- **Cloud Functions** run on Google's servers (not in a browser)
- They don't send HTTP referrer headers
- Your API key is configured to only accept requests with specific referrers
- Result: **403 "API_KEY_HTTP_REFERRER_BLOCKED" errors**

### What's Affected:
- ❌ Skin Analysis (`analyzeSkinPhoto`)
- ❌ Product Analysis (`analyzeSkinCareProducts`)
- ❌ AI Chatbot (`aiChatbot`)
- ❌ SMS AI Integration (`smsAIWebhook`)

---

## ✅ The Solution (Choose Your Path)

### 🚀 Option 1: Quick Fix (2 Minutes) - RECOMMENDED

**Use the quick guide:**
```bash
cat QUICK_FIX_REFERER.md
```

**Steps:**
1. Open: https://aistudio.google.com/app/apikey
2. Edit your API key
3. Select "Don't restrict key"
4. Save
5. Wait 2-3 minutes
6. Test!

---

### 🤖 Option 2: Automated Script (5 Minutes)

**Run the interactive script:**
```bash
./fix-gemini-referer.sh
```

This script will:
- ✅ Walk you through each step
- ✅ Verify your API key is set in Firebase
- ✅ Optionally redeploy your functions
- ✅ Test the fix

---

### 📖 Option 3: Complete Manual (10 Minutes)

**Read the full guide:**
```bash
cat FIX_HTTP_REFERER_BLOCKING.md
```

Includes:
- Multiple security options
- Detailed troubleshooting
- Monitoring and testing
- Best practices
- FAQ

---

## 🧪 Testing Your Fix

### Method 1: Test Script (Fastest)
```bash
node test-gemini-api.js
```

This will:
- ✅ Test your API key directly
- ✅ Simulate Cloud Function environment
- ✅ Show clear error messages if blocked
- ✅ Confirm when working

### Method 2: Check Function Logs
```bash
firebase functions:log --only analyzeSkinPhoto --limit 20
```

Look for:
- ✅ "Skin analysis completed" = Working
- ❌ "Gemini API error: 403" = Still blocked

### Method 3: Test in Your App
1. Go to your customer portal
2. Navigate to **Skin Analysis**
3. Upload a test photo
4. Click **Analyze**
5. Should get results in 5-10 seconds

---

## 📁 Files Created

### Quick Reference
- **`QUICK_FIX_REFERER.md`** - 2-minute fix guide ⚡
- **`FIX_HTTP_REFERER_BLOCKING.md`** - Complete reference 📖

### Tools
- **`fix-gemini-referer.sh`** - Interactive setup script 🤖
- **`test-gemini-api.js`** - Test your API key works 🧪

### Existing Docs (Updated Context)
- **`FIX_GEMINI_API_RESTRICTIONS.md`** - Original guide
- **`GEMINI_API_SETUP.md`** - Initial setup guide
- **`AI_SETUP.md`** - AI integration overview

---

## 🎬 Getting Started (Right Now!)

### Step 1: Read the Quick Fix
```bash
cat QUICK_FIX_REFERER.md
```

### Step 2: Fix Your API Key
Open: https://aistudio.google.com/app/apikey

Edit your key → Select "Don't restrict key" → Save

### Step 3: Test It
```bash
node test-gemini-api.js
```

### Step 4: Verify in Firebase
```bash
# Check if API key is set
firebase functions:secrets:access GEMINI_API_KEY

# If empty, set it
firebase functions:secrets:set GEMINI_API_KEY
```

### Step 5: Test in Your App
Go to Skin Analysis and upload a photo!

---

## 🔍 How to Know It's Fixed

### ✅ Signs of Success:
- No more 403 errors in logs
- Skin analysis completes successfully
- AI responses are generated
- Test script shows "SUCCESS!"

### ❌ Signs It's Still Broken:
- "403 Forbidden" in logs
- "API_KEY_HTTP_REFERRER_BLOCKED" errors
- Skin analysis stays in "analyzing" state forever
- Test script shows referrer blocking

---

## 🆘 If You're Still Having Issues

### Issue 1: Changes Not Taking Effect
**Wait longer** - Can take 5-10 minutes for Google to propagate changes globally

### Issue 2: Still Getting 403 Errors
**Create a new API key:**
1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Select your project
4. Choose "Don't restrict key"
5. Copy the new key
6. Update Firebase: `firebase functions:secrets:set GEMINI_API_KEY`
7. Redeploy: `firebase deploy --only functions`

### Issue 3: API Key Not Set
```bash
# Check current value
firebase functions:secrets:access GEMINI_API_KEY

# Set it if empty
firebase functions:secrets:set GEMINI_API_KEY
```

### Issue 4: Wrong Project
Make sure your Gemini API key is from the same Google Cloud project as your Firebase app.

---

## 📊 Understanding the Architecture

```
┌─────────────────┐
│  Customer Uses  │
│   Your Website  │
└────────┬────────┘
         │ 1. Upload photo
         ▼
┌─────────────────────────┐
│  Firebase Cloud         │
│  Functions              │
│  (analyzeSkinPhoto)     │
└────────┬────────────────┘
         │ 2. Call Gemini API
         │    (No referrer header!)
         ▼
┌─────────────────────────┐
│  Gemini AI API          │
│  (Google AI)            │
└────────┬────────────────┘
         │ 3. Return analysis
         ▼
┌─────────────────────────┐
│  Customer Sees Results  │
└─────────────────────────┘
```

**The Problem:** Cloud Functions don't send referrer headers (step 2)

**The Fix:** Remove referrer restrictions on your API key

---

## 🔐 Security Considerations

### Is This Secure?

**YES!** Because:

1. **API Key is Secret**
   - Stored in Firebase Secrets Manager
   - Not exposed in your code or frontend
   - Only accessible by your Cloud Functions

2. **Cloud Functions are Secure**
   - Run on Google's infrastructure
   - Require authentication to trigger
   - Protected by Firebase Security Rules

3. **Additional Security Available**
   - Can add API restrictions (limit to Generative Language API only)
   - Can monitor usage in Google AI Studio
   - Can set spending limits

### Optional: Add API Restrictions

For extra security layer:

1. Go to: https://aistudio.google.com/app/apikey
2. Edit your API key
3. Find "API restrictions"
4. Select "Restrict key"
5. Check ONLY: "Generative Language API"
6. Save

This ensures the key can ONLY be used for Gemini AI, nothing else.

---

## 💰 Cost Monitoring

### Free Tier Limits:
- 60 requests per minute
- 1,500 requests per day
- **$0/month** for most small businesses

### Monitor Usage:
1. Go to: https://aistudio.google.com/
2. Click your profile
3. View usage stats

### Set Budget Alerts:
1. Go to: https://console.cloud.google.com/billing
2. Create budget alert at $5, $10, etc.

---

## 🚀 Deployment Checklist

After fixing the API key:

- [ ] Removed HTTP referrer restrictions in Google AI Studio
- [ ] Waited 2-3 minutes for changes to propagate
- [ ] Ran test script: `node test-gemini-api.js`
- [ ] Verified API key in Firebase: `firebase functions:secrets:access GEMINI_API_KEY`
- [ ] Tested skin analysis in your app
- [ ] Checked function logs: No 403 errors
- [ ] (Optional) Added API restrictions for extra security
- [ ] (Optional) Set up billing alerts

---

## 📞 Quick Commands

```bash
# Test API key directly
node test-gemini-api.js

# Run interactive fix script
./fix-gemini-referer.sh

# Check if API key is set
firebase functions:secrets:access GEMINI_API_KEY

# Set API key
firebase functions:secrets:set GEMINI_API_KEY

# View function logs
firebase functions:log --only analyzeSkinPhoto

# Deploy functions
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts

# List all functions
firebase functions:list
```

---

## 🎯 Summary

### What You Need to Do:
1. Open https://aistudio.google.com/app/apikey
2. Edit your API key
3. Select "Don't restrict key"
4. Save
5. Wait 2-3 minutes
6. Test with `node test-gemini-api.js`

### Time Required:
- **Fix:** 2 minutes
- **Propagation:** 2-3 minutes
- **Testing:** 1 minute
- **Total:** ~5 minutes

### Result:
- ✅ Skin analysis works
- ✅ Product analysis works
- ✅ AI chatbot works
- ✅ SMS AI works
- ✅ No more 403 errors

---

## 🎉 You're All Set!

Once you complete the fix, all your AI features will work perfectly. The solution is simple and takes just a few minutes.

### Need Help?

1. **Start with:** `cat QUICK_FIX_REFERER.md`
2. **Or run:** `./fix-gemini-referer.sh`
3. **Or test:** `node test-gemini-api.js`
4. **Read more:** `cat FIX_HTTP_REFERER_BLOCKING.md`

---

## 📖 Additional Resources

- **Google AI Studio:** https://aistudio.google.com/
- **Gemini API Docs:** https://ai.google.dev/docs
- **Firebase Secrets:** https://firebase.google.com/docs/functions/config-env
- **Your Project Console:** https://console.firebase.google.com/

---

**Ready to fix it? Start here:** 👇

```bash
# Option 1: Read quick guide
cat QUICK_FIX_REFERER.md

# Option 2: Run automated fix
./fix-gemini-referer.sh

# Option 3: Test current status
node test-gemini-api.js
```

🚀 **Let's get your AI analytics working!**

