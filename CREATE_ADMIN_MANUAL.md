# 🔧 Manual Admin Creation Guide

Since the user `admin@buenobrows.com` is a Google OAuth user, we need to use the Firebase Console to set their admin role.

## 🎯 Quick Solution

### Option 1: Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com/project/bueno-brows-7cce7
2. **Navigate to**: Authentication → Users
3. **Find the user**: `admin@buenobrows.com`
4. **Click on the user** to open their details
5. **Scroll down** to "Custom claims"
6. **Click "Add custom claim"**
7. **Add the claim**:
   - **Key**: `role`
   - **Value**: `admin`
8. **Click "Save"**

### Option 2: Using Firebase Admin SDK (If you have service account)

If you have a service account key, you can use our original script:

```bash
# Place service-account-key.json in the project root
node set-admin-role.js admin@buenobrows.com

# IMPORTANT: Delete the service account key after use!
rm service-account-key.json
```

## 🚀 After Setting Admin Role

1. **User must sign out** from the admin dashboard
2. **User must sign back in** 
3. **Admin privileges will be active**

## ✅ Verification

The user should now see admin features instead of the "Access Restricted" message.

---

## 🔒 Security Note

The manual Firebase Console method is actually more secure than using service account keys, as it doesn't require downloading credentials to your local machine.

---

## 🎉 Quick Steps Summary

1. Go to Firebase Console → Authentication → Users
2. Find `admin@buenobrows.com`
3. Add custom claim: `role` = `admin`
4. User signs out and back in
5. Done! ✅
