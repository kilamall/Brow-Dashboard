#!/bin/bash

# Deploy Script with Cache Fix
# This script builds and deploys both apps with proper cache busting

set -e  # Exit on error

echo "🚀 Starting deployment with cache fix..."
echo ""

# Color codes for pretty output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    print_error "firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Build booking app
print_step "Building booking app..."
cd apps/booking
npm run build
if [ $? -eq 0 ]; then
    print_success "Booking app built successfully"
else
    print_error "Booking app build failed"
    exit 1
fi
cd ../..

# Build admin app
print_step "Building admin app..."
cd apps/admin
npm run build
if [ $? -eq 0 ]; then
    print_success "Admin app built successfully"
else
    print_error "Admin app build failed"
    exit 1
fi
cd ../..

echo ""
print_step "Deploying to Firebase..."

# Deploy both apps and functions
firebase deploy --only hosting,functions

if [ $? -eq 0 ]; then
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "✨ Cache Fix Deployed!"
    echo ""
    echo "What's been fixed:"
    echo "  • Service worker now auto-updates"
    echo "  • Users will see update notifications"
    echo "  • No more browser closing required"
    echo "  • Proper cache headers configured"
    echo ""
    echo "Next steps:"
    echo "  1. Test the booking site in a browser"
    echo "  2. Wait 60 seconds (or check DevTools)"
    echo "  3. Look for the update notification"
    echo ""
    echo "To check service worker status:"
    echo "  • Open DevTools (F12)"
    echo "  • Go to Application → Service Workers"
    echo "  • Check console for 'Service Worker X.X.X' logs"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    print_error "Deployment failed"
    exit 1
fi

