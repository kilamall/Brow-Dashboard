# 🔍 Availability Calculation Debug Fix - October 21, 2025

## 🐛 **Issue Reported**

User reported that despite having 90 minutes available (7:00 PM - 8:30 PM) and only needing 80 minutes for an appointment, the system showed "No available time slots for this date."

### Console Logs Showed:
```
Loaded 1 availability slots for 2025-10-30
Loaded 1 booked slots for 2025-10-30
Checking overlap: Object
Calculated 0 available slots (1 booked slots)
```

---

## 🔍 **Root Cause Analysis**

The issue was that there was **1 booked slot** in the availability collection that was overlapping with the entire 90-minute window, even though the appointment only needed 80 minutes.

### Possible Causes:
1. **Expired Hold**: A previous booking attempt created a hold that never got cleaned up
2. **Stale Availability Slot**: An old availability slot from a cancelled booking
3. **Overlapping Booking**: An existing appointment that overlaps with the requested time

---

## ✅ **Solutions Implemented**

### 1. **Enhanced Debug Logging** ✅

**Updated `packages/shared/src/slotUtils.ts`:**
```typescript
function overlapsAvailability(startMs: number, endMs: number, slots: AvailabilitySlot[]): boolean {
  for (const slot of slots) {
    const slotStart = new Date(slot.start).getTime();
    const slotEnd = new Date(slot.end).getTime();
    const overlaps = slotStart < endMs && slotEnd > startMs;
    
    // Enhanced debug logging
    console.log('🔍 Checking overlap:', {
      slotId: slot.id,
      slotStatus: slot.status,
      slotStart: new Date(slotStart).toISOString(),
      slotEnd: new Date(slotEnd).toISOString(),
      requestedStart: new Date(startMs).toISOString(),
      requestedEnd: new Date(endMs).toISOString(),
      overlaps,
      slotDuration: `${Math.round((slotEnd - slotStart) / 60000)} min`,
      requestedDuration: `${Math.round((endMs - startMs) / 60000)} min`
    });
    
    if (overlaps) {
      console.log(`❌ OVERLAP DETECTED with slot ${slot.id} (${slot.status})`);
      return true;
    }
  }
  return false;
}
```

**What This Does:**
- Shows exactly which slot is causing the overlap
- Displays the slot ID, status, and duration
- Shows the requested time vs. the blocking slot
- Makes it easy to identify the problem

---

### 2. **Cleanup Function for Expired Holds** ✅

**Created `functions/src/cleanup-expired-holds.ts`:**
```typescript
export const cleanupExpiredHolds = onRequest(
  { region: 'us-central1', cors: true },
  async (req, res) => {
    try {
      const now = new Date().toISOString();
      
      // Clean up expired holds
      const holdsQuery = db.collection('holds').where('expiresAt', '<=', now);
      const holdsSnap = await holdsQuery.get();
      
      // Clean up expired availability slots
      const availQuery = db.collection('availability')
        .where('status', '==', 'held')
        .where('expiresAt', '<=', now);
      const availSnap = await availQuery.get();
      
      // Delete expired records
      // ... cleanup logic
      
      res.json({
        success: true,
        holdsDeleted,
        availDeleted,
        cleanedAt: now
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);
```

**What This Does:**
- Removes expired holds from the `holds` collection
- Removes expired held slots from the `availability` collection
- Can be called manually to clean up stale data
- Returns count of deleted records

---

### 3. **Deployed Updates** ✅

- ✅ Enhanced debugging deployed to booking app
- ✅ Cleanup function deployed to Cloud Functions
- ✅ Both are live and ready for testing

---

## 🧪 **How to Debug the Issue**

### Step 1: Check Console Logs
1. Go to https://bueno-brows-7cce7.web.app
2. Open browser console (F12)
3. Try to book for October 30, 2025 at 7:00 PM
4. Look for the enhanced debug logs:

