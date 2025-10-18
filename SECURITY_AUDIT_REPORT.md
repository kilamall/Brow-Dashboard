# 🔒 Security Vulnerability Assessment & Remediation Guide

**Generated:** October 16, 2025  
**Application:** Bueno Brows Admin & Booking Dashboard  
**Severity Levels:** 🔴 CRITICAL | 🟠 HIGH | 🟡 MEDIUM | 🟢 LOW

---

## Executive Summary

Your application has **3 CRITICAL** vulnerabilities that require immediate attention, along with several high and medium-risk issues. The most severe issue is an **open admin privilege escalation endpoint** that allows anyone to grant themselves admin access to your system.

### Risk Score: **8.5/10 (CRITICAL)**

---

## 🔴 CRITICAL VULNERABILITIES (Fix Immediately)

### 1. **Unrestricted Admin Role Assignment** 
**File:** `functions/src/set-admin-role.ts` (lines 19-84)  
**Severity:** 🔴 CRITICAL  
**CVSS Score:** 10.0

#### The Problem
```typescript
export const setAdminRole = functions.https.onCall(async (data, context) => {
  // For initial setup, allow anyone to call this
  // ⚠️ REMOVE THIS FUNCTION AFTER SETTING UP YOUR FIRST ADMIN!
  
  const { email } = data;
  // NO AUTH CHECK - Anyone can call this!
```

**Attack Vector:**
```javascript
// Any user can run this in the browser console:
const setAdmin = firebase.functions().httpsCallable('setAdminRole');
await setAdmin({ email: 'attacker@evil.com' });
// Now attacker has full admin access!
```

#### Impact
- ⚠️ **Complete system takeover**
- Access to all customer data
- Ability to modify/delete all appointments
- Access to business settings and revenue data
- Can lock out legitimate admins

#### Fix (URGENT)
```typescript
// Option 1: COMPLETELY REMOVE the function
// Delete functions/src/set-admin-role.ts
// Remove from functions/src/index.ts line 7

// Option 2: Protect with auth + environment variable
export const setAdminRole = onCall(async (req) => {
  const { email, adminSecret } = req.data || {};
  
  // Require authentication
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  // Verify admin secret (set in Firebase Functions config)
  const ADMIN_SECRET = process.env.ADMIN_SETUP_SECRET;
  if (adminSecret !== ADMIN_SECRET) {
    throw new HttpsError('permission-denied', 'Invalid admin secret');
  }
  
  // Rest of logic...
});
```

**Recommended Action:** **DELETE THIS FUNCTION IMMEDIATELY** if you've already set up your admin account.

---

### 2. **Hardcoded API Keys in Source Code**
**Files:** 
- `functions/src/messaging.ts` (line 12)
- `functions/src/skin-analysis.ts` (line 13)

**Severity:** 🔴 CRITICAL  
**CVSS Score:** 9.1

#### The Problem
```typescript
// Line 12 in messaging.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAsIbSKd9x7Gtn7KtHg5oIBG2zvV1_RgVc';
```

**Attack Vector:**
- API keys are visible in your GitHub repository
- Attackers can use your Gemini API key, racking up charges
- Historical commits still contain the key (git history)

#### Impact
- 💸 **Financial loss** from API abuse
- Service disruption if quota exceeded
- Potential data access if key has broad permissions

#### Fix (URGENT)
```bash
# 1. IMMEDIATELY revoke the exposed API key in Google Cloud Console
# Go to: https://console.cloud.google.com/apis/credentials

# 2. Generate a new Gemini API key

# 3. Set it as an environment variable in Firebase
firebase functions:secrets:set GEMINI_API_KEY
# Enter your new key when prompted

# 4. Update your code to ONLY use environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY not configured');
}

# 5. Scrub git history (if repo is public)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch functions/src/messaging.ts" \
  --prune-empty --tag-name-filter cat -- --all
```

**Additional Steps:**
- Review Google Cloud billing alerts
- Set up API quotas and rate limits
- Enable API key restrictions (IP/referrer restrictions)

---

### 3. **Unrestricted Database Write Access**
**File:** `firebase.rules` (lines 46-50)  
**Severity:** 🔴 CRITICAL  
**CVSS Score:** 8.9

#### The Problem
```javascript
match /holds/{id} {
  allow read: if true;
  allow write: if true;  // ⚠️ ANYONE can write!
  allow delete: if true;
}
```

**Attack Vector:**
```javascript
// Attacker can create fake holds, blocking legitimate appointments
db.collection('holds').add({
  serviceId: 'any-service',
  start: '2025-10-20T10:00:00Z',
  end: '2025-10-20T12:00:00Z',
  status: 'active',
  expiresAt: '2025-12-31T23:59:59Z' // Hold for months!
});
```

