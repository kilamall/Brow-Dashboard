#!/bin/bash

# Deploy Email Dark Mode Fix
# Deploys the updated email templates with dark mode support

set -e

echo "🎨 Deploying Email Dark Mode Fix..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root"
  exit 1
fi

# Navigate to functions directory
cd functions

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building functions..."
npm run build

echo "🚀 Deploying email functions..."
firebase deploy --only functions:onAppointmentConfirmedSendEmail,functions:resendAppointmentConfirmation

echo ""
echo "✅ Email dark mode fix deployed successfully!"
echo ""
echo "📧 Test the emails by:"
echo "   1. Creating a test appointment"
echo "   2. Confirming it as admin"
echo "   3. Opening the email in both light and dark mode"
echo ""
echo "💡 To test dark mode:"
echo "   - iOS Mail: Settings → Display & Brightness → Dark"
echo "   - macOS Mail: System Preferences → Appearance → Dark"
echo "   - Gmail: Settings → Theme → Dark"
echo ""

