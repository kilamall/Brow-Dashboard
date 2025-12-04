# Free SMS Bot Testing Guide

Test your SMS bot **without sending real texts** (and spending money)!

## Quick Start

```bash
# Test with a message
node test-sms-bot.js "available?"

# Test with different messages
node test-sms-bot.js "What are your hours?"
node test-sms-bot.js "BOOK 11/18 2pm brow wax"
node test-sms-bot.js "What's available on 11/20?"
```

## Interactive Mode

If you don't provide a message, it will prompt you:

```bash
node test-sms-bot.js
# Then type your message when prompted
```

## How It Works

This script simulates a Twilio webhook POST request to your `smsWebhook` function. It:
- ✅ Calls your function directly (no SMS charges)
- ✅ Shows the bot's response
- ✅ Works exactly like a real SMS
- ✅ Free to use as much as you want!

## Customization

You can customize the test phone number:

```bash
export TEST_PHONE="+15559876543"
node test-sms-bot.js "available?"
```

Or use a different function URL:

```bash
export SMS_WEBHOOK_URL="https://your-custom-url"
node test-sms-bot.js "available?"
```

## Viewing Logs

Check Firebase Console > Functions > Logs to see detailed processing logs:
- Message parsing
- Gemini AI calls
- Database operations
- Error messages

## Example Test Messages

```bash
# Availability requests
node test-sms-bot.js "available?"
node test-sms-bot.js "What's available?"
node test-sms-bot.js "What's available on 11/18?"

# Booking requests
node test-sms-bot.js "BOOK 11/18 2pm brow wax"
node test-sms-bot.js "I need a brow wax next Tuesday at 2pm"

# Questions
node test-sms-bot.js "What are your hours?"
node test-sms-bot.js "How much does brow tinting cost?"

# Greetings
node test-sms-bot.js "hi"
node test-sms-bot.js "hello"
```

## Troubleshooting

**Function not found?**
- Make sure `smsWebhook` is deployed: `firebase deploy --only functions:smsWebhook`
- Check the URL in Firebase Console > Functions

**No response?**
- Check Firebase Console > Functions > Logs for errors
- Make sure your function has the required secrets configured

**Want to test with a real phone number?**
- The script uses a fake number by default
- You can change `TEST_PHONE` to any format (it's just for testing)