#### Impact
- Denial of Service: Block all appointment slots
- Revenue loss: Prevent legitimate bookings
- Data pollution: Spam holds collection

#### Fix (URGENT)
```javascript
match /holds/{id} {
  allow read: if true; // OK for availability checking
  
  // Only Cloud Functions can write holds (server-side verification)
  allow write: if false; // All writes via Cloud Functions
  allow delete: if false;
  
  // Alternative: Allow authenticated users but verify in Cloud Function
  // allow create: if request.auth != null;
  // allow update, delete: if false;
}
```

---

## 🟠 HIGH SEVERITY VULNERABILITIES

### 4. **Overly Permissive Customer Creation**
**File:** `firebase.rules` (line 27)  
**Severity:** 🟠 HIGH

#### The Problem
```javascript
match /customers/{id} {
  allow create: if true; // Anyone can create customer records
}
```

**Attack Vector:**
- Spam customer database with fake records
- Create customers with malicious data
- Potential for injection attacks

#### Fix
```javascript
match /customers/{id} {
  // Only allow creation via Cloud Function OR authenticated users
  allow create: if request.auth != null && 
    request.resource.data.keys().hasAll(['name', 'email', 'phone']) &&
    request.resource.data.name is string &&
    request.resource.data.name.size() > 0 &&
    request.resource.data.name.size() < 100 &&
    (request.resource.data.email == null || 
     request.resource.data.email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'));
  
  // Rest of rules...
}
```

---

### 5. **Public Appointment Data Exposure**
**File:** `firebase.rules` (line 36)  
**Severity:** 🟠 HIGH

#### The Problem
```javascript
match /appointments/{id} {
  allow read: if true; // All appointment data is public
  allow create: if true; // Anyone can create appointments
}
```

**Privacy Concern:**
- Customer names, emails, phone numbers visible in appointments
- Appointment times reveal when business owner is busy (personal safety)
- Competitor intelligence on pricing and demand

#### Fix
```javascript
match /appointments/{id} {
  // Only expose availability info, not customer details
  allow read: if isAdmin() || 
    (request.auth != null && request.auth.uid == resource.data.customerId) ||
    // For guest availability checking, limit fields returned
    (resource.data.keys().hasOnly(['start', 'duration', 'status', 'serviceId']));
  
  // Create only via Cloud Function after validation
  allow create: if false; // Use Cloud Function createAppointment
  
  allow update: if isAdmin() || 
    (request.auth != null && 
     request.auth.uid == resource.data.customerId &&
     // Only allow status changes (cancel)
     request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status']) &&
     request.resource.data.status == 'cancelled');
  
  allow delete: if isAdmin();
}
```

**Alternative Approach:** Create a separate `availability` collection for public read access:
```javascript
// New collection: availability (generated by Cloud Function)
match /availability/{dateSlot} {
  allow read: if true; // Public availability only
  allow write: if false; // Maintained by Cloud Function
}
```

---

### 6. **Missing Admin Verification in Cloud Functions**
**File:** `functions/src/sms.ts` (line 386-431)  
**Severity:** 🟠 HIGH

#### The Problem
```typescript
export const sendSMSToCustomer = onCall(
  { region: 'us-central1', cors: true, enforceAppCheck: true },
  async (req) => {
    const userId = req.auth?.uid;
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    // ⚠️ No check if user is admin!
```

**Attack Vector:**
- Any authenticated user can send SMS to any phone number
- Spam customers, impersonate business

#### Fix
```typescript
export const sendSMSToCustomer = onCall(
  { region: 'us-central1', cors: true, enforceAppCheck: true },
  async (req) => {
    const userId = req.auth?.uid;
    
    if (!userId) {
      throw new HttpsError('unauthenticated', 'Must be authenticated');
    }
    
    // Verify admin role
    if (req.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }
    
    // Rest of logic...
  }
);
```

**Apply this pattern to ALL admin functions:**
- `sendSMSToCustomer`
- `getSMSConversation`
- Any function that accesses sensitive data or performs privileged operations

---

## 🟡 MEDIUM SEVERITY VULNERABILITIES

### 7. **Weak CORS Configuration**
**Multiple Files:** Various Cloud Functions  
**Severity:** 🟡 MEDIUM

#### The Problem
```typescript
export const someFunction = onCall(
  { cors: true }, // Allows ANY origin
  // ...
);
```

