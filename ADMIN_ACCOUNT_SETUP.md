# 🔐 Admin Account Setup Guide

**Issue**: You're trying to access admin dashboard with a customer account  
**Solution**: Create a separate admin account with proper permissions

---

## 🎯 **The Problem**

- **Admin Dashboard**: Requires `role: 'admin'` claim
- **Booking Site**: Creates regular customer accounts
- **Your Account**: Is a customer account, not an admin account

---

## ✅ **Solution: Create Admin Account**

### **Step 1: Create Admin User in Firebase Console**

1. **Go to**: https://console.firebase.google.com/project/bueno-brows-7cce7/authentication/users

2. **Click "Add user"**

3. **Enter admin credentials**:
   - **Email**: `admin@buenobrows.com` (or your preferred admin email)
   - **Password**: Create a strong password
   - **Click "Add user"**

### **Step 2: Set Admin Role**

1. **Find your new admin user** in the list

2. **Click the 3 dots** → **"Edit user"**

3. **Scroll down to "Custom claims"**

4. **Add this JSON**:
   ```json
   {
     "role": "admin"
   }
   ```

5. **Click "Save"**

### **Step 3: Test Admin Access**

1. **Go to**: https://bueno-brows-admin.web.app

2. **Sign in** with your new admin credentials:
   - **Email**: `admin@buenobrows.com`
   - **Password**: [your admin password]

3. **Should work!** No more permission errors

---

## 🔧 **Alternative: Use Existing Account**

If you want to use an existing account:

### **Option A: Convert Customer Account to Admin**

1. **Go to Firebase Console** → **Authentication** → **Users**

2. **Find your existing account**

3. **Click 3 dots** → **"Edit user"**

4. **Add custom claims**:
   ```json
   {
     "role": "admin"
   }
   ```

5. **Save**

### **Option B: Use Different Browser/Incognito**

1. **Open incognito/private browser**

2. **Go to**: https://bueno-brows-admin.web.app

3. **Sign in** with admin credentials

4. **Keep customer account** in regular browser

---

## 🧪 **Test the Fix**

### **What Should Happen**

1. **Admin dashboard loads** without errors
2. **Customer list shows** with profile pictures
3. **No console errors**
4. **All admin features work**

### **Debug Steps**

1. **Check authentication**:
   ```javascript
   // In browser console
   firebase.auth().currentUser.getIdTokenResult().then(token => {
     console.log('Claims:', token.claims);
     // Should show: { role: "admin" }
   });
   ```

2. **Check customer data**:
   ```javascript
   // Should see customer data with profilePictureUrl
   console.log('Customer data:', customer.name, 'Profile picture URL:', customer.profilePictureUrl);
   ```

---

## 🎯 **Expected Results**

### **Before Fix**
- ❌ Console error: `permission-denied`
- ❌ "Access Restricted" message
- ❌ Can't see customer data
- ❌ No profile pictures

### **After Fix**
- ✅ Admin dashboard loads
- ✅ Customer list with profile pictures
- ✅ No console errors
- ✅ All admin features work

---

## 📋 **Quick Summary**

**You need TWO separate accounts**:

1. **Customer Account**: For booking appointments (booking site)
2. **Admin Account**: For managing the business (admin dashboard)

**The admin account needs**:
- ✅ Email/password authentication
- ✅ `role: 'admin'` custom claim
- ✅ Access to Firestore data

---

## 🚀 **Next Steps**

1. **Create admin account** (steps above)
2. **Set admin role** (custom claims)
3. **Test admin dashboard**
4. **Profile pictures should work!**

**Once you have the admin account set up, the profile picture feature will work perfectly!** 🎉

---

## 📞 **If Still Having Issues**

### **Check These**

1. **Admin role set correctly**:
   ```javascript
   // Should show: { role: "admin" }
   firebase.auth().currentUser.getIdTokenResult().then(token => {
     console.log('Claims:', token.claims);
   });
   ```

2. **Firestore rules deployed**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Admin account authenticated**:
   - Make sure you're signed in with the admin account
   - Not the customer account

**The profile pictures will show once you have proper admin access!** 🚀
