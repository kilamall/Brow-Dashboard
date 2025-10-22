#!/bin/bash
# Deploy fix for booking request email link
# This fixes the admin notification email to properly link to the appointment

echo "🔧 Deploying Email Link Fix..."
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root directory"
  exit 1
fi

# Step 1: Deploy Functions (Email notification fix)
echo "📦 Step 1: Deploying Firebase Functions..."
echo "This will update the admin notification email template"
echo ""
cd functions
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Functions build failed"
  exit 1
fi
cd ..

firebase deploy --only functions:onAppointmentCreatedNotifyAdmin
if [ $? -ne 0 ]; then
  echo "❌ Functions deployment failed"
  exit 1
fi

echo "✅ Functions deployed successfully"
echo ""

# Step 2: Build and Deploy Admin Dashboard (Schedule page fix)
echo "📦 Step 2: Building Admin Dashboard..."
echo "This will update the Schedule page to handle email links"
echo ""

cd apps/admin
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Admin build failed"
  exit 1
fi
cd ../..

echo "🚀 Deploying Admin Dashboard..."
firebase deploy --only hosting:admin
if [ $? -ne 0 ]; then
  echo "❌ Admin deployment failed"
  exit 1
fi

echo "✅ Admin dashboard deployed successfully"
echo ""

# Summary
echo "================================"
echo "✅ Deployment Complete!"
echo "================================"
echo ""
echo "What was fixed:"
echo "  ✅ Admin notification emails now link to: https://bueno-brows-admin.web.app/schedule?appointmentId=XXX"
echo "  ✅ Schedule page now opens the appointment automatically when clicking email link"
echo ""
echo "How to test:"
echo "  1. Create a test booking on the booking site"
echo "  2. Check the admin notification email"
echo "  3. Click the 'Review & Confirm Appointment' button"
echo "  4. The admin dashboard should open with the appointment details displayed"
echo ""
echo "🎉 Your booking request emails now work correctly!"


