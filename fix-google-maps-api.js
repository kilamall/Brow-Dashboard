#!/usr/bin/env node

/**
 * Google Maps API Key Fix Script
 * 
 * This script helps you fix the Google Maps API key issue by:
 * 1. Adding the missing VITE_GOOGLE_MAPS_API_KEY to your .env file
 * 2. Providing instructions to get a new Google Maps API key
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function fixGoogleMapsAPI() {
  console.log('🗺️  Google Maps API Key Fix');
  console.log('============================\n');

  const envPath = path.join(__dirname, 'apps/booking/.env');
  
  try {
    // Read current .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check if VITE_GOOGLE_MAPS_API_KEY already exists
    if (envContent.includes('VITE_GOOGLE_MAPS_API_KEY')) {
      console.log('✅ VITE_GOOGLE_MAPS_API_KEY already exists in .env file');
    } else {
      console.log('❌ VITE_GOOGLE_MAPS_API_KEY is missing from .env file');
      
      // Add the missing environment variable
      envContent += '\nVITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here\n';
      
      // Write back to file
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Added VITE_GOOGLE_MAPS_API_KEY to .env file');
    }

    console.log('\n🔑 Next Steps to Get a Google Maps API Key:');
    console.log('==========================================');
    console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing project');
    console.log('3. Enable the following APIs:');
    console.log('   - Maps Embed API');
    console.log('   - Maps JavaScript API (optional, for advanced features)');
    console.log('4. Go to "Credentials" → "Create Credentials" → "API Key"');
    console.log('5. Copy the API key');
    console.log('6. Restrict the API key:');
    console.log('   - Application restrictions: HTTP referrers');
    console.log('   - Add your domain: buenobrows.com');
    console.log('   - Add your localhost for testing: localhost:*');
    console.log('7. API restrictions: Select "Maps Embed API"');
    console.log('8. Set up billing (Google Maps requires a billing account)');
    
    console.log('\n📝 After getting your API key:');
    console.log('1. Replace "your_google_maps_api_key_here" in apps/booking/.env');
    console.log('2. Run: npm run build (or your build command)');
    console.log('3. Deploy your changes');
    
    console.log('\n⚠️  Important Security Notes:');
    console.log('- Never commit API keys to version control');
    console.log('- Use environment variables for all API keys');
    console.log('- Restrict API keys to specific domains');
    console.log('- Monitor API usage and set up billing alerts');
    
    console.log('\n🧪 Test Your Fix:');
    console.log('1. Start your development server');
    console.log('2. Visit your homepage');
    console.log('3. Check if the Google Maps embed loads correctly');
    console.log('4. Verify no "API key is invalid" error appears');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Manual Fix Required:');
    console.log('Add this line to your apps/booking/.env file:');
    console.log('VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here');
  }

  rl.close();
}

// Run the script
fixGoogleMapsAPI().catch(console.error);
