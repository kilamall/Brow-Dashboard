# 🌐 Custom Domain Setup Guide - Bueno Brows

## Overview

This guide walks you through setting up custom domains for your two Firebase Hosting sites.

**Current Sites:**
- Admin Dashboard: `bueno-brows-admin.web.app`
- Booking Site: `bueno-brows-7cce7.web.app`

**Recommended Custom Domains:**
- Admin: `admin.yourdomain.com` (or `dashboard.yourdomain.com`)
- Booking: `book.yourdomain.com` or `www.yourdomain.com`

---

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] Your custom domain name (e.g., `buenobrows.com`)
- [ ] Access to your domain registrar account (GoDaddy, Namecheap, Cloudflare, etc.)
- [ ] Firebase project access (you already have this)

---

## 🚀 Step-by-Step Setup

### Step 1: Add Custom Domains in Firebase Console

#### For Admin Dashboard:

1. **Open Firebase Console**:
   - Go to: https://console.firebase.google.com/project/bueno-brows-7cce7/hosting

2. **Select the Admin Site**:
   - Click on the site: `bueno-brows-admin` (or you might see it as `bueno-brows-admin.web.app`)

3. **Add Custom Domain**:
   - Click **"Add custom domain"** button
   - Enter your domain: `admin.buenobrows.com` (replace with your actual domain)
   - Click **"Continue"**

