# 🔧 Fix HTTP Referer Blocking for AI Analytics

## 🚨 The Problem

Your Gemini API key has **HTTP referrer restrictions** enabled, which blocks requests from Cloud Functions. Cloud Functions run on Google's servers and don't send referrer headers, causing:

```
Error: Gemini API error: 403
"API_KEY_HTTP_REFERRER_BLOCKED"
"Requests from referer <empty> are blocked."
```

This affects:
- ✅ **Skin Analysis** (analyzeSkinPhoto function)
- ✅ **Product Analysis** (analyzeSkinCareProducts function)  
- ✅ **AI Chatbot** (aiChatbot function)
- ✅ **SMS AI** (smsAIWebhook function)

---

## ✅ Solution: Update API Key Restrictions

### Option 1: Remove All Restrictions (FASTEST - Recommended)

This is the easiest and fastest solution for Cloud Functions.

#### Step 1: Open Google AI Studio
🔗 **Go to:** https://aistudio.google.com/app/apikey

#### Step 2: Edit Your API Key
1. Find your Gemini API key in the list
2. Click the **"⋮"** (three dots) menu
3. Click **"Edit API key"**

#### Step 3: Remove Restrictions
1. Scroll to **"Application restrictions"**
2. Select **"Don't restrict key"** (or "None")
3. Click **"Save"**

#### Step 4: Wait for Propagation
- Wait **2-3 minutes** for changes to take effect
- Google needs to update the key globally

#### Step 5: Test Your Functions
```bash
# Test skin analysis
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard
firebase functions:log --only analyzeSkinPhoto

# Or test via your app
# Go to your site → Skin Analysis → Upload a photo
```

✅ **Done!** Your AI analytics should now work.

---

### Option 2: Allow Specific Referrers (More Secure)

If you want to keep some restrictions for security:

#### Step 1: Edit API Key
🔗 **Go to:** https://aistudio.google.com/app/apikey

#### Step 2: Add Allowed Referrers
1. Click **"Edit API key"**
2. Select **"HTTP referrers (web sites)"**
3. Add these referrer patterns:

```
*.cloudfunctions.net/*
*.run.app/*
*.web.app/*
*.firebaseapp.com/*
localhost:*/*
127.0.0.1:*/*
```

4. Click **"Add"** for each one
5. Click **"Save"**

#### Step 3: Wait & Test
- Wait **2-3 minutes**
- Test your functions

---

### Option 3: API Restrictions (Additional Layer)

You can also restrict which Google APIs the key can access:

#### Step 1: Edit API Key
Same as above

#### Step 2: Add API Restrictions
1. Scroll to **"API restrictions"**
2. Select **"Restrict key"**
3. Check **only** these APIs:
   - ✅ Generative Language API
   - ✅ (or) AI Platform API

4. Click **"Save"**

This ensures the key can ONLY be used for Gemini AI, nothing else.

---

## 🧪 How to Test After Fixing

### Test 1: Check Function Logs
```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard

# View recent logs
firebase functions:log --only analyzeSkinPhoto --limit 50

# Should see:
# ✅ "Analyzing skin photo: [id]"
# ✅ "Skin analysis completed: [id]"
# ❌ NO "Gemini API error: 403"
```

### Test 2: Test via Admin Dashboard
1. Open your admin dashboard
2. Go to **Skin Analysis** page
3. Click **"View All Analyses"**
4. Check if recent analyses completed successfully

### Test 3: Test via Customer Portal
1. Open your customer booking site
2. Log in as a customer
3. Go to **Skin Analysis**
4. Upload a test photo
5. Click **"Analyze"**
6. Should get results in 5-10 seconds ✅

### Test 4: Test AI Chatbot (If Enabled)
```bash
# In your terminal
firebase functions:shell

# Then run:
testAIChatbot({phoneNumber: "+1234567890", message: "Hello"})

# Should get AI response
```

---

## 🔍 Verify Current Restrictions

Want to check what restrictions are currently on your key?

### Method 1: Via Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your API key
3. Click to view details
4. Check **"Application restrictions"** section

### Method 2: Via Google AI Studio  
1. Go to: https://aistudio.google.com/app/apikey
2. Click on your key
3. View current restrictions

---

## 🚨 Still Not Working?

### Issue: "API key not valid"
**Cause:** Wrong API key or not set in Firebase Functions

**Fix:**
```bash
# Check if key is set
firebase functions:secrets:access GEMINI_API_KEY

# If empty or error, set it:
firebase functions:secrets:set GEMINI_API_KEY
# Then paste your API key when prompted

# Redeploy functions
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts
```

### Issue: "Permission denied"
**Cause:** Generative Language API not enabled

**Fix:**
1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. Select your project
3. Click **"Enable"**
4. Wait 2-3 minutes
5. Test again

