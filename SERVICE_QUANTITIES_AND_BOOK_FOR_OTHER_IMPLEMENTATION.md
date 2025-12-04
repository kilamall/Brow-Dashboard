# Service Quantities & Multi-Guest Booking - Implementation Plan

## Overview
This document outlines an elegant combined approach for implementing:
1. **Service Quantities**: Allow customers to book multiple quantities of the same service
2. **Multi-Guest Booking**: When quantities > 1, automatically prompt for guest assignments
3. **Guest Management**: Authenticated users can add multiple guests with a "+" button

## Key Insight
Instead of separate features, we combine them: **when a user selects multiple quantities of a service, we automatically prompt them to assign each quantity to a guest**. This creates a natural, intuitive flow where service quantities map directly to guest assignments.

## Combined Approach: Service Quantities with Guest Assignments

### Current State
- Services are tracked as `selectedServiceIds: string[]` (array of unique service IDs)
- Each service can only be selected once
- No guest assignment capability

### Recommended Approach

#### 1. Data Structure Change
Track quantities with guest assignments:

```typescript
// Guest definition
interface Guest {
  id: string; // Unique ID for this guest in the booking session
  name: string;
  email?: string;
  phone?: string;
  isSelf?: boolean; // True if this is the authenticated user
}

// Service assignment structure
interface ServiceAssignment {
  serviceId: string;
  quantity: number;
  guestAssignments: {
    guestId: string; // Which guest this service instance is for
    serviceId: string; // Redundant but useful for lookups
  }[];
}

// State structure
const [guests, setGuests] = useState<Guest[]>([]);
const [serviceAssignments, setServiceAssignments] = useState<Record<string, ServiceAssignment>>({});
// Example: {
//   "service-id-1": {
//     serviceId: "service-id-1",
//     quantity: 3,
//     guestAssignments: [
//       { guestId: "self", serviceId: "service-id-1" },
//       { guestId: "guest-1", serviceId: "service-id-1" },
//       { guestId: "guest-2", serviceId: "service-id-1" }
//     ]
//   }
// }
```

#### 2. UI Changes

**Service Selection Card** - Add quantity controls with smart guest assignment:
```tsx
// In the service card, replace the checkbox with quantity controls:
<div className="flex items-center gap-2">
  <button
    onClick={() => decreaseQuantity(service.id)}
    disabled={!serviceAssignments[service.id]?.quantity || serviceAssignments[service.id].quantity <= 0}
    className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-50"
  >
    −
  </button>
  <span className="w-12 text-center font-semibold">
    {serviceAssignments[service.id]?.quantity || 0}
  </span>
  <button
    onClick={() => {
      increaseQuantity(service.id);
      // If quantity becomes > 1, show guest assignment prompt
      if (serviceAssignments[service.id]?.quantity === 0) {
        // First selection - assign to self or prompt
        assignToSelfOrGuest(service.id);
      } else {
        // Additional quantity - prompt for guest assignment
        promptGuestAssignment(service.id);
      }
    }}
    className="w-8 h-8 rounded border border-slate-300 hover:bg-slate-50"
  >
    +
  </button>
</div>
```

**Guest Assignment Modal/Prompt** - Appears when quantity > 1:
```tsx
{showGuestAssignment && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">
        Who is this service for?
      </h3>
      
      {/* Option 1: Assign to self (if authenticated) */}
      {user && (
        <button
          onClick={() => assignServiceToGuest(serviceId, 'self')}
          className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 mb-2"
        >
          <div className="font-medium">{user.displayName || user.email}</div>
          <div className="text-sm text-slate-500">You</div>
        </button>
      )}
      
      {/* Option 2: Assign to existing guest */}
      {guests.map(guest => (
        <button
          key={guest.id}
          onClick={() => assignServiceToGuest(serviceId, guest.id)}
          className="w-full text-left p-3 border rounded-lg hover:bg-slate-50 mb-2"
        >
          <div className="font-medium">{guest.name}</div>
          {guest.email && <div className="text-sm text-slate-500">{guest.email}</div>}
        </button>
      ))}
      
      {/* Option 3: Add new guest */}
      <button
        onClick={() => {
          setShowGuestAssignment(false);
          setShowAddGuestModal(true);
          setPendingServiceAssignment(serviceId);
        }}
        className="w-full p-3 border-2 border-dashed border-terracotta rounded-lg hover:bg-terracotta/5 text-terracotta font-medium"
      >
        + Add New Guest
      </button>
    </div>
  </div>
)}
```

