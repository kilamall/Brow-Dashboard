# Easy Test - Copy This Into Browser Console

Since `getFunctions` isn't available directly, use one of these methods:

## Method 1: Access via React DevTools (Easiest)

1. Open React DevTools (if installed) or use this trick:
2. In browser console, paste this:

```javascript
// This accesses the Firebase instance from your React app
const reactRoot = document.querySelector('#root')._reactInternalFiber || 
                  document.querySelector('#root')._reactInternalInstance;

// Navigate to find Firebase
let firebaseApp = null;
function findFirebase(node, depth = 0) {
  if (depth > 10) return null;
  if (!node) return null;
  
  if (node.memoizedState) {
    for (let state = node.memoizedState; state; state = state.next) {
      if (state.memoizedState && state.memoizedState.db) {
        return state.memoizedState;
      }
    }
  }
  
  if (node.child) {
    const found = findFirebase(node.child, depth + 1);
    if (found) return found;
  }
  
  if (node.sibling) {
    const found = findFirebase(node.sibling, depth + 1);
    if (found) return found;
  }
  
  return null;
}

const firebase = findFirebase(reactRoot);
if (firebase && firebase.db) {
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  const functions = getFunctions(firebase.db.app);
  const sendManualReminder = httpsCallable(functions, 'sendManualReminder');
  
  // Test it
  const result = await sendManualReminder({ 
    appointmentId: '3DN74PpczWDjHpq1gh6G',
    reminderType: '24-hour'
  });
  console.log('✅ Result:', result.data);
} else {
  console.error('Could not find Firebase instance');
}
```

## Method 2: Use Firebase Console Directly

1. Go to Firebase Console → Functions
2. Find `sendManualReminder` function
3. Click "Test" tab
4. Enter this JSON:
```json
{
  "appointmentId": "3DN74PpczWDjHpq1gh6G",
  "reminderType": "24-hour"
}
```
5. Click "Test"

## Method 3: Add to Your Admin Panel (Best Long-term)

Add a test button to your admin panel that calls the function. I can help you add this if you want!

## Method 4: Use Firebase CLI

```bash
firebase functions:shell
```

Then:
```javascript
sendManualReminder({ 
  appointmentId: '3DN74PpczWDjHpq1gh6G',
  reminderType: '24-hour'
})
```


