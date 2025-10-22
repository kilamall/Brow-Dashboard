#!/usr/bin/env node

/**
 * Test Gemini API Key - Verify it works without referrer restrictions
 * 
 * This script tests if your Gemini API key can be accessed from a Node.js
 * environment (simulating Cloud Functions) without HTTP referrer restrictions.
 */

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

async function testGeminiAPI() {
  console.log('\n🧪 Test Gemini API Configuration');
  console.log('=================================\n');
  
  console.log('This script tests if your Gemini API key works from Cloud Functions.\n');
  
  // Get API key
  console.log('Please enter your Gemini API key:');
  console.log('(Find it at: https://aistudio.google.com/app/apikey)\n');
  
  const apiKey = await question('API Key: ');
  
  if (!apiKey || !apiKey.startsWith('AIza')) {
    console.log('\n❌ Invalid API key format. Keys should start with "AIza"');
    rl.close();
    return;
  }
  
  console.log('\n🔄 Testing API key...\n');
  
  // Test the API
  const testPrompt = 'Say "Hello! API key is working!" in a friendly way.';
  
  const requestBody = {
    contents: [{
      parts: [{
        text: testPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100,
    }
  };
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Request Failed\n');
      console.log(`Status: ${response.status}`);
      console.log(`Error: ${errorText}\n`);
      
      if (response.status === 403 && errorText.includes('HTTP_REFERRER')) {
        console.log('🔧 DIAGNOSIS: HTTP Referrer Restrictions Detected\n');
        console.log('Your API key has HTTP referrer restrictions that block this request.\n');
        console.log('TO FIX:');
        console.log('1. Go to: https://aistudio.google.com/app/apikey');
        console.log('2. Edit your API key');
        console.log('3. Select "Don\'t restrict key"');
        console.log('4. Save and wait 2-3 minutes');
        console.log('5. Run this test again\n');
        console.log('Or run: ./fix-gemini-referer.sh\n');
      } else if (response.status === 400) {
        console.log('🔧 DIAGNOSIS: API Not Enabled\n');
        console.log('The Generative Language API may not be enabled.\n');
        console.log('TO FIX:');
        console.log('1. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com');
        console.log('2. Select your project');
        console.log('3. Click "Enable"');
        console.log('4. Wait 2-3 minutes');
        console.log('5. Run this test again\n');
      } else {
        console.log('🔧 TO DEBUG:');
        console.log('- Verify API key is correct');
        console.log('- Check if Generative Language API is enabled');
        console.log('- Check Google AI Studio for usage limits\n');
      }
      
      rl.close();
      return;
    }
    
    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      data.candidates?.[0]?.content?.text ||
                      data.candidates?.[0]?.content;
    
    if (aiResponse) {
      console.log('✅ SUCCESS! API Key is Working!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('AI Response:');
      console.log(aiResponse);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('✅ Your API key is properly configured!');
      console.log('✅ No HTTP referrer restrictions detected');
      console.log('✅ Cloud Functions will work correctly\n');
      console.log('NEXT STEPS:');
      console.log('1. Set the API key in Firebase:');
      console.log('   firebase functions:secrets:set GEMINI_API_KEY');
      console.log('2. Deploy your functions:');
      console.log('   firebase deploy --only functions');
      console.log('3. Test skin analysis in your app\n');
    } else {
      console.log('⚠️  Unexpected Response Format\n');
      console.log('The API responded but in an unexpected format.');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.log('❌ Error Testing API\n');
    console.log(`Error: ${error.message}\n`);
    
    if (error.message.includes('fetch')) {
      console.log('🔧 DIAGNOSIS: Network Error\n');
      console.log('Could not connect to Gemini API.');
      console.log('- Check your internet connection');
      console.log('- Verify you can access https://generativelanguage.googleapis.com\n');
    }
  }
  
  rl.close();
}

// Run the test
testGeminiAPI().catch((error) => {
  console.error('Unexpected error:', error);
  rl.close();
  process.exit(1);
});

