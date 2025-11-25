# 📧 Email Troubleshooting Guide

## Why Clients Aren't Receiving Receipt Emails

### Quick Check: SendGrid Configuration

1. **Check if SendGrid API Key is configured:**
   ```bash
   firebase functions:config:get
   ```
   Look for `SENDGRID_API_KEY` in the output.

2. **If not configured, set it:**
   ```bash
   # Get your SendGrid API key from: https://app.sendgrid.com/settings/api_keys
   firebase functions:secrets:set SENDGRID_API_KEY
   # Or if using the old config method:
   firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
   ```

3. **Verify SendGrid account status:**
   - Go to [SendGrid Dashboard](https://app.sendgrid.com)
   - Check if your account is verified
   - Check if you've verified your sender email (`hello@buenobrows.com`)
   - Check if your account has been suspended or has sending limits

### Check Email Logs

The system logs all email attempts in the `email_logs` collection in Firestore. You can check:

1. **In Firebase Console:**
   - Go to Firestore Database
   - Open the `email_logs` collection
   - Look for recent entries with `type: 'receipt-email'`
   - Check the `status` field: `'sent'` or `'failed'`
   - If `'failed'`, check the `error` field for details

2. **Using the diagnostic function:**
   - I've created a `checkEmailConfig` function you can call
   - It will show you:
     - Whether SendGrid is configured
     - Recent email send attempts
     - Success/failure rates
     - Specific errors

### Common Issues

1. **SendGrid API Key Not Set**
   - **Symptom**: No emails sent, logs show "SENDGRID_API_KEY not configured"
   - **Fix**: Set the API key as shown above

2. **Sender Email Not Verified**
   - **Symptom**: Emails fail with "sender verification" error
   - **Fix**: Verify `hello@buenobrows.com` in SendGrid dashboard

3. **SendGrid Account Suspended**
   - **Symptom**: All emails fail
   - **Fix**: Check SendGrid dashboard for account status

4. **Emails Going to Spam**
   - **Symptom**: Emails sent successfully but clients don't see them
   - **Fix**: 
     - Set up SPF/DKIM records for your domain
     - Verify domain in SendGrid
     - Ask clients to check spam folder

5. **Rate Limits**
   - **Symptom**: Some emails fail with rate limit errors
   - **Fix**: Upgrade SendGrid plan or wait for rate limit reset

### Testing Email Sending

1. **Test with a known good email:**
   - Mark an appointment as "attended" for a test customer
   - Check the `email_logs` collection immediately after
   - Look for the entry and check its status

2. **Check Cloud Function logs:**
   ```bash
   firebase functions:log --only markAttendance
   ```
   Look for:
   - `✅ Receipt email sent to customer` (success)
   - `❌ Error sending email` (failure)
   - `⚠️ SENDGRID_API_KEY not set` (configuration issue)

### Next Steps

1. **Deploy the diagnostic function:**
   ```bash
   firebase deploy --only functions:checkEmailConfig
   ```

2. **Check email configuration:**
   - The diagnostic will tell you exactly what's wrong

3. **Fix the issue:**
   - Follow the recommendations from the diagnostic

4. **Test again:**
   - Mark a test appointment as attended
   - Check if the receipt email is sent

