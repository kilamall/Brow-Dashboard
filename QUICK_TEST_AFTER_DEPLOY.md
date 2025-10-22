# Quick Test Guide After Deployment

## 🎯 Critical Tests (Do These First)

### 1. Test Consent Forms (1 minute)
1. Open booking app in browser
2. Open browser console (F12)
3. Log in with a test customer account
4. Navigate to dashboard
5. **Expected:** No "permission-denied" errors in console
6. **Expected:** Consent records load successfully

**✅ PASS** if no errors appear  
**❌ FAIL** if you see "Missing or insufficient permissions"

---

### 2. Test Email Verification (2 minutes)
1. Open login page
2. Click "Sign Up"
3. Create a new test account with fake email
4. **Expected:** "Account created! Please check your email" message
5. Check for network errors in browser console
6. **Expected:** NO 400 errors for sendOobCode

**✅ PASS** if account created without 400 error  
**❌ FAIL** if you see 400 error in network tab

> **Note:** You won't receive actual email with test account, but the important thing is NO 400 error

---

### 3. Test Skin Analysis (2 minutes)
1. Log in as authenticated user
2. Navigate to Skin Analysis page
3. Upload any face photo
4. Click "Analyze"
5. **Expected:** Analysis completes successfully
6. **Expected:** Results display (may take 10-30 seconds)
7. **Expected:** No 500 errors in console

**✅ PASS** if analysis completes  
**❌ FAIL** if you see 500 error from analyzeSkinPhoto

---

## 📊 Console Checks

Open browser console (F12 > Console tab) and verify:

### Should NOT see:
- ❌ `[code=permission-denied]: Missing or insufficient permissions`
- ❌ `Failed to load resource: the server responded with a status of 400`
- ❌ `Failed to load resource: the server responded with a status of 500`
- ❌ `FirebaseError: Failed to analyze image with AI`

### Should see (normal):
- ✅ `Loaded X booked slots for...`
- ✅ `Fetched appointments: X`
- ✅ `Fetched consents: X`
- ✅ `Analysis completed successfully` (when testing skin analysis)

---

## 🔧 Quick Troubleshooting

### If consent forms still show permission errors:
```bash
# Redeploy Firestore rules
firebase deploy --only firestore:rules
```

### If email verification still shows 400:
1. Check Firebase Console > Authentication > Templates
2. Verify email verification is enabled
3. Check that domain is authorized in Firebase Console

### If skin analysis still shows 500:
```bash
# Check function logs
firebase functions:log --only analyzeSkinPhoto

# Verify GEMINI_API_KEY is set
firebase functions:secrets:access GEMINI_API_KEY

# Redeploy just the skin analysis function
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts
```

---

## 🚀 Full User Flow Test (Optional - 5 minutes)

### Complete Booking Flow:
1. **Guest User:**
   - Select service
   - Choose time slot
   - Fill in guest info
   - Complete consent form
   - Book appointment
   - ✅ Booking succeeds

2. **Authenticated User:**
   - Log in
   - Select service
   - Choose time slot
   - Complete consent form (if required)
   - Book appointment
   - ✅ Booking succeeds
   - ✅ Appointment shows in dashboard

3. **Skin Analysis:**
   - Log in
   - Upload skin photo
   - View analysis results
   - ✅ Analysis completes
   - ✅ Results display in dashboard

---

## 📱 Mobile Test (Optional)

Test on mobile device or Chrome DevTools mobile mode:
- [ ] Login works
- [ ] Booking works
- [ ] Dashboard loads
- [ ] No console errors

---

## ✅ Success Criteria

Your deployment is successful if:

1. ✅ No permission-denied errors in console
2. ✅ No 400 errors when creating accounts
3. ✅ No 500 errors when analyzing skin
4. ✅ Users can book appointments
5. ✅ Users can view their dashboard
6. ✅ Skin analysis completes successfully

---

## 📞 If You Need Help

1. **Check Firebase Console Logs:**
   ```bash
   firebase functions:log
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look for red errors
   - Check Network tab for failed requests

3. **Rollback if Critical Issues:**
   ```bash
   firebase hosting:rollback
   ```

---

## 🎉 All Good?

If all tests pass, your application is **PRODUCTION READY** for customer interaction!

You can now:
- Open it to real customers
- Share the booking link
- Start accepting real appointments
- Monitor usage in Firebase Console

**Congratulations! 🎊**

