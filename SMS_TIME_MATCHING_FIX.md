# SMS Booking - Time Matching Fix

## Issue
When customers text to book appointments via SMS (e.g., "Book a 11/12 10am"), the system incorrectly responds that the time isn't available, even when it clearly is available on the schedule and booking page.

**Example:**
- User texts: `"Book a 11/12 10am"`
- System responds: `"10AM isn't available on Nov 12. Here's what we have: 10:00 AM, 11:00 AM, 12:00 PM..."`
- **Contradiction**: The system says 10AM isn't available, but then lists "10:00 AM" as available!

## Root Cause
The time comparison logic had a critical flaw in how it normalized and compared times:

1. **Requested time** `"10am"` → normalized to `"10AM"` (removes spaces/colons)
2. **Available time** `"10:00 AM"` → normalized to `"1000AM"` (removes spaces/colons)
3. **Comparison**: Check if `"1000AM".startsWith("10AM")` → **FALSE** ❌

The "00" from the minutes breaks the match, causing available times to appear unavailable.

### Old Buggy Code
```typescript
const normalizedRequestedTime = requestedTime.replace(/[:\s]/g, ''); // "10am" → "10AM"
const timeAvailable = availableTimes.some(t => {
  const normalizedAvailableTime = t.toUpperCase().replace(/[:\s]/g, ''); // "10:00 AM" → "1000AM"
  return normalizedAvailableTime.startsWith(normalizedRequestedTime); // "1000AM".startsWith("10AM") = FALSE!
});
```

## Solution
Created a new `timeMatches()` helper function that properly parses both times using the existing `parseTimeString()` function and compares hours and minutes correctly:

### New Fixed Code
```typescript
/**
 * Check if a requested time matches an available time slot
 * Handles cases like "10am" matching "10:00 AM"
 */
function timeMatches(requestedTime: string, availableTime: string): boolean {
  const requested = parseTimeString(requestedTime);
  const available = parseTimeString(availableTime);
  
  if (!requested || !available) {
    // Fallback to simple string comparison if parsing fails
    const normalizedRequested = requestedTime.toUpperCase().replace(/[:\s]/g, '');
    const normalizedAvailable = availableTime.toUpperCase().replace(/[:\s]/g, '');
    return normalizedAvailable === normalizedRequested;
  }
  
  // Match if hours are the same and minutes match (or both are on the hour)
  return requested.hours === available.hours && 
         (requested.minutes === available.minutes || 
          (requested.minutes === 0 && available.minutes === 0));
}
```

Now using it for comparisons:
```typescript
const timeAvailable = availableTimes.some(t => timeMatches(requestedTime, t));
```

## Files Changed
1. **functions/src/sms.ts**
   - Added `timeMatches()` helper function (lines 293-314)
   - Fixed time comparison at line 1373 (first booking flow)
   - Fixed time comparison at line 1834 (second booking flow)

## Test Cases
The fix now correctly handles:
- ✅ `"10am"` matches `"10:00 AM"`
- ✅ `"2pm"` matches `"2:00 PM"`
- ✅ `"10:30am"` matches `"10:30 AM"`
- ✅ `"7 PM"` matches `"7:00 PM"`
- ✅ `"19:00"` matches `"7:00 PM"` (24-hour format)

## Deployment
- ✅ Deployed to Firebase Functions: `smsWebhook`
- ✅ Function URL: https://smswebhook-qamrh6uifq-uc.a.run.app
- ✅ No breaking changes

## Additional Fix: Show Top 5 Services
After fixing the time matching, also updated the flow to show top 5 services directly instead of asking for categories:

### Before
```
What type of service are you looking for? 💅

1. Brows
2. Lashes
3. Other

Reply with the number or category name...
```

### After
```
Great! Which service?

1. Brow Wax - $35 (20min)
2. Brow Tint - $25 (15min)
3. Brow Consultation - $40 (30min)
4. Lash Lift - $75 (60min)
5. Combo Service - $95 (90min)

View all: buenobrows.com/services

Reply with number or name. - Bueno Brows
```

## Additional Fix #2: Service Number Matching
After fixing the time matching and showing top 5 services, there was another issue where replying with a number (e.g., "1" or "3") would match against ALL services in the database instead of just the 5 shown.

### Root Cause
When user removed `availableServices` from conversation state, the system fell back to fetching all services:
```typescript
const serviceList = conversationState.availableServices || await getActiveServices();
```

This caused incorrect matches - e.g., replying "1" might match a completely different service than the first one shown.

### Solution
Added `availableServices: top5ServicesList` back to all locations where we show top 5 services and set `awaitingService: true`. This ensures the number matching works against the exact list shown to the user.

## Testing Instructions
1. Text the booking number: `+1 (650) 683-9181`
2. Send: `"Book a 11/12 10am"`
3. **Expected**: System recognizes 10am is available and shows top 5 services with link
4. Reply with `"3"` to select the 3rd service
5. **Expected**: System correctly books the 3rd service from the list shown (not from a different list)
6. **Before fix**: Said "10AM isn't available" then listed 10:00 AM as available (contradiction)
7. **After all fixes**: Shows "Great! Which service?" with top 5 services, and number matching works correctly

---
**Fixed**: November 10, 2025
**Deploy Status**: ✅ Live in production
**Related Issues**: 
- Time comparison logic in SMS booking flow
- Service selection UX (show top 5 instead of categories)
- Service number matching against correct list

