# SMS Booking - Category vs Services Issue

## Problem
User reports seeing categories listed instead of top 5 services after time selection.

## Analysis

### All Code Paths That Could Show Services or Categories

#### Path 1: `specific_availability_request` → `time_selection`
1. User types: "Nov 11 10am"
2. Parser returns: `{type: 'specific_availability_request', data: {date}}`
3. Handler (line 1327-1346):
   - Shows available times
   - Sets state: `type: 'awaiting_time_selection', pendingTimes: true`
4. User selects time: "10am"
5. Parser checks (line 646-654):
   - Matches time pattern: ✅
   - Has `pendingTimes` in state: ✅
   - Returns: `{type: 'time_selection', data: {time}}`
6. Handler (line 1501-1529):
   - ✅ Shows top 5 services
   - ✅ Sets `awaitingService: true, availableServices: [...]`

#### Path 2: `quick_booking`
1. User types: "Book 11/11 10am"
2. Parser returns: `{type: 'quick_booking'}`
3. Handler (line 1348-1461):
   - If time NOT available: shows times, sets `awaitingTime: true`
   - If time IS available: shows top 5 services ✅

#### Path 3: `booking_request`
1. User types: "BOOK 11/11 10am"
2. Parser returns: `{type: 'booking_request'}`
3. Handler (line 1814-1897):
   - If time available: shows top 5 services ✅
   - If not: shows available times

### Where Categories COULD Show

#### Location 1: Parser still has category detection (line 677)
```typescript
if (conversationState.awaitingCategory) {
  return { type: 'provide_category', data: { categoryInput: message.trim() } };
}
```
**BUT**: No code sets `awaitingCategory: true` anymore!
**AND**: No case handler for 'provide_category' - would go to default/error!

#### Location 2: SMS_TEMPLATES.categorySelection (line 109)
```typescript
categorySelection: (categories: string[]) => {
  const categoryList = categories.map((c, i) => `${i + 1}. ${c}`).join('\n');
  return `What type of service are you looking for? 💅\n\n${categoryList}\n\n...`;
}
```
**BUT**: This function is NEVER CALLED anymore!

### Root Cause Hypothesis

**Most Likely**: Old conversation state in Firestore
- User might have an old state saved with `awaitingCategory: true` from before the fix
- When they reply, parser returns `{type: 'provide_category'}`
- No case handler exists, goes to default
- Shows error message and preserves old state

**Test**: Clear the conversation state for this user

## Solution

### Option 1: Handle Legacy `provide_category` Cases
Add a case handler that redirects to show top 5 services:

```typescript
case 'provide_category':
  // Legacy handler - redirect to service selection
  if (conversationState && conversationState.date && conversationState.time) {
    const top5ServicesQuery = await db.collection('services').where('active', '==', true).get();
    const top5ServicesList = top5ServicesQuery.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 5);
    
    responseMessage = `Great! Which service?\n\n${top5ServicesList.map((s, i) => 
      `${i+1}. ${s.name} - $${s.price} (${s.duration}min)`
    ).join('\n')}\n\nView all: buenobrows.com/services\n\nReply with number or name. - Bueno Brows` + A2P_FOOTER;
    
    await saveConversationState(from, {
      type: 'awaiting_service',
      date: conversationState.date,
      dateStr: conversationState.dateStr,
      time: conversationState.time,
      awaitingService: true,
      availableServices: top5ServicesList
    });
  } else {
    // State incomplete, restart
    responseMessage = SMS_TEMPLATES.booking_instructions();
    await clearConversationState(from);
  }
  break;
```

### Option 2: Remove Category Detection from Parser
Remove lines 676-679:
```typescript
// DELETE THESE LINES:
if (conversationState.awaitingCategory) {
  return { type: 'provide_category', data: { categoryInput: message.trim() } };
}
```

## Recommendation
Implement BOTH solutions:
1. Add legacy handler (Option 1) to fix existing users
2. Remove category detection (Option 2) to prevent future issues


