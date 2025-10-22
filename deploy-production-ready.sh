#!/bin/bash

# Production-Ready Deployment Script
# Deploys all fixes for consent forms, email verification, and skin analysis

set -e  # Exit on any error

echo "=================================================="
echo "Production-Ready Deployment"
echo "Date: $(date)"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory!"
    exit 1
fi

print_status "Starting production deployment..."
echo ""

# Step 1: Clean and install dependencies
echo "Step 1: Installing dependencies..."
if pnpm install; then
    print_status "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi
echo ""

# Step 2: Build the project
echo "Step 2: Building project..."
if pnpm run build; then
    print_status "Project built successfully"
else
    print_error "Build failed"
    exit 1
fi
echo ""

# Step 3: Run linter to check for errors
echo "Step 3: Running linter..."
print_warning "Checking for linter errors..."
# Note: We don't fail on lint errors, just warn
pnpm run lint || print_warning "Linter found some warnings (non-blocking)"
echo ""

# Step 4: Verify Firebase login
echo "Step 4: Verifying Firebase authentication..."
if firebase projects:list > /dev/null 2>&1; then
    print_status "Firebase authenticated"
else
    print_error "Not logged in to Firebase. Run: firebase login"
    exit 1
fi
echo ""

# Step 5: Deploy Firestore rules
echo "Step 5: Deploying Firestore rules..."
if firebase deploy --only firestore:rules; then
    print_status "Firestore rules deployed"
else
    print_error "Failed to deploy Firestore rules"
    exit 1
fi
echo ""

# Step 6: Deploy Storage rules
echo "Step 6: Deploying Storage rules..."
if firebase deploy --only storage; then
    print_status "Storage rules deployed"
else
    print_warning "Storage rules deployment failed (may not be critical)"
fi
echo ""

# Step 7: Deploy Cloud Functions
echo "Step 7: Deploying Cloud Functions..."
print_warning "This may take 5-10 minutes..."
if firebase deploy --only functions; then
    print_status "Cloud Functions deployed"
else
    print_error "Failed to deploy Cloud Functions"
    exit 1
fi
echo ""

# Step 8: Deploy Hosting
echo "Step 8: Deploying Hosting (Admin & Booking apps)..."
if firebase deploy --only hosting; then
    print_status "Hosting deployed"
else
    print_error "Failed to deploy hosting"
    exit 1
fi
echo ""

# Deployment complete
echo "=================================================="
echo -e "${GREEN}✓ DEPLOYMENT COMPLETE!${NC}"
echo "=================================================="
echo ""
echo "Fixes deployed:"
echo "  ✓ Consent forms permission errors fixed"
echo "  ✓ Email verification 400 error fixed"
echo "  ✓ Skin analysis function 500 error fixed"
echo ""
echo "Next steps:"
echo "  1. Test consent forms in customer dashboard"
echo "  2. Test email verification for new signups"
echo "  3. Test skin analysis feature"
echo "  4. Monitor Firebase Console for errors"
echo ""
echo "Rollback if needed:"
echo "  firebase hosting:rollback"
echo ""
echo "Monitor logs:"
echo "  firebase functions:log"
echo ""
echo "=================================================="