```
🔍 Checking overlap: {
  slotId: "abc123",
  slotStatus: "held",
  slotStart: "2025-10-30T19:00:00.000Z",
  slotEnd: "2025-10-30T20:30:00.000Z",
  requestedStart: "2025-10-30T19:00:00.000Z",
  requestedEnd: "2025-10-30T20:20:00.000Z",
  overlaps: true,
  slotDuration: "90 min",
  requestedDuration: "80 min"
}
❌ OVERLAP DETECTED with slot abc123 (held)
```

### Step 2: Identify the Problem
The logs will show you:
- **Slot ID**: Which slot is blocking the booking
- **Slot Status**: Whether it's `booked`, `held`, or `available`
- **Slot Duration**: How long the blocking slot is
- **Overlap Details**: Exact time overlap

### Step 3: Clean Up if Needed
If you see a `held` slot that's blocking:
1. Call the cleanup function: 
   ```bash
   curl -X GET "https://us-central1-bueno-brows-7cce7.cloudfunctions.net/cleanupExpiredHolds"
   ```
2. Or manually delete the slot from the admin dashboard

---

## 🔧 **Common Issues and Solutions**

### Issue 1: Expired Hold Blocking Booking
**Symptoms:**
- Console shows `slotStatus: "held"`
- Slot has an `expiresAt` time in the past

**Solution:**
- Call the cleanup function
- Or manually delete the expired hold

### Issue 2: Overlapping Appointment
**Symptoms:**
- Console shows `slotStatus: "booked"`
- Slot duration covers the entire requested time

**Solution:**
- Check if the appointment is legitimate
- If it's a cancelled appointment, update its status
- If it's a real booking, the time slot is correctly unavailable

### Issue 3: Business Hours Mismatch
**Symptoms:**
- No availability slots loaded
- Console shows "Loaded 0 availability slots"

**Solution:**
- Check business hours configuration in admin dashboard
- Ensure the day/time is marked as open
- Verify timezone settings

---

## 📋 **Files Changed**

1. **`packages/shared/src/slotUtils.ts`**
   - Enhanced debug logging for overlap detection
   - Shows slot ID, status, and duration details

2. **`functions/src/cleanup-expired-holds.ts`** (NEW)
   - Cloud function to clean up expired holds
   - Removes stale availability slots

3. **`functions/src/index.ts`**
   - Exported the new cleanup function

---

## 🎯 **Expected Behavior Now**

With the enhanced debugging, you should see detailed logs like:

```
🔍 Checking overlap: {
  slotId: "hold_abc123",
  slotStatus: "held", 
  slotStart: "2025-10-30T19:00:00.000Z",
  slotEnd: "2025-10-30T20:30:00.000Z",
  requestedStart: "2025-10-30T19:00:00.000Z", 
  requestedEnd: "2025-10-30T20:20:00.000Z",
  overlaps: true,
  slotDuration: "90 min",
  requestedDuration: "80 min"
}
❌ OVERLAP DETECTED with slot hold_abc123 (held)
```

This will tell you exactly what's blocking the booking and why.

---

## 🚀 **Next Steps**

1. **Test the fix**: Go to https://bueno-brows-7cce7.web.app and try booking
2. **Check console logs**: Look for the enhanced debugging information
3. **Clean up if needed**: Use the cleanup function if you see expired holds
4. **Report results**: Let me know what the logs show

The enhanced debugging will help us identify exactly what's blocking the booking and fix it accordingly.

---

## ✅ **Status: DEBUGGING ENHANCED AND DEPLOYED**

The booking app now has enhanced debugging that will show exactly what's blocking availability calculations. This will help identify and resolve the issue quickly.

**Test it now at**: https://bueno-brows-7cce7.web.app

---

## 💡 **Why This Happened**

The most likely cause is that a previous booking attempt created a hold that:
1. Never got properly released
2. Expired but wasn't cleaned up
3. Is still blocking new bookings

The enhanced debugging will confirm this and the cleanup function will resolve it.

---

## 🔍 **Quick Diagnosis**

**If you see this in console:**
- `slotStatus: "held"` → Expired hold blocking booking
- `slotStatus: "booked"` → Legitimate appointment blocking booking  
- `slotDuration: "90 min"` → Slot covers entire available window
- `overlaps: true` → Confirmed overlap blocking the booking

The enhanced logs will tell you exactly what's happening! 🎯
