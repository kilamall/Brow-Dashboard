# 🚀 Deploy Customer Data Deletion Feature

## Quick Deploy

### 1. Build and Deploy Cloud Function

```bash
# Navigate to functions directory
cd functions

# Install dependencies (if needed)
npm install

# Build the function
npm run build

# Deploy only the new function
firebase deploy --only functions:deleteCustomerData

# OR deploy all functions
firebase deploy --only functions
```

### 2. Build and Deploy Admin Frontend

```bash
# Navigate to admin app directory
cd apps/admin

# Build the admin app
npm run build

# Deploy admin frontend
firebase deploy --only hosting:admin

# OR from root directory
cd ../..
firebase deploy --only hosting
```

---

## Full Deployment (Recommended)

Deploy both functions and frontend in one go:

```bash
# From root directory
npm run build

# Deploy everything
firebase deploy --only functions,hosting
```

---

## Verify Deployment

### 1. Check Cloud Function

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Functions**
3. Verify `deleteCustomerData` function is deployed
4. Check the function logs for any errors

### 2. Test in Admin Panel

1. Open your admin panel: `https://bueno-brows-admin.web.app`
2. Log in as admin
3. Go to **Customers** page
4. Find a test customer (or create one)
5. Click **"Delete All Data"** button
6. Verify the confirmation dialogs appear
7. Complete the deletion
8. Verify success message shows deleted collections

### 3. Verify Data Deletion

Check Firebase Console to ensure data was deleted:
1. Go to **Firestore Database**
2. Verify customer record is gone
3. Check related collections (appointments, messages, etc.)
4. Confirm all related data is removed

---

## Rollback Plan

If something goes wrong:

### Rollback Cloud Function

```bash
# List recent deployments
firebase functions:list

# If needed, delete the function
firebase functions:delete deleteCustomerData
```

### Rollback Frontend

```bash
# Redeploy previous version
git checkout <previous-commit>
cd apps/admin
npm run build
firebase deploy --only hosting:admin
```

---

## What Was Changed

### New Files
1. `functions/src/delete-customer-data.ts` - Cloud Function for comprehensive deletion
2. `CUSTOMER_DATA_DELETION_GUIDE.md` - User documentation
3. `DEPLOY_CUSTOMER_DELETION.md` - This deployment guide

### Modified Files
1. `functions/src/index.ts` - Export new function
2. `packages/shared/src/functionsClient.ts` - Client wrapper for function
3. `apps/admin/src/pages/Customers.tsx` - Updated UI with new delete button

---

## Environment Variables

No new environment variables needed! The function uses existing Firebase configuration.

---

## Testing Checklist

Before deploying to production:

- [ ] Function builds without errors
- [ ] Function deploys successfully
- [ ] Admin panel shows new "Delete All Data" button
- [ ] Confirmation dialogs appear correctly
- [ ] Test customer deletion works
- [ ] All related data is actually deleted
- [ ] Success message shows correct counts
- [ ] Error handling works (try with invalid customer ID)
- [ ] Auth account deletion works (if selected)
- [ ] Function logs show no errors

---

## Production Considerations

### Performance
- Large datasets (100+ appointments) may take 5-10 seconds
- Function has default timeout of 60 seconds (should be plenty)
- If you have customers with massive data, consider increasing timeout

### Costs
- Each deletion costs based on Firestore operations
- Average customer: ~20-50 document deletions
- Firebase free tier: 20k writes/day (plenty for deletions)

### Monitoring
- Monitor Cloud Function logs for errors
- Set up Firebase Alerts for function failures
- Track deletion frequency in Firebase Analytics (optional)

---

## Support & Troubleshooting

### Common Issues

**"Function not found"**
- Solution: Deploy the function first
- Command: `firebase deploy --only functions:deleteCustomerData`

**"Permission denied"**
- Solution: Ensure you're logged in as admin
- Check: Firebase Console → Authentication → User Claims

**"Timeout"**
- Solution: Customer has too much data
- Workaround: Contact support to manually delete in batches

### Need Help?

1. Check Cloud Function logs: Firebase Console → Functions → Logs
2. Check browser console: F12 → Console tab
3. Review `CUSTOMER_DATA_DELETION_GUIDE.md` for usage help

---

## Next Steps

After successful deployment:

1. ✅ Test with a test customer account
2. ✅ Review the User Guide with your team
3. ✅ Update your data retention policy
4. ✅ Train staff on proper deletion procedures
5. ✅ Set up regular data cleanup schedule

---

**Ready to deploy?** Run:
```bash
npm run build && firebase deploy --only functions,hosting
```

Good luck! 🚀

