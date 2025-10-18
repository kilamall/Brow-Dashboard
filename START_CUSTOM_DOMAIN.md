# 🎯 START HERE - Custom Domain Setup

## Your Mission: Set Up Custom Domains for Your Bueno Brows Sites

Currently your sites are at:
- 🔧 **Admin**: https://bueno-brows-admin.web.app
- 📅 **Booking**: https://bueno-brows-7cce7.web.app

After setup, they'll be at:
- 🔧 **Admin**: https://admin.buenobrows.com (or your custom domain)
- 📅 **Booking**: https://book.buenobrows.com (or your custom domain)

---

## ⏱️ Time Required: ~1 hour
- 10 minutes of your time (actual work)
- 50 minutes of waiting (for DNS/SSL)

---

## 📚 Which Guide Should You Use?

### 🚀 **Quick Start** (Recommended for Most People)
**File**: `CUSTOM_DOMAIN_QUICKSTART.md`

**Use this if:**
- ✅ You want to get it done fast
- ✅ You have a domain already (GoDaddy, Namecheap, etc.)
- ✅ You're comfortable following step-by-step instructions

**What it covers:**
- 5 simple steps
- Plain English instructions
- Quick troubleshooting tips

---

### 📖 **Full Guide** (For Detailed Information)
**File**: `CUSTOM_DOMAIN_SETUP.md`

**Use this if:**
- ✅ You want detailed explanations
- ✅ You need provider-specific instructions (GoDaddy, Cloudflare, etc.)
- ✅ You want to understand what each step does
- ✅ You're encountering issues and need troubleshooting

**What it covers:**
- Comprehensive step-by-step process
- Provider-specific instructions
- Detailed troubleshooting
- Security and best practices
- FAQ and support resources

---

### 📋 **DNS Records Reference** (Visual Guide)
**File**: `DNS_RECORDS_REFERENCE.md`

**Use this if:**
- ✅ You want to see exactly what DNS records should look like
- ✅ You need a visual reference while adding records
- ✅ You're confused about what values to enter
- ✅ You want to avoid common mistakes

**What it covers:**
- Visual tables of DNS records
- Examples for different domain registrars
- Common mistakes to avoid
- Verification commands

---

## 🛠️ Tools Provided

### DNS Checker Script
**File**: `check-dns.sh`

```bash
./check-dns.sh
```

**What it does:**
- Checks if your DNS records are set up correctly
- Verifies IPs are pointing to Firebase
- Tests if HTTPS/SSL is working
- Provides helpful tips and resources

---

## ✅ Step-by-Step Process (Overview)

```
1. Open Firebase Console
   └─> Get Firebase IP addresses for both sites
       (Takes 5 minutes)

2. Open Your Domain Registrar
   └─> Add DNS A records using Firebase IPs
       (Takes 5-10 minutes)

3. Wait for DNS Propagation
   └─> DNS spreads across internet
       (Takes 15-30 minutes, usually)

4. Firebase Provisions SSL
   └─> Automatic HTTPS certificates
       (Takes 5-15 minutes after DNS verification)

5. Go Live!
   └─> Your custom domains are ready
       (Test and celebrate! 🎉)
```

---

## 🎯 What You Need Before Starting

### Required:
- [ ] Your domain name (e.g., `buenobrows.com`)
- [ ] Access to your domain registrar account
- [ ] Firebase project access (you already have this)
- [ ] 10 minutes of focused time