#### Fix
```typescript
// In functions/src/index.ts (or each function file)
const ALLOWED_ORIGINS = [
  'https://buenobrows.com',
  'https://www.buenobrows.com',
  'https://admin.buenobrows.com',
  'http://localhost:5173', // Dev only
  'http://localhost:3000'  // Dev only
];

export const someFunction = onCall(
  { 
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['POST'],
    }
  },
  async (req) => {
    // Function logic
  }
);
```

---

### 8. **No Rate Limiting on Expensive Operations**
**Files:** AI functions in `messaging.ts`, `skin-analysis.ts`  
**Severity:** 🟡 MEDIUM

#### The Problem
- Users can call AI functions repeatedly
- Each call costs money (Gemini API charges)
- No protection against abuse

#### Fix
Implement rate limiting using Firestore:

```typescript
// functions/src/rate-limiter.ts
export async function checkRateLimit(
  userId: string, 
  action: string, 
  maxRequests: number, 
  windowMs: number
): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const rateLimitRef = db.collection('rate_limits')
    .doc(`${userId}_${action}`);
  
  return db.runTransaction(async (tx) => {
    const doc = await tx.get(rateLimitRef);
    const data = doc.data();
    
    if (!data) {
      tx.set(rateLimitRef, {
        requests: [now],
        expiresAt: new Date(now + windowMs)
      });
      return true;
    }
    
    // Filter requests within window
    const recentRequests = data.requests.filter((t: number) => t > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    tx.update(rateLimitRef, {
      requests: [...recentRequests, now],
      expiresAt: new Date(now + windowMs)
    });
    
    return true;
  });
}

// Usage in AI functions
export const analyzeSkinPhoto = onCall(async (request) => {
  const userId = request.auth?.uid || 'anonymous';
  
  // Limit to 5 analyses per hour
  const allowed = await checkRateLimit(userId, 'skin_analysis', 5, 3600000);
  if (!allowed) {
    throw new HttpsError('resource-exhausted', 'Rate limit exceeded. Try again later.');
  }
  
  // Rest of function...
});
```

---

### 9. **Insecure Direct Object Reference (IDOR)**
**File:** `packages/shared/src/firestoreActions.ts`  
**Severity:** 🟡 MEDIUM

#### The Problem
Functions like `updateCustomer`, `deleteCustomer` don't verify the caller has permission to modify that specific customer.

#### Fix
Add authorization checks in Cloud Functions wrapper:

```typescript
// functions/src/customers.ts (NEW FILE)
import { onCall, HttpsError } from 'firebase-functions/v2/https';

export const updateCustomerSecure = onCall(async (req) => {
  const { customerId, updates } = req.data;
  
  if (!req.auth) {
    throw new HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  // Check permission: admin OR owner
  const isAdmin = req.auth.token.role === 'admin';
  const isOwner = req.auth.uid === customerId;
  
  if (!isAdmin && !isOwner) {
    throw new HttpsError('permission-denied', 'Cannot modify this customer');
  }
  
  // Validate updates (prevent privilege escalation)
  if (updates.status && !isAdmin) {
    throw new HttpsError('permission-denied', 'Only admins can change status');
  }
  
  // Perform update via Admin SDK (bypasses security rules)
  await db.collection('customers').doc(customerId).update({
    ...updates,
    updatedAt: new Date().toISOString()
  });
  
  return { success: true };
});
```

---

### 10. **Missing Input Validation**
**Multiple Files:** Various Cloud Functions  
**Severity:** 🟡 MEDIUM

#### The Problem
```typescript
export const findOrCreateCustomer = onCall(async (req) => {
  const { email, name, phone } = req.data || {};
  // No validation on format/length/content
```

#### Fix
```typescript
import validator from 'validator'; // npm install validator

export const findOrCreateCustomer = onCall(async (req) => {
  const { email, name, phone } = req.data || {};
  
  // Validate email
  if (email && !validator.isEmail(email)) {
    throw new HttpsError('invalid-argument', 'Invalid email format');
  }
  
  // Validate phone (E.164 format)
  if (phone && !validator.isMobilePhone(phone, 'any', { strictMode: true })) {
    throw new HttpsError('invalid-argument', 'Invalid phone number format');
  }
  
  // Validate name
  if (name) {
    if (typeof name !== 'string' || name.length < 1 || name.length > 100) {
      throw new HttpsError('invalid-argument', 'Name must be 1-100 characters');
    }
    // Sanitize (prevent XSS if displayed in admin panel)
    const sanitizedName = validator.escape(name);
  }
  
  // Rest of logic...
});
```

---

## 🟢 LOW SEVERITY ISSUES

