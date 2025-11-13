# SMS Booking - Legacy Category State Fix

## Issue
User was seeing categories listed instead of top 5 services after selecting a time, even though we had already "fixed" the code to show services.

## Root Cause
**Two systems problem**: Old conversation state vs. new code

1. **Before the fix**: The system set `awaitingCategory: true` in conversation state
2. **After the fix**: We removed all code that sets `awaitingCategory: true` 
3. **The problem**: Users with **existing/old state** in Firestore still had `awaitingCategory: true`
4. **What happened**:
   - User replies → Parser checks `awaitingCategory` → Returns `{type: 'provide_category'}`
   - No case handler for 'provide_category' exists anymore
   - Goes to default/error case
   - Preserves the broken state and repeats

## The Two Systems
- **System 1 (Old)**: Category selection → Service selection
- **System 2 (New)**: Top 5 services directly

Users caught in the middle had state from System 1 but code for System 2!

## Solution

### Fix 1: Legacy State Handler
Added a special case handler for users with old category state:

```typescript
case 'legacy_category_redirect':
  // Detects old awaitingCategory state
  // Shows top 5 services
  // Updates state to awaitingService with availableServices
  break;
```

### Fix 2: Parser Detection
Modified the parser to detect and redirect legacy states:

```typescript
// BEFORE: Would return {type: 'provide_category'}
// AFTER: Returns {type: 'legacy_category_redirect'} with logging

if (conversationState.awaitingCategory) {
  console.log('⚠️ Found legacy awaitingCategory state, redirecting to service selection');
  return { type: 'legacy_category_redirect', data: { input: message.trim() } };
}
```

### How It Works Now
1. User with old state replies with any message
2. Parser detects `awaitingCategory: true`
3. Logs warning: `⚠️ Found legacy awaitingCategory state`
4. Returns `legacy_category_redirect` type
5. Handler shows top 5 services
6. **Updates state to remove awaitingCategory and add awaitingService**
7. User is now back on the correct flow!

## Testing
**For users with old state**:
1. Text any message (will trigger legacy handler)
2. Should see: "Great! Which service?" with top 5 services
3. Reply with number or name
4. Should proceed normally through booking

**For new users**:
- Never hit this code path (no old state)
- Flow works normally with top 5 services from the start

## Logs to Check
When a user with legacy state texts, you'll see:
```
⚠️ Found legacy awaitingCategory state, redirecting to service selection
🔄 Handling legacy category state, showing top 5 services
```

If this appears frequently, it means many users had old state and are now being fixed automatically.

---
**Fixed**: November 10, 2025
**Deploy Status**: ✅ Live in production
**Impact**: Automatically fixes all users stuck with old category-based conversation state


