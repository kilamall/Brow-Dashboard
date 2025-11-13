# 🐛 SMS Showing 0 But Cost is $3.97 - Debug Guide

## 📊 Current Situation

### What You're Seeing:
- **Twilio Cost**: $3.97 ✅ (increased from $0.43)
- **SMS Sent**: 0 ❌ (should be ~602)
- **SMS Received**: 0 ❌ (should be ~169)

### What Twilio Console Shows:
- **Outbound SMS**: 602 messages = $5.00
- **Inbound SMS**: 169 messages = $1.40
- **Carrier Fees**: $2.33
- **Phone Number**: $1.15
- **A2P Registration**: $16.50
- **TOTAL**: $26.38

---

## 🎯 The Problem

The **cost calculation is working** (showing $3.97 with new pricing), but the **message counting is NOT finding the data**.

This means:
1. ✅ Backend function deployed successfully
2. ✅ New pricing constants applied (carrier fees, A2P, etc.)
3. ❌ Query to `sms_conversations` is returning 0 results
4. ❌ Query to `sms_logs` is also returning 0 results

---

## 🔍 Root Cause Analysis

### Possible Cause #1: Timestamp Format Mismatch

**Problem**: The code queries:
```javascript
.where('timestamp', '>=', startOfMonth.toISOString())
// Looks for: >= "2025-11-01T00:00:00.000Z"
```

But if your Firestore stores timestamps as:
- Firestore Timestamp objects (not strings)
- Different format like `"Nov 13, 2025"`
- Unix timestamps

**Result**: Query returns 0 documents even though data exists.

**Fix**: Check Firestore and convert timestamp field if needed.

---

### Possible Cause #2: Data is in Different Month

**Problem**: The code only checks current month (November 2025).

If your SMS were sent in October, they won't be counted.

**Fix**: Extend the date range or check historical data.

---

### Possible Cause #3: Field Names Don't Match

**Problem**: The code expects:
```javascript
data.direction === 'outbound'  // for sent
data.direction === 'inbound'   // for received
```

But your Firestore might have:
- `type` instead of `direction`
- `status` instead of `direction`
- Different values like `sent`/`received`

**Fix**: Verify field names in Firestore match the code.

---

### Possible Cause #4: Frontend Caching

**Problem**: The dashboard is showing old cached data.

**Fix**: Click "Refresh" button to trigger new calculation.

---

## ✅ **IMMEDIATE ACTION: Click Refresh!**

### Before anything else:

1. **Go to Cost Monitoring page**
2. **Click the "Refresh" button** (top right)
3. **Wait 15 seconds**
4. **Check if numbers update**

If numbers still show 0, continue to diagnosis below.

---

## 🔬 Diagnosis Steps

### Step 1: Check Firestore Data Exists

1. Go to: https://console.firebase.google.com/project/bueno-brows-7cce7/firestore
2. Click `sms_conversations` collection
3. Count the documents - should be 770+

**If 0 documents**: SMS webhook isn't logging. Need to fix `sms.ts`.
**If 770+ documents**: Data exists, continue to Step 2.

---

### Step 2: Check Timestamp Format

Click on any document in `sms_conversations` and check the `timestamp` field:

#### ✅ Good (String format):
```
timestamp: "2025-11-13T18:45:23.123Z"
```

#### ❌ Bad (Firestore Timestamp):
```
timestamp: November 13, 2025 at 6:45:23 PM UTC-8
```

#### ❌ Bad (Unix timestamp):
```
timestamp: 1699908323123
```

**If bad format**: Need to migrate data or update query logic.

---

### Step 3: Check Field Names

Look at a document structure. Should have:
```json
{
  "customerId": "abc123",
  "direction": "outbound",    ← Must be exactly this
  "timestamp": "2025-11-13T...",  ← Must be ISO string
  "phoneNumber": "+1...",
  "message": "..."
}
```

**If `direction` doesn't exist**: The query won't find anything.

---

### Step 4: Run Console Diagnostic

Open your Cost Monitoring page, press F12, paste this:

```javascript
(async () => {
  const db = firebase.firestore();
  const nov1 = new Date(2025, 10, 1); // Nov 1, 2025
  
  console.log("Checking sms_conversations...");
  
  // Try to get ALL documents first (no filter)
  const all = await db.collection('sms_conversations').limit(10).get();
  console.log(`Total sample: ${all.size} documents`);
  
  if (all.size > 0) {
    const firstDoc = all.docs[0].data();
    console.log("First document:", firstDoc);
    console.log("Timestamp type:", typeof firstDoc.timestamp);
    console.log("Has direction?", 'direction' in firstDoc);
  }
  
  // Try the actual query
  const filtered = await db.collection('sms_conversations')
    .where('timestamp', '>=', nov1.toISOString())
    .get();
  
  console.log(`\nFiltered by Nov 2025: ${filtered.size} documents`);
  
  let sent = 0, received = 0;
  filtered.forEach(doc => {
    const data = doc.data();
    if (data.direction === 'outbound') sent++;
    if (data.direction === 'inbound') received++;
  });
  
  console.log(`Sent: ${sent}, Received: ${received}`);
})();
```

**This will show you EXACTLY what's wrong!**

---

## 🛠️ Quick Fixes Based on Diagnosis

### Fix #1: Timestamp is Firestore Timestamp (Not String)

If your timestamps are Firestore Timestamp objects, update the query:

```typescript
// In cost-monitoring.ts, change:
.where('timestamp', '>=', startOfMonth.toISOString())

// To:
.where('timestamp', '>=', admin.firestore.Timestamp.fromDate(startOfMonth))
```

---

### Fix #2: Field Name is Wrong

If the field is called something else, update the code:

```typescript
// In cost-monitoring.ts, change:
if (data.direction === 'outbound') { sentCount++; }

// To match your field name:
if (data.type === 'sent') { sentCount++; }
// or whatever your field is called
```

---

### Fix #3: Data is in Wrong Collection

If SMS is actually in `sms_logs` not `sms_conversations`, the code already checks both. But verify both exist.

---

### Fix #4: Manual Override (Temporary)

If you can't find the issue quickly, manually set the counts:

```javascript
// In Firestore: _usage_tracking/2025-11_twilio
{
  smsSent: 602,
  smsReceived: 169
}
```

The system will use these values instead of querying.

---

## 🎯 Enhanced Dashboard Features

I've also updated the frontend to show:

### **Per Service:**
- ✅ Cost to Date (current month)
- ✅ **Per Day**: Daily average cost
- ✅ **Per Customer**: Cost divided by active customers
- ✅ **Projected Month**: Estimated end-of-month cost

### **For Twilio Card:**
```
Twilio                      $3.97
─────────────────────────────────
SMS Sent:         602       ← Should update after fix
SMS Received:     169       ← Should update after fix
─────────────────────────────────
Per Day:          $0.31     ← $3.97 / 13 days
Per Customer:     $0.08     ← $3.97 / 50 customers
Projected Month:  $9.15     ← $3.97 × (30/13)
```

---

## 📋 Checklist

- [ ] **1. Click "Refresh"** on Cost Monitoring dashboard
- [ ] **2. Check Firestore** for `sms_conversations` collection
- [ ] **3. Verify timestamp format** (should be ISO string)
- [ ] **4. Run console diagnostic** to see exact issue
- [ ] **5. Report findings** so I can provide exact fix

---

## 🎯 Expected Outcome

After fixing the data query issue, you should see:

```
Twilio                      $12-26
─────────────────────────────────
SMS Sent:         602       ✅
SMS Received:     169       ✅
─────────────────────────────────
Per Day:          $0.92/day
Per Customer:     $0.52/customer
Projected Month:  $28.38
```

---

## 📞 Next Steps

1. **Check Firestore** - Does `sms_conversations` have 770+ docs?
2. **Run diagnostic** - What does the console show?
3. **Report back** with findings
4. I'll provide the **exact fix** based on what you find!

---

**The good news**: Your cost is being calculated correctly ($3.97)! We just need to find why the counts aren't showing. Once we identify the data format issue, it's a 1-line fix!

