# 📧 Email Setup - Quick Reference

## ⚡ 5-Minute Setup

### 1. Run Setup Script
```bash
node setup-sendgrid.js
```

### 2. Or Manual Setup
```bash
# 1. Get SendGrid API key from: https://app.sendgrid.com/settings/api_keys
# 2. Set it in Firebase:
firebase functions:config:set sendgrid.api_key="YOUR_API_KEY"

# 3. Deploy:
cd functions && npm run build && firebase deploy --only functions
```

---

## 🔑 What You Need

1. **SendGrid Account** (free)
   - Sign up: https://signup.sendgrid.com/
   
2. **Domain Verified** 
   - Add DNS records for `buenobrows.com`
   - Settings → Sender Authentication → Domain Authentication
   
3. **API Key**
   - Settings → API Keys → Create API Key
   - Copy the key (starts with `SG.`)

---

## 📋 DNS Records to Add

After domain authentication, SendGrid will give you DNS records. Add them to your domain registrar (GoDaddy, Namecheap, etc.):

**Example records:**
```
Type: CNAME
Host: s1._domainkey.buenobrows.com
Value: s1.domainkey.u12345678.wl.sendgrid.net

Type: CNAME  
Host: s2._domainkey.buenobrows.com
Value: s2.domainkey.u12345678.wl.sendgrid.net

Type: CNAME
Host: em1234.buenobrows.com
Value: u12345678.wl.sendgrid.net
```

⏱️ Wait 10-30 minutes for DNS propagation

---

## ✅ Testing

### Quick Test
1. Book a test appointment on your site
2. Check email (and spam folder)
3. View logs:
   ```bash
   firebase functions:log --only onAppointmentCreatedSendEmail
   ```

### Check Configuration
```bash
# View Firebase config
firebase functions:config:get

# Should show:
# {
#   "sendgrid": {
#     "api_key": "SG.xxxxx..."
#   }
# }
```

---

## 🎨 Customization

Edit `functions/src/email.ts`:

### Change Email Address
```typescript
const FROM_EMAIL = 'hello@buenobrows.com';  // Change this
const FROM_NAME = 'Bueno Brows';            // Change this
```

### Change Business Info
Update the footer section (~line 165):
```typescript
<p>123 Main Street, Downtown</p>        // Your address
<p>Phone: (555) 123-4567</p>           // Your phone
```

### Change Colors
Find this line (~line 60):
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```
Replace with your brand colors.

**After changes:**
```bash
cd functions && npm run build && firebase deploy --only functions
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No emails sending | Check `firebase functions:config:get` |
| Emails in spam | Complete domain authentication |
| Wrong sender | Verify domain in SendGrid |
| Logs show error | Check `firebase functions:log` |

---

## 📊 What Gets Sent

### Confirmation Email
- **When:** Immediately after booking
- **To:** Customer email
- **Contains:** Service, date, time, price, notes
- **From:** hello@buenobrows.com

### Email Logs
All emails are logged in Firestore → `email_logs` collection:
- `to`: recipient
- `status`: 'sent' or 'failed'
- `timestamp`: when sent
- `type`: 'appointment_confirmation'

---

## 💰 Cost

- **FREE:** Up to 100 emails/day
- **$19.95/month:** Up to 50,000 emails/month

Most small businesses stay on the free tier.

---

## 📚 Full Documentation

See `EMAIL_SETUP.md` for complete details.

---

## 🚀 Deploy Command

```bash
cd functions
npm run build
firebase deploy --only functions:onAppointmentCreatedSendEmail
```

Or deploy all functions:
```bash
firebase deploy --only functions
```

---

## ✨ That's It!

Once configured, emails send automatically when customers book appointments. No code changes needed for daily use.

**From:** hello@buenobrows.com  
**To:** Your customers  
**Result:** Happy customers! 🎉


