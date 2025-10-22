# Daily Operations Management Guide

## Overview

The Daily Operations feature provides admins with a convenient way to manage shop hours on a day-by-day basis, including the ability to:

- **Set special hours** for specific dates (holidays, events, etc.)
- **Close the shop** for specific days (emergencies, vacations, etc.)
- **Automatically cancel appointments** when closing shop
- **View upcoming days** with their status at a glance

---

## Features

### 1. **Calendar View (Next 14 Days)**
- See the next 14 days with their current status
- Three status types:
  - 🟢 **Normal Hours**: Uses weekly business hours
  - 🔵 **Special Hours**: Custom hours for this specific day
  - 🔴 **Closed**: Shop not operating

### 2. **Close Shop for a Day**
When you click "Close Shop":
- Creates a day closure record in `dayClosures` collection
- Cancels all pending/confirmed appointments for that day
- Removes all time slot holds for that day
- Prevents new bookings from being made

### 3. **Set Special Hours**
- Override the weekly schedule for a specific date
- Add multiple time ranges (e.g., 9:00-12:00 and 14:00-17:00)
- Great for holidays, special events, or adjusted hours

### 4. **Reopen Shop**
- Removes the closure record
- Restores normal business hours
- Allows bookings again

---

## How to Access

1. Go to **Admin Dashboard**
2. Navigate to **Settings** → **Daily Operations** tab
3. You'll see a calendar view of the next 14 days

---

## How It Works

### Backend Components

#### 1. **New Firestore Collections**

```
dayClosures/
  ├── {id}/
      ├── date: "2025-10-22" (YYYY-MM-DD)
      ├── reason: "Holiday closure"
      ├── closedBy: "admin-user-id"
      ├── closedAt: timestamp
      └── createdAt: timestamp

specialHours/
  ├── {id}/
      ├── date: "2025-10-22" (YYYY-MM-DD)
      ├── ranges: [["09:00", "13:00"], ["14:00", "17:00"]]
      ├── reason: "Holiday hours"
      ├── modifiedBy: "admin-user-id"
      ├── modifiedAt: timestamp
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

#### 2. **Updated Slot Generation**

The `availableSlotsForDay()` and `availableSlotsFromAvailability()` functions in `slotUtils.ts` now accept optional parameters:
- `closures: DayClosure[]`
- `specialHours: SpecialHours[]`

They use the new `getEffectiveHoursForDate()` helper which:
1. Checks if the shop is closed (returns null)
2. Checks for special hours (returns special ranges)
3. Falls back to regular weekly hours

#### 3. **Cloud Functions**

Three new Cloud Functions in `functions/src/close-shop.ts`:

- **`closeShopForDate`**: Close shop and cancel appointments
- **`reopenShopForDate`**: Reopen a closed shop
- **`setSpecialHoursForDate`**: Set special hours for a date

All functions require admin authentication.

---

## Usage Examples

### Close Shop for Tomorrow

1. Navigate to **Settings** → **Daily Operations**
2. Find tomorrow's date
3. Click **"Close Shop"** button
4. Confirm the action
5. All pending appointments are automatically cancelled
6. Customers cannot book appointments for that day

### Set Holiday Hours (e.g., Christmas Eve)

1. Navigate to **Settings** → **Daily Operations**
2. Find December 24th
3. Click **"Set Hours"** button
4. Set custom hours: `09:00 - 13:00` (half-day)
5. Click **"Save Hours"**
6. Customers can only book within those hours

### Reopen After Emergency Closure

1. Navigate to **Settings** → **Daily Operations**
2. Find the closed day
3. Click **"Reopen Shop"** button
4. Normal business hours are restored

---

## Integration with Booking System

### Automatic Slot Filtering

When customers try to book appointments:

1. **Booking page** queries `dayClosures` collection
2. If date is closed → No slots shown
3. If date has special hours → Only shows slots within those hours
4. Otherwise → Shows normal weekly hours

### Example Flow

```typescript
// In booking app (Book.tsx)
const closures = await getClosuresInRange(startDate, endDate);
const specialHours = await getSpecialHoursInRange(startDate, endDate);

const slots = availableSlotsForDay(
  date, 
  duration, 
  businessHours, 
  appointments,
  closures,      // ← New parameter
  specialHours   // ← New parameter
);
```

---

## Firestore Security Rules

The feature includes security rules for the new collections:

```javascript
// Day Closures - Admin only write, public read
match /dayClosures/{id} {
  allow read: if true; // Public can check if shop is closed
  allow create, update, delete: if isAdmin();
}

// Special Hours - Admin only write, public read
match /specialHours/{id} {
  allow read: if true; // Public can check special hours
  allow create, update, delete: if isAdmin();
}
```

---

## API Reference

### Firestore Actions

```typescript
// Create a day closure
import { createDayClosure } from '@buenobrows/shared/firestoreActions';

await createDayClosure(db, {
  date: '2025-10-22',
  reason: 'Holiday',
  closedBy: 'admin-id',
  closedAt: new Date().toISOString()
});

