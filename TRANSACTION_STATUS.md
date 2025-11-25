# Transaction Status in findOrCreateCustomer

## ✅ **What We HAVE** (Transaction-Safe)

### New Customer Creation (Lines 502-557)
```typescript
// ✅ FULLY PROTECTED with transaction
await db.runTransaction(async (tx) => {
  // Check reservations (acts as lock)
  const reservation = await tx.get(db.doc(`uniqueContacts/email:${email}`));
  
  if (reservation.exists) {
    throw new HttpsError('already-exists', 'Customer exists');
  }
  
  // Create customer AND reservation atomically
  tx.set(customerRef, { ... });
  tx.set(reservationRef, { ... });
});
```

**Status**: ✅ **FULLY PROTECTED** - No race conditions when creating new customers

---

## ❌ **What We DON'T HAVE** (Not Transaction-Safe)

### Existing Customer Lookup (Lines 77-450)
```typescript
// ❌ NOT PROTECTED - Uses regular queries outside transaction
if (authUid) {
  const authDoc = await db.collection('customers').doc(authUid).get(); // ❌ Not in transaction
}

if (canonicalPhone) {
  const phoneQuery = await db.collection('customers')
    .where('canonicalPhone', '==', canonicalPhone) // ❌ Query, not transaction
    .get();
}

if (canonicalEmail) {
  const emailQuery = await db.collection('customers')
    .where('canonicalEmail', '==', canonicalEmail) // ❌ Query, not transaction
    .get();
}
```

**Status**: ❌ **NOT PROTECTED** - Race condition possible between lookup and creation

---

## 🐛 **The Remaining Race Condition**

### Scenario: Two users book with same email simultaneously

```
Time    User A                          User B
─────────────────────────────────────────────────────
0ms     Query: Check if customer exists
1ms     (No customer found)             Query: Check if customer exists
2ms     (No customer found)
3ms     → Goes to creation step         → Goes to creation step
4ms     Transaction: Check reservation  Transaction: Check reservation
5ms     (No reservation)                (No reservation)
6ms     Create customer ✅              Create customer ✅
7ms     ❌ DUPLICATE! Both created!
```

**Why this happens**: The initial queries (lines 84-164) happen OUTSIDE the transaction, so both users can pass the "doesn't exist" check before either enters the transaction.

---

## ✅ **What We SHOULD Have** (Full Protection)

### Wrap Everything in Transaction

```typescript
await db.runTransaction(async (tx) => {
  // 1. Check for existing customer using uniqueContacts (transaction-safe)
  if (canonicalEmail) {
    const emailReservation = await tx.get(
      db.doc(`uniqueContacts/email:${canonicalEmail}`)
    );
    if (emailReservation.exists) {
      const customerId = emailReservation.data()?.customerId;
      const customer = await tx.get(db.doc(`customers/${customerId}`));
      if (customer.exists) {
        return { customerId, isNew: false };
      }
    }
  }
  
  // 2. If not found, create new customer (transaction-safe)
  // ... creation logic ...
});
```

**Status**: ❌ **NOT IMPLEMENTED YET** - This is what we need to add

---

## 📊 **Current Protection Level**

| Operation | Transaction-Safe? | Risk Level |
|-----------|------------------|------------|
| **New customer creation** | ✅ Yes | 🟢 Low |
| **Existing customer lookup** | ❌ No | 🟡 Medium |
| **Customer updates** | ❌ No | 🟡 Medium |
| **Customer merges** | ❌ No | 🟡 Medium |

---

## 🎯 **Summary**

**We have**: Transaction protection for NEW customer creation ✅

**We're missing**: Transaction protection for EXISTING customer lookup ❌

**Impact**: 
- ✅ Prevents duplicates when creating brand new customers
- ❌ Still possible to create duplicates if two requests check simultaneously before either enters transaction

**Next Step**: Wrap the entire function (lookup + creation) in a single transaction using `uniqueContacts` as the primary lookup mechanism.


