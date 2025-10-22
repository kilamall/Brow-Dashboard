# 🔐 Admin Authentication Fix

**Issue**: Firestore permission denied error  
**Cause**: Admin user doesn't have `role: 'admin'` claim  
**Solution**: Set custom claims in Firebase Console

---

## 🚨 **The Problem**

The admin dashboard is getting this error:
```
FirebaseError: [code=permission-denied]: Missing or insufficient permissions.
```

This happens because:
1. **Firestore rules** require `role: 'admin'` claim
2. **Admin user** doesn't have this claim set
3. **Permission denied** when trying to read customer data

---

## ✅ **Quick Fix**

### **Step 1: Get Your User UID**

1. **Go to**: https://bueno-brows-admin.web.app
2. **Sign in** with your admin account
3. **Open browser console** (F12)
4. **Run this command**:
   ```javascript
   firebase.auth().currentUser.uid
   ```
5. **Copy the UID** (looks like: `abc123def456...`)

### **Step 2: Set Admin Role in Firebase Console**

1. **Go to**: https://console.firebase.google.com/project/bueno-brows-7cce7/authentication/users
2. **Find your user** in the list
3. **Click the 3 dots** → **"Edit user"**
4. **Scroll down** to **"Custom claims"**
5. **Add this JSON**:
   ```json
   {
     "role": "admin"
   }
   ```
6. **Click "Save"**

### **Step 3: Refresh Admin Dashboard**

1. **Go back to**: https://bueno-brows-admin.web.app
2. **Refresh the page**
3. **Check console** - error should be gone
4. **Profile pictures should now show!**

---

## 🔧 **Alternative: Use Firebase CLI**

If you prefer command line:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set admin role for your user
firebase auth:export users.json --project bueno-brows-7cce7
# Then manually edit the JSON and import back
```

---

## 🧪 **Test the Fix**

### **What Should Happen**

1. **No more console errors**
2. **Customer list loads properly**
3. **Profile pictures show** (if customers have them)
4. **All admin features work**

### **Debug Steps**

1. **Check console logs**:
   ```javascript
   // Should show customer data with profilePictureUrl
   console.log('Customer data:', customer.name, 'Profile picture URL:', customer.profilePictureUrl);
   ```

2. **Check Firestore permissions**:
   - Go to Firebase Console → Firestore
   - Check if you can see customer documents
   - Look for `profilePictureUrl` fields

---

## 🎯 **Expected Results**

### **Before Fix**
- ❌ Console error: `permission-denied`
- ❌ Customer list shows "Loading..."
- ❌ No profile pictures
- ❌ Admin features don't work

### **After Fix**
- ✅ No console errors
- ✅ Customer list loads with data
- ✅ Profile pictures show (if uploaded)
- ✅ All admin features work

---

## 🚀 **Quick Test**

1. **Set admin role** (steps above)
2. **Refresh admin dashboard**
3. **Check console** - should see:
   ```
   Customer data: [Name] Profile picture URL: [URL or undefined]
   ```
4. **Profile pictures should appear** in customer list

---

## 📞 **If Still Not Working**

### **Check These**

1. **User has admin role**:
   ```javascript
   // In browser console
   firebase.auth().currentUser.getIdTokenResult().then(token => {
     console.log('Claims:', token.claims);
   });
   ```

2. **Firestore rules deployed**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Admin user authenticated**:
   - Check if you're signed in
   - Check if you have the right email

---

## 🎉 **Success!**

Once the admin role is set:
- ✅ **No more permission errors**
- ✅ **Customer data loads properly**
- ✅ **Profile pictures display**
- ✅ **All admin features work**

**The profile picture feature will work perfectly!** 🚀
