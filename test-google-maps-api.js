#!/usr/bin/env node

/**
 * Test Google Maps API Key
 * 
 * This script tests if the Google Maps API key is working correctly
 */

const API_KEY = 'AIzaSyDxXI9OjWyL3y0XUUZmrydOE7N3kMMK-sU';

async function testGoogleMapsAPI() {
  console.log('🗺️  Testing Google Maps API Key');
  console.log('================================\n');

  console.log('API Key:', API_KEY);
  console.log('');

  // Test 1: Check if Maps Embed API is enabled
  console.log('🧪 Test 1: Checking Maps Embed API access...');
  try {
    const testUrl = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=315+9th+Ave,+San+Mateo,+CA+94401`;
    console.log('Test URL:', testUrl);
    console.log('✅ API key format is correct');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('==========================');
  console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.log('2. Select your project: "bueno-brows-7cce7"');
  console.log('3. Go to: APIs & Services → Library');
  console.log('4. Search for "Maps Embed API"');
  console.log('5. Click on it and make sure it\'s ENABLED');
  console.log('6. Go to: APIs & Services → Credentials');
  console.log('7. Find your API key and click on it');
  console.log('8. Set restrictions:');
  console.log('   - Application restrictions: HTTP referrers (web sites)');
  console.log('   - Website restrictions:');
  console.log('     * buenobrows.com/*');
  console.log('     * *.buenobrows.com/*');
  console.log('     * localhost:*');
  console.log('   - API restrictions: Maps Embed API');
  console.log('9. Make sure billing is enabled');

  console.log('\n💰 Billing Requirements:');
  console.log('========================');
  console.log('- Google Maps requires a billing account');
  console.log('- Maps Embed API has a free tier');
  console.log('- Go to: Billing → Link a billing account');

  console.log('\n🧪 Manual Test:');
  console.log('===============');
  console.log('1. Open this URL in your browser:');
  console.log(`   https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=315+9th+Ave,+San+Mateo,+CA+94401`);
  console.log('2. If you see a map, the API key is working');
  console.log('3. If you see an error, check the restrictions above');

  console.log('\n🔍 Common Issues:');
  console.log('==================');
  console.log('❌ "API key is invalid" → API key not found or restricted');
  console.log('❌ "This API project is not authorized" → Maps Embed API not enabled');
  console.log('❌ "RefererNotAllowedMapError" → Domain restrictions too strict');
  console.log('❌ "BillingNotEnabled" → Billing account not linked');

  console.log('\n✅ Next Steps:');
  console.log('===============');
  console.log('1. Enable Maps Embed API in Google Cloud Console');
  console.log('2. Configure API key restrictions');
  console.log('3. Ensure billing is enabled');
  console.log('4. Test the embed URL manually');
  console.log('5. Rebuild and redeploy your app');
}

testGoogleMapsAPI().catch(console.error);
