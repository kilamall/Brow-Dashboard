# 🔐 Admin Storage Permissions Fix

**Issue**: Admin user getting `storage/unauthorized` error when uploading service images  
**Cause**: Admin user lacks `role: 'admin'` custom claim in Firebase Auth token  
**Solution**: Set up proper admin account with correct permissions ✅

---

## 🚨 **The Problem**

**Error**: `Firebase Storage: User does not have permission to access 'service-images/...' (storage/unauthorized)`

**Root Cause**: The admin user doesn't have the `role: 'admin'` custom claim in their Firebase Auth token, which is required by the storage rules.

**Storage Rules Check**:
```javascript
function isAdmin() {
  return request.auth != null && 
         request.auth.token.role == 'admin';
}

match /service-images/{imageId} {
  allow read: if true;
  allow write: if isAdmin(); // ❌ This fails if no admin role
}
```

---

## ✅ **The Solution**

### **Step 1: Create Admin Account in Firebase Console**

1. **Go to**: [Firebase Console](https://console.firebase.google.com/project/bueno-brows-7cce7/authentication/users)
2. **Click**: "Add user" or "Import users"
3. **Create admin user** with email/password
4. **Note the UID** of the new admin user

### **Step 2: Set Custom Claims**

**Option A: Using Firebase Console (Recommended)**
1. **Go to**: [Firebase Console → Authentication → Users](https://console.firebase.google.com/project/bueno-brows-7cce7/authentication/users)
2. **Find your admin user**
3. **Click the 3 dots** → "Custom claims"
4. **Add custom claim**:
   ```json
   {
     "role": "admin"
   }
   ```
5. **Click "Save"**

**Option B: Using Firebase CLI**
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set custom claims (replace USER_UID with actual UID)
firebase auth:export users.json
# Edit users.json to add custom claims, then:
firebase auth:import users.json
```

### **Step 3: Test Admin Access**

1. **Sign out** of current admin account
2. **Sign in** with the new admin account (with `role: 'admin'` claim)
3. **Try uploading** a service image
4. **Should work** without permission errors

---

## 🧪 **Verify the Fix**

### **Check Custom Claims**

**In browser console** (on admin dashboard):
```javascript
// Check if user has admin role
firebase.auth().currentUser.getIdTokenResult().then((idTokenResult) => {
  console.log('User role:', idTokenResult.claims.role);
  console.log('Is admin:', idTokenResult.claims.role === 'admin');
});
```

**Expected Result**:
```javascript
User role: admin
Is admin: true
```

### **Test Image Upload**

1. **Go to**: Admin dashboard → Services
2. **Click on any service** to edit
3. **Try uploading an image**
4. **Should work** without `storage/unauthorized` error

---

## 📋 **What This Fixes**

### **Admin Dashboard Access**
- ✅ **Service image uploads** work
- ✅ **Gallery image uploads** work  
- ✅ **Hero image uploads** work
- ✅ **All admin features** accessible

### **Storage Permissions**
- ✅ **Firebase Storage access** granted
- ✅ **Service images** can be uploaded
- ✅ **Admin-only content** properly secured

### **Security**
- ✅ **Only admin users** can upload images
- ✅ **Customer users** cannot access admin storage
- ✅ **Proper role-based access** control

---

## 🎯 **Summary**

**The Issue**: Admin user lacked `role: 'admin'` custom claim in Firebase Auth token

**The Fix**: Create proper admin account with `role: 'admin'` custom claim

**The Result**: 
- ✅ **Service image uploads work**
- ✅ **All admin features accessible**
- ✅ **Proper security permissions**

**Follow the steps above to set up the admin account correctly!** 🚀

---

## 🚀 **Next Steps**

1. **Create admin account** in Firebase Console
2. **Set custom claims** to `{"role": "admin"}`
3. **Test image upload** on services page
4. **Verify all admin features** work

**Once you have the proper admin account set up, all storage permissions will work correctly!** ✨
