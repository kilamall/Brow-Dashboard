# 🤖 AI Chatbot Integration Setup Guide

This guide will help you set up an intelligent AI chatbot using Google Gemini AI that can handle customer SMS inquiries, provide real-time business information, and interact with your Firebase database.

## 🎯 What This Does

- **Intelligent Responses**: AI-powered responses to customer questions
- **Real-time Data**: Access to live appointment availability, services, and business hours
- **SMS Integration**: Works with your existing phone number via AWS SNS
- **Database Integration**: Reads from and writes to your Firebase database
- **Admin Dashboard**: Monitor all AI conversations in real-time

## 🚀 Quick Setup

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (starts with `AIza...`)

### 2. Run Setup Script

```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard
node setup-gemini-ai.js
```

Follow the prompts to:
- Enter your Gemini API key
- Optionally set up AWS SNS for SMS
- Deploy the AI functions

### 3. Test the AI

```bash
# Test AI chatbot
firebase functions:shell
testAIChatbot({phoneNumber: "+1234567890", message: "What services do you offer?"})

# Test SMS + AI integration
testSMSAI({phoneNumber: "+1234567890", message: "Do you have availability this week?"})
```

## 📱 SMS Setup Options

### Option 1: AWS SNS (Recommended - Use Your Own Number)

1. **AWS Account Setup**:
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Create an account or sign in
   - Go to IAM → Users → Create User
   - Attach policy: `AmazonSNSFullAccess`
   - Create access keys

2. **Enable SMS in SNS**:
   - Go to SNS → Text messaging (SMS)
   - Request production access
   - Add your phone number
   - Set up spending limits

3. **Configure Webhook**:
   - Point your phone number to: `smsAIWebhook` function
   - Webhook URL: `https://us-central1-your-project.cloudfunctions.net/smsAIWebhook`

### Option 2: Twilio (Alternative)

1. **Twilio Setup**:
   - Sign up at [Twilio](https://www.twilio.com/)
   - Get a phone number
   - Set webhook URL to your function

2. **Configure Function**:
   - Update `sms-ai-integration.ts` to use Twilio instead of AWS SNS

## 🧠 AI Features

### Smart Responses
- **Availability**: "Do you have slots this week?" → AI checks real calendar
- **Pricing**: "How much for brow shaping?" → AI provides current prices
- **Hours**: "When are you open?" → AI gives current business hours
- **Booking**: "I want to book" → AI guides through process

### Context Awareness
- Remembers previous conversations
- Tracks customer preferences
- Provides personalized responses
- Maintains conversation history

### Business Integration
- Reads live appointment data
- Checks service availability
- Updates customer records
- Logs all interactions

## 📊 Admin Dashboard

### AI Conversations Page
- View all customer interactions
- Filter by customer or message type
- See AI responses and context
- Monitor conversation quality

### Features
- **Real-time Updates**: See new messages as they arrive
- **Customer History**: Track all interactions per customer
- **AI Context**: View what data AI used for responses
- **Message Status**: See if SMS was sent successfully

## 🔧 Configuration

### Environment Variables
```bash
# Gemini AI
firebase functions:config:set gemini.api_key="your_gemini_api_key"

# AWS SNS (optional)
firebase functions:config:set aws.access_key_id="your_aws_key"
firebase functions:config:set aws.secret_access_key="your_aws_secret"
firebase functions:config:set aws.region="us-east-1"
firebase functions:config:set business.phone_number="+1234567890"
```

### Business Context
Update `BUSINESS_CONTEXT` in `ai-chatbot.ts`:
```typescript
const BUSINESS_CONTEXT = {
  name: "Your Business Name",
  type: "Your business type",
  services: [
    { name: "Service 1", price: 45, duration: 60 },
    // Add your services
  ],
  hours: {
    monday: "9:00 AM - 6:00 PM",
    // Add your hours
  },
  location: "Your Address",
  phone: "Your Phone Number"
};
```

## 🧪 Testing

### Test AI Responses
```bash
# Test different scenarios
testAIChatbot({phoneNumber: "+1234567890", message: "Hello"})
testAIChatbot({phoneNumber: "+1234567890", message: "What services do you offer?"})
testAIChatbot({phoneNumber: "+1234567890", message: "Do you have availability?"})
testAIChatbot({phoneNumber: "+1234567890", message: "How much does it cost?"})
```

### Test SMS Integration
```bash
# Test SMS + AI
testSMSAI({phoneNumber: "+1234567890", message: "Hi, I want to book an appointment"})
```

### Monitor Logs
```bash
# View function logs
firebase functions:log --only aiChatbot,smsAIWebhook
```

## 📈 Analytics

### Firebase Collections
- `ai_conversations`: All AI interactions
- `ai_sms_conversations`: SMS-specific AI conversations
- `customers`: Customer data with AI interaction history

### Key Metrics
- Total AI interactions
- Response accuracy
- Customer satisfaction
- Booking conversion rate

## 🛠️ Troubleshooting

### Common Issues

1. **AI Not Responding**:
   - Check Gemini API key
   - Verify function deployment
   - Check function logs

2. **SMS Not Sending**:
   - Verify AWS SNS credentials
   - Check phone number format
   - Ensure SMS is enabled in AWS

3. **Database Errors**:
   - Check Firebase security rules
   - Verify collection permissions
   - Check function authentication

### Debug Commands
```bash
# Check function status
firebase functions:list

# View logs
firebase functions:log --only aiChatbot

# Test locally
firebase emulators:start --only functions
```

## 🚀 Deployment

### Deploy All Functions
```bash
firebase deploy --only functions
```

### Deploy Specific Functions
```bash
firebase deploy --only functions:aiChatbot,functions:smsAIWebhook
```

### Update Security Rules
```bash
firebase deploy --only firestore:rules
```

## 📞 Support

### Getting Help
1. Check function logs: `firebase functions:log`
2. Test individual functions: `firebase functions:shell`
3. Verify configuration: `firebase functions:config:get`

### Common Commands
```bash
# View all functions
firebase functions:list

# View function details
firebase functions:describe aiChatbot

# Test function
firebase functions:shell
testAIChatbot({phoneNumber: "+1234567890", message: "test"})
```

## 🎉 Success!

Once set up, your AI chatbot will:
- ✅ Respond to customer SMS automatically
- ✅ Provide real-time business information
- ✅ Help with appointment booking
- ✅ Learn from customer interactions
- ✅ Integrate with your existing systems

Your customers can now text your business number and get intelligent, helpful responses powered by AI!
