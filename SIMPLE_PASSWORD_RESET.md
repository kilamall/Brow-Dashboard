# 🚀 Simple Password Reset Solution

## 🎯 The Problem

1. **Password reset redirects to wrong site** - Goes to `buenobrows.com/verify` instead of admin site
2. **Script fails** - Can't connect to Google metadata service
3. **Need immediate solution** - You need to get back into admin dashboard

## 🚀 **IMMEDIATE SOLUTION - Use Firebase Console**

This is the fastest and most reliable method:

### **Step 1: Go to Firebase Console**
1. Open: https://console.firebase.google.com/project/bueno-brows-7cce7
2. Click **Authentication** → **Users**

### **Step 2: Find Your Admin Account**
1. Look for your admin email
2. Click on the user to open details

### **Step 3: Reset Password**
1. Click **"Reset password"** button
2. This will send a password reset email to your admin account
3. Check your email and click the reset link
4. Set a new password
5. Sign in to admin dashboard with new password

## 🔧 **Alternative: Create New Admin Account**

If the above doesn't work, create a new admin account:

```bash
node create-admin-password.js YourNewPassword123
```

Then sign in with `admin@buenobrows.com` + your new password.

## 🎯 **Why This Happened**

The password reset is configured to redirect to the booking site (`buenobrows.com/verify`) instead of the admin site (`bueno-brows-admin.web.app/verify`). This is a Firebase project configuration issue.

## ✅ **Quick Steps**

1. **Go to Firebase Console** → Authentication → Users
2. **Find your admin email**
3. **Click "Reset password"**
4. **Check email and set new password**
5. **Sign in to admin dashboard**

This should work immediately and get you back into the admin dashboard!

---

## 🆘 **If You Need Help**

If you can't access Firebase Console or need immediate access:
1. **Create new admin account**: `node create-admin-password.js NewPassword123`
2. **Sign in with new account**
3. **Transfer any needed data later**

---

**Try the Firebase Console password reset first - it's the most reliable method!** 🚀