**Add Guest Button** - For authenticated users:
```tsx
{user && (
  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-slate-800">Guests</h4>
      <button
        onClick={() => setShowAddGuestModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Guest
      </button>
    </div>
    
    {/* Guest List */}
    <div className="space-y-2">
      {guests.map(guest => (
        <div key={guest.id} className="flex items-center justify-between p-2 bg-white rounded border">
          <div>
            <div className="font-medium">{guest.name}</div>
            {guest.email && <div className="text-sm text-slate-500">{guest.email}</div>}
          </div>
          <button
            onClick={() => removeGuest(guest.id)}
            className="text-red-600 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  </div>
)}
```

**Selected Services Summary** - Show quantities with guest assignments:
```tsx
{Object.values(serviceAssignments)
  .filter(assignment => assignment.quantity > 0)
  .map(assignment => {
    const service = services.find(s => s.id === assignment.serviceId);
    if (!service) return null;
    
    return (
      <div key={assignment.serviceId} className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-semibold text-lg">{service.name}</span>
            {assignment.quantity > 1 && (
              <span className="ml-2 text-sm text-slate-500">× {assignment.quantity}</span>
            )}
          </div>
          <div>
            <span className="font-bold text-terracotta text-lg">
              ${(service.price * assignment.quantity).toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Show guest assignments */}
        <div className="space-y-2 pt-3 border-t border-slate-200">
          {assignment.guestAssignments.map((guestAssignment, idx) => {
            const guest = guestAssignment.guestId === 'self' 
              ? { name: user?.displayName || 'You', email: user?.email }
              : guests.find(g => g.id === guestAssignment.guestId);
            
            return (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-terracotta"></div>
                  <span className="text-slate-700">
                    {guest?.name || 'Unassigned'}
                  </span>
                </div>
                <span className="text-slate-500">${service.price.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  })}
```

#### 3. Calculation Updates

```typescript
// Total duration calculation (sum of all service instances)
const totalDuration = useMemo(() => {
  return Object.values(serviceAssignments).reduce((sum, assignment) => {
    const service = services.find(s => s.id === assignment.serviceId);
    return sum + (service ? service.duration * assignment.quantity : 0);
  }, 0);
}, [serviceAssignments, services]);

// Subtotal calculation
const subtotalPrice = useMemo(() => {
  return Object.values(serviceAssignments).reduce((sum, assignment) => {
    const service = services.find(s => s.id === assignment.serviceId);
    return sum + (service ? service.price * assignment.quantity : 0);
  }, 0);
}, [serviceAssignments, services]);

// Get unique guest count
const uniqueGuests = useMemo(() => {
  const guestIds = new Set<string>();
  Object.values(serviceAssignments).forEach(assignment => {
    assignment.guestAssignments.forEach(ga => {
      if (ga.guestId !== 'self' || !user) {
        guestIds.add(ga.guestId);
      }
    });
  });
  return guestIds.size;
}, [serviceAssignments, user]);
```

#### 4. Backend Changes

**Hold Creation** - Convert assignments to service IDs array:
```typescript
// When creating hold, expand assignments to service IDs
const serviceIdsForHold = Object.values(serviceAssignments)
  .flatMap(assignment => 
    Array(assignment.quantity).fill(assignment.serviceId)
  );

// Example: 
// {
//   "svc-1": { quantity: 2, guestAssignments: [...] },
//   "svc-2": { quantity: 1, guestAssignments: [...] }
// }
// → ["svc-1", "svc-1", "svc-2"]
```

