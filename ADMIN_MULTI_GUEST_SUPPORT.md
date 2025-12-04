# Admin Panel - Multi-Guest Booking Support

## Current State (Main Branch)

### Admin Appointment Creation Modal

The admin currently uses `AddAppointmentModal.tsx` which:
- ✅ Allows selecting multiple services (checkboxes)
- ✅ Searches/creates customers
- ✅ Sets date, time, notes
- ✅ Creates single appointment with `serviceIds` array
- ❌ **No quantity controls**
- ❌ **No guest assignment capability**
- ❌ **Can only book for one customer at a time**

### Current Admin Flow:

```
1. Admin clicks "Add Appointment" on schedule
2. Modal opens with:
   - Customer search/create
   - Service selection (checkboxes for multi-select)
   - Date picker
   - Time picker
   - Notes field
3. Admin saves
4. Single appointment created for one customer
```

### Admin Appointment Viewing

Appointments are displayed in:
- **Schedule View**: Calendar/day/week views showing appointment cards
- **Appointment Detail Modal**: Full details including:
  - Customer name, email, phone
  - Service(s) - shown as comma-separated list
  - Time, duration, status
  - Price, tip
  - Actions (edit, cancel, mark attendance, send reminder)

---

## What's Different with Multi-Guest Bookings?

### Customer Booking Page (Now on feature/multi-guest-booking):
✅ **Quantity Controls**: +/- buttons for each service
✅ **Guest Management**: Can add multiple guests
✅ **Smart Assignment**: Automatically assigns services to specific guests
✅ **Guest Summary**: Shows "Service × 2" with guest names

### Booking Data Structure:

```typescript
// Customer creates booking with quantities:
serviceAssignments: {
  "brow-lamination-id": {
    serviceId: "brow-lamination-id",
    quantity: 3,
    guestAssignments: [
      { guestId: "self", serviceId: "brow-lamination-id" },
      { guestId: "guest-123", serviceId: "brow-lamination-id" },
      { guestId: "guest-456", serviceId: "brow-lamination-id" }
    ]
  }
}

// Gets converted to:
serviceIds: ["brow-lamination-id", "brow-lamination-id", "brow-lamination-id"]

// Appointment stores:
{
  serviceIds: ["brow-lamination-id", "brow-lamination-id", "brow-lamination-id"],
  bookedBy: {
    name: "John Doe",
    email: "john@example.com",
    userId: "user-uid"
  },
  guestInfo: {
    guestId: "guest-123",
    guestName: "Jane Smith",
    guestEmail: "jane@example.com"
  },
  isGroupBooking: true,
  groupBookingId: "group-xyz"
}
```

---

## Options for Admin Support

### Option 1: Read-Only Support (Quickest - Recommended First)

**What**: Admin can VIEW multi-guest bookings but creates appointments the old way

**Implementation**:
- ✅ No changes to `AddAppointmentModal` needed
- ✅ Update `EnhancedAppointmentDetailModal` to show:
  - "Booked By" section if `bookedBy` field exists
  - "Guest Info" section if `guestInfo` field exists
  - Group booking indicator if `isGroupBooking` is true
- ✅ Update appointment cards to show multi-guest indicator

**Effort**: ~1-2 hours
**Benefit**: Admin can see multi-guest bookings made by customers
**Limitation**: Admin still creates single-customer appointments

### Option 2: Full Multi-Guest Creation (More Complex)

**What**: Admin can also create multi-guest bookings

**Implementation**:
- Update `AddAppointmentModal` with:
  - Quantity controls (like customer booking page)
  - Guest management UI
  - Service assignment logic
  - Multiple appointment creation
- Update finalization to create separate appointments per guest

**Effort**: ~4-6 hours
**Benefit**: Complete feature parity with customer booking
**Complexity**: Medium - reuse customer booking components

### Option 3: Hybrid Approach (Balanced)

**What**: Admin can book multiple services for one customer (quantities) but not manage multiple guests

**Implementation**:
- Add quantity controls to admin modal
- Remove guest assignment (admin always books for selected customer)
- If quantity > 1, create multiple appointments for same customer

