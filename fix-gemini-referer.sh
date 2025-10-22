#!/bin/bash

# Fix Gemini API HTTP Referer Blocking
# This script helps you update your Gemini API key to work with Cloud Functions

set -e

echo "🔧 Fix Gemini API HTTP Referer Blocking"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Problem:${NC}"
echo "Your Gemini API key has HTTP referrer restrictions that block Cloud Functions."
echo "Cloud Functions don't send referrer headers, causing 403 errors."
echo ""

echo -e "${GREEN}Solution:${NC}"
echo "We need to update your API key restrictions in Google AI Studio."
echo ""

echo -e "${BLUE}Step 1: Open Google AI Studio${NC}"
echo "-------------------------------"
echo ""
echo "Please open this URL in your browser:"
echo ""
echo -e "${GREEN}https://aistudio.google.com/app/apikey${NC}"
echo ""
read -p "Press ENTER when you have the page open..."
echo ""

echo -e "${BLUE}Step 2: Edit Your API Key${NC}"
echo "-------------------------"
echo ""
echo "In Google AI Studio:"
echo "1. Find your Gemini API key in the list"
echo "2. Click the three dots (⋮) menu next to it"
echo "3. Click 'Edit API key' or 'Edit restrictions'"
echo ""
read -p "Press ENTER when you're on the edit page..."
echo ""

echo -e "${BLUE}Step 3: Update Restrictions${NC}"
echo "---------------------------"
echo ""
echo "You have TWO options:"
echo ""
echo -e "${GREEN}Option 1: Remove All Restrictions (RECOMMENDED - Easiest)${NC}"
echo "  1. Find 'Application restrictions' section"
echo "  2. Select 'Don't restrict key' or 'None'"
echo "  3. Click 'Save'"
echo ""
echo -e "${YELLOW}Option 2: Add Specific Referrers (More Secure)${NC}"
echo "  1. Select 'HTTP referrers (web sites)'"
echo "  2. Add these patterns:"
echo "     - *.cloudfunctions.net/*"
echo "     - *.run.app/*"
echo "     - *.web.app/*"
echo "     - *.firebaseapp.com/*"
echo "     - localhost:*/*"
echo "  3. Click 'Save'"
echo ""
read -p "Which option did you choose? (1 or 2): " option
echo ""

echo -e "${GREEN}✅ Great!${NC}"
echo ""
echo "Waiting for changes to propagate (this takes 2-3 minutes)..."
echo ""
echo "While we wait, let's verify your Gemini API key is set in Firebase..."
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not found${NC}"
    echo "Please install it: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Please run: firebase login"
    read -p "Press ENTER after logging in..."
fi

echo ""
echo -e "${BLUE}Step 4: Verify/Update Firebase Secret${NC}"
echo "--------------------------------------"
echo ""

# Try to check if secret exists
echo "Checking if GEMINI_API_KEY secret is set..."
if firebase functions:secrets:access GEMINI_API_KEY &> /dev/null; then
    echo -e "${GREEN}✅ GEMINI_API_KEY is already set${NC}"
    echo ""
    read -p "Do you want to update it with a new key? (y/n): " update_key
    
    if [[ $update_key == "y" || $update_key == "Y" ]]; then
        echo ""
        echo "Please enter your Gemini API key (starts with AIza...):"
        firebase functions:secrets:set GEMINI_API_KEY
        echo ""
        echo -e "${GREEN}✅ API key updated!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY not set${NC}"
    echo ""
    echo "Let's set it now."
    echo "Please enter your Gemini API key (starts with AIza...):"
    firebase functions:secrets:set GEMINI_API_KEY
    echo ""
    echo -e "${GREEN}✅ API key set!${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Deploy Functions${NC}"
echo "------------------------"
echo ""
read -p "Do you want to redeploy your AI functions now? (y/n): " deploy
echo ""

if [[ $deploy == "y" || $deploy == "Y" ]]; then
    echo "Deploying AI-related Cloud Functions..."
    echo ""
    
    firebase deploy --only functions:analyzeSkinPhoto,functions:analyzeSkinCareProducts,functions:aiChatbot,functions:smsAIWebhook
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Functions deployed successfully!${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  Some functions may not exist yet. That's okay!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping deployment. Remember to deploy later:${NC}"
    echo "   firebase deploy --only functions"
fi

echo ""
echo -e "${BLUE}Step 6: Test the Fix${NC}"
echo "-------------------"
echo ""
echo "Let's test if the fix worked..."
echo ""
echo "Waiting 30 seconds for changes to propagate..."
sleep 30

echo ""
echo "Checking recent function logs..."
firebase functions:log --only analyzeSkinPhoto --limit 20 2>/dev/null || echo "No logs yet (this is okay if you haven't used the feature)"

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "===================="
echo "Next Steps:"
echo "===================="
echo ""
echo "1. Test Skin Analysis:"
echo "   - Go to your customer portal"
echo "   - Navigate to 'Skin Analysis'"
echo "   - Upload a test photo"
echo "   - Should work without 403 errors!"
echo ""
echo "2. Monitor Logs:"
echo "   firebase functions:log --only analyzeSkinPhoto"
echo ""
echo "3. Check Usage:"
echo "   Visit: https://aistudio.google.com/"
echo ""
echo "4. If still having issues:"
echo "   - Wait 5-10 minutes for full propagation"
echo "   - Try creating a NEW API key with no restrictions"
echo "   - Check: firebase functions:log for specific errors"
echo ""
echo "===================="
echo -e "${GREEN}Documentation:${NC} See FIX_HTTP_REFERER_BLOCKING.md"
echo "===================="
echo ""
echo -e "${GREEN}🎉 Done! Your AI analytics should now work properly.${NC}"
echo ""

