# 🔒 Security Remediation Checklist

Use this checklist to track your progress fixing the security vulnerabilities.

## 🔴 CRITICAL - Fix Within 24 Hours

### 1. Admin Role Function (CVSS 10.0)
- [ ] **Review** `functions/src/set-admin-role.ts`
- [ ] **Verify** you have already set up your admin account
- [ ] **Run** `./CRITICAL_SECURITY_FIXES.sh` (Option 1)
- [ ] **OR** Delete the function entirely if admin is already set
- [ ] **Remove** export from `functions/src/index.ts` line 7
- [ ] **Deploy** functions: `firebase deploy --only functions`
- [ ] **Test** that the function is no longer accessible
- [ ] **Verify** existing admin can still access admin panel

**Test Command:**
```bash
# This should fail with "Function not found"
curl -X POST https://us-central1-[PROJECT-ID].cloudfunctions.net/setAdminRoleHTTP \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

### 2. Exposed API Keys (CVSS 9.1)
- [ ] **Go to** [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [ ] **Find** the exposed key: `AIzaSyAsIbSKd9x7Gtn7KtHg5oIBG2zvV1_RgVc`
- [ ] **Delete or Restrict** the key
- [ ] **Create** a new Gemini API key
- [ ] **Set restrictions** on the new key (IP/API restrictions)
- [ ] **Store** new key in Firebase Secrets:
  ```bash
  firebase functions:secrets:set GEMINI_API_KEY
  ```
- [ ] **Update** `functions/src/messaging.ts` line 12
- [ ] **Update** `functions/src/skin-analysis.ts` line 13
- [ ] **Remove** hardcoded fallback values
- [ ] **Deploy** functions
- [ ] **Test** AI features still work

**Code Changes:**
```typescript
// Before
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSy...';

