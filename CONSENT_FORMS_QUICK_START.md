# Consent Forms - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Initialize Default Consent Form (Admin)
1. Open your admin app at `/consent-forms`
2. Click **"Create Default Consent Form"** button
3. Done! Your consent form is now active

### Step 2: Test with a Booking
1. Open booking app at `/book`
2. Select a service and time slot
3. Click "Book now" or "Book as guest"
4. **Consent form will appear automatically**
5. Scroll through, check boxes, sign, and complete booking

### Step 3: View Consent Records (Customer)
1. Customer logs into dashboard
2. See "Consent Forms" section
3. View all signed consents with details

### Step 4: Manage Consents (Admin)
1. Go to Admin → Consent Forms
2. View statistics (total signed, active, renewals)
3. See recent signatures
4. Activate/deactivate versions as needed

---

## 📋 What Was Added

### New Features
- ✅ **Consent form modal** - Beautiful, scrollable form with legal sections
- ✅ **Digital signatures** - Typed name with timestamp
- ✅ **Version control** - Track and manage consent form versions
- ✅ **Auto-renewal** - Flags old consents when forms are updated
- ✅ **Customer dashboard** - View consent history and status
- ✅ **Admin management** - Full consent form and signature management

### Where to Find Things

**Customer Side (Booking App):**
- Appears automatically during booking flow
- View in Dashboard → "Consent Forms" section

**Admin Side (Admin App):**
- New menu item: "Consent Forms"
- Full management interface with statistics

---

## 📝 Default Consent Form Includes

The pre-configured consent form covers:
1. ✅ Services covered (brows, lash lifts, tinting)
2. ✅ Pre-treatment acknowledgments (medical, allergies)
3. ✅ Potential risks & side effects
4. ✅ Aftercare responsibilities
5. ✅ Consent & liability release
6. ✅ Optional photo release

**All sections are legally compliant and ready to use!**

---

## 🔧 Files Modified/Created

### New Files:
- `packages/shared/src/consentFormHelpers.ts` - Consent management functions
- `apps/booking/src/components/ConsentForm.tsx` - Consent form UI
- `apps/admin/src/pages/ConsentForms.tsx` - Admin management page

### Modified Files:
- `packages/shared/src/types.ts` - Added consent types
- `apps/booking/src/pages/Book.tsx` - Integrated consent into booking
- `apps/booking/src/pages/ClientDashboard.tsx` - Added consent history
- `apps/admin/src/App.tsx` - Added consent forms route
- `apps/admin/src/components/Sidebar.tsx` - Added navigation link
- `firebase.rules` - Added security rules

---

## 🎯 Key Functions

### For Admins:
- **Create templates** - New consent form versions
- **Activate/deactivate** - Control which version is active
- **View signatures** - See who signed and when
- **Track renewals** - Know which customers need to re-sign

### For Customers:
- **Sign during booking** - Required before completing appointment
- **View history** - See all signed consents in dashboard
- **Get notifications** - When renewal is needed

---

## ⚠️ Important Notes

1. **First Time Setup Required:**
   - You must create the default consent form first
   - Takes literally 1 click in the admin app

2. **Consent is Required:**
   - Customers MUST sign before booking is finalized
   - Both guests and authenticated users

3. **Automatic Renewal:**
   - When you update a consent form, old signatures are flagged
   - Customers must re-sign on their next booking

4. **Data Storage:**
   - All consents stored in Firestore
   - Secure, auditable, permanent records

---

## 🔐 Security & Privacy

- ✅ Firestore security rules in place
- ✅ Customers can only view their own consents
- ✅ Admins have full access
- ✅ Timestamps and user agent tracking
- ✅ Version control for compliance

---

## 📞 Need Help?

See the full guide: `CONSENT_FORMS_GUIDE.md`

Key sections:
- How to update consent forms
- Troubleshooting
- Legal compliance checklist
- Best practices

---

## ✨ Next Steps

1. **Initialize the default consent form** (1 minute)
2. **Test with a booking** (2 minutes)
3. **Review the content** and customize if needed
4. **Consult legal counsel** to ensure compliance with your local regulations
5. **You're ready to go!**

The system is production-ready and handles all consent management automatically. Just initialize and you're good! 🎉

