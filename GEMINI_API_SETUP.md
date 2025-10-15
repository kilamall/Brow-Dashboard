# 🤖 Gemini API Setup Guide

## Quick Overview

You need a Google Gemini API key to power the AI skin analysis feature. Don't worry - it's **free** to get started and very affordable even at scale!

## 📋 What You Need

- A Google account (Gmail)
- 5 minutes of your time
- That's it!

## 🚀 Step-by-Step Setup

### Step 1: Get Your Gemini API Key (2 minutes)

1. **Go to Google AI Studio**
   - Visit: https://makersuite.google.com/app/apikey
   - Or visit: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account**
   - Use any Google/Gmail account
   - Accept the terms of service if prompted

3. **Create API Key**
   - Click the **"Create API Key"** button
   - Choose **"Create API key in new project"** (recommended)
   - Or select an existing Google Cloud project if you have one

4. **Copy Your API Key**
   - Your key will start with `AIza...`
   - **IMPORTANT:** Copy it immediately and save it somewhere safe
   - You'll need it for the next step

   Example key format: `AIzaSyD1234567890abcdefghijklmnopqrstuvwx`

### Step 2: Configure Firebase Functions (2 minutes)

Open your terminal and navigate to your project:

```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard
```

Then set your Gemini API key:

```bash
firebase functions:config:set gemini.api_key="YOUR_API_KEY_HERE"
```

**Example:**
```bash
firebase functions:config:set gemini.api_key="AIzaSyD1234567890abcdefghijklmnopqrstuvwx"
```

### Step 3: Verify Configuration (1 minute)

Check that it was set correctly:

```bash
firebase functions:config:get
```

You should see output like:
```json
{
  "gemini": {
    "api_key": "AIzaSyD1234567890abcdefghijklmnopqrstuvwx"
  }
}
```

### Step 4: Deploy Functions

Now deploy your Cloud Functions with the API key:

```bash
firebase deploy --only functions
```

This will take a few minutes and make your API key available to the Cloud Functions.

## ✅ You're Done!

That's it! Your Gemini API is now configured and ready to analyze skin photos.

## 💰 Pricing & Limits

### Free Tier (Perfect for Getting Started)

- **Rate Limit:** 60 requests per minute
- **Daily Limit:** 1,500 requests per day
- **Cost:** **FREE** ✨

This is more than enough for:
- Testing the feature
- Low to medium traffic
- Up to 1,500 skin analyses per day!

### Paid Tier (If You Need More)

If you exceed the free tier, Google automatically switches to paid usage:

- **Gemini 1.5 Flash:** ~$0.00025 per image (1/4 of a penny!)
- **Example:** 10,000 analyses = $2.50

**Super affordable!**

### Cost Estimates

| Monthly Analyses | Approximate Cost |
|-----------------|------------------|
| 100 | FREE |
| 1,000 | FREE |
| 10,000 | ~$2.50 |
| 50,000 | ~$12.50 |
| 100,000 | ~$25.00 |

## 🔒 Security Best Practices

### ✅ DO:
- Keep your API key secret and private
- Use Firebase Functions config (like we did above)
- Never commit API keys to Git
- Monitor your usage in Google AI Studio

### ❌ DON'T:
- Share your API key publicly
- Put it in your frontend code
- Commit it to version control
- Post it on social media or forums

## 📊 Monitor Usage

### Check Your Usage

1. Go to: https://aistudio.google.com/
2. Click on your profile/settings
3. View your quota and usage

### Set Up Billing Alerts (Optional)

If you want to be notified when usage increases:

1. Go to: https://console.cloud.google.com
2. Select your project
3. Navigate to Billing → Budgets & Alerts
4. Set up a budget alert (e.g., notify me at $5, $10, etc.)

## 🧪 Test Your Setup

Once deployed, test the skin analysis feature:

1. **Log in to your booking site**
2. **Go to `/skin-analysis`**
3. **Upload a test photo**
4. **Verify you get AI-generated results**

If it works - congratulations! 🎉

## 🐛 Troubleshooting

