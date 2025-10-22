# 🔧 Fix Admin Authentication Issue

## 🎯 The Problem

When you enabled Google Auth, it likely created a **separate Google OAuth account** for the same email address. This means you now have:
1. **Password account**: `admin@buenobrows.com` (with admin role)
2. **Google OAuth account**: `admin@buenobrows.com` (without admin role)

## 🚀 Solution Options

### Option 1: Link the Accounts (Recommended)

This allows you to use both password and Google sign-in with the same admin role.

#### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/bueno-brows-7cce7
2. Go to **Authentication** → **Users**

#### Step 2: Find Both Accounts
You should see two entries for `admin@buenobrows.com`:
- One with password provider
- One with Google provider

#### Step 3: Link the Accounts
1. Click on the **password account** (the one that likely has admin role)
2. Scroll down to **"Link accounts"**
3. Click **"Link account"**
4. Select **"Google"**
5. Sign in with the same Google account
6. The accounts will be linked and both will have admin access

### Option 2: Set Admin Role on Google Account

If you prefer to use only Google sign-in:

#### Step 1: Find the Google Account
1. In Firebase Console → Authentication → Users
2. Find the Google OAuth account for `admin@buenobrows.com`
3. Click on it to open details

#### Step 2: Add Admin Role
1. Scroll down to **"Custom claims"**
2. Click **"Add custom claim"**
3. Set:
   - **Key**: `role`
   - **Value**: `admin`
4. Click **"Save"**

### Option 3: Use Our Script (If you have service account)

If you want to use the script approach:

1. Download service account key from Firebase Console
2. Save as `service-account-key.json` (temporarily)
3. Run: `node set-admin-role.js admin@buenobrows.com`
4. **Delete** the service account key immediately

## 🔍 How to Identify Which Account Has Admin Role

In Firebase Console → Authentication → Users:
- Look for accounts with **"Custom claims"** section
- The one with `role: admin` is your admin account
- The one without custom claims is the new Google OAuth account

## ✅ After Fixing

1. **Sign out** from the admin dashboard
2. **Sign back in** (using either method)
3. You should now have admin access

## 🎯 Recommended Approach

**Option 1 (Link accounts)** is best because:
- ✅ You can use both password and Google sign-in
- ✅ Maintains existing admin permissions
- ✅ More flexible for future use
- ✅ No need for service account keys

---

## 🚨 If You Can't Access Firebase Console

If you can't access the Firebase Console, you can:

1. **Reset password** for the original admin account
2. **Use email/password sign-in** (if it still works)
3. **Or** use the service account script method

---

## 📋 Quick Checklist

- [ ] Go to Firebase Console
- [ ] Find both accounts for `admin@buenobrows.com`
- [ ] Link the accounts OR add admin role to Google account
- [ ] Sign out and back in
- [ ] Test admin access

---

**The key is that you need to either link the accounts or ensure the Google OAuth account has the admin role claim!** 🎉
