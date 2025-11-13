# 📱 SMS Cost Tracking - Quick Start Guide

## ✅ What's New?

Your cost monitoring dashboard now **automatically tracks Twilio SMS costs** alongside all your other Firebase and third-party service costs!

---

## 🚀 How to View SMS Costs

### Step 1: Navigate to Cost Monitoring
1. Log into your **Admin Dashboard**
2. Click **"Cost Monitoring"** in the navigation menu (or go to `/cost-monitoring`)

### Step 2: View Your Costs
You'll immediately see:
- **Total Monthly Cost** (including SMS)
- **Budget Status** (Safe/Warning/Critical)
- **Efficiency Score** (cost vs. revenue)

### Step 3: Check SMS Details
Scroll down to the **"Service Breakdown"** section and find the **"Twilio"** card:

```
┌─────────────────────────────┐
│ Twilio                 $3.33│
├─────────────────────────────┤
│ Sms Sent: 200              │
│ Sms Received: 100          │
└─────────────────────────────┘
```

---

## 💰 Understanding SMS Costs

### Pricing (US Numbers)
- **Outgoing SMS**: $0.0079 per message (~$0.79 per 100 messages)
- **Incoming SMS**: $0.0075 per message (~$0.75 per 100 messages)
- **Phone Number**: $1.00 per month (~$0.033 per day)

### Example Monthly Costs

| Scenario | Sent | Received | Phone # | **Total** |
|----------|------|----------|---------|-----------|
| **Low Usage** | 50 | 25 | $1.00 | **$1.59** |
| **Medium Usage** | 200 | 100 | $1.00 | **$3.33** |
| **High Usage** | 500 | 250 | $1.00 | **$7.82** |

---

## 🎯 Key Features

### ✅ Real-Time Tracking
- Updates every time you send/receive an SMS
- No manual entry required
- Pulls from actual `sms_logs` collection

### ✅ Smart Recommendations
The system will alert you if:
- SMS usage is high (>100 messages/month)
- SMS costs exceed 30% of total costs
- Optimization opportunities exist

### ✅ Historical Data
- View 30-day cost trends
- Compare month-over-month
- Identify cost spikes

---

## 🔍 Quick Checks

### Is SMS tracking working?

**Check 1**: Send a test SMS
1. Go to your SMS management page
2. Send a test message to a customer
3. Wait 1-2 minutes
4. Refresh Cost Monitoring page
5. SMS count should increase by 1

**Check 2**: Look at the logs
1. Go to Firestore in Firebase Console
2. Open `sms_logs` collection
3. Look for recent entries with `provider: 'twilio'`

### Common Questions

**Q: Why are my SMS costs $0?**
- You haven't sent any SMS this month yet
- SMS is not active (check Twilio setup)
- You're using AWS SNS instead (update pricing)

**Q: When do costs update?**
- **Real-time**: Click "Refresh" button anytime
- **Automatic**: Every day at 2 AM PST

**Q: What if I use AWS SNS instead of Twilio?**
- The system will detect AWS SNS messages
- Update pricing constants in `cost-monitoring.ts`
- AWS SNS: ~$0.00645 per SMS (no phone number fee)

---

## 💡 Cost Optimization Tips

### 1. Use Templates
Pre-defined messages are more efficient than unique ones.

### 2. Batch Notifications
Group similar messages together when possible.

### 3. Cache Common Responses
For AI-powered SMS, cache frequently asked questions.

### 4. Monitor Usage
Check the dashboard weekly to catch anomalies early.

---

## 📊 What's Being Tracked?

### Automatic Detection
The system automatically counts:
- ✅ Outbound SMS (admin → customer)
- ✅ Inbound SMS (customer → admin)
- ✅ Phone number rental cost (prorated daily)

### Excluded
These are NOT counted:
- ❌ Failed SMS attempts
- ❌ Cancelled appointments
- ❌ AWS SNS messages (unless you configure it)

---

## 🛠️ Technical Details

### Files Updated
1. **Backend**: `functions/src/cost-monitoring.ts`
   - Added Twilio pricing constants
   - Added SMS usage tracking from `sms_logs`
   - Added cost calculation logic

2. **Frontend**: `apps/admin/src/pages/CostMonitoring.tsx`
   - Updated to display SMS metrics
   - Added SMS card to service breakdown

3. **Types**: `packages/shared/src/types.ts`
   - Added `twilio` to `UsageStats` interface
   - Added `twilio` to `CostMetrics` interface

### No Deployment Needed!
The changes are ready to use immediately. Just:
1. Restart your development server (if running locally)
2. Or wait for the next auto-deployment (if using hosting)

---

## 🎉 Benefits

✅ **Accurate Costs** - Know exactly what SMS is costing you  
✅ **Unified View** - All costs in one dashboard  
✅ **Smart Alerts** - Get notified of high usage  
✅ **Optimization** - Save money with recommendations  
✅ **Zero Setup** - Works automatically

---

## 📞 Need Help?

**View SMS Logs**:
```
Firebase Console → Firestore → sms_logs collection
```

**Check Function Logs**:
```bash
firebase functions:log --only getCurrentUsage
firebase functions:log --only syncFirebaseCosts
```

**Review Cost Monitoring Code**:
```
functions/src/cost-monitoring.ts (lines 533-575)
```

---

## 📈 Next Steps

1. **Review Current Costs**: Check your dashboard now
2. **Set Budget Alerts**: Configure in Settings (if not already done)
3. **Monitor Weekly**: Make it a habit to check costs every Monday
4. **Optimize**: Follow recommendations to reduce costs

---

**Updated**: November 13, 2025  
**Status**: ✅ Live & Ready to Use

Enjoy your new SMS cost tracking! 🎉

