# Enhanced Database Cleanup - Deployment Guide
**Date:** October 21, 2025

## 🎯 What This Solves

Your enhanced cleanup system now automatically cleans **14 types of data** to prevent database clutter while preserving all regulatory and UX-critical information.

### Problems Fixed
✅ SMS logs accumulating indefinitely  
✅ Old verification codes sitting in database  
✅ Email delivery logs growing unchecked  
✅ AI cache entries never expiring  
✅ Orphaned availability slots blocking the calendar  
✅ Old completed skin analyses taking space  
✅ Failed notification logs cluttering the database  
✅ Conversations growing without limit  

---

## 📦 What Was Added

### 1. New Function: `enhanced-auto-cleanup.ts`
**Location:** `/functions/src/enhanced-auto-cleanup.ts`

**Features:**
- 14 different cleanup tasks (vs 5 in the old version)
- Parallel execution for faster cleanup
- Better error handling
- Comprehensive logging
- Batch processing optimization

### 2. Documentation: `DATABASE_CLEANUP_POLICY.md`
Complete policy document explaining:
- What gets cleaned and when
- What is NEVER deleted
- Regulatory compliance considerations
- How to adjust retention periods

### 3. Updated Functions Index
**Location:** `/functions/src/index.ts`
- Added export for new enhanced cleanup function

---

## 🚀 Deployment Steps

### Step 1: Build the Functions
```bash
cd functions
npm run build
```

### Step 2: Deploy to Firebase
```bash
# Deploy only the new cleanup function
firebase deploy --only functions:enhancedAutoCleanup

# OR deploy all functions
firebase deploy --only functions
```

### Step 3: Verify Deployment
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to your project → Functions
3. Look for `enhancedAutoCleanup` in the list
4. Check that it's scheduled for **daily at 2 AM PST**

### Step 4: Enable Cloud Scheduler (if not already enabled)
1. In Firebase Console → Functions
2. Click on `enhancedAutoCleanup`
3. Make sure the schedule is active
4. Billing must be enabled for scheduled functions

### Step 5: Test the Function (Optional)
```bash
# Trigger the function manually to test
# In Firebase Console → Functions → enhancedAutoCleanup → Test
# Or use the Cloud Scheduler console to trigger it
```

---

## 📊 Cleanup Categories

### Immediate Cleanup (After Expiration)
| Data Type | Retention | Impact |
|-----------|-----------|--------|
| Verification Codes | Immediate | Security |
| Expired Holds | 24 hours | Calendar availability |
| Orphaned Availability | Immediate | Calendar accuracy |

### Short-Term Cleanup (< 90 days)
| Data Type | Retention | Impact |
|-----------|-----------|--------|
| Failed Notifications | 30 days | Error logs |
| AI Cache Entries | 30 days | Performance cache |
| Cancelled Appointments | 30 days | Historical data |

### Long-Term Cleanup (90+ days)
| Data Type | Retention | Impact |
|-----------|-----------|--------|
| SMS Logs | 90 days | Delivery tracking |
| Email Logs | 90 days | Delivery tracking |
| Customer Tokens | 90 days (inactive) | Push notifications |
| Skin Analysis Requests | 6 months | Service data |
| Completed Analyses | 1 year | Medical/cosmetic records |

### Smart Cleanup (Keep Recent)
| Data Type | Retention | Impact |
|-----------|-----------|--------|
| Messages | Last 50 per customer | Chat history |
| SMS Conversations | Last 50 per customer | SMS history |
| AI SMS Conversations | Last 50 per customer | AI interactions |

---

## 🔒 What's Protected (NEVER Auto-Deleted)

### Critical Business Data
- ✅ Customer records
- ✅ Consent forms
- ✅ Confirmed appointments
- ✅ Completed appointments
- ✅ Services catalog
- ✅ Business settings
- ✅ Reviews and ratings

### Active Data
- ✅ Current sessions
- ✅ Active holds (< 24 hours)
- ✅ Recent messages (last 50)
- ✅ Active conversations
- ✅ Active notification tokens

---

## 📈 Expected Storage Impact

### Before Enhanced Cleanup
Unlimited growth:
- **Month 1**: 100MB
- **Month 6**: 600MB  
- **Month 12**: 1.2GB
- **Month 24**: 2.4GB

### With Enhanced Cleanup
Steady state after initial cleanup:
- **Steady State**: ~200MB
- **Growth**: Minimal (only active data)
- **Savings**: ~90% reduction in long-term storage costs

---

## 🔧 Customizing Retention Periods

If you need to adjust how long data is kept:

### Example: Change SMS Logs from 90 to 180 days

**File:** `/functions/src/enhanced-auto-cleanup.ts`

Find this function:
```typescript
async function cleanupSMSLogs(results: any) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90); // Change -90 to -180
  // ... rest of function
}
```

**After changing:**
```bash
cd functions
npm run build
firebase deploy --only functions:enhancedAutoCleanup
```

---

## 🧪 Testing the Cleanup

### View Cleanup Statistics
Use the manual cleanup function to see what would be cleaned:

```typescript
// Call from admin dashboard or Cloud Functions console
import { getCleanupStats } from './manual-cleanup';

// Returns counts of data that would be cleaned
const stats = await getCleanupStats();
console.log(stats);
```

### Trigger Manual Cleanup
For immediate cleanup (requires admin authentication):

