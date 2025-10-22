# Database Cleanup - Quick Reference Card

## 🚀 Quick Deploy
```bash
cd functions
npm run build
firebase deploy --only functions:enhancedAutoCleanup
```

## 📊 What Gets Cleaned

| Data Type | Keep For | Why |
|-----------|----------|-----|
| Cancelled Appointments | 30 days | Recent history only |
| Expired Holds | 24 hours | Free up calendar |
| Unused Tokens | 90 days | Inactive users |
| Messages | Last 50 | Recent conversations |
| SMS Logs | 90 days | Troubleshooting |
| Verification Codes | Until expired | Security |
| AI Cache | 30 days | Performance |
| Old Analyses | 1 year | Medical value |

## 🔒 Never Deleted
✅ Customer records  
✅ Consent forms  
✅ Confirmed appointments  
✅ Services catalog  
✅ Business settings  
✅ Reviews & ratings  

## 🕐 Cleanup Schedule
- **When**: Daily at 2 AM PST
- **Duration**: ~5 minutes
- **Memory**: 2GB allocated
- **Timeout**: 9 minutes max

## 📈 Storage Impact
- **Before**: Unlimited growth → 2.4GB/year
- **After**: Steady ~200MB
- **Savings**: ~90% reduction

## 🔧 Quick Commands

### View What Would Be Cleaned
```typescript
getCleanupStats()
```

### Manual Cleanup (Admin Only)
```typescript
manualCleanup({ cleanupTypes: ['smsLogs', 'emailLogs'] })
```

### Check Function Logs
Firebase Console → Functions → enhancedAutoCleanup → Logs

## ⚠️ Before Production
1. ✅ Enable Firestore backups
2. ✅ Test in staging
3. ✅ Review retention periods
4. ✅ Monitor first run

## 📞 Troubleshooting

**Not running?**
- Check billing enabled
- Verify Cloud Scheduler active
- Check function logs

**Too much deleted?**
- Restore from backup
- Increase retention periods
- Redeploy function

**Not enough deleted?**
- Run manual cleanup
- Check queries working
- Decrease retention periods

## 📚 Full Documentation
- `DATABASE_CLEANUP_POLICY.md` - Complete policy
- `ENHANCED_CLEANUP_DEPLOYMENT.md` - Deployment guide
- `functions/src/enhanced-auto-cleanup.ts` - Source code

## 🎯 Success Indicators
✅ Function runs daily  
✅ No errors in logs  
✅ Storage stabilizes  
✅ Customers have recent data  
✅ No missing appointments  

---

**Remember**: Keep backups enabled. When in doubt, keep data longer.

