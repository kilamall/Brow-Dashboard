# Twilio A2P 10DLC Setup Instructions

## 📱 SMS Verification with Twilio

Your SMS verification system is **ready to switch to Twilio** once your A2P 10DLC campaign is approved!

### Current Status
- ✅ **Email verification**: Fully functional via SendGrid
- ⏳ **SMS verification**: Waiting for A2P 10DLC campaign approval

### What is A2P 10DLC?
A2P (Application-to-Person) 10DLC is a type of long code phone number designed for application-to-person messaging. It's required by carriers in the US to send commercial SMS messages.

---

## 🚀 How to Enable Twilio (Once Approved)

### Step 1: Get Your Twilio Credentials
Once your A2P 10DLC campaign is approved by Twilio:

1. Go to [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID**
3. Find your **Auth Token**
4. Note your **Twilio Phone Number** (the 10DLC number)

### Step 2: Add Credentials to Firebase Functions

Open your `functions/.env` file and add these lines:

```bash
# Twilio Configuration (for SMS verification)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+12345678900
```

**Important Notes:**
- Replace the placeholder values with your actual Twilio credentials
- The phone number must be in E.164 format (e.g., `+12345678900`)
- Keep the `.env` file secure - never commit it to Git
- You can find your credentials at: https://console.twilio.com/

### Step 3: Deploy the Functions

```bash
cd functions
npm run deploy
```

That's it! The code will **automatically detect** the Twilio credentials and start using Twilio instead of AWS SNS.

---

## 🔄 How It Works

The SMS verification system has 3 fallback options:

1. **Twilio** (Primary - once A2P 10DLC is approved)
   - If `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER` are set
   - SMS sent via Twilio API
   - Logged in Firestore with `provider: 'twilio'`

2. **AWS SNS** (Fallback)
   - If Twilio is not configured but AWS credentials are set
   - SMS sent via AWS SNS
   - Logged in Firestore with `provider: 'aws_sns'`

3. **Log Only** (Development)
   - If neither service is configured
   - SMS is logged to console and database only
   - Status: `pending_a2p`

---

## 📊 Monitoring

All SMS attempts are logged in Firestore at `/sms_logs`:

```javascript
{
  to: '+1234567890',
  body: 'Your verification code...',
  type: 'verification',
  status: 'sent' | 'failed' | 'pending_a2p',
  timestamp: '2024-01-01T00:00:00.000Z',
  provider: 'twilio' | 'aws_sns',
  twilioMessageId: 'SM...' // Twilio SID
}
```

You can view these logs in:
- **Firebase Console**: Firestore → `sms_logs` collection
- **Firebase Functions Logs**: Check for `✅ SMS verification code sent via Twilio`

---

## 🧪 Testing SMS Verification

Once Twilio is set up, test the SMS verification:

1. **Go to**: https://bueno-brows-7cce7.web.app
2. **Start a guest booking**
3. **Enter a phone number** (use your own for testing)
4. **Click "Send Code"**
5. **Check your phone** for the SMS
6. **Enter the 6-digit code** and click "Verify"

---

## 🔒 Admin Controls

You can control SMS verification in the admin dashboard:

1. **Go to**: https://bueno-brows-admin-dashboard.web.app
2. **Navigate to**: Settings → Customer Verifications
3. **Toggle options**:
   - Enable/disable SMS verification
   - Enable/disable email verification
   - Require verification for guest bookings

---

## 📝 Current Implementation

The SMS verification code is in: `functions/src/guest-verification.ts`

Key function: `sendVerificationSMS()`

This function automatically chooses the best SMS provider based on what's configured.

---

## ❓ Need Help?

- **Twilio Support**: https://support.twilio.com
- **A2P 10DLC Guide**: https://www.twilio.com/docs/sms/a2p-10dlc
- **Firebase Functions**: https://firebase.google.com/docs/functions

---

## 📞 Contact

If you have any questions about setting this up, let me know!

