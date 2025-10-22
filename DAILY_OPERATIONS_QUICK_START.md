# Daily Operations - Quick Start Guide

## 🚀 Get Started in 3 Minutes

### Access the Feature

1. Open **Admin Dashboard**
2. Click **Settings** in the sidebar
3. Click the **Daily Operations** tab (📅 icon)

You'll see a calendar view of the next 14 days.

---

## ✅ Common Tasks

### Close Shop for a Day

**Use Case**: Emergency, vacation, holiday

**Steps**:
1. Find the date in the calendar
2. Click the **"Close Shop"** button
3. Confirm the action

**What Happens**:
- ❌ Day marked as closed
- ❌ All appointments cancelled
- ❌ No new bookings allowed

---

### Set Special Hours

**Use Case**: Holiday hours, half-day, special event

**Steps**:
1. Find the date in the calendar
2. Click **"Set Hours"** button
3. Set time ranges (e.g., `09:00` to `13:00`)
4. Click **"+ Add Time Range"** for multiple ranges
5. Click **"Save Hours"**

**Example**:
- **Normal**: 9:00 AM - 6:00 PM
- **Holiday**: 9:00 AM - 1:00 PM only

---

### Reopen a Closed Day

**Use Case**: Changed your mind, emergency resolved

**Steps**:
1. Find the closed date (marked red)
2. Click **"Reopen Shop"** button
3. Confirm

**What Happens**:
- ✅ Normal hours restored
- ✅ Bookings allowed again

---

## 🎨 Visual Guide

### Status Colors

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | Normal | Using weekly schedule |
| 🔵 Blue | Special | Custom hours for this day |
| 🔴 Red | Closed | Shop not operating |

---

## 📱 Example Scenarios

### Scenario 1: Emergency Closure

```
Problem: Pipe burst, need to close today!

Solution:
1. Go to Daily Operations
2. Find today's date
3. Click "Close Shop"
4. Done! All appointments cancelled, 
   customers notified.
```

### Scenario 2: Christmas Eve (Half Day)

```
Problem: Want to close at 1 PM instead of 6 PM

Solution:
1. Go to Daily Operations
2. Find December 24th
3. Click "Set Hours"
4. Enter: 09:00 - 13:00
5. Save
6. Done! Only morning slots available.
```

### Scenario 3: Week-Long Vacation

```
Problem: Going on vacation next week

Solution:
For each day:
1. Click "Close Shop"
2. Confirm

Do this for all 7 days.
All appointments automatically cancelled.
```

---

## ⚠️ Important Notes

### About Cancelled Appointments

When you close shop:
- Pending appointments → Cancelled
- Confirmed appointments → Cancelled
- Completed appointments → Not affected
- A note is added: "[Shop closed for the day]"

**Important**: Currently, customers are NOT automatically notified. You should:
- Email affected customers
- Call important appointments
- Post on social media

### About Special Hours vs Closed

- **Special Hours**: Shop open, but different times
- **Closed**: Shop completely closed, no bookings

Choose the right one for your situation!

---

## 🔧 Deployment

Before using this feature, ensure:

1. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Deploy Cloud Functions** (optional, for advanced features)
   ```bash
   firebase deploy --only functions
   ```

3. **Clear Browser Cache**
   - Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

---

## 🆘 Troubleshooting

### "Close Shop" button not working?

**Check**:
- Are you logged in as admin?
- Did you deploy Firestore rules?
- Check browser console for errors

### Slots still showing after closing?

**Fix**:
1. Clear browser cache
2. Hard refresh booking page
3. Verify date format is `YYYY-MM-DD`

### Can't set special hours?

**Check**:
- Time format must be `HH:MM` (24-hour)
- Example: `09:00` not `9:00 AM`
- Start time must be before end time

---

## 📊 At a Glance

| Action | Effect | Reversible? |
|--------|--------|-------------|
| Close Shop | Cancels appointments, blocks bookings | ✅ Yes (Reopen) |
| Set Special Hours | Shows only specified time slots | ✅ Yes (Remove Special) |
| Reopen Shop | Restores normal hours | ✅ Yes (Close again) |

---

## 🎯 Best Practices

### Planning Ahead

- Set special hours at least 24 hours in advance
- Close shop 48 hours in advance for vacations
- Post notices on social media

### Customer Communication

- Email customers about changes
- Update website/social media
- Consider offering rebooking assistance

### Holiday Schedule

Use special hours for:
- Holiday shortened hours
- Special event days
- Staff training days

Use closed for:
- Holidays
- Vacations
- Emergency closures

---

## 📞 Need Help?

1. Check [DAILY_OPERATIONS_GUIDE.md](./DAILY_OPERATIONS_GUIDE.md) for detailed docs
2. Review Firestore security rules
3. Check Cloud Functions logs
4. Verify admin authentication

---

**Quick Links**:
- [Full Documentation](./DAILY_OPERATIONS_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

---

**Last Updated**: October 22, 2025

