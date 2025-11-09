# 🚀 SMS Features - Quick Activation Guide

## ✅ Your A2P Twilio Approval is Valuable!

**Decision: Use Twilio** (you're already approved and ready to go!)

### Why Twilio Makes Sense for You:
- ✅ **Ready NOW** - you're already A2P approved
- ✅ **Better deliverability** - carriers trust your verified brand
- ✅ **No waiting** - AWS would need 1-4 weeks for separate A2P approval
- ✅ **Cost is reasonable** - ~$2-3/month for typical salon usage
- ✅ **Professional service** - best uptime and support

---

## 📋 5-Minute Setup Checklist

### ☑️ Step 1: Install Twilio Package (1 min)

```bash
cd functions
npm install twilio
```

### ☑️ Step 2: Add Twilio Credentials (2 min)

Get these from [Twilio Console](https://console.twilio.com/):

1. **Account SID** (starts with AC...)
2. **Auth Token** (click eye icon to reveal)
3. **Phone Number** (your A2P approved number, format: +12345678900)

Edit `functions/.env` and add:

```bash
# Twilio A2P Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900
```

**Security Note:** Never commit `.env` to Git (it's already in `.gitignore`)

### ☑️ Step 3: Deploy Functions (2 min)

```bash
cd functions
npm run deploy
```

Wait for deployment to complete (~1-2 minutes)

### ☑️ Step 4: Configure Twilio Webhook (30 sec)

1. Go to [Twilio Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click your A2P approved phone number
3. Scroll to "Messaging"
4. Under "A MESSAGE COMES IN":
   - Select: **Webhook**
   - URL: `https://us-central1-bueno-brows-7cce7.cloudfunctions.net/smsWebhook`
   - HTTP: **POST**
5. Click **Save**

### ☑️ Step 5: Test It! (30 sec)

**Test 1: Guest Booking Verification**
1. Go to: https://bueno-brows-7cce7.web.app
2. Click "Book Now"
3. Enter your phone number
4. Click "Send Code"
5. 📱 **You should receive a text within 5 seconds!**

**Test 2: AI Chatbot**
1. Text your Twilio number from any phone
2. Send: "hours" or "pricing" or "available"
3. 📱 **You should get an auto-reply!**

---

## 🎉 Features Now Active

### 1. ✅ SMS Verification for Guest Bookings
- Prevents fake bookings
- 6-digit codes that expire in 5 minutes
- Professional verification flow
- Fallback to email if customer prefers

### 2. ✅ AI-Powered SMS Chatbot
Customers can text your business number and get instant responses:
- **"hours"** → Business hours
- **"pricing"** → Service prices
- **"available"** → Available appointment slots
- **"location"** → Your address
- Any question → AI-powered response

### 3. ✅ Admin SMS Interface
- Send SMS from admin dashboard
- View all conversations
- See message history
- Manual responses when needed

### 4. ✅ Appointment Notifications
- Booking confirmations
- 24-hour reminders
- Follow-up messages
- Rescheduling notifications

---

## 💰 Your Monthly Cost (Estimated)

Based on typical salon usage:

| Activity | Est. Quantity | Cost |
|----------|--------------|------|
| Guest verifications | 50/month | $0.40 |
| Booking confirmations | 50/month | $0.40 |
| Reminders (24hr before) | 50/month | $0.40 |
| Customer inquiries (inbound) | 30/month | $0.24 |
| Admin responses | 20/month | $0.16 |
| Phone number | 1/month | $1.15 |
| **TOTAL** | | **~$2.75/month** |

**Less than a cup of coffee for professional SMS features!** ☕

---

## 🔍 How to Monitor

### Check Twilio Console
Visit [Twilio Console](https://console.twilio.com/) to see:
- Real-time message delivery
- Delivery status per message
- Error logs
- Usage statistics

### Check Firebase Functions Logs
```bash
firebase functions:log
```

Look for:
- `✅ SMS sent via Twilio (A2P approved)`
- `✅ AI SMS sent via Twilio`
- `SMS webhook received`

### Check Firestore Collections
- **sms_logs** - all SMS sent/received
- **sms_conversations** - customer text conversations
- **verification_codes** - verification attempts

---

## 🎯 Smart Features Already Built-In

### Automatic Fallback System
Your code automatically:
1. Tries Twilio first (if configured)
2. Falls back to AWS SNS (if Twilio unavailable)
3. Logs messages (if neither configured)

### Cost Optimization
- ✅ Response caching (common questions cached 24hr)
- ✅ Rate limiting (prevents abuse)
- ✅ Smart routing (uses cheapest available provider)

### Security
- ✅ Admin-only SMS sending
- ✅ Rate limits (5 SMS per 5 min per number)
- ✅ Verification code expiration
- ✅ One-time code usage
- ✅ STOP/HELP compliance built-in

---

## 📱 Webhook URLs (Reference)

| Function | URL |
|----------|-----|
| SMS Webhook (inbound) | `https://us-central1-bueno-brows-7cce7.cloudfunctions.net/smsWebhook` |
| SMS AI Webhook | `https://us-central1-bueno-brows-7cce7.cloudfunctions.net/smsAIWebhook` |

Use these in Twilio console for incoming message handling.

---

## ❓ Troubleshooting

### SMS Not Sending?
1. ✅ Check `.env` file has correct credentials
2. ✅ Verify functions deployed: `firebase functions:list`
3. ✅ Check Twilio console for errors
4. ✅ Check Firebase logs: `firebase functions:log`

### SMS Not Receiving?
1. ✅ Verify webhook URL in Twilio console
2. ✅ Confirm HTTP method is POST
3. ✅ Test webhook in Twilio console
4. ✅ Check Firebase functions logs

### Wrong SMS Content?
1. ✅ Update templates in `functions/src/sms.ts`
2. ✅ Update AI prompts in `functions/src/sms-ai-integration.ts`
3. ✅ Deploy functions: `npm run deploy`

---

## 🎊 Success!

Your SMS features are now **LIVE** with:
- ✅ A2P 10DLC approval (professional, trusted delivery)
- ✅ Guest booking verification
- ✅ AI-powered chatbot
- ✅ Admin SMS interface  
- ✅ Automatic notifications
- ✅ Cost-effective at ~$2.75/month

**Start texting with your customers today!** 📱

---

## 📞 Support

**Twilio Issues:**
- Console: https://console.twilio.com/
- Support: https://support.twilio.com
- Docs: https://www.twilio.com/docs/sms

**Firebase Issues:**
- Console: https://console.firebase.google.com/
- Docs: https://firebase.google.com/docs/functions

**Check Your Logs:**
```bash
# Firebase functions
firebase functions:log

# Twilio messages  
https://console.twilio.com/us1/monitor/logs/sms
```

---

**Questions? Check `ACTIVATE_SMS_FEATURES.md` for detailed information.**



