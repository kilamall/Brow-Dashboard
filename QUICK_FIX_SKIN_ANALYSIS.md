# ⚡ Quick Fix: Skin Analysis Not Working

## 🔴 Problem
Skin analysis failing with: `Failed to analyze image with AI`

## ✅ Solution (Takes 2 Minutes)

### Step 1: Open Google AI Studio
🔗 **https://aistudio.google.com/app/apikey**

### Step 2: Edit Your API Key
1. Click the **pencil icon** next to your key
2. Scroll to **"Application restrictions"**
3. Select **"Don't restrict key"**
4. Click **"Save"**

### Step 3: Wait 2 Minutes
Let Google's systems update...

### Step 4: Test
Try skin analysis again - it should work! ✅

---

## 🎯 What Happened?

Your Gemini API key was blocking requests from Cloud Functions because they don't send HTTP referrer headers.

**The Error:**
```
"Requests from referer <empty> are blocked."
```

**The Fix:**
Remove HTTP referrer restrictions to allow server-to-server calls.

---

## 🔐 Prefer to Keep Restrictions?

Instead of "Don't restrict key", add these referrers:
- `*.cloudfunctions.net/*`
- `*.run.app/*`

Then Save.

---

## ✨ That's It!

Once you update the API key, skin analysis will work perfectly.

**Full details:** See `FIX_GEMINI_API_RESTRICTIONS.md`