**Effort**: ~2-3 hours
**Benefit**: Admin can quickly book multiple services without guest complexity
**Use Case**: Customer calls "I want 3 brow waxes for my family"

---

## Recommended Approach

### Phase 1: Read-Only Support (Now)
Update admin views to display multi-guest booking information when customers create them.

### Phase 2: Quantity Controls Only (Later)
Add quantity controls to admin modal (no guest management).

### Phase 3: Full Multi-Guest (Future)
Complete multi-guest creation capability if needed.

---

## Phase 1 Implementation: Admin Viewing

### Files to Update:

#### 1. `EnhancedAppointmentDetailModal.tsx`

Add sections to show multi-guest info:

```tsx
{/* Booking Information */}
{appointment.bookedBy && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
    <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
      Booked By
    </h3>
    <div className="text-sm">
      <div className="font-medium">{appointment.bookedBy.name}</div>
      {appointment.bookedBy.email && (
        <div className="text-blue-700">{appointment.bookedBy.email}</div>
      )}
    </div>
  </div>
)}

{/* Guest Information */}
{appointment.guestInfo && (
  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
    <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
      Service For
    </h3>
    <div className="text-sm">
      <div className="font-medium">{appointment.guestInfo.guestName}</div>
      {appointment.guestInfo.guestEmail && (
        <div className="text-purple-700">{appointment.guestInfo.guestEmail}</div>
      )}
      {appointment.guestInfo.guestPhone && (
        <div className="text-purple-700">{appointment.guestInfo.guestPhone}</div>
      )}
    </div>
  </div>
)}

{/* Group Booking Indicator */}
{appointment.isGroupBooking && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
    <div className="flex items-center gap-2 text-sm text-amber-800">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
      <span className="font-medium">Part of a group booking</span>
      {appointment.groupBookingId && (
        <span className="text-xs text-amber-600 ml-1">
          (Group ID: {appointment.groupBookingId.slice(0, 8)})
        </span>
      )}
    </div>
  </div>
)}
```

#### 2. Schedule Appointment Cards

Add visual indicator for multi-guest bookings:

```tsx
{/* On appointment cards in schedule view */}
{appointment.isGroupBooking && (
  <div className="absolute top-1 right-1">
    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
      Multi-Guest
    </span>
  </div>
)}
```

#### 3. Service Display Enhancement

Show quantity when serviceIds has duplicates:

```tsx
{/* Instead of just listing service names */}
{appointment.serviceIds ? (
  (() => {
    // Count occurrences of each service
    const serviceCounts: Record<string, number> = {};
    appointment.serviceIds.forEach(id => {
      serviceCounts[id] = (serviceCounts[id] || 0) + 1;
    });
    
    return Object.entries(serviceCounts).map(([serviceId, count]) => {
      const service = services[serviceId];
      return (
        <div key={serviceId} className="flex items-center gap-2">
          <span>{service?.name || 'Unknown Service'}</span>
          {count > 1 && (
            <span className="text-xs bg-terracotta text-white px-2 py-0.5 rounded-full">
              × {count}
            </span>
          )}
        </div>
      );
    });
  })()
) : (
  <span>{services[appointment.serviceId]?.name || 'Unknown Service'}</span>
)}
```

---

## What Admin Currently Sees

For a multi-guest booking created by a customer:

### Current View (Without Updates):
```
Customer: John Doe
Services: Brow Lamination, Brow Lamination, Brow Lamination
Time: 2:00 PM
Duration: 180 minutes
```

### Enhanced View (With Phase 1 Updates):
```
Customer: John Doe (Booker)
Services: 
  - Brow Lamination × 3
    • For: Sarah Johnson (guest)
    • For: Mike Chen (guest)  
    • For: You
Time: 2:00 PM
Duration: 180 minutes
💜 Multi-Guest Booking
```

---

## Mock UI for Admin