// After
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not configured');
}
```

---

### 3. Unrestricted Holds Collection (CVSS 8.9)
- [ ] **Backup** current rules: `cp firebase.rules firebase.rules.backup`
- [ ] **Update** `firebase.rules` line 46-50
- [ ] **Change** `allow write: if true` to `allow write: if false`
- [ ] **Deploy** rules: `firebase deploy --only firestore:rules`
- [ ] **Test** booking flow still works
- [ ] **Verify** direct database writes fail

**Rules Change:**
```javascript
match /holds/{id} {
  allow read: if true;
  allow write: if false;  // Cloud Functions only (Admin SDK)
  allow delete: if false;
}
```

---

## 🟠 HIGH PRIORITY - Fix This Week

### 4. Open Customer Creation
- [ ] **Update** `firebase.rules` line 27
- [ ] **Add** authentication requirement
- [ ] **Add** input validation (name, email format)
- [ ] **Deploy** rules
- [ ] **Test** guest booking still works via Cloud Function
- [ ] **Verify** direct unauthenticated writes fail

**Estimated Time:** 30 minutes

---

### 5. Public Appointment Data
- [ ] **Review** what data needs to be public (only availability)
- [ ] **Consider** creating separate `availability` collection
- [ ] **Update** `firebase.rules` lines 35-44
- [ ] **Restrict** read to admin/owner only
- [ ] **Update** booking UI to use Cloud Function for availability
- [ ] **Deploy** changes
- [ ] **Test** availability checking works
- [ ] **Verify** customer details are not exposed

**Estimated Time:** 2-3 hours

---

### 6. Missing Admin Checks in Cloud Functions
- [ ] **Create** `functions/src/auth-helpers.ts` (provided in fix script)
- [ ] **Update** `functions/src/sms.ts` `sendSMSToCustomer` (line 386)
- [ ] **Update** `functions/src/sms.ts` `getSMSConversation` (line 462)
- [ ] **Review** all Cloud Functions for admin operations
- [ ] **Add** `requireAdmin(req)` to admin-only functions
- [ ] **Build** functions: `cd functions && npm run build`
- [ ] **Deploy** functions
- [ ] **Test** admin functions work when logged in as admin
- [ ] **Test** non-admin users get permission-denied error

**Functions to Update:**
- `sendSMSToCustomer`
- `getSMSConversation`
- Any function that modifies customer data
- Any function that accesses all appointments/customers

**Estimated Time:** 1-2 hours

---

## 🟡 MEDIUM PRIORITY - Fix This Month

### 7. CORS Configuration
- [ ] **List** all production domains
- [ ] **Create** `ALLOWED_ORIGINS` constant
- [ ] **Update** all Cloud Functions with `cors: true`
- [ ] **Change** to specific origin whitelist
- [ ] **Deploy** and test

**Estimated Time:** 1 hour

---

### 8. Rate Limiting
- [ ] **Create** `functions/src/rate-limiter.ts`
- [ ] **Implement** `checkRateLimit` function
- [ ] **Add** rate limiting to `analyzeSkinPhoto`
- [ ] **Add** rate limiting to AI messaging functions
- [ ] **Set** appropriate limits (5-10 per hour)
- [ ] **Deploy** and test
- [ ] **Monitor** rate limit hits in logs

**Estimated Time:** 2-3 hours

---

### 9. Input Validation
- [ ] **Install** validator: `cd functions && npm install validator`
- [ ] **Create** validation helper functions
- [ ] **Update** `findOrCreateCustomer` with email/phone validation
- [ ] **Update** all functions accepting user input
- [ ] **Add** XSS sanitization for text fields
- [ ] **Test** with invalid inputs
- [ ] **Deploy**

**Estimated Time:** 2-3 hours

---

### 10. IDOR Prevention
- [ ] **Review** all update/delete operations
- [ ] **Add** ownership checks
- [ ] **Create** secure Cloud Function wrappers
- [ ] **Remove** direct client-side updates where possible
- [ ] **Test** users cannot modify others' data
- [ ] **Deploy**

**Estimated Time:** 3-4 hours

---

## 🟢 LOW PRIORITY - Ongoing

### 11. Error Message Sanitization
- [ ] **Review** all `catch` blocks
- [ ] **Replace** `error.message` with generic messages
- [ ] **Keep** detailed errors in server logs only
- [ ] **Deploy**

**Estimated Time:** 1 hour

---

### 12. Security Headers
- [ ] **Update** `firebase.json` with security headers
- [ ] **Add** CSP, X-Frame-Options, etc.
- [ ] **Test** app still functions
- [ ] **Deploy** hosting config

**Estimated Time:** 30 minutes

---

### 13. Firebase App Check
- [ ] **Set up** reCAPTCHA v3 in Google Cloud
- [ ] **Install** `firebase/app-check` in apps
- [ ] **Initialize** App Check in both apps
- [ ] **Enable** enforcement in Firebase Console
- [ ] **Test** thoroughly

**Estimated Time:** 2-3 hours

---

### 14. Audit Logging
- [ ] **Create** `audit_logs` collection
- [ ] **Create** `logAuditEvent` function
- [ ] **Add** logging to sensitive operations:
  - [ ] Admin role changes
  - [ ] Customer data access
  - [ ] Appointment modifications
  - [ ] Settings changes
- [ ] **Create** admin audit log viewer
- [ ] **Deploy**

**Estimated Time:** 4-5 hours

---

### 15. Security Testing
- [ ] **Write** Firestore rules unit tests
- [ ] **Test** auth flows (positive and negative cases)
- [ ] **Test** IDOR vulnerabilities
- [ ] **Test** XSS/injection attempts
- [ ] **Run** `npm audit` and fix vulnerabilities
- [ ] **Consider** hiring penetration testing service

**Estimated Time:** 6-8 hours

---

## 📊 Progress Tracker

**CRITICAL:** ☐☐☐ (0/3 complete)  
**HIGH:** ☐☐☐ (0/3 complete)  
**MEDIUM:** ☐☐☐☐ (0/4 complete)  
**LOW:** ☐☐☐☐☐ (0/5 complete)

**Overall Progress:** 0% (0/15 tasks complete)

---

## 🚀 Quick Start

1. **First, run the automated fix script:**
   ```bash
   chmod +x CRITICAL_SECURITY_FIXES.sh
   ./CRITICAL_SECURITY_FIXES.sh
   ```

2. **Then follow manual steps:**
   - Revoke exposed API key
   - Set new key in Firebase Secrets
   - Deploy functions and rules

3. **Verify fixes:**
   ```bash
   # Test admin function is disabled
   curl https://us-central1-[PROJECT].cloudfunctions.net/setAdminRole
   # Should return 404 or "Function not found"
   
   # Test booking flow
   # Visit your booking app and try creating an appointment
   ```

4. **Move on to HIGH priority items**

---

## 📝 Notes

- **Always test in development environment first**
- **Back up your Firestore rules before changes**
- **Monitor Firebase Console logs after deployment**
- **Keep this checklist updated as you complete tasks**

---

## 🆘 If Something Breaks

1. **Check Firebase Console logs:**
   ```bash
   firebase functions:log
   ```

2. **Revert Firestore rules:**
   ```bash
   cp firebase.rules.backup firebase.rules
   firebase deploy --only firestore:rules
   ```

3. **Revert functions:**
   ```bash
   git checkout functions/src/
   firebase deploy --only functions
   ```

4. **Review error messages** in browser console and Firebase logs

---

**Last Updated:** October 16, 2025  
**Next Review:** Check off items as you complete them!

