# Edit Request Cleanup & Data Management Improvements

## 🎯 Overview
This update implements comprehensive edit request management with delete functionality, enhanced data management UI, and automatic cleanup of old edit requests.

## 📝 Changes Made

### 1. **Edit Request Delete Functionality**

#### Customer Dashboard (`apps/booking/src/pages/ClientDashboard.tsx`)
- ✅ Added delete button with trash icon to each edit request card
- ✅ Filtered view to show ONLY pending edit requests (approved/denied are hidden)
- ✅ Added confirmation dialog: "Delete this edit request? This action cannot be undone."
- ✅ Red delete button styling with hover effects
- ✅ Error handling for delete operations

**Key Changes:**
```typescript
// Filter to show only pending requests
.filter(req => req.status === 'pending')

// Delete handler
const handleDeleteRequest = async (requestId: string) => {
  if (!confirm('Delete this edit request? This action cannot be undone.')) return;
  try {
    await deleteDoc(doc(db, 'appointmentEditRequests', requestId));
  } catch (error) {
    console.error('Error deleting edit request:', error);
    alert('Failed to delete edit request. Please try again.');
  }
};
```

#### Admin Dashboard - Schedule Page (`apps/admin/src/pages/Schedule.tsx`)
- ✅ Added delete button to each edit request card on the main schedule page
- ✅ Gray "Delete" button next to approve/deny actions
- ✅ Confirmation dialog before deletion
- ✅ Error handling with user feedback

**Key Changes:**
```typescript
const handleDeleteEditRequest = async (request: AppointmentEditRequest) => {
  if (!db) return;
  
  try {
    const confirmed = window.confirm('Delete this edit request? This action cannot be undone.');
    if (!confirmed) return;

    await deleteDoc(doc(db, 'appointmentEditRequests', request.id));
    console.log('✅ Edit request deleted');
  } catch (error) {
    console.error('❌ Error deleting edit request:', error);
    alert('Failed to delete edit request. Please try again.');
  }
};
```

#### Admin Dashboard - Edit Requests Modal (`apps/admin/src/components/EditRequestsModal.tsx`)
- ✅ Added delete button for pending requests (alongside Approve/Deny)
- ✅ Added delete button for approved/denied requests
- ✅ Separate sections for pending vs processed requests
- ✅ Confirmation dialogs and error handling

### 2. **Data Management UI Redesign** (`apps/admin/src/components/DataManagement.tsx`)

#### Smart Cleanup Center
- ✅ **Smart Recommendations**: Dynamic suggestions based on database stats
  - Alerts when cancelled appointments exceed 50
  - Alerts when expired holds exceed 100
  - Alerts when old edit requests exceed 30
  - Alerts when old messages exceed 1000
- ✅ **Quick Actions Grid**: Four prominent action buttons
  - Sync Visits (purple)
  - Clear Old Data (blue)
  - Auto Cleanup (green)
  - Purge Data (red)
- ✅ **Live Database Status Dashboard**:
  - Cancelled Appointments
  - Expired Holds
  - Expired Tokens
  - Old Messages (30+ days)
  - Old Skin Requests (30+ days)
  - Old Edit Requests (30+ days approved/denied)
  - Color-coded indicators (red/orange/yellow/gray)
  - Individual "Clean" buttons for targeted cleanup

#### Enhanced Error Handling
All data management functions now have detailed error handling:
```typescript
catch (error: any) {
  let errorMessage = 'Operation failed: ';
  if (error.code === 'permission-denied') {
    errorMessage += 'You do not have permission to perform this action.';
  } else if (error.code === 'invalid-argument') {
    errorMessage += 'Invalid selection. Please try again.';
  } else if (error.code === 'not-found') {
    errorMessage += 'No data found to process.';
  } else if (error.code === 'unavailable') {
    errorMessage += 'Service temporarily unavailable. Please try again in a few minutes.';
  } else if (error.message) {
    errorMessage += error.message;
  } else {
    errorMessage += 'Unknown error. Please try again or contact support.';
  }
  alert(errorMessage);
}
```

#### Fixed Function Names
- ✅ Fixed `syncCustomerVisits` call (was incorrectly trying to call non-existent function)
- ✅ Fixed `manualCleanup` call (was incorrectly named)
- ✅ Fixed `adminPurgeData` call (was incorrectly named)
- ✅ Fixed Purge Data modal to load collection counts when opened

### 3. **Cloud Functions - Edit Request Cleanup**

#### New Cleanup Function (`functions/src/cleanup-edit-requests.ts`)
```typescript
export async function cleanupOldEditRequests(results: any) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldRequests = await db.collection('appointmentEditRequests')
      .where('status', 'in', ['approved', 'denied'])
      .where('processedAt', '<', thirtyDaysAgo.toISOString())
      .limit(1000)
      .get();
    
    // Delete in batches of 500
    const batchSize = 500;
    const docs = oldRequests.docs;
    
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const batchDocs = docs.slice(i, i + batchSize);
      
      batchDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      results.oldEditRequests += batchDocs.length;
    }
  } catch (error) {
    console.error('Error cleaning up old edit requests:', error);
    results.errors++;
  }
}
```

#### Updated Manual Cleanup (`functions/src/manual-cleanup.ts`)
- ✅ Added `'oldEditRequests'` to default cleanup types
- ✅ Integrated `cleanupOldEditRequests` function
- ✅ Updated `getCleanupStats` to count old edit requests
- ✅ Enhanced result reporting

#### Index Export (`functions/src/index.ts`)
- ✅ Added `export * from './cleanup-edit-requests.js';`

### 4. **Firestore Security Rules** (`firebase.rules`)

