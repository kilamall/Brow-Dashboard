# 🚀 Custom Domain Setup - Quick Start

## What You'll Do (5 Easy Steps)

This is a simplified version of the full guide. For detailed instructions, see `CUSTOM_DOMAIN_SETUP.md`.

---

## Step 1: Get Firebase DNS Records (5 minutes)

### For Admin Dashboard:

1. Open: https://console.firebase.google.com/project/bueno-brows-7cce7/hosting
2. Find the site: **`bueno-brows-admin`**
3. Click **"Add custom domain"**
4. Enter your domain: **`admin.buenobrows.com`** (use your actual domain)
5. Click **"Continue"**
6. **📝 WRITE DOWN** the IP addresses Firebase shows you (usually 2 IPs)

Example:
```
151.101.1.195
151.101.65.195
```

### For Booking Site:

7. Go back to the Hosting page
8. Find the site: **`bueno-brows-7cce7`**
9. Click **"Add custom domain"**
10. Enter your domain: **`book.buenobrows.com`** (or `www.buenobrows.com`)
11. Click **"Continue"**
12. **📝 WRITE DOWN** the IP addresses (same as above, but confirm)

---

## Step 2: Add DNS Records to Your Domain (5-10 minutes)

### Login to Your Domain Registrar

Go to your domain provider (where you bought your domain):
- GoDaddy → godaddy.com
- Namecheap → namecheap.com
- Cloudflare → cloudflare.com
- Google Domains → domains.google.com
- etc.

### Find DNS Settings

Look for one of these:
- "DNS Settings"
- "DNS Management"
- "Manage DNS"
- "Advanced DNS"

### Add A Records for Admin

Click "Add Record" or "Add New Record":

**First A Record:**
```
Type: A
Name: admin
Value: [First IP from Firebase, e.g., 151.101.1.195]
TTL: 3600 (or Auto)
```

**Second A Record:**
```
Type: A
Name: admin
Value: [Second IP from Firebase, e.g., 151.101.65.195]
TTL: 3600 (or Auto)
```

### Add A Records for Booking

**First A Record:**
```
Type: A
Name: book (or "www" if using www.buenobrows.com)
Value: [First IP from Firebase]
TTL: 3600 (or Auto)
```

**Second A Record:**
```
Type: A
Name: book (or "www")
Value: [Second IP from Firebase]
TTL: 3600 (or Auto)
```

**Save all records!**

---

## Step 3: Wait for DNS Propagation (15-30 minutes)

DNS changes take time to spread across the internet:
- **Minimum**: 5-15 minutes
- **Typical**: 15-30 minutes
- **Maximum**: Up to 48 hours (rare)

**☕ Take a break! Grab some coffee.**

---

## Step 4: Check Your DNS (Optional)

Run this command in your terminal:

```bash
./check-dns.sh
```

Or manually check:

```bash
# Check admin domain
dig admin.buenobrows.com

# Check booking domain
dig book.buenobrows.com
```

You should see the Firebase IP addresses appear.

**Online checker**: https://dnschecker.org

---

## Step 5: Verify in Firebase Console (Wait for SSL)

1. Go back to: https://console.firebase.google.com/project/bueno-brows-7cce7/hosting
2. Look at your custom domains
3. Wait for status to change:
   - "Pending" → DNS found, getting SSL certificate
   - **"Connected" ✅** → You're live!

**SSL can take 5-15 minutes** after DNS is verified.

---

## ✅ Done! Test Your Sites

Once status shows "Connected":

### Admin Dashboard
Visit: **https://admin.buenobrows.com** (your domain)
- Should show your admin login page
- Should have 🔒 (secure/HTTPS)

### Booking Site
Visit: **https://book.buenobrows.com** (your domain)
- Should show your booking site
- Should have 🔒 (secure/HTTPS)

---

## 🐛 Troubleshooting

### "Domain not resolving"
- ✅ Wait longer (DNS takes time)
- ✅ Check DNS records are saved in domain registrar
- ✅ Run `./check-dns.sh` to verify

### "Not secure" or SSL error
- ✅ Wait for Firebase to provision SSL (5-15 mins after DNS verification)
- ✅ Clear browser cache
- ✅ Try incognito/private mode

### "Still shows .web.app URL"
- ✅ Clear browser cache
- ✅ Make sure you're using HTTPS (not HTTP)
- ✅ Check Firebase Console shows "Connected"

### Using Cloudflare?
- ⚠️ **Important**: Set proxy to **"DNS only"** (grey cloud) during setup
- You can enable proxy after SSL is working

---

## 📞 Need Help?

1. Check the full guide: `CUSTOM_DOMAIN_SETUP.md`
2. Run the DNS checker: `./check-dns.sh`
3. Check Firebase Console for errors
4. Visit: https://firebase.google.com/docs/hosting/custom-domain

---

## 📋 Quick Checklist

- [ ] Got Firebase IP addresses for admin domain
- [ ] Got Firebase IP addresses for booking domain
- [ ] Added 2 A records for admin subdomain to domain registrar
- [ ] Added 2 A records for booking subdomain to domain registrar
- [ ] Saved DNS records
- [ ] Waited 15-30 minutes
- [ ] DNS resolves correctly (`dig` command or dnschecker.org)
- [ ] Firebase Console shows "Connected"
- [ ] SSL certificate provisioned (🔒 appears in browser)
- [ ] Admin site loads on custom domain
- [ ] Booking site loads on custom domain
- [ ] Updated Firebase Authentication authorized domains

---

## 🎯 Expected Timeline

| Step | Time |
|------|------|
| Get Firebase IPs | 5 minutes |
| Add DNS records | 5-10 minutes |
| DNS propagation | 15-30 minutes |
| SSL provisioning | 5-15 minutes |
| **Total** | **30-60 minutes** |

---

## 💡 What Domains Should You Use?

### Recommended Option:
```
admin.buenobrows.com  → Admin Dashboard
book.buenobrows.com   → Customer Booking
```

### Alternative Options:
```
dashboard.buenobrows.com  → Admin Dashboard
www.buenobrows.com        → Customer Booking
```

```
admin.buenobrows.com      → Admin Dashboard
buenobrows.com            → Customer Booking (root domain)
```

---

## 🎉 That's It!

Your custom domains will be live once:
1. ✅ DNS records are added
2. ✅ DNS has propagated
3. ✅ Firebase provisions SSL certificates

**Your sites will automatically redirect HTTP → HTTPS and will have full SSL encryption!**

---

*Quick Start Guide | Last Updated: October 16, 2025*