4. **Firebase Will Show DNS Records**:
   - You'll see either:
     - **Option A**: A records (two IP addresses)
     - **Option B**: TXT record for verification + A records

   **A Records (you'll get these values from Firebase):**
   ```
   Type: A
   Name: admin (or @)
   Value: [Firebase will provide IP addresses like:]
       - 151.101.1.195
       - 151.101.65.195
   TTL: 3600 (or Auto)
   ```

   **TXT Record (for verification if required):**
   ```
   Type: TXT
   Name: admin
   Value: [Firebase will provide a long verification string]
   TTL: 3600
   ```

#### For Booking Site:

5. **Back to Hosting Page**:
   - Go back to: https://console.firebase.google.com/project/bueno-brows-7cce7/hosting

6. **Select the Booking Site**:
   - Click on the site: `bueno-brows-7cce7` (or `bueno-brows-7cce7.web.app`)

7. **Add Custom Domain**:
   - Click **"Add custom domain"** button
   - Enter your domain: `book.buenobrows.com` or `www.buenobrows.com`
   - Click **"Continue"**

8. **Note the DNS Records**:
   - Firebase will show you the DNS records needed (same format as above)

---

### Step 2: Configure DNS Records at Your Domain Registrar

You'll need to add these records in your domain registrar's DNS settings. Here's how for popular providers:

#### General Steps (applies to most registrars):

1. **Log in to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

2. **Find DNS Management**:
   - Look for: "DNS Settings", "DNS Management", "Domain Settings", or "Nameservers"

3. **Add A Records for Admin Dashboard**:
   ```
   Type: A
   Name: admin (or subdomain "admin")
   Value: [First IP from Firebase, e.g., 151.101.1.195]
   TTL: 3600
   
   Type: A
   Name: admin (or subdomain "admin")
   Value: [Second IP from Firebase, e.g., 151.101.65.195]
   TTL: 3600
   ```

4. **Add A Records for Booking Site**:
   ```
   Type: A
   Name: book (or www or @)
   Value: [First IP from Firebase]
   TTL: 3600
   
   Type: A
   Name: book (or www or @)
   Value: [Second IP from Firebase]
   TTL: 3600
   ```

5. **Add TXT Record (if Firebase requires verification)**:
   ```
   Type: TXT
   Name: admin (or book)
   Value: [The verification string from Firebase]
   TTL: 3600
   ```

---

### Step 3: Wait for DNS Propagation

- **DNS propagation can take 5 minutes to 48 hours** (usually 15-30 minutes)
- Firebase will automatically verify and provision SSL certificates
- You can check verification status in Firebase Console

**Check DNS Propagation:**
```bash
# Check A records for admin
dig admin.buenobrows.com

# Check A records for booking
dig book.buenobrows.com

# Or use online tools:
# https://dnschecker.org
```

---

### Step 4: Verify in Firebase Console

1. **Go back to Firebase Console → Hosting**
2. **Check the status** of your custom domains
3. You should see:
   - ✅ **"Pending"** → DNS records found, provisioning SSL
   - ✅ **"Connected"** → Domain is live with SSL certificate

---

## 🔧 Provider-Specific Instructions

### GoDaddy

1. Log in to GoDaddy.com
2. Go to **"My Products" → "Domain"**
3. Click **"DNS"** next to your domain
4. Click **"Add"** button (bottom right)
5. Select **"Type: A"**
6. Enter **"Name: admin"** or **"Name: book"**
7. Enter **"Value: [Firebase IP address]"**
8. Click **"Save"**
9. Repeat for the second A record

### Cloudflare

1. Log in to Cloudflare Dashboard
2. Select your domain
3. Go to **"DNS"** tab
4. Click **"Add record"**
5. Select **"Type: A"**
6. Enter **"Name: admin"** or **"Name: book"**
7. Enter **"IPv4 address: [Firebase IP]"**
8. **IMPORTANT**: Set proxy status to **"DNS only" (grey cloud icon)**
   - Firebase needs direct access for SSL provisioning
   - You can enable proxy after SSL is set up
9. Click **"Save"**
10. Repeat for second A record

### Namecheap

1. Log in to Namecheap
2. Go to **"Domain List"**
3. Click **"Manage"** next to your domain
4. Go to **"Advanced DNS"** tab
5. Click **"Add New Record"**
6. Select **"Type: A Record"**
7. Enter **"Host: admin"** or **"Host: book"**
8. Enter **"Value: [Firebase IP]"**
9. Click **✓ (checkmark)** to save
10. Repeat for second A record

### Google Domains

1. Log in to domains.google.com
2. Click on your domain
3. Go to **"DNS"** in left sidebar
4. Scroll to **"Custom resource records"**
5. Enter **"Name: admin"** or **"Name: book"**
6. Select **"Type: A"**
7. Enter **"Data: [Firebase IP]"**
8. Click **"Add"**
9. Repeat for second A record

---

## 🌐 Recommended Domain Structure

Here are some common domain setups:

### Option 1: Subdomain for Both (Recommended)
```
book.buenobrows.com     → Customer booking site
admin.buenobrows.com    → Admin dashboard
buenobrows.com          → Your main website (if you have one)
```

### Option 2: Root Domain for Booking
```
www.buenobrows.com      → Customer booking site
admin.buenobrows.com    → Admin dashboard
buenobrows.com          → Redirect to www
```

### Option 3: Root Domain Only
```
buenobrows.com          → Customer booking site
admin.buenobrows.com    → Admin dashboard
```

---

## 📊 DNS Record Examples

### For `admin.buenobrows.com`:

| Type | Name  | Value               | TTL  |
|------|-------|---------------------|------|
| A    | admin | 151.101.1.195       | 3600 |
| A    | admin | 151.101.65.195      | 3600 |

### For `book.buenobrows.com`:

| Type | Name | Value               | TTL  |
|------|------|---------------------|------|
| A    | book | 151.101.1.195       | 3600 |
| A    | book | 151.101.65.195      | 3600 |

### For Root Domain (if using `www.buenobrows.com` or `buenobrows.com`):

| Type | Name | Value               | TTL  |
|------|------|---------------------|------|
| A    | @    | 151.101.1.195       | 3600 |
| A    | @    | 151.101.65.195      | 3600 |
| A    | www  | 151.101.1.195       | 3600 |
| A    | www  | 151.101.65.195      | 3600 |

**Note**: The actual IP addresses will be provided by Firebase. These are examples.

---

## ⚡ Quick Start Command Reference

```bash
# Check if your custom domain is resolving
dig admin.yourdomain.com
dig book.yourdomain.com

# Check DNS propagation globally
# Visit: https://dnschecker.org

# Check SSL certificate status
curl -I https://admin.yourdomain.com

# Test both sites after setup
curl https://admin.yourdomain.com
curl https://book.yourdomain.com
```

---

## 🔒 SSL Certificates

Firebase Hosting automatically provisions and manages SSL certificates for your custom domains:

✅ **Automatic SSL** - Firebase uses Let's Encrypt
✅ **Auto-renewal** - Certificates renew automatically
✅ **HTTPS enforcement** - All HTTP traffic redirects to HTTPS
✅ **No cost** - SSL certificates are free

**SSL Provisioning Time**: 
- Usually takes 5-15 minutes after DNS records are verified
- Can take up to 24 hours in some cases

---

## 🐛 Troubleshooting

### "Domain verification failed"

**Problem**: Firebase can't verify your domain ownership

**Solutions**:
1. Double-check DNS records are entered correctly
2. Wait 30-60 minutes for DNS propagation
3. Try using the TXT record verification method
4. Check that you haven't added extra spaces or characters

### "Pending" status for over 24 hours

**Problem**: SSL certificate not provisioning

**Solutions**:
1. Verify A records are pointing to correct Firebase IPs
2. If using Cloudflare, disable proxy (set to "DNS only")
3. Remove and re-add the custom domain in Firebase Console
4. Contact Firebase Support

### "DNS records not found"

**Problem**: DNS hasn't propagated or records are incorrect

**Solutions**:
1. Verify records in your domain registrar's dashboard
2. Use `dig` command to check DNS:
   ```bash
   dig admin.yourdomain.com
   ```
3. Check on https://dnschecker.org
4. Wait longer for propagation (can take 24-48 hours)

### SSL certificate errors

**Problem**: Browser shows "Not secure" or SSL warnings

**Solutions**:
1. Wait for Firebase to provision SSL (can take 15 mins - 24 hours)
2. Clear browser cache and try again
3. Try accessing in incognito/private mode
4. Check Firebase Console for SSL status

### Multiple domains showing same site

**Problem**: Both domains show the same app

**Solutions**:
1. Verify you added the domain to the correct Firebase Hosting site
2. Check hosting targets in `.firebaserc`:
   ```bash
   cat .firebaserc
   ```
3. Make sure you selected the right site when adding the domain

---

## ✅ Verification Checklist

After setup, verify everything is working:

### Admin Dashboard
- [ ] Custom domain resolves (e.g., `admin.buenobrows.com`)
- [ ] HTTPS is working (SSL certificate valid)
- [ ] Site loads correctly on custom domain
- [ ] Login works on custom domain
- [ ] All features function normally

### Booking Site
- [ ] Custom domain resolves (e.g., `book.buenobrows.com`)
- [ ] HTTPS is working (SSL certificate valid)
- [ ] Site loads correctly on custom domain
- [ ] Booking flow works end-to-end
- [ ] All features function normally

### DNS Records
- [ ] A records added for admin subdomain
- [ ] A records added for booking subdomain
- [ ] TXT record added (if required for verification)
- [ ] DNS propagated globally

### Firebase Console
- [ ] Both domains show "Connected" status
- [ ] SSL certificates provisioned
- [ ] No errors or warnings

---

## 📱 After Setup - Update Configurations

Once your custom domains are live, update these:

### 1. Firebase Authentication
Add your custom domains to authorized domains:
1. Go to **Firebase Console → Authentication → Settings**
2. Scroll to **"Authorized domains"**
3. Click **"Add domain"**
4. Add:
   - `admin.buenobrows.com`
   - `book.buenobrows.com`

### 2. Update Links in Your Apps
Update any hardcoded URLs in your code:
- Booking confirmation emails
- Redirect URLs
- External links

### 3. Google Analytics / SEO (if applicable)
- Update Google Analytics with new domain
- Update sitemap.xml
- Submit new domain to Google Search Console

---

## 💡 Best Practices

1. **Use HTTPS Only**: Firebase enforces this automatically
2. **Keep .web.app domains**: They still work as fallback
3. **Monitor Firebase Hosting Usage**: Check Firebase Console regularly
4. **Set up redirects**: Redirect non-www to www (or vice versa) if needed
5. **Test thoroughly**: Test all features after domain setup

---

## 📞 Support Resources

- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting/custom-domain
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html
- **Firebase Console**: https://console.firebase.google.com/project/bueno-brows-7cce7

---

## 🎯 Quick Summary

**What you need to do:**

1. Go to Firebase Console → Hosting
2. Click "Add custom domain" for each site
3. Get the A record IP addresses from Firebase
4. Add those A records to your domain registrar's DNS settings
5. Wait 15-30 minutes for DNS propagation
6. Firebase will automatically provision SSL certificates
7. Your sites will be live on custom domains!

**Timeline:**
- DNS setup: 5-10 minutes
- DNS propagation: 15-30 minutes (can take up to 48 hours)
- SSL provisioning: 5-15 minutes after DNS verification
- Total time: Usually 30-60 minutes

---

## 🆘 Need Help?

If you run into issues:
1. Check the Troubleshooting section above
2. Verify DNS records with `dig` command
3. Check Firebase Console for error messages
4. Wait longer for DNS propagation
5. Try removing and re-adding the domain

---

*Last updated: October 16, 2025*