### Current Admin Modal (No Changes):
```
┌─────────────────────────────────────┐
│  Add Appointment                    │
├─────────────────────────────────────┤
│  Customer: [Search/Select]          │
│  Services:                          │
│    ☐ Brow Wax                       │
│    ☑ Brow Lamination                │
│    ☐ Brow Tint                      │
│  Date: [12/04/2025]                 │
│  Time: [10:00 AM]                   │
│  Notes: [________]                  │
│  [Cancel] [Create Appointment]      │
└─────────────────────────────────────┘
```

### Enhanced Admin Modal (Phase 2 - Optional):
```
┌─────────────────────────────────────┐
│  Add Appointment                    │
├─────────────────────────────────────┤
│  Customer: [Search/Select]          │
│  Services:                          │
│    Brow Wax        [-] 0 [+] $30    │
│    Brow Lamination [-] 2 [+] $240   │
│    Brow Tint       [-] 0 [+] $25    │
│                                     │
│  ⓘ Booking 2 services for customer  │
│                                     │
│  Date: [12/04/2025]                 │
│  Time: [10:00 AM]                   │
│  Notes: [________]                  │
│  [Cancel] [Create Appointment]      │
└─────────────────────────────────────┘
```

### Enhanced Appointment Detail (Phase 1):
```
┌─────────────────────────────────────┐
│  Appointment Details                │
├─────────────────────────────────────┤
│  💜 Multi-Guest Booking             │
│                                     │
│  👤 Booked By:                      │
│     John Doe                        │
│     john@example.com                │
│                                     │
│  👥 Service For:                    │
│     Sarah Johnson                   │
│     sarah@example.com               │
│                                     │
│  Services:                          │
│    • Brow Lamination × 3            │
│                                     │
│  Time: 2:00 PM                      │
│  Duration: 180 minutes              │
│  Price: $360                        │
│  Status: Confirmed                  │
└─────────────────────────────────────┘
```

---

## Implementation Priority

### Immediate (Recommended):
✅ **Phase 1**: Read-only support - Show multi-guest info in detail modal

### Later (Optional):
⏳ **Phase 2**: Add quantity controls to admin modal
⏳ **Phase 3**: Full multi-guest creation for admin

---

## Quick Assessment

**Customer Side**: ✅ **COMPLETE** - Full multi-guest booking with quantities
**Admin Side**: ⚠️ **NEEDS UPDATE** - Currently won't show multi-guest info

### What Happens Now (Without Updates):

1. **Customer books** 3× Brow Lamination for 3 different people
2. **Appointment created** with `serviceIds: ["brow-id", "brow-id", "brow-id"]`
3. **Admin sees**: "Brow Lamination, Brow Lamination, Brow Lamination" (repeated names)
4. **Admin doesn't see**: Who each service is for, who booked it

### What Should Happen (With Phase 1 Updates):

1. **Customer books** 3× Brow Lamination for 3 different people
2. **Appointment created** with guest information
3. **Admin sees**: 
   - "Brow Lamination × 3"
   - Booked by: John Doe
   - For guests: Sarah, Mike, John
   - Multi-guest indicator
4. **Admin understands**: This is a group booking with specific assignments

---

## Next Steps

### To Add Admin Support:

1. **Start new branch**: `feature/admin-multi-guest-support`
2. **Update `EnhancedAppointmentDetailModal.tsx`**: Add multi-guest display sections
3. **Update appointment cards**: Add multi-guest indicators
4. **Update service display logic**: Show "× 3" instead of repeating names
5. **Test**: Create multi-guest booking as customer, view as admin
6. **Merge**: When satisfied

### Estimated Effort:
- **Phase 1 (read-only)**: 1-2 hours
- **Phase 2 (quantities)**: 2-3 hours  
- **Phase 3 (full multi-guest)**: 4-6 hours

---

## Summary

**Current Status**:
- ✅ Customer booking page: Fully functional with multi-guest support
- ⚠️ Admin panel: Needs updates to view/manage multi-guest bookings

**Recommendation**:
Start with **Phase 1 (read-only)** to quickly add multi-guest viewing support to admin. This allows admins to see and understand group bookings made by customers.

**Good News**:
The admin modal's current `selectedServiceIds` array approach is already compatible with multi-guest bookings (just expanded quantities). So the backend will work fine - it's just the UI that needs updating!

