# Attendance Tracking Feature - Local Testing Guide

## 🚀 Development Servers Running
- **Admin Dashboard**: http://localhost:5173
- **Booking App**: http://localhost:5174

## 🧪 Testing Checklist

### 1. **Past Appointment Confirmation (No Notifications)**
- [ ] Go to Admin Dashboard → Schedule
- [ ] Find a past appointment (status: pending)
- [ ] Click "Confirm & Notify" 
- [ ] **Expected**: Status changes to "confirmed" but NO SMS/email sent to customer
- [ ] **Verify**: Check console logs for "⏰ Skipped confirmation notification (past appointment)"

### 2. **Future Appointment Confirmation (With Notifications)**
- [ ] Create a new appointment for tomorrow
- [ ] Confirm the appointment
- [ ] **Expected**: Status changes to "confirmed" AND SMS/email sent to customer
- [ ] **Verify**: Check console logs for "📱 Confirmation sent for appointment"

### 3. **Attendance Tracking UI**
- [ ] Go to Admin Dashboard → Schedule → "Recent Past Appointments" section
- [ ] **Expected**: See attendance buttons (✓ Attended, ✗ No-Show) on past appointments
- [ ] **Expected**: No buttons on already completed/no-show appointments

### 4. **Mark as Attended**
- [ ] Click "✓ Attended" button on a past appointment
- [ ] **Expected**: 
  - Status changes to "completed"
  - Shows "✓ Completed" status
  - Customer receives post-service receipt SMS
  - Buttons disappear (already marked)

### 5. **Mark as No-Show**
- [ ] Click "✗ No-Show" button on a past appointment
- [ ] **Expected**:
  - Status changes to "no-show" 
  - Shows "✗ No-Show" status
  - Customer record updated with no-show tracking
  - Buttons disappear (already marked)

### 6. **Post-Service Receipt Content**
- [ ] Check the SMS sent when marking as attended
- [ ] **Expected**: Receipt includes:
  - Service name and date/time
  - Service fee amount
  - Tip amount (if any)
  - Total paid
  - Thank you message
  - Review request

### 7. **Bulk Confirmation (Mixed Past/Future)**
- [ ] Select multiple appointments (some past, some future)
- [ ] Use bulk confirm
- [ ] **Expected**: 
  - Past appointments: Status updated, no notifications
  - Future appointments: Status updated, notifications sent

### 8. **UI State Management**
- [ ] Test loading states during attendance marking
- [ ] **Expected**: Buttons show "..." during processing
- [ ] **Expected**: Buttons are disabled during processing
- [ ] **Expected**: Error handling if marking fails

### 9. **Auto-Attend Scheduler (Manual Test)**
- [ ] Create test appointments for today
- [ ] Manually trigger the auto-attend function
- [ ] **Expected**: All unmarked appointments auto-marked as attended
- [ ] **Expected**: Post-service receipts sent automatically

### 10. **Database Cleanup (Future Test)**
- [ ] Create completed appointments with old dates
- [ ] Run cleanup function
- [ ] **Expected**: Detailed tracking fields removed after 90 days
- [ ] **Expected**: Basic appointment records preserved

## 🔧 Manual Testing Commands

### Test Auto-Attend Function
```bash
# In Firebase Functions emulator
firebase functions:shell
# Then call:
autoMarkAttendedEndOfDay()
```

### Test Post-Service Receipt
```bash
# In Firebase Functions emulator
sendPostServiceReceipt("appointment-id-here")
```

### Test Mark Attendance
```bash
# In Firebase Functions emulator
markAttendance({appointmentId: "appointment-id", attendance: "attended"})
```

## 🐛 Common Issues & Solutions

### Issue: Buttons not showing
- **Check**: Appointment status is not 'completed' or 'no-show'
- **Check**: Appointment is in the past (start time < now)

### Issue: SMS not sending
- **Check**: AWS credentials configured
- **Check**: Customer has phone number
- **Check**: Console logs for SMS errors

### Issue: UI not updating
- **Check**: Firestore real-time listeners
- **Check**: Browser cache (hard refresh)
- **Check**: Network connectivity

## 📊 Expected Database Changes

### New Fields Added to Appointments:
```typescript
{
  status: 'completed' | 'no-show', // New statuses
  attendance: 'attended' | 'no-show',
  attendanceMarkedAt: string,
  attendanceMarkedBy: string,
  completedAt: string,
  completedBy: string,
  receiptSent: boolean,
  receiptSentAt: string
}
```

### Customer Records Updated:
```typescript
{
  lastNoShow: string, // For no-show appointments
  noShowCount: number // Incremented for no-shows
}
```

## 🎯 Success Criteria

✅ **All tests pass**
✅ **No console errors**
✅ **SMS receipts sent correctly**
✅ **UI updates immediately**
✅ **Database changes persist**
✅ **Error handling works**
✅ **Loading states display**

## 📝 Test Results Log

| Test | Status | Notes |
|------|--------|-------|
| Past appointment confirmation | ⏳ | |
| Future appointment confirmation | ⏳ | |
| Attendance UI display | ⏳ | |
| Mark attended | ⏳ | |
| Mark no-show | ⏳ | |
| Receipt content | ⏳ | |
| Bulk confirmation | ⏳ | |
| UI state management | ⏳ | |
| Auto-attend scheduler | ⏳ | |
| Database cleanup | ⏳ | |

---

**Ready to test!** 🚀
