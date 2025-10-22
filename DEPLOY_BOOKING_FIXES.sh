#!/bin/bash
# Deployment script for booking email and dashboard fixes
# October 21, 2025

echo "🚀 Deploying Booking Email & Dashboard Fixes..."
echo ""

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
  echo "❌ Error: firebase.json not found. Please run this script from the project root."
  exit 1
fi

echo "📋 Summary of changes:"
echo "  ✅ Fixed: Emails only sent after admin confirmation"
echo "  ✅ Fixed: Push notifications only sent after admin confirmation"
echo "  ✅ Fixed: My Bookings works for phone auth users"
echo ""

# Deploy Cloud Functions
echo "📦 Deploying Cloud Functions..."
firebase deploy --only functions:onAppointmentConfirmedSendEmail,functions:onAppointmentConfirmedNotification,functions:resendAppointmentConfirmation

if [ $? -ne 0 ]; then
  echo "❌ Cloud Functions deployment failed"
  exit 1
fi

echo ""
echo "🌐 Deploying Booking App..."
cd apps/booking
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Booking app build failed"
  exit 1
fi

cd ../..
firebase deploy --only hosting:booking

if [ $? -ne 0 ]; then
  echo "❌ Booking app deployment failed"
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Testing checklist:"
echo "  1. Book appointment as guest → verify NO email sent immediately"
echo "  2. Admin confirms appointment → verify email sent"
echo "  3. Sign in with phone number → verify My Bookings shows appointments"
echo ""
echo "📝 See BOOKING_EMAIL_AND_DASHBOARD_FIX_OCT_21_2025.md for detailed testing instructions"
echo ""

