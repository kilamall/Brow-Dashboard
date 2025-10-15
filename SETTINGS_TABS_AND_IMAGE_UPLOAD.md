# Settings Page Update: Tabs & Image Upload

## ✅ What's New

### **1. Tab Navigation in Settings**
The settings page now has a beautiful tabbed interface for better organization:

- **🏢 Business Info** - Contact details and social media
- **📝 Website Content** - Homepage text, images, and promotions
- **🕐 Business Hours** - Operating schedule
- **📊 Analytics** - Revenue targets

### **2. Hero Image Upload**
You can now upload images directly to Firebase Storage instead of pasting URLs!

**Features:**
- ✅ **Drag & Drop or Click** - Easy file selection
- ✅ **Image Preview** - See your image before saving
- ✅ **Progress Indicator** - Know when upload is complete
- ✅ **File Validation** - Only accepts images (JPG, PNG, WebP)
- ✅ **Size Limit** - Max 5MB per image
- ✅ **Delete Button** - Remove images with one click
- ✅ **Automatic URL** - No need to paste URLs anymore

---

## 🚀 How to Use Image Upload

### **Step 1: Enable Firebase Storage**

Before you can upload images, you need to enable Firebase Storage:

1. Go to: https://console.firebase.google.com/project/bueno-brows-7cce7/storage
2. Click **"Get Started"**
3. Choose **Production mode** or **Test mode** (Production is recommended with our security rules)
4. Select your location (us-central1 recommended)
5. Click **Done**

### **Step 2: Deploy Storage Rules**

After enabling Storage, run this command to deploy the security rules:

```bash
cd /Users/kilam/Desktop/Admin-Github/Brow-Admin-Booking-Dashboard
firebase deploy --only storage
```

This will deploy the security rules that allow:
- ✅ Admins to upload/delete images
- ✅ Everyone to view images
- ✅ Organized folders (hero-images, gallery, service-images, etc.)

### **Step 3: Upload Your Hero Image**

1. Go to **Admin Settings** → **Website Content** tab
2. Scroll to the **Hero Section**
3. Click **"Upload Image"** (or "Change Image" if one exists)
4. Select an image from your computer
5. Wait for upload to complete (you'll see "Image uploaded successfully!")
6. Click **"Save Website Content"** to save all changes
7. Your image will now appear on the homepage!

---

## 📐 Image Specifications

### **Recommended Sizes:**
- **Hero Image**: 1200x600px (2:1 ratio)
- **Gallery Images**: 800x600px (4:3 ratio)
- **Service Images**: 600x600px (1:1 ratio)

### **Supported Formats:**
- JPG/JPEG
- PNG
- WebP
- GIF

### **File Size Limit:**
- Maximum: 5MB per image
- Recommended: Under 1MB for faster loading

---

## 🎨 Updated Settings Layout

### **Business Info Tab**
```
Business Name           [Input Field]
Phone Number            [Input Field]
Email Address           [Input Field]
Street Address          [Input Field]
City | State | ZIP      [3 Input Fields]

Social Media:
  @Instagram            [Input Field]
  @TikTok              [Input Field]
  Facebook             [Input Field]

[Save Business Info]
```

### **Website Content Tab**
```
🖼️ Hero Section
  Title                [Input Field]
  Subtitle             [Textarea]
  Image                [Upload Button + Preview]

🔘 Call-to-Action Buttons
  Primary Button       [Input Field]
  Secondary Button     [Input Field]

📖 About Section
  About Text           [Textarea]

🎁 Bueno Circle
  [x] Enabled
  Title                [Input Field]
  Description          [Textarea]
  Discount %           [Number Input]

[Save Website Content]
```

### **Business Hours Tab**
```
Timezone               [Input Field]
Slot Interval          [Number Input]

Sunday    [Add hours] or [Closed]
  09:00 — 17:00 [Remove]

Monday    [Add hours]
  ...

[Save Business Hours]

Preview Available Slots
  Date: [Date Picker]
  Duration: [Number Input]
  [Grid of available time slots]
```

### **Analytics Tab**
```
Daily Target ($)       [Number Input]
Weekly Target ($)      [Number Input]
Monthly Target ($)     [Number Input]
Default COGS (%)       [Number Input]

[Save Targets]
```

---

## 🔒 Security (Storage Rules)

The storage rules ensure:

1. **Public Read Access** - Anyone can view uploaded images
2. **Admin-Only Write** - Only users with `admin: true` token can upload/delete
3. **Organized Folders**:
   - `/hero-images/` - Homepage hero images
   - `/gallery/` - Gallery photos
   - `/service-images/` - Service-specific images
   - `/profile-images/{userId}/` - User profile pictures

4. **File Naming** - Automatic timestamped filenames prevent conflicts

---

## 📝 Technical Details

### **Upload Process:**

1. User selects an image file
2. File is validated (type and size)
3. File is uploaded to Firebase Storage at `/hero-images/{timestamp}-{filename}`
4. Download URL is retrieved
5. URL is saved to Firestore in `settings/homePageContent`
6. Image appears on homepage immediately

### **Storage Path Structure:**
```
bueno-brows-7cce7.firebasestorage.app/
├── hero-images/
│   └── 1697123456789-hero.jpg
├── gallery/
│   ├── 1697123456790-image1.jpg
│   └── 1697123456791-image2.jpg
└── service-images/
    ├── 1697123456792-brows.jpg
    └── 1697123456793-lashes.jpg
```

### **Firestore Data:**
```javascript
settings/homePageContent {
  heroTitle: "Refined. Natural. You.",
  heroSubtitle: "Filipino-inspired beauty studio...",
  heroImageUrl: "https://firebasestorage.googleapis.com/.../hero.jpg",
  // ... other fields
}
```

---

## 🎯 Benefits of New Layout

### **Before:**
- ❌ All settings in one long scrolling page
- ❌ Hard to find specific settings
- ❌ No visual organization
- ❌ Manual URL pasting for images

### **After:**
- ✅ **Tab Navigation** - Quick access to different sections
- ✅ **Organized Layout** - Related settings grouped together
- ✅ **Visual Icons** - Easy identification of sections
- ✅ **Direct Upload** - No more URL hunting
- ✅ **Image Preview** - See what you're uploading
- ✅ **Better UX** - Professional admin experience

---

## 🚀 What's Live Now

**Admin App**: https://bueno-brows-admin.web.app/settings

**Tabs Available:**
1. Business Info
2. Website Content (with image upload!)
3. Business Hours
4. Analytics

**Note:** Storage upload will work once you enable Firebase Storage in the console!

---

## 📋 Next Steps

### **To Activate Image Upload:**

1. **Enable Firebase Storage** (see Step 1 above)
2. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```
3. **Upload Your First Image!**

### **Future Enhancements:**

- [ ] Gallery management (multiple image uploads)
- [ ] Service-specific images
- [ ] Logo upload
- [ ] Image cropping/editing tools
- [ ] Drag & drop reordering for galleries

---

## 🎉 Summary

You now have:
- ✅ **Tabbed Settings** - Better organization
- ✅ **Image Upload** - Direct file upload to Firebase Storage
- ✅ **Security Rules** - Admin-only upload permissions
- ✅ **Image Preview** - See before you save
- ✅ **Professional UI** - Clean, modern interface

**All code is deployed and ready to use!** Just enable Firebase Storage in the console to start uploading images.

