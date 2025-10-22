# Database Cleanup Policy - Bueno Brows
**Last Updated:** October 21, 2025

## Overview

This document outlines what data is automatically cleaned up from the database versus what is preserved for regulatory compliance and optimal user experience.

## Automatic Cleanup Schedule

The enhanced auto-cleanup function runs **daily at 2 AM PST** and processes the following data:

---

## 🗑️ Data That Gets Cleaned Up

### 1. **Cancelled Appointments** (30 days)
- **What**: Appointments with status = 'cancelled'
- **Retention**: 30 days after cancellation
- **Why Clean**: Reduces database clutter while keeping recent history for customer service
- **Preserved**: All confirmed/completed appointments (never deleted automatically)

### 2. **Expired Slot Holds** (24 hours)
- **What**: Temporary holds placed during booking process
- **Retention**: 24 hours
- **Why Clean**: Frees up slots that were held but never converted to appointments
- **Preserved**: Active holds within 24 hour window

### 3. **Expired Customer Tokens** (90 days)
- **What**: FCM push notification tokens for mobile/web notifications
- **Retention**: 90 days of inactivity
- **Why Clean**: Old tokens from customers who stopped using the app
- **Preserved**: Recently used tokens for active customers

### 4. **Old Messages** (Keep Last 50 per Customer)
- **What**: In-app chat messages between customer and admin
- **Retention**: Last 50 messages per customer
- **Why Clean**: Maintains conversation history while preventing unlimited growth
- **Preserved**: Most recent 50 messages per customer