### "API Key Not Found" Error

**Check if it's set:**
```bash
firebase functions:config:get gemini.api_key
```

**If empty, set it again:**
```bash
firebase functions:config:set gemini.api_key="YOUR_KEY_HERE"
firebase deploy --only functions
```

### "Quota Exceeded" Error

**Free tier limits:**
- 60 requests per minute
- 1,500 per day

**Solutions:**
1. Wait for the quota to reset (happens every minute/day)
2. Enable billing in Google Cloud Console for higher limits
3. Implement rate limiting in your app

### "Invalid API Key" Error

**Check:**
1. API key is correct (starts with `AIza`)
2. No extra spaces or quotes
3. API is enabled in Google Cloud Console

**Fix:**
```bash
# Remove old key
firebase functions:config:unset gemini.api_key

# Set new key
firebase functions:config:set gemini.api_key="CORRECT_KEY_HERE"

# Deploy
firebase deploy --only functions
```

### "Permission Denied" Error

**Enable the Generative Language API:**
1. Go to: https://console.cloud.google.com
2. Select your project
3. Go to APIs & Services → Library
4. Search for "Generative Language API"
5. Click "Enable"

### "Function Not Responding" Error

**Check Cloud Function logs:**
```bash
firebase functions:log --only analyzeSkinPhoto
```

**Look for errors in the output**

## 🔄 Updating Your API Key

If you need to rotate your API key:

```bash
# Get a new key from Google AI Studio
# Then update Firebase:
firebase functions:config:set gemini.api_key="NEW_KEY_HERE"
firebase deploy --only functions
```

## 📚 Additional Resources

### Google AI Studio
- Dashboard: https://aistudio.google.com
- Documentation: https://ai.google.dev/docs
- Pricing: https://ai.google.dev/pricing

### Gemini API
- API Reference: https://ai.google.dev/api/rest
- Rate Limits: https://ai.google.dev/gemini-api/docs/models/gemini#rate-limits
- Best Practices: https://ai.google.dev/gemini-api/docs/best-practices

## 💡 Tips for Success

### 1. Start with Free Tier
- Test thoroughly before enabling billing
- Monitor usage patterns
- Understand your customer behavior

### 2. Optimize Costs
- The free tier is generous
- Most small-to-medium businesses stay free forever
- Only pay for what you use beyond free tier

### 3. Monitor Regularly
- Check usage weekly
- Set up billing alerts
- Track which features use the most API calls

### 4. Cache Results (Future Enhancement)
- Store analysis results in Firestore
- Avoid re-analyzing the same photo
- Reduces API calls and costs

## 🎯 What's Next?

After setting up your API key:

1. ✅ Deploy your functions
2. ✅ Test the skin analysis feature
3. ✅ Update your documentation files
4. ✅ Share with your team
5. ✅ Launch to customers!

## 📞 Support

### If You Get Stuck

1. **Check the error message carefully**
2. **Review this guide** - most issues are covered
3. **Check Firebase Functions logs:**
   ```bash
   firebase functions:log
   ```
4. **Check Google AI Studio** for quota/billing issues
5. **Try the troubleshooting section** above

## ✨ Success Checklist

Before launching, verify:

- [ ] Gemini API key obtained from Google AI Studio
- [ ] API key set in Firebase Functions config
- [ ] Functions deployed successfully
- [ ] Tested skin analysis with real photos
- [ ] Results are accurate and detailed
- [ ] Reviewed pricing and usage limits
- [ ] Set up billing alerts (optional)
- [ ] Documented API key location for team

## 🎉 Congratulations!

Once you complete this setup, you'll have:
- ✅ AI-powered skin analysis
- ✅ Professional-grade recommendations
- ✅ Foundation matching
- ✅ Facial feature analysis
- ✅ Personalized beauty reports

All powered by Google's cutting-edge Gemini AI!

---

**Remember:** Your API key is like a password. Keep it safe, never share it publicly, and use Firebase Functions config to manage it securely.

**Questions?** Check the troubleshooting section or review the Firebase Functions logs for detailed error messages.

