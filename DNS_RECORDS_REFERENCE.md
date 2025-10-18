# 📋 DNS Records Reference - Visual Guide

This document shows exactly what your DNS records should look like in your domain registrar.

---

## 🎯 What You're Setting Up

You have **2 Firebase Hosting sites** that need custom domains:

| Site | Current URL | Custom Domain (Example) | Purpose |
|------|-------------|------------------------|---------|
| Admin Dashboard | bueno-brows-admin.web.app | **admin.buenobrows.com** | Staff/Admin portal |
| Booking Site | bueno-brows-7cce7.web.app | **book.buenobrows.com** | Customer booking |

---

## 📝 DNS Records You Need to Add

### Replace with YOUR values:
- `buenobrows.com` → Your actual domain
- `151.101.1.195` & `151.101.65.195` → The IPs Firebase provides you

---

## Option 1: Using Subdomains (Recommended)

This is the cleanest approach and works with any domain registrar.

### For Admin Dashboard (`admin.buenobrows.com`):

```
┌──────┬───────┬─────────────────┬──────┐
│ Type │ Name  │ Value/Target    │ TTL  │
├──────┼───────┼─────────────────┼──────┤
│  A   │ admin │ 151.101.1.195   │ 3600 │
│  A   │ admin │ 151.101.65.195  │ 3600 │
└──────┴───────┴─────────────────┴──────┘
```

### For Booking Site (`book.buenobrows.com`):

```
┌──────┬──────┬─────────────────┬──────┐
│ Type │ Name │ Value/Target    │ TTL  │
├──────┼──────┼─────────────────┼──────┤
│  A   │ book │ 151.101.1.195   │ 3600 │
│  A   │ book │ 151.101.65.195  │ 3600 │
└──────┴──────┴─────────────────┴──────┘
```

**Result:**
- ✅ Admin: `https://admin.buenobrows.com`
- ✅ Booking: `https://book.buenobrows.com`

---

## Option 2: Using Root Domain for Booking

If you want your main domain to be the booking site:

### For Admin Dashboard (`admin.buenobrows.com`):

```
┌──────┬───────┬─────────────────┬──────┐
│ Type │ Name  │ Value/Target    │ TTL  │
├──────┼───────┼─────────────────┼──────┤
│  A   │ admin │ 151.101.1.195   │ 3600 │
│  A   │ admin │ 151.101.65.195  │ 3600 │
└──────┴───────┴─────────────────┴──────┘
```

### For Booking Site (`buenobrows.com` + `www.buenobrows.com`):

```
┌──────┬──────┬─────────────────┬──────┐
│ Type │ Name │ Value/Target    │ TTL  │
├──────┼──────┼─────────────────┼──────┤
│  A   │  @   │ 151.101.1.195   │ 3600 │
│  A   │  @   │ 151.101.65.195  │ 3600 │
│  A   │ www  │ 151.101.1.195   │ 3600 │
│  A   │ www  │ 151.101.65.195  │ 3600 │
└──────┴──────┴─────────────────┴──────┘
```

**Result:**
- ✅ Admin: `https://admin.buenobrows.com`
- ✅ Booking: `https://buenobrows.com` and `https://www.buenobrows.com`

---

## 🔍 Understanding Each Field

### Type: `A`
- **A** = Address Record
- Maps a domain name to an IPv4 address
- This is the most common DNS record type

### Name (or Host/Subdomain)
- **admin** = Creates `admin.yourdomain.com`
- **book** = Creates `book.yourdomain.com`
- **www** = Creates `www.yourdomain.com`
- **@** = Root domain `yourdomain.com`

### Value (or Target/Points to)
- The IP address from Firebase
- You'll get **2 IP addresses** from Firebase
- Both should be in the `151.101.x.x` range (typically)
- Add **2 separate A records** with the same Name but different IPs

### TTL (Time To Live)
- How long DNS servers cache this record
- **3600** = 1 hour (recommended)
- Some registrars use "Auto" or "Automatic"
- Don't stress about this - default is fine

---

## 📊 How It Should Look in Different Registrars

### GoDaddy View:

```
DNS Management
─────────────────────────────────────────────
Type    Host     Points to           TTL
────────────────────────────────────────────
A       admin    151.101.1.195       1 Hour
A       admin    151.101.65.195      1 Hour
A       book     151.101.1.195       1 Hour
A       book     151.101.65.195      1 Hour
```

### Cloudflare View:

```
DNS Records
─────────────────────────────────────────────────────────
Type    Name     Content/Target      Proxy   TTL
─────────────────────────────────────────────────────────
A       admin    151.101.1.195       DNS     Auto
A       admin    151.101.65.195      DNS     Auto
A       book     151.101.1.195       DNS     Auto
A       book     151.101.65.195      DNS     Auto
```

**⚠️ Important for Cloudflare**: Set Proxy to **DNS only** (grey cloud ☁️)

### Namecheap View:

```
Host Records
─────────────────────────────────────────────
Type    Host     Value               TTL
─────────────────────────────────────────────
A       admin    151.101.1.195       Automatic
A       admin    151.101.65.195      Automatic
A       book     151.101.1.195       Automatic
A       book     151.101.65.195      Automatic
```

### Google Domains View:

```
Custom resource records
─────────────────────────────────────────────
Name     Type    TTL    Data
─────────────────────────────────────────────
admin    A       1h     151.101.1.195
admin    A       1h     151.101.65.195
book     A       1h     151.101.1.195
book     A       1h     151.101.65.195
```

---

## 🔐 Optional: TXT Record for Verification

Firebase might ask you to add a TXT record first to verify domain ownership.