### 5. **Old Skin Analysis Requests** (6 months)
- **What**: Pending or failed skin analysis requests
- **Retention**: 6 months
- **Why Clean**: Requests older than 6 months are no longer relevant
- **Preserved**: Completed analyses (see #13)

### 6. **SMS Logs** (90 days)
- **What**: Delivery status logs for SMS messages
- **Retention**: 90 days
- **Why Clean**: Technical logs don't need long-term retention
- **Preserved**: Recent 90 days for troubleshooting

### 7. **SMS Conversations** (Keep Last 50 per Customer)
- **What**: SMS message history per phone number
- **Retention**: Last 50 messages per customer
- **Why Clean**: Balance between history and database size
- **Preserved**: Most recent 50 SMS messages per customer

### 8. **AI SMS Conversations** (Keep Last 50 per Customer)
- **What**: AI-powered SMS conversation history
- **Retention**: Last 50 messages per customer
- **Why Clean**: AI conversations can be verbose
- **Preserved**: Most recent 50 AI conversations per customer

### 9. **Expired Verification Codes** (Immediately after expiration)
- **What**: OTP codes for email/SMS verification
- **Retention**: Until expiration (typically 10 minutes)
- **Why Clean**: Security - expired codes should not exist in database
- **Preserved**: Active, non-expired codes

### 10. **Email Logs** (90 days)
- **What**: Email delivery status logs
- **Retention**: 90 days
- **Why Clean**: Technical logs for troubleshooting
- **Preserved**: Recent 90 days for debugging

### 11. **AI Cache Entries** (30 days)
- **What**: Cached AI responses for common queries
- **Retention**: 30 days
- **Why Clean**: Cache can regenerate if needed
- **Preserved**: Recently cached responses for performance

### 12. **Orphaned Availability Slots** (Immediately after expiration)
- **What**: Held availability slots that expired
- **Retention**: Until expiration (typically 15 minutes)
- **Why Clean**: Frees up calendar availability
- **Preserved**: Active held slots

### 13. **Old Completed Skin Analyses** (1 year)
- **What**: Completed skin analysis reports
- **Retention**: 1 year
- **Why Clean**: Medical/cosmetic analyses have limited shelf life
- **Preserved**: Analyses from last 12 months
- **Note**: Kept longer than requests due to potential value

### 14. **Failed Notification Logs** (30 days)
- **What**: Failed SMS/email delivery logs
- **Retention**: 30 days
- **Why Clean**: Error logs accumulate quickly
- **Preserved**: Recent 30 days for troubleshooting

---

## ✅ Data That Is NEVER Automatically Deleted

### Regulatory & Compliance Data
1. **Customer Records** - Never deleted (includes contact info, preferences, medical history)
2. **Consent Forms** - Never deleted (regulatory requirement)
3. **Completed Appointments** - Never deleted (business records)
4. **Confirmed Appointments** - Never deleted (active bookings)
5. **Payment Records** - Never deleted (financial compliance)

### Essential Business Data
6. **Services** - Never deleted (core business catalog)
7. **Business Settings** - Never deleted (operational configuration)
8. **Business Hours** - Never deleted (operational configuration)
9. **Analytics Targets** - Never deleted (business metrics)
10. **Service Categories** - Never deleted (organizational structure)

### Active User Data
11. **Active Customer Sessions** - Never deleted (current user experience)
12. **Recent Messages (Last 50)** - Preserved (customer service)
13. **Current Conversations** - Never deleted (active communication)
14. **Active Tokens** - Never deleted (push notifications)

### Review & Feedback
15. **Customer Reviews** - Never deleted (business reputation)
16. **Customer Ratings** - Never deleted (business metrics)

---

## 🔧 Manual Cleanup Options

Admins can trigger manual cleanup through the admin dashboard for:

### Immediate Cleanup (Admin-Only Functions)
- `manualCleanup()` - Run all cleanup tasks immediately
- `clearCancelledAppointments()` - Remove all cancelled appointments (regardless of age)
- `cleanupExpiredHolds()` - Remove all expired holds immediately
- `getCleanupStats()` - Preview what would be cleaned

### Admin Data Management
Available in Admin Dashboard → Settings → Data Management:
- Delete specific customer and all their data (GDPR compliance)
- Clear all cancelled appointments
- View cleanup statistics
- Export data before deletion

---

## 📊 Cleanup Execution Details

### Performance Optimizations
- **Batch Processing**: Deletes in batches of 500 documents
- **Parallel Execution**: Multiple cleanup tasks run concurrently
- **Memory**: 2GB allocated for cleanup function
- **Timeout**: 9 minutes maximum execution time
- **Rate Limiting**: Max 1000 documents per collection per run

### Error Handling
- Errors in one cleanup task don't affect others
- All errors logged with details
- Cleanup results reported with counts
- Failed cleanups retry on next scheduled run

### Monitoring
Each cleanup run logs:
- Total documents cleaned per category
- Number of errors encountered
- Execution timestamp
- Performance metrics

---

## 🚨 Important Notes

### GDPR & Data Privacy
- Customer can request complete data deletion at any time
- Use `deleteCustomerDataClient()` function for GDPR requests
- Deletion includes all messages, appointments, analyses, etc.
- Cannot be undone once executed

### Backup Recommendations
Before enabling auto-cleanup:
1. Enable Firestore automatic backups (7-day retention recommended)
2. Set up Cloud Storage export for critical collections
3. Test cleanup on staging environment first

### Regulatory Compliance
This cleanup policy is designed to:
- ✅ Maintain required business records
- ✅ Preserve customer consent documentation
- ✅ Keep appointment history for tax/accounting
- ✅ Allow GDPR-compliant data deletion
- ✅ Balance storage costs with data retention needs

### Adjusting Retention Periods
To modify retention periods, edit `/functions/src/enhanced-auto-cleanup.ts`:

```typescript
// Example: Change cancelled appointments from 30 to 60 days
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);  // Change to -60
```

After changes:
```bash
cd functions
npm run build
firebase deploy --only functions:enhancedAutoCleanup
```

---

## 📈 Storage Impact

### Before Auto-Cleanup
Estimated monthly growth without cleanup:
- SMS Logs: ~10MB/month
- Messages: ~5MB/month  
- Holds: ~2MB/month
- Cache Entries: ~50MB/month
- **Total: ~67MB/month**

### With Auto-Cleanup
Estimated steady-state storage:
- SMS Logs: ~27MB (90 days)
- Messages: ~5MB (last 50 per customer)
- Holds: <1MB (24 hours)
- Cache Entries: ~50MB (30 days)
- **Total: ~83MB steady state** (vs unlimited growth)

---

## 🔒 Security Considerations

### Access Control
- Auto-cleanup runs with admin privileges
- Manual cleanup requires admin authentication
- Cannot be triggered by customers
- Audit logs maintained for all cleanup operations

### Data Recovery
- No recovery after cleanup (by design)
- Enable Firestore backups for safety net
- Test cleanup policies in staging first
- Export critical data before major cleanups

---

## 📞 Support

### Need to Adjust Cleanup Policy?
Contact your developer or:
1. Review this document
2. Modify retention periods in `/functions/src/enhanced-auto-cleanup.ts`
3. Deploy updated function
4. Monitor cleanup logs

### Cleanup Not Running?
Check:
1. Cloud Scheduler is enabled (Firebase Console → Functions)
2. Function deployed successfully
3. Billing account active
4. Check Function logs for errors

---

## Version History

- **v2.0** (Oct 21, 2025): Enhanced cleanup with 14 categories
- **v1.0** (Initial): Basic cleanup for holds and cancelled appointments

---

**Remember**: This cleanup policy prioritizes regulatory compliance and user experience while keeping database costs manageable. When in doubt, we err on the side of keeping data longer rather than deleting it prematurely.