**Appointment Creation** - Create multiple appointments or single with guest mapping:
```typescript
// Option A: Create separate appointments for each guest
// This is cleaner for tracking and allows different times if needed
const appointments = Object.values(serviceAssignments).flatMap(assignment => {
  return assignment.guestAssignments.map(guestAssignment => {
    const guest = guestAssignment.guestId === 'self'
      ? { name: user?.displayName, email: user?.email, phone: user?.phoneNumber }
      : guests.find(g => g.id === guestAssignment.guestId);
    
    return {
      serviceId: assignment.serviceId,
      customerId: await findOrCreateCustomer(guest),
      start: chosen.startISO,
      // ... other appointment fields
      bookedBy: user ? {
        name: user.displayName,
        email: user.email,
        userId: user.uid
      } : undefined,
      bookedFor: guestAssignment.guestId === 'self' ? 'self' : 'guest'
    };
  });
});

// Option B: Single appointment with guest mapping (if all same time)
// Store guest assignments in appointment metadata
```

**New Appointment Field** - Add guest assignment tracking:
```typescript
interface Appointment {
  // ... existing fields ...
  guestAssignment?: {
    guestId: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
  };
  bookedBy?: {
    name: string;
    email: string;
    userId?: string;
  };
  isGroupBooking?: boolean;
  groupBookingId?: string; // Link related appointments together
}
```

### Migration Strategy
1. Keep backward compatibility: Convert old `selectedServiceIds` array to new format on load
2. Update sessionStorage format to store quantities
3. Update all service selection handlers

---

## Guest Management Flow

### 1. Initialization for Authenticated Users

When an authenticated user starts booking, automatically create a "self" guest:

```typescript
useEffect(() => {
  if (user && guests.length === 0) {
    // Initialize with self as first guest
    setGuests([{
      id: 'self',
      name: user.displayName || user.email || 'You',
      email: user.email || undefined,
      phone: user.phoneNumber || undefined,
      isSelf: true
    }]);
  }
}, [user]);
```

### 2. Add Guest Modal

```tsx
{showAddGuestModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">Add Guest</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Guest Name *
          </label>
          <input
            type="text"
            value={newGuestName}
            onChange={(e) => setNewGuestName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Enter guest name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email (optional)
          </label>
          <input
            type="email"
            value={newGuestEmail}
            onChange={(e) => setNewGuestEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="guest@example.com"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={newGuestPhone}
            onChange={(e) => setNewGuestPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => {
            setShowAddGuestModal(false);
            setNewGuestName('');
            setNewGuestEmail('');
            setNewGuestPhone('');
          }}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!newGuestName.trim()) return;
            const newGuest: Guest = {
              id: `guest-${Date.now()}`,
              name: newGuestName.trim(),
              email: newGuestEmail.trim() || undefined,
              phone: newGuestPhone.trim() || undefined,
              isSelf: false
            };
            setGuests([...guests, newGuest]);
            setShowAddGuestModal(false);
            setNewGuestName('');
            setNewGuestEmail('');
            setNewGuestPhone('');
            
            // If there's a pending service assignment, assign it to this guest
            if (pendingServiceAssignment) {
              assignServiceToGuest(pendingServiceAssignment, newGuest.id);
              setPendingServiceAssignment(null);
            }
          }}
          disabled={!newGuestName.trim()}
          className="flex-1 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 disabled:opacity-50"
        >
          Add Guest
        </button>
      </div>
    </div>
  </div>
)}
```

### 3. Smart Assignment Logic

When quantity increases, intelligently assign:

```typescript
function increaseQuantity(serviceId: string) {
  const current = serviceAssignments[serviceId] || {
    serviceId,
    quantity: 0,
    guestAssignments: []
  };
  
  const newQuantity = current.quantity + 1;
  
  // If this is the first selection and user is authenticated, assign to self
  if (newQuantity === 1 && user) {
    setServiceAssignments({
      ...serviceAssignments,
      [serviceId]: {
        ...current,
        quantity: 1,
        guestAssignments: [{ guestId: 'self', serviceId }]
      }
    });
    return;
  }
  
  // If quantity > 1, prompt for guest assignment
  if (newQuantity > current.quantity) {
    // Check if we have available guests
    const availableGuests = guests.filter(g => 
      !current.guestAssignments.some(ga => ga.guestId === g.id)
    );
    
    if (availableGuests.length > 0 && availableGuests.length === 1) {
      // Only one available guest, auto-assign
      setServiceAssignments({
        ...serviceAssignments,
        [serviceId]: {
          ...current,
          quantity: newQuantity,
          guestAssignments: [
            ...current.guestAssignments,
            { guestId: availableGuests[0].id, serviceId }
          ]
        }
      });
    } else {
      // Multiple options or no guests, show prompt
      setPendingServiceAssignment(serviceId);
      setShowGuestAssignment(true);
    }
  }
}
```

### 4. Finalization Logic

```typescript
async function finalizeBooking() {
  // ... existing validation ...
  
  // Create appointments for each guest assignment
  const appointmentsToCreate = Object.values(serviceAssignments)
    .filter(assignment => assignment.quantity > 0)
    .flatMap(assignment => {
      return assignment.guestAssignments.map(async (guestAssignment) => {
        const guest = guestAssignment.guestId === 'self'
          ? { 
              name: user?.displayName || 'You', 
              email: user?.email, 
              phone: user?.phoneNumber 
            }
          : guests.find(g => g.id === guestAssignment.guestId);
        
        if (!guest) throw new Error('Guest not found');
        
        // Find or create customer for this guest
        const customerId = await findOrCreateCustomerClient({
          name: guest.name,
          email: guest.email,
          phone: guest.phone
        });
        
        // Create appointment
        return {
          serviceId: assignment.serviceId,
          customerId,
          start: chosen.startISO,
          // ... other appointment fields
          bookedBy: user ? {
            name: user.displayName || user.email,
            email: user.email,
            userId: user.uid
          } : undefined,
          guestInfo: {
            guestId: guestAssignment.guestId,
            guestName: guest.name,
            guestEmail: guest.email,
            guestPhone: guest.phone
          }
        };
      });
    });
  
  // Create all appointments
  const createdAppointments = await Promise.all(appointmentsToCreate);
  
  // ... navigate to confirmation ...
}
```

---

## Implementation Priority

### Phase 1: Core Data Structure & Quantity Controls
1. ✅ Change data structure to `serviceAssignments` with guest assignments
2. ✅ Add quantity controls (+/-) to service cards
3. ✅ Update calculations (duration, price) to use assignments
4. ✅ Update sessionStorage to persist assignments
5. ✅ Test basic quantity selection

### Phase 2: Guest Management (Authenticated Users)
1. ✅ Initialize "self" guest for authenticated users
2. ✅ Add "Add Guest" button and modal
3. ✅ Display guest list
4. ✅ Allow removing guests
5. ✅ Test guest CRUD operations

### Phase 3: Smart Assignment Logic
1. ✅ Auto-assign first service to "self" for authenticated users
2. ✅ Show guest assignment prompt when quantity > 1
3. ✅ Auto-assign if only one available guest
4. ✅ Handle pending assignments when new guest is added
5. ✅ Test assignment flow

### Phase 4: Backend Integration
1. ✅ Update hold creation to expand assignments
2. ✅ Update finalization to create multiple appointments
3. ✅ Add `bookedBy` and `guestInfo` fields to appointments
4. ✅ Handle customer creation for each guest
5. ✅ Test end-to-end booking flow

### Phase 5: Guest Booking (Non-Authenticated)
1. ✅ For guests, show simple quantity selection
2. ✅ Prompt for guest info when quantity > 1
3. ✅ Create multiple appointments for multiple guests
4. ✅ Test guest multi-booking flow

---

## UI/UX Considerations

### Service Quantities
- **Visual Feedback**: Show quantity badges on service cards
- **Validation**: Prevent quantities from going below 0
- **Summary**: Clearly show "2x Service Name" with guest assignments
- **Duration**: Show total duration including all quantities
- **Smart Defaults**: Auto-assign first service to "self" for authenticated users

