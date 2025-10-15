# Bueno Brows - System Architecture & Data Flow

## 🔄 Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                           │
│                     (bueno-brows-admin.web.app)                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Settings Page → Business Info Tab                       │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Basic Information                                 │   │   │
│  │  │ • Business Name: "Bueno Brows"                    │   │   │
│  │  │ • Email: "hello@buenobrows.com"                   │   │   │
│  │  │ • Phone: "(650) 613-8455"                         │   │   │
│  │  │ • Address: "315 9th Ave, San Mateo, CA 94401"     │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Social Media                                      │   │   │
│  │  │ • Instagram URL: "https://instagram.com/..."     │   │   │
│  │  │ • TikTok URL: "https://tiktok.com/..."           │   │   │
│  │  │ • Google Maps Link: "https://maps.google.com/..." │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Homepage Hero                                     │   │   │
│  │  │ • Hero Title: "Refined. Natural. You."           │   │   │
│  │  │ • Hero Description: "Filipino-inspired..."       │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Newsletter Section                                │   │   │
│  │  │ • Newsletter Title: "Stay on the cutting-edge"   │   │   │
│  │  │ • Newsletter Description: "Get 10% off..."       │   │   │
│  │  │ • Discount Amount: "10%"                         │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  [Save Business Info] ← Click to save                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SAVE (Firestore API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FIRESTORE DATABASE                       │
│                                                                   │
│  Collection: settings                                            │
│  Document: businessInfo                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ {                                                         │   │
│  │   businessName: "Bueno Brows",                           │   │
│  │   email: "hello@buenobrows.com",                         │   │
│  │   phone: "(650) 613-8455",                               │   │
│  │   address: "315 9th Ave, San Mateo, CA 94401",          │   │
│  │   googleMapsLink: "https://maps.google.com/...",         │   │
│  │   instagramUrl: "https://instagram.com/buenobrows/",    │   │
│  │   tiktokUrl: "https://tiktok.com/@buenobrows",          │   │
│  │   heroTitle: "Refined. Natural. You.",                  │   │
│  │   heroDescription: "Filipino-inspired...",              │   │
│  │   newsletterTitle: "Stay on the cutting-edge",          │   │
│  │   newsletterDescription: "Get 10% off...",              │   │
│  │   newsletterDiscount: "10%"                             │   │
│  │ }                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ READ (Firestore API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BOOKING WEBSITE                             │
│                     (bueno-brows-7cce7.web.app)                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Home Page (Home.tsx)                                    │   │
│  │                                                           │   │
│  │  useEffect(() => {                                       │   │
│  │    const docRef = doc(db, 'settings', 'businessInfo');   │   │
│  │    const docSnap = await getDoc(docRef);                 │   │
│  │    setBusinessInfo(docSnap.data());                      │   │
│  │  }, [db]);                                               │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Hero Section                                      │   │   │
│  │  │ <h1>{businessInfo.heroTitle}</h1>                │   │   │
│  │  │ <p>{businessInfo.heroDescription}</p>            │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Contact Information                               │   │   │
│  │  │ <a href="mailto:{businessInfo.email}">           │   │   │
│  │  │   {businessInfo.email}                           │   │   │
│  │  │ </a>                                              │   │   │
│  │  │ <a href="tel:{businessInfo.phone}">              │   │   │
│  │  │   {businessInfo.phone}                           │   │   │
│  │  │ </a>                                              │   │   │
│  │  │ <a href="{businessInfo.googleMapsLink}">         │   │   │
│  │  │   {businessInfo.address}                         │   │   │
│  │  │ </a>                                              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Social Media Links                                │   │   │
│  │  │ <a href="{businessInfo.instagramUrl}">          │   │   │
│  │  │   Instagram                                      │   │   │
│  │  │ </a>                                              │   │   │
│  │  │ <a href="{businessInfo.tiktokUrl}">             │   │   │
│  │  │   TikTok                                         │   │   │
│  │  │ </a>                                              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │ Newsletter Section                                │   │   │
│  │  │ <h2>{businessInfo.newsletterTitle}</h2>          │   │   │
│  │  │ <p>{businessInfo.newsletterDescription}</p>      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
Brow-Admin-Booking-Dashboard/
│
├── apps/
│   ├── admin/                          # Admin Dashboard App
│   │   └── src/
│   │       └── pages/
│   │           └── Settings.tsx        # ← ADMIN PANEL (Edits data)
│   │
│   └── booking/                        # Booking Website App
│       └── src/
│           └── pages/
│               └── Home.tsx            # ← BOOKING SITE (Reads data)
│
└── functions/
    └── src/
        └── sms.ts                      # Cloud Functions (SMS handling)
```

## 🔗 Connection Points

### 1. **Admin Settings Page** (`apps/admin/src/pages/Settings.tsx`)

**Lines 96-107: Business Info Editor Component**
```typescript
function BusinessInfoEditor({ initial, db }: { initial: BusinessInfo; db: any }) {
  const [info, setInfo] = useState<BusinessInfo>(initial);
  
  async function save() {
    await setDoc(doc(db, 'settings', 'businessInfo'), info, { merge: true });
  }
  
  return (
    <div>
      <input value={info.heroTitle} onChange={(e) => setInfo({...info, heroTitle: e.target.value})} />
      <input value={info.email} onChange={(e) => setInfo({...info, email: e.target.value})} />
      // ... more inputs
      <button onClick={save}>Save Business Info</button>
    </div>
  );
}
```

**What it does:**
- Displays form with all business info fields
- When you type, it updates local state
- When you click "Save", it writes to Firestore: `settings/businessInfo`

---

### 2. **Firestore Database** (`settings/businessInfo` document)

**Location:** Firebase Console → Firestore Database

**Document Path:**
```
settings (collection)
  └── businessInfo (document)
      ├── businessName: "Bueno Brows"
      ├── email: "hello@buenobrows.com"
      ├── phone: "(650) 613-8455"
      ├── address: "315 9th Ave, San Mateo, CA 94401"
      ├── googleMapsLink: "https://maps.google.com/..."
      ├── instagramUrl: "https://instagram.com/buenobrows/"
      ├── tiktokUrl: "https://tiktok.com/@buenobrows"
      ├── heroTitle: "Refined. Natural. You."
      ├── heroDescription: "Filipino-inspired beauty studio..."
      ├── newsletterTitle: "Stay on the cutting-edge"
      ├── newsletterDescription: "Get 10% off your first service..."
      └── newsletterDiscount: "10%"
```

---

### 3. **Booking Home Page** (`apps/booking/src/pages/Home.tsx`)

**Lines 32-45: Loading Data from Firestore**
```typescript
const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);

useEffect(() => {
  const loadBusinessInfo = async () => {
    const docRef = doc(db, 'settings', 'businessInfo');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setBusinessInfo(docSnap.data() as BusinessInfo);
    }
  };
  loadBusinessInfo();
}, [db]);
```

**Lines 145-148: Displaying Dynamic Content**
```typescript
<h1>{businessInfo.heroTitle}</h1>
<p>{businessInfo.heroDescription}</p>
```

**Lines 176-178: Dynamic Email Link**
```typescript
<a href={`mailto:${businessInfo.email}`}>
  {businessInfo.email}
