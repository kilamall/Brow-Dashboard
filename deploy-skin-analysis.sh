#!/bin/bash

# Deploy Skin Analysis Feature
# This script deploys all components of the AI Skin Analysis feature

set -e  # Exit on error

echo "🔬 Deploying AI Skin Analysis Feature..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ Error: firebase.json not found. Please run this script from the project root."
    exit 1
fi

# 1. Deploy Storage Rules
echo -e "${BLUE}📦 Step 1: Deploying Storage Rules...${NC}"
firebase deploy --only storage
echo -e "${GREEN}✓ Storage rules deployed${NC}"
echo ""

# 2. Deploy Firestore Rules
echo -e "${BLUE}🔒 Step 2: Deploying Firestore Rules...${NC}"
firebase deploy --only firestore:rules
echo -e "${GREEN}✓ Firestore rules deployed${NC}"
echo ""

# 3. Build and Deploy Cloud Functions
echo -e "${BLUE}☁️  Step 3: Building and Deploying Cloud Functions...${NC}"
cd functions
npm run build
cd ..
firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts
echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
echo ""

# 4. Build and Deploy Admin App
echo -e "${BLUE}🎨 Step 4: Building Admin App...${NC}"
cd apps/admin
npm run build
cd ../..
echo -e "${GREEN}✓ Admin app built${NC}"

echo -e "${BLUE}🚀 Deploying Admin App...${NC}"
firebase deploy --only hosting:admin
echo -e "${GREEN}✓ Admin app deployed${NC}"
echo ""

# 5. Build and Deploy Booking App
echo -e "${BLUE}🎨 Step 5: Building Booking App...${NC}"
cd apps/booking
npm run build
cd ../..
echo -e "${GREEN}✓ Booking app built${NC}"

echo -e "${BLUE}🚀 Deploying Booking App...${NC}"
firebase deploy --only hosting:booking
echo -e "${GREEN}✓ Booking app deployed${NC}"
echo ""

# Success message
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Skin Analysis Feature Deployed! ✨${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test skin analysis at: https://your-booking-site.web.app/skin-analysis"
echo "2. View analyses in admin at: https://your-admin-site.web.app/skin-analyses"
echo "3. Verify Gemini API key is set: firebase functions:config:get gemini.api_key"
echo ""
echo -e "${YELLOW}Tip:${NC} Check the logs if you encounter issues:"
echo "  firebase functions:log --only analyzeSkinPhoto,analyzeSkinCareProducts"
echo ""
echo "📖 For detailed documentation, see SKIN_ANALYSIS_FEATURE.md"
echo ""