### Helpful (but optional):
- [ ] Terminal access (for running `check-dns.sh`)
- [ ] Basic understanding of DNS (don't worry, we explain everything)

---

## 🚦 Recommended Path

### For Beginners:

```
START → Read CUSTOM_DOMAIN_QUICKSTART.md
         ↓
      Follow the 5 steps
         ↓
      Use DNS_RECORDS_REFERENCE.md as visual guide
         ↓
      Run ./check-dns.sh to verify
         ↓
      DONE! 🎉
```

### For Experienced Users:

```
START → Skim CUSTOM_DOMAIN_SETUP.md
         ↓
      Firebase Console → Get IPs
         ↓
      Domain Registrar → Add A records
         ↓
      Run ./check-dns.sh
         ↓
      DONE! 🎉
```

### If You Run Into Issues:

```
START → Check DNS_RECORDS_REFERENCE.md
         ↓
      Run ./check-dns.sh
         ↓
      Read troubleshooting in CUSTOM_DOMAIN_SETUP.md
         ↓
      Check Firebase Console for errors
         ↓
      Contact support or revisit guides
```

---

## 📝 Recommended Domain Structure

### Option 1: Subdomains (Easiest & Recommended)
```
admin.buenobrows.com     → Admin Dashboard
book.buenobrows.com      → Customer Booking Site
```

**Pros:**
- ✅ Clean and professional
- ✅ Easy to set up
- ✅ Works with any domain registrar
- ✅ Clear separation between admin and customer sites

### Option 2: Root Domain for Booking
```
admin.buenobrows.com     → Admin Dashboard
buenobrows.com           → Customer Booking Site
www.buenobrows.com       → Redirects to buenobrows.com
```

**Pros:**
- ✅ Shorter booking URL
- ✅ Main domain goes to booking site
- ✅ Professional appearance

**Cons:**
- ⚠️ Slightly more complex (need to add @ and www records)

### Option 3: Dashboard Subdomain
```
dashboard.buenobrows.com → Admin Dashboard
book.buenobrows.com      → Customer Booking Site
```

**Pros:**
- ✅ "Dashboard" might be clearer than "admin"
- ✅ Same setup as Option 1

**Pick whichever feels right for your brand!**

---

## 🎬 Getting Started NOW

### 1. Choose Your Domains
Decide what subdomains you want:
- Admin: `admin.buenobrows.com` or `dashboard.buenobrows.com`
- Booking: `book.buenobrows.com` or `www.buenobrows.com`

### 2. Open These Two Tabs:

**Tab 1**: Firebase Console
```
https://console.firebase.google.com/project/bueno-brows-7cce7/hosting
```

**Tab 2**: Your Domain Registrar
- GoDaddy: https://www.godaddy.com
- Namecheap: https://www.namecheap.com
- Cloudflare: https://dash.cloudflare.com
- Google Domains: https://domains.google.com
- (Or wherever you bought your domain)

### 3. Open Quick Start Guide:
```bash
# In your editor or terminal:
open CUSTOM_DOMAIN_QUICKSTART.md
```

### 4. Follow Steps 1-5!

---

## 🆘 If You Get Stuck

### Check These Resources (in order):

1. **DNS Records Reference**
   ```bash
   open DNS_RECORDS_REFERENCE.md
   ```
   Visual examples of what records should look like

2. **Run DNS Checker**
   ```bash
   ./check-dns.sh
   ```
   Diagnoses DNS issues

3. **Full Troubleshooting Guide**
   ```bash
   open CUSTOM_DOMAIN_SETUP.md
   ```
   Look for "Troubleshooting" section

4. **Firebase Hosting Docs**
   https://firebase.google.com/docs/hosting/custom-domain

5. **Check DNS Globally**
   https://dnschecker.org

---

## 📊 What Success Looks Like

When everything is working:

### ✅ DNS Check:
```bash
$ dig admin.buenobrows.com
# Shows 2 Firebase IP addresses (151.101.x.x)
```

### ✅ Browser Check:
```
Visit: https://admin.buenobrows.com
→ Shows admin login page
→ Shows 🔒 (secure) in address bar
→ No SSL warnings
```

### ✅ Firebase Console:
```
Status: Connected ✓
SSL: Active ✓
```

---

## ⚠️ Important Notes

### DNS Propagation Takes Time
- **Don't panic** if it doesn't work immediately
- **Normal wait**: 15-30 minutes
- **Maximum wait**: Up to 48 hours (rare)
- **Check progress**: Use `./check-dns.sh` or https://dnschecker.org

### SSL Certificates are Automatic
- Firebase uses Let's Encrypt (free)
- Provisions automatically after DNS verification
- Usually takes 5-15 minutes
- Renews automatically (you don't have to do anything)

### Your .web.app URLs Still Work
- `bueno-brows-admin.web.app` will still work
- `bueno-brows-7cce7.web.app` will still work
- These are backup URLs you can always use
- Custom domains are just additional URLs

### Cloudflare Users: Special Note
- If using Cloudflare, set proxy to **"DNS only"** during setup
- Look for the cloud icon (☁️) and click it to turn it grey
- You can enable proxy later after SSL is working

---

## 🎉 After Setup is Complete

Once your custom domains are live:

### 1. Update Firebase Authentication
Add your custom domains to authorized domains:
```
Firebase Console → Authentication → Settings
→ Authorized domains → Add domain
```

Add:
- `admin.buenobrows.com`
- `book.buenobrows.com`

### 2. Test Everything
- [ ] Log in to admin dashboard on custom domain
- [ ] Create test booking on booking site via custom domain
- [ ] Verify all features work
- [ ] Test on mobile devices

### 3. Update Marketing Materials
- Update business cards with new booking URL
- Update social media bios
- Update any promotional materials
- Update your website (if you have one)

### 4. Monitor
- Check Firebase Console for usage
- Monitor for any SSL certificate issues
- Keep an eye on DNS records in case you need to make changes

---

## 💡 Pro Tips

1. **Do both sites at once** - Add all DNS records in one session
2. **Copy-paste IPs** - Don't type Firebase IPs manually
3. **Use incognito mode** - When testing, use private/incognito to avoid cache
4. **Screenshot Firebase instructions** - For reference while in domain registrar
5. **Be patient** - DNS takes time, it's normal

---

## 📞 Need Human Help?

If automated guides aren't enough:

1. **Firebase Support**: https://firebase.google.com/support
2. **Your Domain Registrar Support**:
   - GoDaddy: 1-480-505-8877
   - Namecheap: Live chat on website
   - Cloudflare: Support ticket system
   - Google Domains: https://support.google.com/domains

3. **Community Help**:
   - Firebase Discord: https://discord.gg/firebase
   - Stack Overflow: [firebase-hosting] tag

---

## 🚀 Ready? Let's Go!

**Your next step:**

```bash
# Open the quick start guide
open CUSTOM_DOMAIN_QUICKSTART.md

# Or if you prefer the full guide
open CUSTOM_DOMAIN_SETUP.md
```

---

## 📋 File Reference Summary

| File | Purpose | When to Use |
|------|---------|-------------|
| `CUSTOM_DOMAIN_QUICKSTART.md` | Fast 5-step guide | Start here for quick setup |
| `CUSTOM_DOMAIN_SETUP.md` | Comprehensive guide | Detailed info & troubleshooting |
| `DNS_RECORDS_REFERENCE.md` | Visual DNS examples | Reference while adding records |
| `check-dns.sh` | DNS verification script | Check if DNS is working |
| `START_CUSTOM_DOMAIN.md` | This file | Overview and navigation |

---

## 🎯 Success Timeline

Most people complete this in about **1 hour**:

```
0:00  Start reading guide (5 min)
0:05  Get Firebase IPs (5 min)
0:10  Add DNS records (5-10 min)
0:20  [Wait for DNS propagation - 15-30 min]
0:50  [Wait for SSL provisioning - 5-15 min]
1:00  Test custom domains (5 min)
1:05  DONE! ✅
```

---

**Your custom domains are just 1 hour away! Let's do this! 🚀**

---

*Custom Domain Setup Overview | Last Updated: October 16, 2025*

