# Quick Rebook Feature Implementation

## Overview
Added "Book Again" functionality for customers and "Quick Rebook" actions for admins, making it easy to schedule repeat appointments 2+ weeks in advance with prepopulated customer information.

## Features Implemented

### 1. Customer Side (Booking App)

#### My Bookings Tab - "Book Again" Button
**Location:** `apps/booking/src/pages/ClientDashboard.tsx`

**What was added:**
- Added a "Book Again" button to all past confirmed appointments
- Button appears on the right side of each past appointment card
- Uses a refresh icon (circular arrows) for easy recognition

**Functionality:**
- Clicking "Book Again" navigates to `/book` page with:
  - **Service preselected:** Same service as the past appointment
  - **Date set to:** 2 weeks from today
  - **Customer info prepopulated:** Name, email, and phone from the past appointment
- Customer can adjust the date/time and complete the booking

**Code Changes:**
- Added `addWeeks` import from `date-fns`
- Created `handleBookAgain()` function that:
  - Calculates date 2 weeks ahead
  - Navigates with state containing preselected service and prefilled customer data
- Updated past appointments rendering to include the button (only for confirmed appointments)

---

### 2. Customer Booking Page Updates
**Location:** `apps/booking/src/pages/Book.tsx`

**What was added:**
- Support for receiving and applying prepopulated data from navigation state

**Functionality:**
- Reads `location.state` for:
  - `preselectedServiceId`: Auto-selects the service
  - `prefillCustomer`: Fills in name, email, phone fields
  - `initialDate`: Sets the calendar to the specified date
- Automatically applies these values when the page loads

**Code Changes:**
- Added `useLocation` import
- Added location state type definition with optional prefill fields
- Updated state initializers for:
  - `selectedServiceIds`: Checks for preselected service
  - `dateStr`: Checks for initial date
  - `gName`, `gEmail`, `gPhone`: Initialize with prefilled customer data

---

### 3. Admin Side - Appointment Detail Modal
**Location:** `apps/admin/src/components/AppointmentDetailModal.tsx`

**What was added:**
- "Quick Rebook (2+ Weeks)" button prominently displayed at the top of the actions section
- Green button with calendar refresh icon

**Functionality:**
- Clicking the button navigates to the Schedule page with:
  - **Date:** 2 weeks from today
  - **Customer info prepopulated:** All customer details from the appointment
  - **Service preselected:** Same service from the appointment
- Schedule opens with the AddAppointmentModal ready to create the new booking

**Code Changes:**
- Added `addWeeks` import from `date-fns`
- Created `handleQuickRebook()` function that navigates to schedule with quickRebook state
- Added prominent quick rebook button (only shown for confirmed appointments with customer IDs)
- Reorganized action buttons into sections for better UX

---

### 4. Admin Side - Customer Detail Modal
**Location:** `apps/admin/src/components/EnhancedCustomerDetailModal.tsx`

**What was added:**
- "Quick Rebook (2+ Weeks Ahead)" button in the header section
- Styled to match the header gradient with white text

**Functionality:**
- Clicking the button navigates to the Schedule page with:
  - **Date:** 2 weeks from today
  - **Customer info prepopulated:** All customer details
  - **Service:** If the customer has past appointments, preselects their most recent service
- Opens directly to the appointment creation modal

**Code Changes:**
- Added `useNavigate`, `addWeeks` imports
- Created `handleQuickRebook()` function that:
  - Calculates 2 weeks ahead
  - Gets most recent service if available
  - Navigates with quickRebook state
- Added button to header with calendar icon

---

### 5. Admin Side - Schedule Page
**Location:** `apps/admin/src/pages/Schedule.tsx`

**What was added:**
- Support for receiving quick rebook data from navigation state
- Automatic opening of AddAppointmentModal with prefilled data

**Functionality:**
- Detects `quickRebook` data in location state
- Automatically:
  - Sets the month view to the target date
  - Opens the AddAppointmentModal
  - Prepopulates all customer information
  - Preselects the service if provided
- Clears the location state after processing to prevent re-triggering

**Code Changes:**
- Added `useLocation` and `parseISO` imports
- Added location state type definition for quickRebook
- Updated `openAdd` state to include optional `prefillData`
- Added `useEffect` to handle quickRebook state on mount
- Passed `prefillData` to AddAppointmentModal component

---

### 6. Admin Side - Add Appointment Modal
**Location:** `apps/admin/src/components/AddAppointmentModal.tsx`