### 11. **Information Disclosure in Error Messages**
**Severity:** 🟢 LOW

#### Fix
```typescript
// Bad
catch (error: any) {
  throw new HttpsError('internal', error.message); // Leaks internal details
}

// Good
catch (error: any) {
  console.error('Internal error:', error); // Log for debugging
  throw new HttpsError('internal', 'An error occurred. Please try again.');
}
```

---

### 12. **No Security Headers**
**Severity:** 🟢 LOW

#### Fix
Add to `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ]
  }
}
```

---

## 📋 Priority Action Checklist

### Immediate (Within 24 Hours)
- [ ] **DELETE or PROTECT** `setAdminRole` function
- [ ] **REVOKE** exposed Gemini API key in Google Cloud Console
- [ ] **GENERATE** new API key and store in Firebase Secrets
- [ ] **UPDATE** firebase.rules to restrict holds collection
- [ ] **DEPLOY** updated rules: `firebase deploy --only firestore:rules`

### This Week
- [ ] Implement admin role checks in all Cloud Functions
- [ ] Add input validation to all callable functions
- [ ] Implement rate limiting on AI functions
- [ ] Review and restrict appointment read access
- [ ] Set up CORS whitelist
- [ ] Add security headers to firebase.json

### This Month
- [ ] Implement comprehensive audit logging
- [ ] Set up Firebase App Check for client verification
- [ ] Add monitoring/alerts for suspicious activity
- [ ] Security code review of all Cloud Functions
- [ ] Penetration testing

---

## 🛡️ Additional Security Recommendations

### 1. Enable Firebase App Check
Protects your backend from abuse by untrusted clients:

```bash
# Install App Check in your apps
npm install firebase/app-check

# In your app initialization
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

### 2. Implement Comprehensive Logging
```typescript
// functions/src/audit-log.ts
export async function logAuditEvent(
  action: string,
  userId: string | null,
  resourceType: string,
  resourceId: string,
  metadata?: any
) {
  await db.collection('audit_logs').add({
    action,
    userId,
    resourceType,
    resourceId,
    metadata,
    timestamp: new Date(),
    ip: metadata?.ip || null
  });
}

// Usage
await logAuditEvent('admin_role_set', userId, 'user', targetUserId, {
  grantedBy: currentUserId
});
```

### 3. Regular Security Audits
```bash
# Check for known vulnerabilities
npm audit

# Update dependencies regularly
npm update

# Use Snyk for continuous monitoring
npm install -g snyk
snyk test
snyk monitor
```

### 4. Set Up Firestore Security Rules Testing
```javascript
// firestore.rules.test.js
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');

test('Cannot read other customer data', async () => {
  const db = getFirestore('user-id');
  await assertFails(db.collection('customers').doc('other-user-id').get());
});
```

---

## 📊 Risk Assessment Matrix

| Vulnerability | Likelihood | Impact | Risk Level | Priority |
|--------------|------------|--------|------------|----------|
| Open Admin Endpoint | High | Critical | 🔴 CRITICAL | P0 |
| Hardcoded API Keys | High | High | 🔴 CRITICAL | P0 |
| Open Holds Collection | Medium | High | 🔴 CRITICAL | P0 |
| Public Customer Creation | Medium | Medium | 🟠 HIGH | P1 |
| Public Appointments | High | Medium | 🟠 HIGH | P1 |
| Missing Admin Checks | Medium | High | 🟠 HIGH | P1 |
| Weak CORS | Low | Medium | 🟡 MEDIUM | P2 |
| No Rate Limiting | Medium | Medium | 🟡 MEDIUM | P2 |
| IDOR Vulnerabilities | Low | Medium | 🟡 MEDIUM | P2 |

---

## 🆘 Incident Response Plan

If you suspect a breach:

1. **Immediate:**
   - Revoke all API keys
   - Disable compromised user accounts
   - Review audit logs for suspicious activity
   - Take offline if actively under attack

2. **Within 1 Hour:**
   - Deploy emergency firestore rules (deny all)
   - Investigate scope of breach
   - Notify affected users if personal data compromised

3. **Within 24 Hours:**
   - Complete security patch deployment
   - Reset all admin passwords
   - Review and revoke all admin roles
   - File incident report

---

## 📞 Need Help?

If you need assistance implementing these fixes:
1. Prioritize the CRITICAL issues
2. Test each fix in a development environment first
3. Deploy during low-traffic periods
4. Monitor error logs after deployment

**Questions?** Review Firebase Security Docs: https://firebase.google.com/docs/rules

---

**Last Updated:** October 16, 2025  
**Next Review:** November 16, 2025 (Monthly security audits recommended)

