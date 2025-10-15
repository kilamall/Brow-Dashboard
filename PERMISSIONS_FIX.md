# 🔧 Permissions Fix - October 15, 2025

## 🐛 **Issue**

Guest booking was failing with error:
```
finalizeBooking error: FirebaseError: Missing or insufficient permissions.
```

---

## 🔍 **Root Cause**

The issue was in the `createCustomer` function in `packages/shared/src/firestoreActions.ts`.

### The Problem:

The function was using `setDoc` with `{ merge: true }`:

```typescript
await setDoc(ref, data, { merge: true });
```

**Why this caused the error:**

1. `setDoc` with `{ merge: true }` is treated as an **UPDATE** operation by Firestore
2. The security rules for customers:
   ```javascript
   match /customers/{id} {
     allow create: if true;  // Anyone can CREATE
     allow update: if isAdmin() || 
       (request.auth != null && 
        request.auth.token.email == resource.data.email);  // Only authenticated users can UPDATE
   }
   ```
3. Guest users are **not authenticated**, so they cannot UPDATE
4. The function was trying to UPDATE, not CREATE, causing the permission error

---

## ✅ **The Fix**

Changed `setDoc` to use `{ merge: false }`:

### Before:
```typescript
export async function createCustomer(db: Firestore, input: Partial<Customer>): Promise<string> {
  const ref = input.id ? doc(db, 'customers', input.id) : doc(collection(db, 'customers'));
  await setDoc(
    ref,
    {
      name: input.name || 'Unnamed',
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
      status: input.status || 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }  // ❌ This triggers UPDATE rule
  );
  return ref.id;
}
```

### After:
```typescript
export async function createCustomer(db: Firestore, input: Partial<Customer>): Promise<string> {
  const ref = input.id ? doc(db, 'customers', input.id) : doc(collection(db, 'customers'));
  // Use merge: false for new customers to trigger 'create' rule, not 'update' rule
  await setDoc(
    ref,
    {
      name: input.name || 'Unnamed',
      email: input.email || null,
      phone: input.phone || null,
      notes: input.notes || null,
      status: input.status || 'approved',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: false }  // ✅ This triggers CREATE rule
  );
  return ref.id;
}
```

---

## 🎯 **Why This Works**

1. `setDoc` with `{ merge: false }` is treated as a **CREATE** operation
2. The security rules allow **anyone** to CREATE customers: `allow create: if true;`
3. Guest users can now create customer records
4. The booking flow completes successfully

---

## 📊 **What Changed**

### Files Modified:
- `packages/shared/src/firestoreActions.ts` - Changed `merge: true` to `merge: false`

### Files Rebuilt:
- `apps/booking/dist/` - New build with fix

### Deployed To:
- https://bueno-brows-7cce7.web.app (booking app)

---

## 🧪 **Testing**

### Guest Booking Flow:

1. **Go to**: https://bueno-brows-7cce7.web.app
2. **Click**: "Book now"
3. **Select**: A service
4. **Choose**: A date and time
5. **Click**: "Book now" (without signing in)
6. **Fill in**: Guest form (name, email, phone)
7. **Click**: "Confirm guest booking"
8. **Expected**: Confirmation page with appointment ID ✅

### Signed-In Booking Flow:

1. **Sign in** to your account
2. **Book** an appointment
3. **Expected**: Works as before ✅

---

## 🎓 **Key Learnings**

### Firestore Security Rules:

- `allow create` - Controls who can create new documents
- `allow update` - Controls who can update existing documents
- `setDoc` with `{ merge: true }` triggers **UPDATE** rule
- `setDoc` with `{ merge: false }` triggers **CREATE** rule

### Best Practices:

1. **Use `{ merge: false }`** when creating new documents
2. **Use `{ merge: true }`** only when you know the document might already exist
3. **Check if document exists first** before deciding which operation to use
4. **Design security rules** to allow the operations you need

---

## ✅ **Status**

**FIXED** - Both guest and signed-in booking now work correctly!

---

## 🎉 **Summary**

The permissions error was caused by using `setDoc` with `{ merge: true }`, which triggered the UPDATE security rule instead of the CREATE rule. By changing it to `{ merge: false }`, the function now properly triggers the CREATE rule, which allows guest users to create customer records.

---

*Fix deployed: October 15, 2025*  
*Status: ✅ RESOLVED*


