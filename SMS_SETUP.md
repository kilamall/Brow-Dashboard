# SMS Integration Setup Guide

This guide will help you set up SMS integration for your Bueno Brows salon, allowing customers to text your business number for availability and get automated responses.

## 🚀 Quick Setup

### 1. Twilio Account Setup

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for a free trial account
   - Verify your phone number

2. **Get a Phone Number**
   - In Twilio Console, go to Phone Numbers > Manage > Buy a number
   - Choose a local number for your business
   - Note down the phone number (e.g., +15551234567)

3. **Get API Credentials**
   - Go to Console Dashboard
   - Copy your Account SID and Auth Token
   - These will be used in your environment variables

### 2. Environment Variables

Add these to your Firebase Functions environment:

```bash
# Set Twilio credentials
firebase functions:config:set twilio.account_sid="your_account_sid"
firebase functions:config:set twilio.auth_token="your_auth_token"
firebase functions:config:set twilio.phone_number="+15551234567"

# Deploy the updated functions
firebase deploy --only functions
```

### 3. Webhook Configuration

1. **Get your webhook URL**
   - After deploying functions, your webhook will be at:
   - `https://us-central1-your-project-id.cloudfunctions.net/handleIncomingSMS`

2. **Configure Twilio Webhook**
   - In Twilio Console, go to Phone Numbers > Manage > Active numbers
   - Click on your phone number
   - Set the webhook URL for incoming messages:
     - **A message comes in**: `https://us-central1-your-project-id.cloudfunctions.net/handleIncomingSMS`
     - **HTTP method**: POST

## 📱 How It Works

### Customer Experience

Customers can text your business number with:

- **"AVAILABLE"** or **"OPEN"** → Get available appointment slots
- **"BOOK 12/15 2:00 PM"** → Request to book a specific time
- **"HOURS"** → Get business hours
- **"PRICING"** → Get service pricing
- **"LOCATION"** → Get business address
- **"HELP"** → Get instructions

### Automated Responses

The system automatically responds with:

- **Availability**: Shows next 7 days of available slots
- **FAQ Answers**: Responds to common questions
- **Booking Instructions**: Guides customers on how to book
- **Error Handling**: Provides help when messages aren't understood

### Admin Interface

Admins can:

- View all SMS conversations
- Send manual responses to customers
- Track conversation history
- Manage customer interactions

## 🔧 Configuration

### Customizing Responses

Edit the FAQ database in `functions/src/sms.ts`:

```typescript
const FAQ_DATABASE = {
  'hours': 'We\'re open Tuesday-Saturday 9AM-6PM, Sunday 10AM-4PM. Closed Mondays.',
  'pricing': 'Brow services start at $45. Full pricing: Basic $45, Shaping $55, Tinting $25, Waxing $15.',
  'location': 'We\'re located at 123 Main Street, Downtown. Free parking in the back lot.',
  // Add more FAQ entries
};
```

### Business Hours

Update your business hours in Firebase:

```javascript
// In Firestore, update settings/businessHours
{
  "monday": { "open": null, "close": null },
  "tuesday": { "open": "09:00", "close": "18:00" },
  "wednesday": { "open": "09:00", "close": "18:00" },
  "thursday": { "open": "09:00", "close": "18:00" },
  "friday": { "open": "09:00", "close": "18:00" },
  "saturday": { "open": "09:00", "close": "18:00" },
  "sunday": { "open": "10:00", "close": "16:00" }
}
```

## 💰 Pricing

### Twilio Costs (Approximate)

- **Phone Number**: ~$1/month
- **SMS Messages**: ~$0.0075 per message (US)
- **Incoming Messages**: Free
- **Outgoing Messages**: ~$0.0075 each

### Example Monthly Costs

- 100 customer texts/month = ~$0.75
- 200 admin responses/month = ~$1.50
- Phone number = ~$1.00
- **Total**: ~$3.25/month

## 🧪 Testing

### Test the Integration

1. **Send a test message** to your Twilio number
2. **Check Firebase Functions logs**:
   ```bash
   firebase functions:log
   ```
3. **Verify in admin interface** that conversations appear
4. **Test different message types**:
   - "AVAILABLE"
   - "HOURS"
   - "PRICING"
   - "BOOK 12/15 2:00 PM"

### Common Issues

1. **Webhook not receiving messages**
   - Check Twilio webhook URL is correct
   - Verify Firebase Functions are deployed
   - Check function logs for errors

2. **Messages not sending**
   - Verify Twilio credentials are correct
   - Check account has sufficient balance
   - Verify phone number format (+1XXXXXXXXXX)

3. **Availability not showing**
   - Check business hours are set in Firestore
   - Verify services are marked as active
   - Check appointment data structure

## 📊 Monitoring

### Firebase Console

- **Functions**: Monitor execution and errors
- **Firestore**: View SMS conversations and logs
- **Analytics**: Track usage patterns

### Twilio Console

- **Monitor**: View message delivery status
- **Logs**: Check for failed messages
- **Usage**: Monitor costs and limits

## 🔒 Security

### Data Protection

- Customer phone numbers are stored securely
- SMS conversations are encrypted in transit
- Admin access is controlled by Firebase Auth
- No sensitive data is logged

### Compliance

- Follow TCPA guidelines for SMS marketing
- Provide opt-out instructions
- Respect customer privacy
- Maintain conversation records

## 🚀 Advanced Features

### Future Enhancements

- **Appointment booking via SMS**: Complete booking flow
- **Payment integration**: Accept payments via SMS
- **Multi-language support**: Spanish/English responses
- **AI integration**: More natural language processing
- **Calendar sync**: Real-time availability updates

### Customization Options

- **Branded responses**: Customize message templates
- **Business logic**: Add custom rules and responses
- **Integration**: Connect with other business tools
- **Analytics**: Track customer engagement metrics

## 📞 Support

### Getting Help

- **Twilio Support**: [support.twilio.com](https://support.twilio.com)
- **Firebase Support**: [firebase.google.com/support](https://firebase.google.com/support)
- **Documentation**: Check function logs and Firebase console

### Troubleshooting

1. Check function logs: `firebase functions:log`
2. Verify environment variables: `firebase functions:config:get`
3. Test webhook manually: Use Twilio's webhook testing tool
4. Check Firestore rules: Ensure proper permissions

---

**Your SMS integration is now ready! Customers can text your business number for instant availability and support.** 📱✨