### Issue: "Quota exceeded"
**Cause:** Hit free tier limits

**Fix:**
- **Free tier:** 60 requests/minute, 1,500/day
- Wait for quota to reset (every minute/day)
- Or enable billing in Google Cloud Console

### Issue: Still getting 403 errors
**Cause:** Changes not propagated yet

**Fix:**
1. Wait 5-10 minutes (sometimes takes longer)
2. Try creating a **NEW** API key with no restrictions
3. Update Firebase secret with new key

---

## 🎯 Recommended Settings

For the best balance of security and functionality:

### Application Restrictions
```
✅ HTTP referrers (websites)
  Allowed referrers:
  - *.cloudfunctions.net/*
  - *.run.app/*
  - *.web.app/*
  - *.firebaseapp.com/*
  - localhost:*/*
```

### API Restrictions  
```
✅ Restrict key
  Allowed APIs:
  - Generative Language API
```

### Usage Quotas
```
✅ Set up budget alerts
  - Alert at $5
  - Alert at $10
  - Alert at $25
```

---

## 💡 Understanding the Issue

### Why Cloud Functions Have No Referrer

**Cloud Functions** are server-side code that runs on Google's infrastructure:

```
Browser → Firebase Cloud Function → Gemini API
         ⬆️                        ⬆️
         Has referrer header       NO referrer header
```

When a Cloud Function makes an API request, there's no "web page" making the request, so there's no referrer header to send.

### Why This Blocks Your Requests

If your API key has referrer restrictions like:
```
Allowed referrers:
- https://yourdomain.com/*
```

Then requests from Cloud Functions get blocked because they don't send any referrer header.

### The Solution

Either:
1. **Remove restrictions** - Allow requests from anywhere
2. **Add Cloud Function domains** - Allow `*.cloudfunctions.net/*`
3. **Use IP restrictions instead** - More complex but possible

---

## 📊 Monitoring Usage

After fixing, monitor your API usage:

### Via Google AI Studio
1. Go to: https://aistudio.google.com/
2. Click your profile
3. View **"Usage"**
4. See requests per day/minute

### Via Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/dashboard
2. Select your project
3. Find **"Generative Language API"**
4. View traffic and errors

### Via Firebase Functions Logs
```bash
# View all function logs
firebase functions:log

# View specific function
firebase functions:log --only analyzeSkinPhoto

# View recent errors
firebase functions:log --only analyzeSkinPhoto | grep "error"
```

---

## 🎉 Success Checklist

After fixing, you should see:

- ✅ No more 403 errors in function logs
- ✅ Skin analysis completing successfully
- ✅ AI chatbot responding to messages
- ✅ Product analysis working
- ✅ SMS AI integration working (if enabled)

---

## 🔐 Security Best Practices

### DO:
- ✅ Monitor API usage regularly
- ✅ Set up billing alerts
- ✅ Use API restrictions (limit to Generative Language API)
- ✅ Rotate API keys periodically
- ✅ Keep API keys in Firebase Secrets (not in code)

### DON'T:
- ❌ Commit API keys to Git
- ❌ Share API keys publicly
- ❌ Use the same key for dev and production
- ❌ Ignore usage spikes
- ❌ Leave keys unrestricted permanently (if not needed)

---

## 🚀 Quick Commands Reference

```bash
# Check API key secret
firebase functions:secrets:access GEMINI_API_KEY

# Set API key secret
firebase functions:secrets:set GEMINI_API_KEY

# Deploy AI functions
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts,functions:aiChatbot

# View logs
firebase functions:log --only analyzeSkinPhoto

# Test locally
firebase emulators:start --only functions

# Check function status
firebase functions:list | grep analyze
```

---

## 📞 Need More Help?

If you're still experiencing issues:

1. **Check the logs** for specific error messages
   ```bash
   firebase functions:log --only analyzeSkinPhoto --limit 100
   ```

2. **Verify API key is correct** in Google AI Studio
   - Should start with `AIza`
   - Should be from same project as your Firebase app

3. **Wait longer** - Sometimes takes 10-15 minutes for changes to propagate globally

4. **Create new API key** - Start fresh with no restrictions

5. **Check billing** - Ensure you haven't hit quota limits

---

## ✨ Summary

**The Fix:**
1. Go to https://aistudio.google.com/app/apikey
2. Edit your API key
3. Select "Don't restrict key" 
4. Save
5. Wait 2-3 minutes
6. Test your functions

**Why It Works:**
Cloud Functions don't send referrer headers, so removing referrer restrictions allows them to access the API.

**Security:**
You can still use API restrictions to limit which Google APIs the key can access. Just remove or update the HTTP referrer restrictions.

---

🎉 **That's it!** Your AI analytics should now work perfectly.