**What was added:**
- Support for optional prepopulated customer and service data

**Functionality:**
- Accepts optional `prefillData` prop containing:
  - Customer ID, name, email, phone
  - Service ID
- Automatically loads customer from database if customer ID provided
- Pre-fills all form fields with the provided data
- Admin can still modify any field before creating the appointment

**Code Changes:**
- Created `AddAppointmentModalProps` interface with optional `prefillData`
- Added `useEffect` to populate form fields when `prefillData` is provided
- Loads full customer record from Firestore if customer ID is available
- Added dependency array to watch for `prefillData` changes

---

## User Experience Flow

### Customer Flow (Rebooking):
1. Customer logs into their dashboard (`/dashboard`)
2. Scrolls to "Past Appointments" section
3. Sees "Book Again" button on confirmed past appointments
4. Clicks "Book Again"
5. Redirected to booking page with:
   - Service already selected
   - Date set to 2+ weeks from now
   - Name, email, phone already filled in
6. Customer selects exact time slot and confirms

### Admin Flow (From Appointment):
1. Admin views appointment details in any appointment modal
2. Clicks "Quick Rebook (2+ Weeks)" button
3. Navigated to Schedule page at target date
4. AddAppointmentModal opens automatically with:
   - Customer info filled in
   - Service preselected
   - Date set to 2 weeks ahead
5. Admin selects time and confirms booking

### Admin Flow (From Customer Profile):
1. Admin views customer detail modal
2. Clicks "Quick Rebook (2+ Weeks Ahead)" in header
3. Navigated to Schedule page
4. Modal opens with customer info and most recent service
5. Admin selects time and confirms booking

---

## Technical Details

### Date Calculation
- Uses `addWeeks(new Date(), 2)` from `date-fns`
- Formats as `yyyy-MM-dd` for consistency
- Ensures bookings are at least 14 days in advance

### State Management
- Customer side: Uses React Router's `location.state` to pass data
- Admin side: Uses navigation state for seamless handoff to Schedule page
- Clears state after use with `window.history.replaceState()` to prevent duplicate triggers

### Data Flow
```
User Action → Navigation with State → Target Page → Apply State → Clear State
```

### Safety Features
- Only shows "Book Again" for confirmed past appointments
- Only shows admin quick rebook for appointments with valid customer IDs
- Validates all data before applying
- Falls back gracefully if data is missing

---

## Testing Recommendations

### Customer Side Testing:
1. Complete a booking and confirm it
2. Wait for appointment to pass (or manually update the date in DB)
3. Log in to customer dashboard
4. Verify "Book Again" button appears on past confirmed appointment
5. Click button and verify:
   - Service is preselected
   - Date is ~2 weeks ahead
   - Customer fields are filled
   - Booking can be completed

### Admin Side Testing (Appointment Modal):
1. Open any confirmed appointment in admin
2. Verify "Quick Rebook" button appears
3. Click button and verify:
   - Navigate to Schedule page
   - Calendar shows ~2 weeks ahead
   - AddAppointmentModal opens automatically
   - Customer info is filled
   - Service is preselected

### Admin Side Testing (Customer Modal):
1. Open customer detail modal
2. Click "Quick Rebook" in header
3. Verify same behavior as appointment modal test
4. Verify most recent service is preselected if customer has booking history

---

## Files Modified

1. `apps/booking/src/pages/ClientDashboard.tsx`
2. `apps/booking/src/pages/Book.tsx`
3. `apps/admin/src/components/AppointmentDetailModal.tsx`
4. `apps/admin/src/components/EnhancedCustomerDetailModal.tsx`
5. `apps/admin/src/components/AddAppointmentModal.tsx`
6. `apps/admin/src/pages/Schedule.tsx`

All changes pass linting with no errors.

---

## Benefits

### For Customers:
- **Quick rebooking:** One-click to start rebooking their favorite service
- **No re-entry:** Don't need to type their information again
- **Smart date:** Automatically suggests a date far enough ahead to plan

### For Admins:
- **Faster booking:** Create repeat appointments in seconds
- **Reduced errors:** Customer information is already verified
- **Better retention:** Makes it easy to proactively rebook loyal customers
- **Context aware:** Preselects customer's preferred service

### For Business:
- **Increased retention:** Lower friction for repeat bookings
- **Time savings:** Admins spend less time on data entry
- **Better experience:** Professional, streamlined rebooking flow

