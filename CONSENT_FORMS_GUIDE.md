# Consent Forms System - Implementation Guide

## Overview

A comprehensive consent form management system has been added to your booking platform for legal compliance with brow, lash lifts, and other superficial brow procedures. The system supports:

- ✅ **Version control** for consent forms
- ✅ **Digital signatures** with full legal tracking
- ✅ **Guest & authenticated user support**
- ✅ **Automatic renewal notifications** when forms are updated
- ✅ **Admin management interface**
- ✅ **Customer consent history** in user profiles

---

## 🎯 Features

### For Customers (Booking App)

1. **During Booking**
   - Consent form automatically appears before finalizing booking
   - Must scroll through all sections before signing
   - Digital signature via typed name
   - Timestamped consent record

2. **In User Dashboard**
   - View all signed consent forms
   - See consent status (Active / Needs Renewal)
   - Track signature history
   - Get notified when renewal is required

### For Admins (Admin App)

1. **Consent Form Management**
   - Create and manage consent form templates
   - Version control with activation/deactivation
   - View all customer signatures
   - Track compliance statistics

2. **Default Template Included**
   - Pre-configured for brow & lash services
   - Covers all necessary legal sections
   - Ready to use out of the box

---

## 📋 How It Works

### 1. Initial Setup

**Step 1: Create Default Consent Form**
- Navigate to Admin app → "Consent Forms" page
- Click "Create Default Consent Form"
- This creates a legally compliant template for brow/lash services

**Step 2: Review & Customize (Optional)**
- Click "View Details" on the template
- Review all sections
- Customize content if needed for your specific business requirements

### 2. Customer Booking Flow

**For New Customers:**
1. Customer selects service and time slot
2. Fills out guest form or signs in
3. **Consent form appears automatically**
4. Customer must:
   - Scroll through all sections
   - Check required acknowledgments
   - Type their full name as signature
5. Booking is completed with consent recorded

**For Returning Customers:**
- If they've already signed the current version → no consent form shown
- If form was updated → new consent form appears automatically

### 3. Consent Management

**When to Update Consent Forms:**
- Legal requirements change
- Services change significantly
- Annual compliance review
- Insurance requirements update

**How to Update:**
1. Go to Admin → Consent Forms
2. Create new version with updated content
3. Deactivate old version
4. System automatically flags all previous consents for renewal
5. Customers are prompted to sign new version on next booking

---

## 🔧 Technical Implementation

### New Files Created

**Shared Package:**
- `packages/shared/src/consentFormHelpers.ts` - Helper functions for consent management
- Updated `packages/shared/src/types.ts` - Added consent form types

**Booking App:**
- `apps/booking/src/components/ConsentForm.tsx` - Consent form modal component
- Updated `apps/booking/src/pages/Book.tsx` - Integrated consent into booking flow
- Updated `apps/booking/src/pages/ClientDashboard.tsx` - Added consent history section

**Admin App:**
- `apps/admin/src/pages/ConsentForms.tsx` - Full consent form management interface
- Updated `apps/admin/src/App.tsx` - Added consent forms route
- Updated `apps/admin/src/components/Sidebar.tsx` - Added navigation link

**Firebase:**
- Updated `firebase.rules` - Added security rules for consent collections

### Database Collections

**`consentFormTemplates`** - Stores consent form templates
```typescript
{
  id: string;
  name: string;
  version: string;
  category: 'general' | 'brow_services' | 'lash_services' | 'wax' | 'tint' | 'other';
  title: string;
  content: string;
  sections: Array<{
    heading: string;
    content: string;
    required: boolean;
  }>;
  active: boolean;
  effectiveDate: string;
  createdAt: string;
}
```

**`customerConsents`** - Stores customer consent records
```typescript
{
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  consentFormId: string;
  consentFormVersion: string;
  consentFormCategory: string;
  agreed: boolean;
  signature: string;
  userAgent: string;
  consentedAt: string;
  expiresAt?: string;
  needsRenewal?: boolean;
  appointmentId?: string;
}
```

---

## 📝 Default Consent Form Sections

The default template includes:

1. **Services Covered** (Required)
   - Eyebrow shaping, waxing, tinting
   - Lash lifts and tinting
   - Brow lamination
   - Other brow/lash procedures

2. **Pre-Treatment Acknowledgment** (Required)
   - Medical conditions disclosure
   - Medication disclosure (Retin-A, Accutane)
   - Pregnancy status
   - Recent sun exposure

3. **Potential Risks & Side Effects** (Required)
   - Redness, swelling, irritation
   - Allergic reactions
   - Infection risks
   - Result variations

4. **Aftercare Responsibilities** (Required)
   - Avoiding water/steam
   - No touching/rubbing
   - Makeup restrictions
   - Follow-up appointments

5. **Consent & Release** (Required)
   - Service consent
   - Liability release
   - Information accuracy

6. **Photo Release** (Optional)
   - Marketing permission
   - Social media use
   - Portfolio inclusion

---

## 🔒 Legal Compliance Features

### Digital Signatures
- **Typed name signature** - Legally binding electronic signature
- **Timestamp** - Date and time of consent
- **User agent tracking** - Device/browser information
- **IP address ready** - Can be added if needed

### Audit Trail
- All consents permanently stored
- Version tracking
- Cannot be deleted (only archived by admins)
- Full history maintained

### Renewal System
- Automatic flagging when forms are updated
- Customer notification in dashboard
- Required before next appointment
- Clear renewal status indicators

---

## 🎨 User Experience

### Customer View
- **Modern, clean interface** with terracotta brand colors
- **Scroll progress tracking** - Must read all content
- **Clear visual feedback** - Checkboxes for required sections
- **Mobile-responsive** - Works on all devices
- **Accessible** - Proper ARIA labels and keyboard navigation

