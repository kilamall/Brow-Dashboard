#!/bin/bash

# Deploy Pricing and Tip Tracking Feature
# Date: October 21, 2025

echo "🚀 Deploying Pricing & Tip Tracking Feature..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build all packages
echo -e "${BLUE}📦 Step 1: Building packages...${NC}"
pnpm run build
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Build failed. Please fix errors and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Packages built successfully${NC}"
echo ""

# Step 2: Deploy Firebase Functions
echo -e "${BLUE}🔧 Step 2: Deploying Firebase Functions...${NC}"
firebase deploy --only functions
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Functions deployment failed. Please check Firebase CLI authentication.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Functions deployed successfully${NC}"
echo ""

# Step 3: Deploy Admin App
echo -e "${BLUE}🎨 Step 3: Deploying Admin Dashboard...${NC}"
firebase deploy --only hosting:admin
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Admin deployment failed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Admin dashboard deployed successfully${NC}"
echo ""

# Step 4: Deploy Booking App
echo -e "${BLUE}🌐 Step 4: Deploying Booking App...${NC}"
firebase deploy --only hosting:booking
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Booking app deployment failed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Booking app deployed successfully${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  🎉 DEPLOYMENT COMPLETE - Pricing & Tips Feature Live! 🎉  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 What's New:${NC}"
echo "  ✅ Edit appointment prices directly in modals"
echo "  ✅ Track tip amounts for accurate revenue"
echo "  ✅ Real-time propagation to all views"
echo "  ✅ Customer spending includes tips"
echo "  ✅ Analytics revenue includes tips"
echo ""
echo -e "${BLUE}📖 Documentation:${NC}"
echo "  📄 PRICING_AND_TIP_TRACKING_FEATURE.md (detailed guide)"
echo "  📄 QUICK_START_PRICING_TIPS.md (quick reference)"
echo ""
echo -e "${BLUE}🔗 Admin Dashboard:${NC} https://bueno-brows-admin.web.app"
echo -e "${BLUE}🔗 Booking Site:${NC} https://bueno-brows-7cce7.web.app"
echo ""
echo -e "${GREEN}Ready to use! Open any appointment to start tracking tips.${NC}"
echo ""

