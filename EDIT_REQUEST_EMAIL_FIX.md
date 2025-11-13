# Edit Request Email - Service Name Fix

## Issue
When admin receives edit appointment request emails, the subject line was showing `{{serviceName}}` as a literal placeholder instead of the actual service name(s).

Example:
- **Before**: `Edit Request: {{serviceName}} - Customer`
- **After**: `Edit Request: Brow Consultation, Brow Wax + Tint - Regina Bueno`

## Root Cause
The email template in `EmailTemplatesManager.tsx` used `{{serviceName}}` in the subject line, but the Firebase Function in `edit-request-notifications.ts` was only providing `currentServiceName` as a template variable, not `serviceName`.

## Solution
Added `serviceName` to the template variables in the `onEditRequestCreated` function:

```typescript
const templateVariables: Record<string, string | number> = {
  // ... other variables
  serviceName: currentServiceNamesDisplay,  // ← ADDED THIS LINE
  currentServiceName: currentServiceNamesDisplay,
  // ... rest of variables
};
```

## Files Changed
1. **functions/src/edit-request-notifications.ts** (Line 206)
   - Added `serviceName` variable to template variables

2. **apps/admin/src/components/EmailTemplatesManager.tsx** (Line 520)
   - Updated variables list to document `serviceName` as available

## Deployment
- ✅ Deployed to Firebase Functions: `onEditRequestCreated`
- ✅ No breaking changes
- ✅ Backwards compatible (kept `currentServiceName` for body content)

## Testing
The next edit request email will now show:
- Subject: `📝 Edit Request: [Service Name(s)] - [Customer Name]`
- Body: Will continue to show "Current Service: [Service Name(s)]" correctly

---
**Fixed**: November 10, 2025
**Deploy Status**: ✅ Live in production