### Verification TXT Record Example:

```
┌──────┬───────┬──────────────────────────────────────┬──────┐
│ Type │ Name  │ Value/Target                         │ TTL  │
├──────┼───────┼──────────────────────────────────────┼──────┤
│ TXT  │ admin │ firebase-hosting=abc123xyz789def456  │ 3600 │
└──────┴───────┴──────────────────────────────────────┴──────┘
```

**Note**: You'll get the exact TXT value from Firebase Console. Add this BEFORE the A records if Firebase requests it.

---

## ✅ Verification After Adding Records

### Check DNS is Working:

```bash
# Check admin domain
dig admin.buenobrows.com

# Expected output:
admin.buenobrows.com. 3600 IN A 151.101.1.195
admin.buenobrows.com. 3600 IN A 151.101.65.195
```

```bash
# Check booking domain
dig book.buenobrows.com

# Expected output:
book.buenobrows.com. 3600 IN A 151.101.1.195
book.buenobrows.com. 3600 IN A 151.101.65.195
```

### Use the Helper Script:

```bash
./check-dns.sh
```

### Check Online:

Visit: https://dnschecker.org
- Enter your domain: `admin.buenobrows.com`
- Select: **A** record type
- Click "Search"
- Should show Firebase IPs from multiple locations worldwide

---

## 🎨 Visual Domain Structure

```
buenobrows.com (your domain)
│
├── @ (root)
│   └── → Your main website (if you have one)
│       OR → Booking site (if using root domain)
│
├── admin.buenobrows.com
│   └── → Admin Dashboard (Firebase Hosting)
│       [bueno-brows-admin.web.app]
│
├── book.buenobrows.com
│   └── → Customer Booking Site (Firebase Hosting)
│       [bueno-brows-7cce7.web.app]
│
└── www.buenobrows.com
    └── → Usually redirects to @ or booking site
```

---

## 🕒 Timeline

```
┌─────────────────────────────────────────────────────┐
│ DNS Setup Timeline                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [You add DNS records]                               │
│         │                                           │
│         ▼                                           │
│ 0-5 min: Records saved                              │
│         │                                           │
│         ▼                                           │
│ 5-30 min: DNS propagation                           │
│         │ (Firebase detects records)                │
│         ▼                                           │
│ Firebase: "DNS records found! ✓"                    │
│         │                                           │
│         ▼                                           │
│ 5-15 min: SSL certificate provisioning              │
│         │ (Let's Encrypt)                           │
│         ▼                                           │
│ Firebase: "Connected ✓" + SSL certificate ready     │
│         │                                           │
│         ▼                                           │
│ [Your custom domain is LIVE! 🎉]                    │
│                                                     │
└─────────────────────────────────────────────────────┘

Total Time: Usually 30-60 minutes
Max Time: Up to 48 hours (very rare)
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Wrong:
```
Type: CNAME
Name: admin
Value: bueno-brows-admin.web.app
```
**Problem**: Firebase requires A records, not CNAME records

### ✅ Correct:
```
Type: A
Name: admin
Value: 151.101.1.195
```

---

### ❌ Wrong:
```
Type: A
Name: admin.buenobrows.com
Value: 151.101.1.195
```
**Problem**: Name should be just "admin", not the full domain

### ✅ Correct:
```
Type: A
Name: admin
Value: 151.101.1.195
```

---

### ❌ Wrong:
```
Only adding 1 A record instead of 2
```
**Problem**: Firebase provides 2 IPs for redundancy

### ✅ Correct:
```
Type: A  |  Name: admin  |  Value: 151.101.1.195
Type: A  |  Name: admin  |  Value: 151.101.65.195
```

---

## 📞 Quick Reference

| What | Where |
|------|-------|
| **Get Firebase IPs** | Firebase Console → Hosting → Add custom domain |
| **Add DNS records** | Your domain registrar (GoDaddy, Namecheap, etc.) |
| **Check DNS** | `dig your-domain.com` or https://dnschecker.org |
| **Check SSL** | Firebase Console → Hosting → View status |
| **Test site** | https://your-custom-domain.com |

---

## 📚 Related Documents

- **Quick Start**: `CUSTOM_DOMAIN_QUICKSTART.md` - Fast setup guide
- **Full Guide**: `CUSTOM_DOMAIN_SETUP.md` - Detailed instructions
- **DNS Checker**: `check-dns.sh` - Verify DNS records

---

## 💡 Pro Tips

1. **Copy-paste the IPs** from Firebase - don't type them manually
2. **Add all records before waiting** - do both sites at once
3. **Use a password manager** to store the Firebase IPs temporarily
4. **Take screenshots** of Firebase's instructions for reference
5. **Don't panic** if it takes 30-60 minutes - that's normal
6. **Check DNS with `dig`** before blaming Firebase
7. **Clear cache** or use incognito when testing

---

## 🎯 Final Checklist

When your DNS is correctly configured, you should see:

- [ ] `dig admin.yourdomain.com` shows 2 Firebase IPs
- [ ] `dig book.yourdomain.com` shows 2 Firebase IPs
- [ ] Firebase Console shows "Connected" status
- [ ] Visiting `https://admin.yourdomain.com` shows admin login (with 🔒)
- [ ] Visiting `https://book.yourdomain.com` shows booking site (with 🔒)
- [ ] No SSL certificate warnings in browser
- [ ] Both sites load without `.web.app` in URL

---

**You're all set! Once these records are added, your custom domains will be live within 30-60 minutes.** 🚀

---

*DNS Records Reference | Last Updated: October 16, 2025*