### Admin View
- **Dashboard statistics** - Active consents, renewals needed
- **Template management** - Easy version control
- **Customer signatures** - View who signed what and when
- **Bulk operations** - Activate/deactivate templates

---

## 🚀 Getting Started (Quick Steps)

1. **Initial Setup (One-Time)**
   ```
   1. Open admin app
   2. Navigate to "Consent Forms"
   3. Click "Create Default Consent Form"
   4. Review the created template
   ```

2. **Test the System**
   ```
   1. Go to booking app
   2. Select a service and time
   3. Fill out guest information
   4. Confirm the consent form appears
   5. Sign and complete booking
   ```

3. **Verify in Admin**
   ```
   1. Go to Admin → Consent Forms
   2. See the new signature in "Recent Signatures"
   3. Check statistics updated
   ```

4. **Customer Can View**
   ```
   1. Customer logs in
   2. Goes to Dashboard
   3. Sees "Consent Forms" section
   4. Views signed consent with details
   ```

---

## 🔄 Updating Consent Forms

### When You Need to Update:

**Scenario 1: Minor Changes (Same Version)**
- Small typo fixes
- Clarification of existing terms
- → Just edit the template directly in Firestore if needed

**Scenario 2: Major Changes (New Version)**
- New legal requirements
- Service changes
- New risk disclosures
- → Create new template version and deactivate old one

### Process for New Version:

1. **Create New Template**
   - Go to Admin → Consent Forms
   - Click "New Template"
   - Set new version number (e.g., "2.0")
   - Update content and sections

2. **Activate New Version**
   - Click "Activate" on new template
   - System automatically deactivates old version
   - Old consents are flagged for renewal

3. **Customer Experience**
   - See notification in dashboard
   - Must sign new version before next booking
   - Old consent remains in history

---

## 🛡️ Security & Privacy

### Data Protection
- **Firestore Security Rules** - Only authorized access
- **Customers can only view their own consents**
- **Admins have full read access**
- **No public access to consent records**

### GDPR/Privacy Compliance
- Customer consent records are clearly tied to specific forms
- Timestamps and versions for audit trail
- Can export customer data if needed
- Secure storage in Firebase

---

## 📊 Admin Features in Detail

### Statistics Dashboard
- **Templates Count** - Total consent form templates
- **Active Consents** - Currently valid signatures
- **Needs Renewal** - Customers requiring re-signature
- **Total Signed** - All-time consent records

### Template Management
- **Create** - New consent form templates
- **Activate/Deactivate** - Control which version is active
- **View Details** - Full template preview
- **Version Control** - Multiple versions per category

### Customer Tracking
- **Recent Signatures** - Last 3 signatures per template
- **Signature Details** - Name, email/phone, date
- **Status Indicators** - Active vs. needs renewal

---

## 🎯 Best Practices

### For Your Business

1. **Review Annually**
   - Check consent forms once per year
   - Update for any new services
   - Verify legal compliance

2. **Keep Records**
   - All consents are automatically stored
   - Export regularly for backup
   - Maintain 7+ years for legal purposes

3. **Update Proactively**
   - When adding new services
   - When insurance requirements change
   - When local regulations update

4. **Customer Communication**
   - Explain why consent is required
   - Highlight it protects both parties
   - Make it easy to review later

### For Customers

1. **Read Carefully**
   - System enforces scrolling through all sections
   - Ensures informed consent

2. **Ask Questions**
   - Contact before booking if unclear
   - Use messaging system for questions

3. **Keep Copy**
   - Customers can view anytime in dashboard
   - Print/save for records

---

## 🐛 Troubleshooting

### Consent Form Not Appearing
**Issue:** Customer books without seeing consent form
**Solution:** 
- Check that at least one template is active
- Verify template category matches service type
- Check browser console for errors

### Customer Can't Sign
**Issue:** "Agree & Sign" button disabled
**Solution:**
- Ensure all required sections are checked
- Verify customer scrolled to bottom
- Check that signature field is filled

### Old Consents Not Flagging
**Issue:** Updated form but old consents not showing renewal needed
**Solution:**
- Manually run `flagConsentsForRenewal()` in admin console
- Check that old template was properly deactivated

---

## 🔮 Future Enhancements (Potential)

- [ ] PDF generation of signed consents
- [ ] Email copy to customer
- [ ] Multiple language support
- [ ] Drawn signature support (canvas)
- [ ] Expiration dates (annual renewal)
- [ ] Service-specific consent forms
- [ ] Custom consent form builder UI
- [ ] Batch export for legal/audit

---

## 📞 Support

If you need to customize the consent forms or add new categories:

1. Use the Admin interface for most changes
2. For complex customizations, modify `DEFAULT_BROW_CONSENT_TEMPLATE` in `consentFormHelpers.ts`
3. For new categories, add to the `category` type in `types.ts`

---

## ✅ Compliance Checklist

- [x] Digital signatures collected
- [x] Timestamps recorded
- [x] Version control implemented
- [x] Customer access to records
- [x] Secure storage
- [x] Admin oversight
- [x] Renewal system
- [x] Audit trail
- [x] Risk disclosures included
- [x] Aftercare instructions included

---

## 🎉 Summary

Your booking system now has a complete, legally compliant consent form system that:
- ✅ Requires consent before booking
- ✅ Tracks all signatures with full audit trail
- ✅ Manages versions and renewals automatically
- ✅ Provides customer access to their consent history
- ✅ Gives admins full control and oversight

The system is production-ready and meets standard compliance requirements for beauty services. Remember to consult with your legal counsel to ensure the consent form content meets your specific local regulations and insurance requirements.

