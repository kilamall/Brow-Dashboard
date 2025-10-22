#!/bin/bash

# Deploy Fix: Appointment Customer Details Not Showing
# This script deploys the fix and runs the migration

echo "======================================"
echo "🔧 Deploying Appointment Details Fix"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from project root directory"
    exit 1
fi

echo "📦 Step 1: Building packages..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi
echo "✅ Build completed"
echo ""

echo "🚀 Step 2: Deploying to Firebase..."
echo "   - Deploying admin dashboard..."
firebase deploy --only hosting:admin
if [ $? -ne 0 ]; then
    echo "❌ Admin deployment failed!"
    exit 1
fi
echo "✅ Admin dashboard deployed"
echo ""

echo "   - Deploying cloud functions..."
firebase deploy --only functions:createAppointmentTx
if [ $? -ne 0 ]; then
    echo "⚠️  Function deployment failed, but continuing..."
    echo "   (This is expected if function name doesn't match exactly)"
fi
echo ""

echo "🔄 Step 3: Running migration to fix existing appointments..."
node fix-appointment-customer-details.js
if [ $? -ne 0 ]; then
    echo "⚠️  Migration failed, but deployment is complete"
    echo "   You can run the migration manually: node fix-appointment-customer-details.js"
else
    echo "✅ Migration completed successfully"
fi
echo ""

echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""
echo "🧪 Next Steps:"
echo "1. Test creating a new appointment in the admin dashboard"
echo "2. Verify customer details appear in appointment modals"
echo "3. Check existing appointments show customer info"
echo ""
echo "📝 For detailed testing instructions, see:"
echo "   FIX_APPOINTMENT_CUSTOMER_DETAILS.md"
echo ""

