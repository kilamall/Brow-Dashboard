# 🗑️ Customer Deletion - Quick Reference

## One-Page Cheat Sheet

---

### 🚀 To Deploy

```bash
npm run build
firebase deploy --only functions:deleteCustomerData,hosting:admin
```

---

### 🎯 To Delete a Customer

1. **Admin Panel** → **Customers**
2. Click **"Delete All Data"** button
3. Confirm deletion ✅
4. Choose auth account option ✅
5. Done! 🎉

---

### 🗂️ What Gets Deleted

```
✅ Customer profile
✅ All appointments
✅ All messages
✅ All SMS conversations  
✅ All consent forms
✅ All skin analyses
✅ All reviews
✅ Push notification tokens
✅ Availability slots
✅ Temporary holds
✅ Firebase Auth (optional)
```

---

### ⚠️ Important

- **PERMANENT** - Cannot be undone!
- **Admin only** - Requires admin role
- **Takes 2-10 seconds** - Depending on data
- **GDPR compliant** - Right to be forgotten ✅

---

### 🆚 Delete vs Block

| Action | When | Result |
|--------|------|--------|
| **Block** | Temporary | Can't book, data stays |
| **Delete** | Permanent | Everything gone forever |

---

### 🔑 Auth Account Choice

**Delete Auth (OK):**
- Can't log in anymore
- Complete removal

**Keep Auth (Cancel):**
- Data deleted, login works
- Can create new profile

---

### 📚 Documentation

| File | Purpose |
|------|---------|
| `CUSTOMER_DATA_DELETION_GUIDE.md` | Full user guide |
| `DEPLOY_CUSTOMER_DELETION.md` | Deployment steps |
| `CUSTOMER_DELETION_IMPLEMENTATION_SUMMARY.md` | Technical details |

---

### 🐛 Troubleshooting

**Error?**
1. Check you're logged in as admin
2. Check browser console (F12)
3. Check Firebase Functions logs
4. Try again

---

### ✅ Before Production

- [ ] Deploy function
- [ ] Test with test customer
- [ ] Verify all data deleted
- [ ] Review with team
- [ ] Update data policy

---

### 📞 Quick Help

**Function not found?**
→ Deploy: `firebase deploy --only functions:deleteCustomerData`

**Permission denied?**
→ Verify admin role in Firebase Console

**Takes too long?**
→ Normal for customers with lots of data (wait up to 60s)

---

## That's It! 🎉

Simple one-click deletion that handles everything automatically.

**No more manual Firebase cleanup!** ✨

---

*For detailed information, see the full guides.*