```typescript
import { manualCleanup } from './manual-cleanup';

// Clean specific types
await manualCleanup({ 
  cleanupTypes: ['smsLogs', 'emailLogs', 'aiCacheEntries'] 
});

// Clean everything
await manualCleanup({ cleanupTypes: 'all' });
```

---

## 📊 Monitoring Cleanup

### View Cleanup Logs
1. Go to Firebase Console → Functions
2. Click `enhancedAutoCleanup`
3. Click "Logs" tab
4. Look for daily cleanup results

### Expected Log Output
```
🧹 Starting enhanced automatic database cleanup...
Deleted 45 old cancelled appointments
Deleted 123 expired holds
Deleted 67 expired tokens
Deleted 234 old messages
Deleted 12 old skin analysis requests
Deleted 456 old SMS logs
Deleted 89 old SMS conversations
Deleted 34 old AI SMS conversations
Deleted 78 expired verification codes
Deleted 123 old email logs
Deleted 567 old AI cache entries
Deleted 23 orphaned availability slots
Deleted 5 old skin analyses
Deleted 89 failed notification logs
✅ Enhanced auto-cleanup completed successfully: {
  cancelledAppointments: 45,
  oldHolds: 123,
  expiredTokens: 67,
  ...
  errors: 0
}
```

---

## ⚠️ Important Warnings

### Before Enabling in Production

1. **Enable Firestore Backups**
   - Go to Firebase Console → Firestore Database → Backups
   - Enable daily automatic backups (7-day retention recommended)

2. **Test in Staging First**
   - Deploy to staging environment
   - Run manual cleanup
   - Verify no critical data deleted

3. **Review Retention Periods**
   - Make sure retention periods match your business needs
   - Consider regulatory requirements (GDPR, HIPAA, etc.)

### Cannot Be Undone
- Once data is deleted, it cannot be recovered
- Only way to recover is from Firestore backups
- Test thoroughly before production deployment

---

## 🔄 Migration from Old Cleanup

### If You're Using `auto-cleanup.ts`

The new `enhanced-auto-cleanup.ts` includes everything from the old version plus:
- 9 additional cleanup categories
- Better performance (parallel execution)
- More comprehensive logging

**Options:**
1. **Keep Both**: Old cleanup + new cleanup (redundant but safe)
2. **Replace**: Disable old `autoCleanup` and use only `enhancedAutoCleanup`

**To Disable Old Cleanup:**
```typescript
// In functions/src/index.ts
// Comment out or remove:
// export * from './auto-cleanup.js';
```

Then redeploy:
```bash
firebase deploy --only functions
```

---

## 📞 Troubleshooting

### Function Not Running
**Check:**
- Billing enabled on Firebase project
- Cloud Scheduler enabled
- Function deployed successfully
- Check function logs for errors

### Function Times Out
**Solutions:**
- Increase timeout (currently 540 seconds)
- Increase memory allocation (currently 2GB)
- Reduce batch sizes in code

### Too Much Data Deleted
**Solutions:**
- Increase retention periods
- Adjust logic to keep more data
- Restore from Firestore backup

### Not Enough Data Deleted
**Solutions:**
- Decrease retention periods
- Run manual cleanup for immediate results
- Check if queries are working correctly

---

## 🎓 Understanding the Code

### How It Works

1. **Scheduled Trigger**: Function runs daily at 2 AM
2. **Parallel Execution**: All 14 cleanup tasks run simultaneously
3. **Batch Processing**: Deletes in batches of 500 for efficiency
4. **Error Isolation**: Error in one task doesn't affect others
5. **Logging**: Comprehensive results logged for monitoring

### Key Functions

```typescript
// Main scheduler
export const enhancedAutoCleanup = onSchedule({ ... })

// Individual cleanup tasks
cleanupOldCancelledAppointments()
cleanupExpiredHolds()
cleanupExpiredTokens()
// ... 11 more

// Helper for batch deletion
deleteBatch(docs: QueryDocumentSnapshot[])
```

---

## 📚 Related Documentation

- `DATABASE_CLEANUP_POLICY.md` - Complete cleanup policy
- `functions/src/enhanced-auto-cleanup.ts` - Source code
- `functions/src/manual-cleanup.ts` - Manual cleanup options
- Firebase Functions Documentation: https://firebase.google.com/docs/functions

---

## ✅ Deployment Checklist

- [ ] Review retention periods in `DATABASE_CLEANUP_POLICY.md`
- [ ] Enable Firestore automatic backups
- [ ] Build functions (`npm run build`)
- [ ] Deploy to staging (test)
- [ ] Verify cleanup logs in staging
- [ ] Deploy to production
- [ ] Monitor first cleanup run
- [ ] Verify storage reduction over time
- [ ] Document any custom changes

---

## 🎉 Success Criteria

Your cleanup is working correctly when:

✅ Function runs daily without errors  
✅ Cleanup logs show data being deleted  
✅ Database size stabilizes (not growing indefinitely)  
✅ No customer complaints about missing data  
✅ Recent messages/conversations still accessible  
✅ Confirmed appointments never deleted  
✅ Storage costs remain reasonable  

---

**Questions or Issues?**
- Check the logs first
- Review `DATABASE_CLEANUP_POLICY.md`
- Test in staging before making changes
- Keep backups enabled at all times

**Remember**: When in doubt, keep data longer rather than delete it prematurely. You can always reduce retention periods later, but you can't recover deleted data without backups.

