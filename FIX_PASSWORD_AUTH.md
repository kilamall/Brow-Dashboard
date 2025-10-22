# 🔧 Fix Password Authentication Issue

## 🎯 The Problem

1. **Password stopped working** for `admin@yourdomain.com` after enabling Google Auth
2. **Password reset redirects to `/verify`** which doesn't exist in the admin app
3. **Need to restore password authentication** for admin access

## 🚀 Solution Options

### Option 1: Reset Password via Firebase Console (Recommended)

This is the fastest and most reliable method:

#### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/bueno-brows-7cce7
2. Go to **Authentication** → **Users**

#### Step 2: Find Regina's Account
1. Look for `admin@yourdomain.com`
2. Click on the user to open details

#### Step 3: Reset Password
1. Click **"Reset password"** button
2. This will send a password reset email to `admin@yourdomain.com`
3. Check your email and click the reset link
4. Set a new password
5. Try signing in with the new password

### Option 2: Create New Password Account

If the above doesn't work, we can create a fresh password account:

```bash
node create-admin-password.js YourNewPassword123
```

### Option 3: Fix the Admin App Routes

The admin app is missing the `/verify` route that password reset expects. Let me add it:

#### Step 1: Add Verify Route to Admin App
```typescript
// In apps/admin/src/App.tsx, add:
<Route path="/verify" element={<VerifyEmail />} />
```

#### Step 2: Create VerifyEmail Component
```typescript
// Create apps/admin/src/components/VerifyEmail.tsx
function VerifyEmail() {
  return (
    <div className="min-h-screen grid place-items-center bg-cream">
      <div className="bg-white shadow-soft rounded-xl p-6 w-[380px]">
        <h1 className="text-xl font-serif text-slate-800 mb-2">Email Verified</h1>
        <p className="text-slate-600 text-sm">Your email has been verified. You can now sign in.</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full bg-terracotta text-white rounded-md py-2 mt-4"
        >
          Continue to Sign In
        </button>
      </div>
    </div>
  );
}
```

## 🔍 Why This Happened

When Google Auth was enabled, it likely:
1. **Disabled password authentication** for existing users
2. **Changed the password reset redirect URL** to point to the booking app
3. **Created authentication conflicts** between password and Google OAuth

## ✅ Quick Fix Steps

### Immediate Solution:
1. **Go to Firebase Console**
2. **Find `admin@yourdomain.com`**
3. **Click "Reset password"**
4. **Check email and set new password**
5. **Sign in with new password**

### If That Doesn't Work:
1. **Run our script**: `node create-admin-password.js NewPassword123`
2. **Sign in with `admin@buenobrows.com` + new password**

## 🎯 Recommended Approach

**Try the Firebase Console password reset first** - it's the cleanest solution and will restore your original admin account.

If that fails, we can use the script to create a new admin account with a fresh password.

---

## 📋 Troubleshooting Checklist

- [ ] Check Firebase Console → Authentication → Users
- [ ] Look for `admin@yourdomain.com`
- [ ] Try password reset from Firebase Console
- [ ] Check email for reset link
- [ ] Set new password
- [ ] Try signing in with new password
- [ ] If still failing, use the script method

---

**The Firebase Console password reset should fix this immediately!** 🚀