</a>
```

**Lines 281-283: Dynamic Newsletter**
```typescript
<h2>{businessInfo.newsletterTitle}</h2>
<p>{businessInfo.newsletterDescription.replace('10%', businessInfo.newsletterDiscount)}</p>
```

---

## 🔄 Complete Data Flow

### **Step 1: Admin Makes Changes**
1. Admin opens: https://bueno-brows-admin.web.app
2. Goes to Settings → Business Info tab
3. Types new content in any field
4. Clicks "Save Business Info"

### **Step 2: Data Saved to Firestore**
```typescript
// In Settings.tsx, line 47-55
async function save() {
  await setDoc(doc(db, 'settings', 'businessInfo'), info, { merge: true });
}
```
- Data is written to Firestore
- Document path: `settings/businessInfo`
- Uses `merge: true` to update only changed fields

### **Step 3: Booking Site Reads Data**
```typescript
// In Home.tsx, line 32-45
useEffect(() => {
  const docRef = doc(db, 'settings', 'businessInfo');
  const docSnap = await getDoc(docRef);
  setBusinessInfo(docSnap.data());
}, [db]);
```
- Booking site fetches data from Firestore
- Happens on page load
- Data is stored in React state

### **Step 4: Content Displays**
```typescript
// Dynamic rendering
<h1>{businessInfo.heroTitle}</h1>
<a href={`mailto:${businessInfo.email}`}>{businessInfo.email}</a>
```
- React renders the dynamic content
- All fields are editable from admin panel

---

## 🔐 Security Rules

**File:** `firebase.rules`

```javascript
match /settings/{doc} {
  allow read: if true;  // Everyone can read
  allow write: if isAdmin();  // Only admins can write
}

function isAdmin() {
  return request.auth != null && request.auth.token.role == 'admin';
}
```

**What this means:**
- ✅ Public can read settings (needed for booking site)
- ✅ Only admins can edit settings
- ✅ Secured by Firebase Authentication

---

## 🎯 Key Technologies

1. **Firebase Firestore** - Database
2. **React** - Frontend framework
3. **TypeScript** - Type safety
4. **Firebase SDK** - Database operations
   - `getDoc()` - Read data
   - `setDoc()` - Write data
   - `doc()` - Reference to document

---

## 📊 Summary

| Component | File | Purpose |
|-----------|------|---------|
| **Admin Panel** | `apps/admin/src/pages/Settings.tsx` | Edit business info |
| **Database** | Firestore `settings/businessInfo` | Store business info |
| **Booking Site** | `apps/booking/src/pages/Home.tsx` | Display business info |
| **Security** | `firebase.rules` | Control access |

---

## 🚀 How to Use

1. **Edit Content:**
   - Go to Admin Dashboard
   - Settings → Business Info
   - Edit any field
   - Click "Save Business Info"

2. **View Changes:**
   - Go to Booking Site
   - Refresh page
   - See updated content

3. **No Code Required:**
   - Everything is editable from admin panel
   - No need to touch code
   - Changes appear instantly

---

## 🔍 Testing the Connection

### Test 1: Change Hero Title
1. Admin: Change "Hero Title" to "Welcome to Bueno Brows"
2. Save
3. Booking Site: Refresh and see new title

### Test 2: Change Email
1. Admin: Change email to "info@buenobrows.com"
2. Save
3. Booking Site: Email link now uses new address

### Test 3: Change Newsletter Discount
1. Admin: Change discount to "15%"
2. Save
3. Booking Site: Newsletter shows "Get 15% off..."

---

## ✅ Everything is Connected!

- Admin Panel writes to Firestore
- Booking Site reads from Firestore
- Changes appear instantly (after page refresh)
- No code changes needed
- Fully managed from admin panel

