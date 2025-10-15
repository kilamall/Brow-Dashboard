# 🔬 AI Skin Analysis Feature

## Overview

The AI Skin Analysis feature allows customers to upload photos of their face or skincare products to receive personalized AI-powered recommendations using Google Gemini Vision API.

## Features

### 1. **Skin Photo Analysis** 📸
- Upload a clear photo of your face
- Get personalized skin type analysis
- Identify skin concerns (acne, wrinkles, texture issues, etc.)
- Receive tailored skincare recommendations
- Get service recommendations with frequency suggestions

### 2. **Skincare Product Analysis** 🧴
- Upload photos of your skincare products
- Get correct product usage order
- Receive AM/PM routine instructions
- Check product compatibility
- Get recommendations to improve your routine

## How It Works

### For Customers (Booking App)

1. **Navigate to Skin Analysis**
   - Click "Skin Analysis" in the navigation menu
   - Choose between skin photo or product analysis

2. **Upload Image**
   - Select a high-quality photo
   - For skin analysis: Use natural lighting, face the camera directly
   - For products: Ensure product labels are visible

3. **Provide Information** (for guest users)
   - Enter your name and email to receive results

4. **Get Results**
   - AI analyzes your photo in real-time
   - Receive detailed recommendations
   - View recommended services with booking links

### For Admins (Admin Dashboard)

1. **View All Analyses**
   - Navigate to "Skin Analyses" in the admin sidebar
   - See all customer analyses in one place

2. **Filter and Search**
   - Filter by type (skin vs. products)
   - View statistics (total, completed, pending, errors)

3. **Review Details**
   - Click "View" to see full analysis
   - Review customer information
   - See all recommendations and services suggested

4. **Manage Analyses**
   - Delete analyses as needed
   - Monitor analysis status

## Technical Implementation

### Frontend Components

**Booking App:**
- `/apps/booking/src/pages/SkinAnalysis.tsx` - Customer-facing analysis page
- Navigation updated in `App.tsx` and `Navbar.tsx`

**Admin App:**
- `/apps/admin/src/pages/SkinAnalyses.tsx` - Admin management page
- Added to admin routing and sidebar

### Backend Functions

**Cloud Functions:**
- `analyzeSkinPhoto` - Analyzes facial skin photos
- `analyzeSkinCareProducts` - Analyzes skincare product photos

Located in: `/functions/src/skin-analysis.ts`

### Data Model

**SkinAnalysis Type:**
```typescript
{
  id: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  type: 'skin' | 'products';
  imageUrl: string;
  analysis: {
    skinType?: string;
    concerns?: string[];
    recommendations?: string[];
    recommendedServices?: Array<{
      serviceName: string;
      reason: string;
      frequency: string;
    }>;
    productAnalysis?: {
      products?: Array<{
        name: string;
        usage: string;
        order: number;
        suitability: string;
      }>;
      routine?: string;
    };
    summary: string;
  };
  status: 'pending' | 'completed' | 'error';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}
```

### Security

**Firebase Storage Rules:**
- Authenticated users: `skin-analysis/{userId}/{imageId}`
- Guest users: `skin-analysis-guest/{analysisId}`
- Users can only access their own analyses
- Admins can access all analyses

**Firestore Security Rules:**
- Users can create analyses (including guests)
- Users can read/update their own analyses
- Admins have full access

## Services Recommended

The AI can recommend the following services based on skin analysis:

1. **Brow Shaping** - Enhances facial symmetry
2. **Brow Tinting** - Adds definition to brows
3. **Brow Lamination** - Creates fuller, polished brows
4. **Facial Waxing** - Removes unwanted facial hair
5. **Lash Lift** - Enhances natural lashes
6. **Dermaplaning** - Exfoliates and smooths skin
7. **Chemical Peel** - Improves texture and reduces fine lines

## Deployment

### 1. Deploy Storage Rules
```bash
firebase deploy --only storage
```

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Cloud Functions
```bash
cd functions
npm run build
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts
```

### 4. Deploy Frontend Apps

**Admin App:**
```bash
cd apps/admin
npm run build
firebase deploy --only hosting:admin
```

**Booking App:**
```bash
cd apps/booking
npm run build
firebase deploy --only hosting:booking
```

### 5. Deploy Everything at Once
```bash
firebase deploy
```

## Environment Setup

### Prerequisites

