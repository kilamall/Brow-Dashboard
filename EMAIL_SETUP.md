# 📧 Email Confirmation Setup Guide

This guide will help you configure email confirmations from **hello@buenobrows.com** for appointment bookings.

## 🎯 Overview

Your site will send beautiful, professional email confirmations when customers book appointments. The system includes:

- ✅ Automated confirmation emails when appointments are booked
- ✅ Professional HTML templates with your branding
- ✅ Reminder emails (24 hours before appointments)
- ✅ Email delivery tracking in Firestore
- ✅ Fallback to plain text for email clients that don't support HTML

---

## 🚀 Quick Start (Recommended)

### Option 1: Use the Setup Script

```bash
node setup-sendgrid.js
```

The script will guide you through:
1. Setting up your SendGrid account
2. Configuring your API key
3. Deploying the functions

### Option 2: Manual Setup

Follow the detailed instructions below.

---

## 📋 Step-by-Step Setup

### Step 1: Sign Up for SendGrid

1. Go to [SendGrid](https://signup.sendgrid.com/)
2. Create a **free account** (100 emails/day included)
3. Verify your email address

**Cost:** FREE (up to 100 emails/day)

---

### Step 2: Verify Your Domain

This is the most important step to send from `hello@buenobrows.com`:

1. Log into SendGrid
2. Go to **Settings → Sender Authentication**
3. Click **Domain Authentication**
4. Click **Get Started**
5. Select:
   - DNS Host: Choose your DNS provider (GoDaddy, Namecheap, etc.)
   - Enter domain: `buenobrows.com`
6. SendGrid will give you DNS records to add

#### DNS Records to Add

You'll need to add these records to your domain's DNS (example):

```
Type: CNAME
Host: s1._domainkey
Value: s1.domainkey.u12345678.wl.sendgrid.net

Type: CNAME
Host: s2._domainkey
Value: s2.domainkey.u12345678.wl.sendgrid.net

Type: CNAME
Host: em1234
Value: u12345678.wl.sendgrid.net
```

7. Wait for DNS propagation (can take up to 48 hours, usually 10-30 minutes)
8. Click **Verify** in SendGrid

✅ Once verified, you can send from `hello@buenobrows.com`

---

### Step 3: Create API Key

1. In SendGrid, go to **Settings → API Keys**
2. Click **Create API Key**
3. Name it: `Bueno Brows Production`
4. Select **Full Access**
5. Click **Create & View**
6. **COPY THE KEY** (you won't see it again!)
   - It will look like: `SG.xxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyy`

---

### Step 4: Configure Firebase Functions

Set the API key in Firebase:

```bash
firebase functions:config:set sendgrid.api_key="YOUR_API_KEY_HERE"
```

**Example:**
```bash
firebase functions:config:set sendgrid.api_key="SG.abc123xyz..."
```

To verify it's set:
```bash
firebase functions:config:get
```

---

### Step 5: Deploy Functions

Build and deploy your functions:

```bash
cd functions
npm run build
firebase deploy --only functions
```

This will deploy:
- `onAppointmentCreatedSendEmail` - Sends confirmation emails automatically

---

## 🧪 Testing

### Test 1: Create a Test Appointment

1. Go to your booking site
2. Book an appointment with a real email address
3. Check your inbox for the confirmation email
4. Check spam folder if not in inbox

### Test 2: Check Email Logs

View email delivery logs in Firestore:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Look for the `email_logs` collection
5. Each document shows:
   - `to`: recipient email
   - `status`: 'sent' or 'failed'
   - `timestamp`: when it was sent
   - `type`: 'appointment_confirmation'

### Test 3: SendGrid Dashboard

Check email delivery in SendGrid:

1. Log into SendGrid
2. Go to **Activity**
3. View recent emails sent
4. See delivery status, opens, clicks

---

## 📧 Email Templates

### Confirmation Email

Sent immediately when an appointment is booked:

**Subject:** ✨ Appointment Confirmed - [Service] on [Date]

**Contains:**
- Service name
- Date and time
- Duration
- Price (if available)
- Notes (if any)
- Link to customer dashboard
- Business contact info

### Reminder Email (Coming Soon)

Sent 24 hours before the appointment:

**Subject:** ⏰ Reminder: [Service] appointment tomorrow

---

## 🎨 Customizing Email Templates

The email templates are in `functions/src/email.ts`. You can customize:

### Change Business Info

Edit these lines in `email.ts`:

```typescript
const FROM_EMAIL = 'hello@buenobrows.com';
const FROM_NAME = 'Bueno Brows';
```

Update the footer section:
```typescript
<p style="margin: 0 0 10px 0;"><strong>Bueno Brows</strong></p>
<p style="margin: 5px 0;">123 Main Street, Downtown</p>
<p style="margin: 5px 0;">Phone: (555) 123-4567</p>
```

### Change Colors

The email uses a purple gradient. To change it, update:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Replace with your brand colors:
```css
background: linear-gradient(135deg, #yourColor1 0%, #yourColor2 100%);
```

### Add Your Logo

Add this to the header section:

```html
<div class="header">
  <img src="https://yourdomain.com/logo.png" alt="Bueno Brows" style="max-width: 200px; margin-bottom: 20px;">
  <h1 style="margin: 0; font-size: 28px;">✨ Appointment Confirmed!</h1>
</div>
```

---

## 🔧 Troubleshooting

### Emails Not Sending

**Check 1: Is SendGrid configured?**
```bash
firebase functions:config:get
```
Should show: `sendgrid.api_key`

**Check 2: View function logs**
```bash
firebase functions:log --only onAppointmentCreatedSendEmail
```

**Check 3: Verify domain is authenticated**
- Log into SendGrid
- Go to Settings → Sender Authentication
- Status should be "Verified"

### Emails Going to Spam

1. **Domain authentication:** Make sure you completed Step 2 above
2. **Warm up your domain:** Start with a few test emails, increase gradually
3. **Check SPF/DKIM records:** SendGrid provides these during domain authentication
4. **Content:** Avoid spam trigger words in subject/body

### Wrong "From" Email

The email will show as sent from `hello@buenobrows.com` ONLY if:
1. You've verified the domain `buenobrows.com` in SendGrid
2. DNS records are properly configured
3. Domain verification is complete

If not verified, SendGrid will use a generic sender.

### Customer Email Missing

If a customer doesn't have an email address in Firestore, no email will be sent. Check function logs:

```bash
firebase functions:log --only onAppointmentCreatedSendEmail
```

You'll see: `No email for customer: [customerId]`

---

## 💰 Pricing

### SendGrid Free Tier
- **100 emails/day**
- Perfect for starting out
- No credit card required

### SendGrid Essentials ($19.95/month)
- **50,000 emails/month**
- Email API support
- For growing businesses

### Cost Estimation

Based on typical usage:
- 10 appointments/day = ~300 emails/month (confirmations + reminders)
- **FREE tier is sufficient** for most small businesses
- Upgrade only if you exceed 100 emails/day

---

## 🔐 Security Best Practices

### Protect Your API Key

1. **Never commit API keys to git**
   - Keys are stored in Firebase config, not in code
   - The `.gitignore` includes `.env` files

2. **Rotate keys periodically**
   - Create a new API key in SendGrid every 6-12 months
   - Update Firebase config with new key
   - Delete old key

3. **Use restricted keys for production**
   - In SendGrid, create API keys with minimal permissions
   - "Mail Send" permission is all you need

---

## 📊 Monitoring

### View Email Stats

**In Firebase:**
```javascript
// Query email logs
const logs = await db.collection('email_logs')
  .where('type', '==', 'appointment_confirmation')
  .orderBy('timestamp', 'desc')
  .limit(100)
  .get();
```

**In SendGrid:**
- Go to **Statistics → Overview**
- See:
  - Total emails sent
  - Delivery rate
  - Open rate
  - Click rate
  - Bounce rate

### Set Up Alerts

In SendGrid, you can set up alerts for:
- Failed deliveries
- Spam reports
- Bounced emails

---

## 🆘 Support

### Need Help?

1. **SendGrid Support:** [support.sendgrid.com](https://support.sendgrid.com)
2. **Firebase Support:** [firebase.google.com/support](https://firebase.google.com/support)
3. **Check logs:** `firebase functions:log`

### Common Issues

| Issue | Solution |
|-------|----------|
| Emails not sending | Verify SendGrid API key is set |
| Wrong sender email | Complete domain authentication |
| Emails in spam | Add SPF/DKIM records |
| HTML not rendering | Email client doesn't support HTML (fallback works) |

---

## 🎉 You're All Set!

Once configured, your customers will automatically receive:
- ✅ Beautiful confirmation emails
- ✅ Professional branding
- ✅ All appointment details
- ✅ Links to manage their bookings

**Every time an appointment is booked**, an email is sent automatically from `hello@buenobrows.com`!

---

## Alternative Email Services

If you prefer not to use SendGrid, you can also use:

### AWS SES (if using AWS already)
- Lower cost at scale
- Requires more setup
- See `AWS_SES_SETUP.md` (coming soon)

### Resend (modern alternative)
- Developer-friendly
- Great docs
- See `RESEND_SETUP.md` (coming soon)

### Mailgun
- Similar to SendGrid
- Good deliverability
- See `MAILGUN_SETUP.md` (coming soon)

---

**Questions?** Check the troubleshooting section or contact support.