### Guest Management
- **Clear Labeling**: Distinguish between "You" (self) and guests
- **Easy Addition**: "+ Add Guest" button always visible for authenticated users
- **Quick Assignment**: Auto-assign when only one option available
- **Visual Hierarchy**: Show guest assignments in service summary
- **Validation**: Ensure guest name is provided before assignment

### Assignment Flow
- **Progressive Disclosure**: Only show guest assignment when needed (quantity > 1)
- **Contextual Prompts**: Show assignment modal with relevant options
- **Pending State**: Handle assignments that are waiting for guest creation
- **Confirmation**: Show clear breakdown of who gets which service

### Booking Confirmation
- **Group Bookings**: Show all appointments in confirmation
- **Guest Info**: Display guest name and contact for each appointment
- **Booker Info**: Show who made the booking
- **Email/SMS**: Send confirmations to each guest (not just booker)

---

## Testing Checklist

### Service Quantities
- [ ] Can add multiple quantities of same service
- [ ] Can remove quantities (down to 0)
- [ ] Price calculation includes quantities
- [ ] Duration calculation includes quantities
- [ ] Hold creation works with quantities
- [ ] Session storage persists quantities and assignments

### Guest Management (Authenticated)
- [ ] "Self" guest auto-created for authenticated users
- [ ] Can add new guests with "+ Add Guest" button
- [ ] Can remove guests (except self)
- [ ] Guest list displays correctly
- [ ] Guest info (name, email, phone) is stored

### Smart Assignment
- [ ] First service auto-assigned to "self" for authenticated users
- [ ] Guest assignment prompt appears when quantity > 1
- [ ] Can assign service to self
- [ ] Can assign service to existing guest
- [ ] Can create new guest from assignment prompt
- [ ] Auto-assigns when only one available guest
- [ ] Pending assignments work when guest is added

### Multi-Guest Booking
- [ ] Can book multiple services for multiple guests
- [ ] Each guest gets their own appointment
- [ ] Customer records created for each guest
- [ ] `bookedBy` field populated correctly
- [ ] `guestInfo` field populated correctly
- [ ] All appointments linked via `groupBookingId` (if implemented)

### Guest Booking (Non-Authenticated)
- [ ] Can select multiple quantities as guest
- [ ] Prompted for guest info when quantity > 1
- [ ] Multiple appointments created for multiple guests
- [ ] No "self" assignment for guests

### Edge Cases
- [ ] Removing guest with assigned services (should unassign or prevent)
- [ ] Changing quantity after assignment (reassign or remove)
- [ ] Booking for self + multiple guests in same booking
- [ ] Mixed services (some for self, some for guests)
- [ ] Session persistence across page refreshes

---

## Alternative Approaches Considered

### Service Quantities
- ❌ **Separate appointments per quantity**: Create multiple appointments upfront (too complex, breaks hold system)
- ✅ **Quantity map with guest assignments**: Track quantities and assign to guests (chosen - most flexible)

### Guest Assignment
- ❌ **Separate booking flow**: Different page/route for group bookings (too much duplication)
- ❌ **Toggle-based approach**: Simple toggle for "book for someone else" (less flexible, doesn't scale)
- ✅ **Smart assignment prompts**: Automatically prompt when quantity > 1 (chosen - most intuitive)
- ❌ **Admin-only feature**: Only allow admins to book for others (too restrictive)

### Why This Approach Wins
1. **Natural Flow**: Quantity selection naturally leads to guest assignment
2. **Scalable**: Works for 1 guest or 10 guests
3. **Intuitive**: Users understand "I need 3 services, who are they for?"
4. **Flexible**: Can mix self + guests in same booking
5. **Data Rich**: Know exactly which service is for which guest

---

## Next Steps

1. Review this plan with stakeholders
2. Prioritize which feature to implement first
3. Create detailed tickets for development
4. Design mockups for UI changes
5. Update data models and types
6. Implement and test incrementally

