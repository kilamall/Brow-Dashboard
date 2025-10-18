# Debug: "You already have a skin analysis" Error

## Issue
After deleting the analysis from admin page and booking profile, still getting error:
```
FirebaseError: You already have a skin analysis. Please contact an admin to delete your current analysis before creating a new one.
```

## Root Cause
The Cloud Functions haven't been redeployed yet, and there may still be an analysis document in Firestore.

## Step-by-Step Fix

### Step 1: Verify Analysis is Actually Deleted

1. **Open Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select your project: `bueno-brows-7cce7` (or whatever your project name is)

2. **Check Firestore Database:**
   - Click on "Firestore Database" in the left menu
   - Look for the `skinAnalyses` collection
   - Search for documents where `customerId` matches your user ID
   - **If you find any documents there, DELETE them manually**

3. **Get Your User ID:**
   - In the browser console while logged in, type:
     ```javascript
     firebase.auth().currentUser.uid
     ```
   - Copy this ID and search for it in Firestore

### Step 2: Deploy the Cloud Functions

The functions need to be redeployed to get the latest code:

```bash
# Navigate to functions directory
cd functions

# Install dependencies (if needed)
npm install

# Build the functions
npm run build

# Go back to root
cd ..

# Deploy ONLY the functions (not hosting yet)
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts

# This may take 2-3 minutes
```

### Step 3: Clear Cache and Test

After deployment completes:

1. **Clear your browser cache:**
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Clear cached images and files
   - OR just do a hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

2. **Log out and log back in:**
   - This ensures you have fresh authentication tokens

3. **Try uploading again**

## Quick Manual Fix (If Above Doesn't Work)

If you just want to test quickly without deploying functions:

### Option A: Delete via Firebase Console (Easiest)

1. Go to Firebase Console → Firestore Database
2. Find the `skinAnalyses` collection
3. Find the document(s) for your customer ID
4. Click the three dots → Delete
5. Confirm deletion
6. Refresh your booking site and try again

### Option B: Use Firebase Console Query

1. In Firestore Database, click "Start collection"
2. Run a query:
   - Collection: `skinAnalyses`
   - Field: `customerId`
   - Operator: `==`
   - Value: YOUR_USER_ID (paste your uid from console)
3. Delete all results
4. Also check `customerEmail` field if customerId query returns nothing

## Verify the Fix

After trying the above:

1. Open browser console (F12)
2. Go to skin analysis page
3. Try to upload a photo
4. You should either:
   - See your analysis create successfully, OR
   - Still see the error (then proceed to next section)

## If Still Not Working

### Check 1: Verify User ID
```javascript
// In browser console:
console.log('User ID:', firebase.auth().currentUser.uid);
console.log('User Email:', firebase.auth().currentUser.email);
```

### Check 2: Query Firestore Directly
```javascript
// In browser console:
const db = firebase.firestore();
db.collection('skinAnalyses')
  .where('customerId', '==', firebase.auth().currentUser.uid)
  .get()
  .then(snapshot => {
    console.log('Found analyses:', snapshot.size);
    snapshot.forEach(doc => {
      console.log('Analysis ID:', doc.id);
      console.log('Analysis data:', doc.data());
    });
  });
```

If this returns any results, those documents need to be deleted.

### Check 3: Delete Programmatically
```javascript
// In browser console (ONLY if you found documents above):
const db = firebase.firestore();
db.collection('skinAnalyses')
  .where('customerId', '==', firebase.auth().currentUser.uid)
  .get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      doc.ref.delete().then(() => {
        console.log('Deleted:', doc.id);
      });
    });
  })
  .then(() => {
    console.log('All analyses deleted. Refresh the page and try again.');
  });
```

## Common Issues

### Issue: "I deleted it but it's still there"
- **Cause:** Delete didn't complete or page cached old data
- **Fix:** Hard refresh (Ctrl+Shift+R), check Firestore console directly

### Issue: "Functions deploy fails"
- **Cause:** Usually missing dependencies or build errors
- **Fix:** 
  ```bash
  cd functions
  rm -rf node_modules
  npm install
  npm run build
  cd ..
  firebase deploy --only functions
  ```

### Issue: "Delete button doesn't work in admin"
- **Cause:** Admin delete handler may have issues
- **Fix:** Delete directly in Firebase Console as shown above

## What Should Happen After Fix

1. No documents in `skinAnalyses` collection for your user ID
2. You can upload a new photo
3. Analysis creates successfully
4. You see your full report with all sections

## Need More Help?

If none of the above works:

1. **Check Firebase Functions Logs:**
   ```bash
   firebase functions:log --only analyzeSkinPhoto
   ```

2. **Check Browser Console for Errors**
   - Look for red error messages
   - Take a screenshot and check what it says

3. **Verify Your User Account**
   - Make sure you're logged in as a customer, not admin
   - Try with a different customer account to see if it's account-specific


