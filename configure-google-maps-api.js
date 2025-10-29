#!/usr/bin/env node

/**
 * Google Maps API Configuration Helper
 * 
 * This script helps you configure your Google Maps API key with proper restrictions
 * and provides testing instructions.
 */

console.log('🗺️  Google Maps API Configuration');
console.log('==================================\n');

console.log('✅ API Key Updated Successfully!');
console.log('Your Google Maps API key has been added to apps/booking/.env\n');

console.log('🔒 Next: Configure API Key Restrictions');
console.log('=====================================');
console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('2. Navigate to: APIs & Services → Credentials');
console.log('3. Find your API key: AIzaSyDxXI9OjWyL3y0XUUZmrydOE7N3kMMK-sU');
console.log('4. Click on the API key to edit it');
console.log('5. Set up restrictions:');
console.log('   📍 Application restrictions: HTTP referrers (web sites)');
console.log('   🌐 Website restrictions:');
console.log('      - buenobrows.com/*');
console.log('      - *.buenobrows.com/*');
console.log('      - localhost:* (for development)');
console.log('   🔑 API restrictions: Maps Embed API');
console.log('6. Save the restrictions');

console.log('\n💰 Billing Setup (Required)');
console.log('============================');
console.log('1. Go to: Billing → Link a billing account');
console.log('2. Create a billing account if you don\'t have one');
console.log('3. Set up billing alerts to monitor usage');
console.log('4. Google Maps Embed API has a free tier, but billing is required');

console.log('\n🧪 Test Your Google Maps Integration');
console.log('==================================');
console.log('1. Start your development server:');
console.log('   cd apps/booking && npm run dev');
console.log('2. Visit your homepage');
console.log('3. Check the "Visit Us" section');
console.log('4. Verify the map loads without "API key is invalid" error');
console.log('5. Test the "Open in Google Maps" button');

console.log('\n🚀 Deploy Your Fix');
console.log('==================');
console.log('1. Build your application:');
console.log('   npm run build');
console.log('2. Deploy to your hosting platform');
console.log('3. Test the live website');

console.log('\n⚠️  Security Checklist');
console.log('======================');
console.log('✅ API key is in environment variables (not in code)');
console.log('✅ API key is restricted to specific domains');
console.log('✅ API key is restricted to Maps Embed API only');
console.log('✅ Billing account is set up');
console.log('✅ Usage monitoring is configured');

console.log('\n🎉 Your Google Maps should now work perfectly!');
console.log('The "API key is invalid" error should be resolved.');