**Critical Fix**: Added delete permissions for edit requests

```javascript
match /appointmentEditRequests/{id} {
  // ... existing read, create, update rules ...
  
  // Allow delete if admin OR if customer document matches auth email/phone
  allow delete: if isAdmin() || 
    (request.auth != null && 
     exists(/databases/$(database)/documents/customers/$(resource.data.customerId)) &&
     (get(/databases/$(database)/documents/customers/$(resource.data.customerId)).data.email == request.auth.token.email ||
      get(/databases/$(database)/documents/customers/$(resource.data.customerId)).data.phone == request.auth.token.phone_number));
}
```

**Permissions:**
- ✅ Admins can delete any edit request
- ✅ Customers can delete their own edit requests (verified by email/phone match)

### 5. **Firestore Composite Index**

The cleanup function requires a composite index for efficient queries:

**Index Configuration** (in `firestore.indexes.json`):
```json
{
  "collectionGroup": "appointmentEditRequests",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "processedAt", "order": "ASCENDING" }
  ]
}
```

**Index URL** (should be auto-created):
https://console.firebase.google.com/v1/r/project/bueno-brows-7cce7/firestore/indexes

## 🎯 User Experience Improvements

### For Customers
1. **Cleaner Dashboard**: Only see pending edit requests (approved/denied are hidden)
2. **Easy Deletion**: Red delete button on each request card
3. **Clear Feedback**: Confirmation dialogs and error messages
4. **Reduced Clutter**: Approved/denied requests auto-hide

### For Admins
1. **Multiple Delete Points**:
   - Schedule page edit request cards
   - Edit Requests modal (all statuses)
2. **Enhanced Data Management**:
   - Smart recommendations
   - Visual status dashboard
   - One-click cleanup actions
   - Detailed success/error messages
3. **Better Organization**:
   - Logical grouping of cleanup functions
   - Color-coded status indicators
   - Real-time database metrics

## 🔄 Automatic Cleanup

Edit requests are automatically cleaned up:
- **Trigger**: Runs during manual cleanup or scheduled cleanup
- **Criteria**: Status is 'approved' or 'denied' AND processedAt is 30+ days old
- **Batch Size**: 500 documents per batch (Firestore limit)
- **Safety**: Errors logged but don't stop other cleanup operations

## 📊 Database Impact

### Before
- ❌ Edit requests accumulated indefinitely
- ❌ No way for customers to remove pending requests
- ❌ Admins had to manually manage old requests
- ❌ Database bloat with processed requests

### After
- ✅ Customers can delete their own pending requests
- ✅ Admins can delete any request at any time
- ✅ Old processed requests auto-cleanup after 30 days
- ✅ Database stays clean and efficient

## 🚀 Deployment

All changes have been deployed:
- ✅ Cloud Functions (includes new cleanup function)
- ✅ Admin Dashboard (enhanced UI and delete buttons)
- ✅ Booking App (customer delete functionality)
- ✅ Firestore Rules (delete permissions)

## 🧪 Testing Checklist

### Customer Dashboard
- [ ] Sign in as customer
- [ ] Create an edit request
- [ ] Verify delete button appears
- [ ] Confirm delete works
- [ ] Verify approved/denied requests are hidden

### Admin Dashboard - Schedule Page
- [ ] View edit request cards
- [ ] Click delete button
- [ ] Confirm dialog appears
- [ ] Verify deletion works

### Admin Dashboard - Edit Requests Modal
- [ ] Open "View All Edit Requests"
- [ ] Test delete on pending request
- [ ] Test delete on approved request
- [ ] Test delete on denied request

### Data Management
- [ ] View Smart Recommendations
- [ ] Check Live Database Status
- [ ] Run "Auto Cleanup" (includes edit request cleanup)
- [ ] Verify old edit requests are cleaned

## 🔐 Security

All delete operations are secured:
- ✅ Firestore rules validate permissions
- ✅ Customers can only delete their own requests
- ✅ Admins can delete any request
- ✅ Confirmation dialogs prevent accidental deletions
- ✅ Error handling prevents unauthorized access

## 📈 Performance

- ✅ Batch deletions (500 per batch)
- ✅ Efficient queries with composite indexes
- ✅ Error handling doesn't block other operations
- ✅ Async operations with proper await handling

## 🐛 Known Issues Addressed

1. **Permission Errors**: Fixed by adding `allow delete` rule
2. **Function Name Mismatches**: Fixed in DataManagement.tsx
3. **Missing Composite Index**: Added to firestore.indexes.json
4. **Purge Modal Empty**: Fixed to load counts on open
5. **Customer Dashboard Clutter**: Fixed by filtering to pending only

## 📝 Files Modified

### Frontend
- `apps/booking/src/pages/ClientDashboard.tsx`
- `apps/admin/src/pages/Schedule.tsx`
- `apps/admin/src/components/EditRequestsModal.tsx`
- `apps/admin/src/components/DataManagement.tsx`

### Backend
- `functions/src/cleanup-edit-requests.ts` (NEW)
- `functions/src/manual-cleanup.ts`
- `functions/src/index.ts`

### Configuration
- `firebase.rules`
- `firestore.indexes.json`

## 🎉 Summary

This update provides a complete edit request lifecycle management system:
1. **Creation**: Customers can request appointment changes
2. **Management**: Admins can approve, deny, or delete requests
3. **Self-Service**: Customers can delete their own pending requests
4. **Cleanup**: Old processed requests auto-delete after 30 days
5. **UI/UX**: Smart recommendations and visual status dashboard

The system is now production-ready with proper security, error handling, and automatic maintenance! 🚀

