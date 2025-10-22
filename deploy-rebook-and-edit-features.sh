#!/bin/bash

# Deployment script for Quick Rebook and Edit Appointment features
# Date: $(date +"%Y-%m-%d")

set -e  # Exit on any error

echo "🚀 Starting deployment of Quick Rebook and Edit Appointment features..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "${BLUE}Step 1: Installing dependencies...${NC}"
pnpm install
echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "${BLUE}Step 2: Running linter...${NC}"
pnpm run lint || {
    echo "${YELLOW}⚠️  Linter found issues. Attempting to fix...${NC}"
    pnpm run lint:fix || echo "${YELLOW}⚠️  Some linting issues may need manual review${NC}"
}
echo "${GREEN}✅ Linting complete${NC}"
echo ""

echo "${BLUE}Step 3: Building applications...${NC}"
echo "Building booking app..."
pnpm --filter @buenobrows/booking build
echo "Building admin app..."
pnpm --filter @buenobrows/admin build
echo "${GREEN}✅ Build complete${NC}"
echo ""

echo "${BLUE}Step 4: Deploying to Firebase...${NC}"
echo ""
echo "${YELLOW}⚠️  IMPORTANT: Review the following changes before deploying:${NC}"
echo "  ✓ Customer 'Book Again' button on past appointments"
echo "  ✓ Customer 'Edit' button on upcoming appointments"
echo "  ✓ Admin 'Quick Rebook' from appointment details"
echo "  ✓ Admin 'Quick Rebook' from customer profiles"
echo "  ✓ Book.tsx improvements (hold creation fixes)"
echo ""

read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "${BLUE}Deploying hosting...${NC}"
    firebase deploy --only hosting
    echo ""
    echo "${GREEN}✅ Deployment complete!${NC}"
    echo ""
    echo "${GREEN}🎉 Successfully deployed:${NC}"
    echo "  ✓ Quick Rebook Feature"
    echo "  ✓ Edit Appointment Feature"
    echo "  ✓ Book.tsx improvements"
    echo ""
    echo "${BLUE}📋 Post-deployment checklist:${NC}"
    echo "  1. Test 'Book Again' on customer dashboard"
    echo "  2. Test 'Edit' on customer upcoming appointments"
    echo "  3. Test 'Quick Rebook' from admin appointment modal"
    echo "  4. Test 'Quick Rebook' from admin customer modal"
    echo "  5. Test slot reservation improvements on booking page"
    echo ""
    echo "${BLUE}📚 Documentation:${NC}"
    echo "  - See QUICK_REBOOK_FEATURE.md for detailed feature documentation"
    echo "  - See CUSTOMER_EDIT_APPOINTMENTS.md for edit feature details"
    echo ""
else
    echo ""
    echo "${YELLOW}Deployment cancelled by user${NC}"
    exit 0
fi