// Set special hours
import { setSpecialHours } from '@buenobrows/shared/firestoreActions';

await setSpecialHours(db, {
  date: '2025-10-22',
  ranges: [['09:00', '13:00'], ['14:00', '17:00']],
  reason: 'Holiday hours',
  modifiedBy: 'admin-id',
  modifiedAt: new Date().toISOString()
});

// Get closures in range
import { getClosuresInRange } from '@buenobrows/shared/firestoreActions';

const closures = await getClosuresInRange(db, '2025-10-01', '2025-10-31');

// Get special hours in range
import { getSpecialHoursInRange } from '@buenobrows/shared/firestoreActions';

const specialHours = await getSpecialHoursInRange(db, '2025-10-01', '2025-10-31');
```

### Slot Utils

```typescript
import { availableSlotsForDay, getEffectiveHoursForDate } from '@buenobrows/shared/slotUtils';

// Check effective hours for a date
const effectiveHours = getEffectiveHoursForDate(
  date,
  businessHours,
  closures,
  specialHours
);
// Returns: null (closed), [] (no hours), or [["09:00", "17:00"]] (time ranges)

// Get available slots with closures consideration
const slots = availableSlotsForDay(
  date,
  durationMinutes,
  businessHours,
  existingAppointments,
  closures,
  specialHours
);
```

---

## TypeScript Types

```typescript
// Day Closure
interface DayClosure {
  id: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
  closedBy?: string;
  closedAt?: string;
  createdAt?: any;
}

// Special Hours
interface SpecialHours {
  id: string;
  date: string; // YYYY-MM-DD format
  ranges: [string, string][]; // e.g., [["09:00", "17:00"]]
  reason?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  createdAt?: any;
  updatedAt?: any;
}
```

---

## Deployment Checklist

Before deploying this feature to production:

- [ ] Deploy updated Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Deploy admin dashboard: Build and deploy admin app
- [ ] Deploy booking site: Build and deploy booking app
- [ ] Test closing shop and verifying slots disappear
- [ ] Test setting special hours and verifying correct slots appear
- [ ] Test reopening shop and verifying normal hours return
- [ ] Verify appointments are cancelled when shop closes

---

## Common Scenarios

### Scenario 1: Unexpected Closure (Emergency)

**Problem**: Need to close shop immediately

**Solution**:
1. Go to Daily Operations
2. Click "Close Shop" for today
3. All appointments automatically cancelled
4. System prevents new bookings

### Scenario 2: Holiday Schedule

**Problem**: Holiday with different hours

**Solution**:
1. Set special hours for the holiday date
2. Define custom time ranges
3. Booking system only shows slots within those hours

### Scenario 3: Multi-Day Vacation

**Problem**: Closing for a week

**Solution**:
1. Close each day individually (or use Cloud Function in bulk)
2. All appointments for those days are cancelled
3. Customers see "closed" status

---

## Troubleshooting

### Issue: Slots still showing after closing shop

**Check**:
1. Is the closure date in `YYYY-MM-DD` format?
2. Is the booking app fetching closures?
3. Clear browser cache and reload

### Issue: Special hours not applying

**Check**:
1. Verify ranges are in `HH:MM` format (24-hour)
2. Check that ranges don't overlap
3. Ensure date matches exactly

### Issue: Cannot close shop (permission denied)

**Check**:
1. User must be authenticated as admin
2. Check Firebase Auth custom claims: `role: 'admin'`
3. Verify Firestore security rules are deployed

---

## Future Enhancements

Potential improvements for this feature:

- [ ] Bulk close multiple days at once
- [ ] Recurring special hours (e.g., "every Saturday in December")
- [ ] Email notifications to customers when appointments are cancelled
- [ ] Integration with calendar apps (Google Calendar, iCal)
- [ ] Analytics on closure frequency and impact
- [ ] Staff vacation management tied to closures

---

## Files Modified/Created

### New Files
- `/apps/admin/src/components/DailyOperations.tsx` - Main UI component
- `/functions/src/close-shop.ts` - Cloud Functions
- `/DAILY_OPERATIONS_GUIDE.md` - This guide

### Modified Files
- `/packages/shared/src/types.ts` - Added DayClosure & SpecialHours types
- `/packages/shared/src/firestoreActions.ts` - Added CRUD functions
- `/packages/shared/src/slotUtils.ts` - Updated slot generation logic
- `/apps/admin/src/pages/Settings.tsx` - Added Operations tab
- `/firebase.rules` - Added security rules for new collections
- `/functions/src/index.ts` - Exported new Cloud Functions

---

## Support

For issues or questions about Daily Operations:

1. Check this guide first
2. Verify Firestore security rules are deployed
3. Check Cloud Functions logs in Firebase Console
4. Review browser console for errors

---

**Version**: 1.0  
**Last Updated**: October 22, 2025  
**Author**: Admin Dashboard Team