1. **Gemini API Key** (Required)
   - Already set up in your environment
   - Used for AI vision analysis
   - Get one at: https://makersuite.google.com/app/apikey

2. **Firebase Storage** (Required)
   - Already configured
   - Used for image uploads

3. **Firebase Functions** (Required)
   - Already configured
   - Processes image analysis

## Usage Tips

### For Best Results (Skin Analysis)

1. ✅ **Good Lighting** - Natural window light is ideal
2. ✅ **Clean Face** - Remove makeup for accurate analysis
3. ✅ **Face Camera** - Look directly at the camera
4. ✅ **Clear Photo** - Ensure your face is in focus
5. ❌ **Avoid Filters** - No Instagram/Snapchat filters

### For Best Results (Product Analysis)

1. ✅ **Clear Labels** - Make sure product names are visible
2. ✅ **Multiple Products** - Include your full routine
3. ✅ **Good Lighting** - Ensure labels are readable
4. ✅ **Flat Surface** - Lay products on a flat surface
5. ❌ **Avoid Clutter** - Focus on skincare products only

## Cost Considerations

### Gemini API Pricing
- Free tier: 60 requests per minute
- Paid tier: $0.00025 per image for Gemini 1.5 Flash
- Very affordable for most businesses

### Firebase Storage
- First 5GB stored: Free
- First 1GB transferred per day: Free
- Additional: $0.026/GB stored, $0.12/GB transferred

### Recommendations
- Monitor usage in Firebase Console
- Set up billing alerts
- Consider implementing rate limiting for high traffic

## Testing

### Test Skin Analysis

1. Go to your booking site: `/skin-analysis`
2. Select "Skin Analysis"
3. Upload a clear face photo
4. Enter your details (if guest)
5. Click "Analyze My Skin"
6. Review the AI-generated results

### Test Product Analysis

1. Go to your booking site: `/skin-analysis`
2. Select "Product Analysis"
3. Upload a photo of skincare products
4. Enter your details (if guest)
5. Click "Analyze My Products"
6. Review the routine recommendations

### Admin Testing

1. Log into admin dashboard
2. Navigate to "Skin Analyses"
3. View all customer analyses
4. Click "View" to see details
5. Test filtering and statistics

## Troubleshooting

### Analysis Fails

**Problem:** Analysis returns an error
**Solutions:**
1. Check Gemini API key is set in Firebase Functions config
2. Verify image is under 5MB
3. Ensure image is a valid format (JPEG, PNG)
4. Check Cloud Function logs: `firebase functions:log`

### Image Upload Fails

**Problem:** Can't upload images
**Solutions:**
1. Verify storage rules are deployed
2. Check file size (must be < 5MB)
3. Verify Firebase Storage is enabled
4. Check browser console for errors

### No Results Displayed

**Problem:** Analysis completes but no results shown
**Solutions:**
1. Check Firestore rules are deployed
2. Verify the `skinAnalyses` collection exists
3. Check browser console for errors
4. Verify user has read permissions

## Future Enhancements

Potential improvements to consider:

1. **Email Results** - Send analysis results via email
2. **Save History** - Let users view past analyses
3. **Compare Results** - Track skin improvement over time
4. **Video Analysis** - Analyze skin from video
5. **Multi-Photo Upload** - Analyze multiple angles
6. **Export Reports** - Download PDF reports
7. **Share Results** - Share with friends/dermatologist
8. **Product Recommendations** - Suggest specific products to purchase
9. **Booking Integration** - Auto-book recommended services
10. **Progress Tracking** - Track skin health over time

## Support

For questions or issues:
1. Check Firebase Functions logs: `firebase functions:log`
2. Check browser console for frontend errors
3. Review Firestore/Storage rules
4. Verify Gemini API key is configured

## Disclaimer

⚠️ **Important:** This AI analysis is for informational purposes only and should not replace professional medical advice. Users with specific skin concerns should consult with a dermatologist or licensed skincare professional.

---

## Summary

The AI Skin Analysis feature provides:
- ✅ Automated skin type identification
- ✅ Personalized recommendations
- ✅ Service suggestions with frequency
- ✅ Product routine optimization
- ✅ Guest and authenticated user support
- ✅ Admin management dashboard
- ✅ Secure image storage
- ✅ Real-time AI analysis

This feature enhances customer engagement, provides value-added services, and can help drive bookings through personalized service recommendations.

