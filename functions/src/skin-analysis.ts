import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

try { initializeApp(); } catch {}
const db = getFirestore();
const storage = getStorage();

// Gemini AI Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Business services for recommendations
const SERVICES = [
  { name: 'Brow Shaping', benefits: 'Enhances facial symmetry and complements skin features' },
  { name: 'Brow Tinting', benefits: 'Adds definition and fullness to sparse or light brows' },
  { name: 'Brow Lamination', benefits: 'Creates fuller, fluffier brows with a polished look' },
  { name: 'Facial Waxing', benefits: 'Removes unwanted facial hair for smoother skin' },
  { name: 'Lash Lift', benefits: 'Enhances natural lashes for a more open, lifted look' },
  { name: 'Dermaplaning', benefits: 'Exfoliates dead skin cells and removes peach fuzz' },
  { name: 'Chemical Peel', benefits: 'Improves skin texture, tone, and reduces fine lines' },
];

// Convert image URL to base64
async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    // If it's a Firebase Storage URL, get it directly from storage
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      // Extract the path from the URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      if (!pathMatch) throw new Error('Invalid Firebase Storage URL');
      
      const filePath = decodeURIComponent(pathMatch[1]);
      const bucket = storage.bucket();
      const file = bucket.file(filePath);
      
      const [buffer] = await file.download();
      return buffer.toString('base64');
    }
    
    // For other URLs, fetch directly
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new HttpsError('internal', 'Failed to process image');
  }
}

// Call Gemini Vision API
async function callGeminiVision(imageBase64: string, prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new HttpsError('failed-precondition', 'Gemini API key not configured');
  }

  try {
    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`${GEMINI_VISION_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!result) {
      throw new Error('No response from Gemini API');
    }
    
    return result.trim();
  } catch (error) {
    console.error('Error calling Gemini Vision API:', error);
    throw new HttpsError('internal', 'Failed to analyze image with AI');
  }
}

// Parse JSON from AI response (handles markdown code blocks)
function parseAIResponse(response: string): any {
  try {
    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error('Failed to parse AI response:', response);
    throw new HttpsError('internal', 'Failed to parse AI analysis');
  }
}

// Analyze skin photo
export const analyzeSkinPhoto = onCall(async (request) => {
  const { analysisId, imageUrl, analysisType } = request.data;

  if (!analysisId || !imageUrl) {
    throw new HttpsError('invalid-argument', 'analysisId and imageUrl are required');
  }

  try {
    console.log('Analyzing skin photo:', analysisId);

    // Convert image to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);

    // Create detailed prompt for skin analysis
    const prompt = `You are an expert aesthetician and makeup artist analyzing a client's facial skin. Analyze this photo and provide a comprehensive assessment in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no additional text or markdown.

Provide detailed analysis including:

1. SKIN TYPE: Identify if oily, dry, combination, normal, or sensitive
2. SKIN TONE: Determine exact skin tone category, undertone, and Fitzpatrick scale (1-6)
3. FOUNDATION MATCH: Provide specific shade ranges and brand recommendations
4. FACIAL FEATURES: Analyze face shape, eye shape, brow shape, and lip shape
5. CONCERNS: Identify any visible skin concerns
6. RECOMMENDATIONS: Personalized skincare and beauty recommendations
7. SERVICES: Recommend our services based on their needs

Services we offer:
${SERVICES.map(s => `- ${s.name}: ${s.benefits}`).join('\n')}

Return your analysis in this EXACT JSON format:
{
  "skinType": "oily/dry/combination/normal/sensitive",
  "skinTone": {
    "category": "Fair/Light/Medium/Tan/Deep",
    "undertone": "Cool/Warm/Neutral",
    "fitzpatrickScale": 1-6,
    "hexColor": "#approximate hex color"
  },
  "foundationMatch": {
    "shadeRange": "e.g., Fair 110-120 or Medium 240-260",
    "undertoneRecommendation": "Look for cool/warm/neutral toned foundations",
    "popularBrands": [
      {
        "brand": "Fenty Beauty",
        "shades": ["shade1", "shade2"]
      },
      {
        "brand": "MAC",
        "shades": ["shade1", "shade2"]
      }
    ]
  },
  "facialFeatures": {
    "faceShape": "Oval/Round/Square/Heart/Diamond/Oblong",
    "eyeShape": "Almond/Round/Hooded/Monolid/etc",
    "browShape": "Arched/Straight/S-shaped/etc",
    "lipShape": "Full/Thin/Heart-shaped/etc"
  },
  "concerns": ["specific concern 1", "specific concern 2"],
  "recommendations": ["specific recommendation 1", "specific recommendation 2"],
  "recommendedServices": [
    {
      "serviceName": "exact service name from our list",
      "reason": "detailed explanation why this service is perfect for them",
      "frequency": "Every 4-6 weeks/Monthly/Every 3 months/etc",
      "priority": "high/medium/low"
    }
  ],
  "summary": "A warm, friendly 2-3 sentence summary of their skin analysis",
  "detailedReport": "A comprehensive 2-3 paragraph report covering their skin type, tone, features, concerns, and personalized recommendations. This should be a complete beauty consultation they can reference."
}`;

    // Get AI analysis
    const aiResponse = await callGeminiVision(imageBase64, prompt);
    const analysis = parseAIResponse(aiResponse);

    // Update Firestore with the analysis
    await db.collection('skinAnalyses').doc(analysisId).update({
      analysis,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });

    console.log('Skin analysis completed:', analysisId);

    return {
      success: true,
      analysis,
    };
  } catch (error: any) {
    console.error('Error in analyzeSkinPhoto:', error);
    
    // Update status to error
    try {
      await db.collection('skinAnalyses').doc(analysisId).update({
        status: 'error',
        error: error.message,
        updatedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    throw new HttpsError('internal', error.message || 'Failed to analyze skin photo');
  }
});

// Analyze skincare products
export const analyzeSkinCareProducts = onCall(async (request) => {
  const { analysisId, imageUrl } = request.data;

  if (!analysisId || !imageUrl) {
    throw new HttpsError('invalid-argument', 'analysisId and imageUrl are required');
  }

  try {
    console.log('Analyzing skincare products:', analysisId);

    // Convert image to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);

    // Create detailed prompt for product analysis
    const prompt = `You are an expert skincare consultant analyzing skincare products. Look at this image of skincare products and provide a detailed analysis in JSON format.

IMPORTANT: Respond ONLY with valid JSON, no additional text or markdown.

Analyze:
1. Identify each visible product by name/brand
2. Determine the correct usage order (AM/PM routines)
3. Check compatibility between products
4. Assess quality and suitability for different skin types
5. Provide recommendations for which services might complement their routine

Services we offer:
${SERVICES.map(s => `- ${s.name}: ${s.benefits}`).join('\n')}

Return your analysis in this exact JSON format:
{
  "products": [
    {
      "name": "Product name and brand",
      "usage": "How to use (AM/PM, frequency)",
      "order": 1,
      "suitability": "Good for [skin types] / May cause issues for [skin types]"
    }
  ],
  "routine": "Detailed AM and PM routine instructions with the identified products",
  "concerns": ["Any concerns about product combinations or missing steps"],
  "recommendations": ["Suggestions to improve their routine"],
  "recommendedServices": [
    {
      "serviceName": "service name",
      "reason": "how this service complements their product routine",
      "frequency": "recommended frequency"
    }
  ],
  "summary": "A friendly 2-3 sentence summary of their product routine analysis"
}`;

    // Get AI analysis
    const aiResponse = await callGeminiVision(imageBase64, prompt);
    const rawAnalysis = parseAIResponse(aiResponse);

    // Format for consistent structure
    const analysis = {
      concerns: rawAnalysis.concerns || [],
      recommendations: rawAnalysis.recommendations || [],
      recommendedServices: rawAnalysis.recommendedServices || [],
      productAnalysis: {
        products: rawAnalysis.products || [],
        routine: rawAnalysis.routine || '',
      },
      summary: rawAnalysis.summary || 'Analysis completed successfully.',
    };

    // Update Firestore with the analysis
    await db.collection('skinAnalyses').doc(analysisId).update({
      analysis,
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });

    console.log('Product analysis completed:', analysisId);

    return {
      success: true,
      analysis,
    };
  } catch (error: any) {
    console.error('Error in analyzeSkinCareProducts:', error);
    
    // Update status to error
    try {
      await db.collection('skinAnalyses').doc(analysisId).update({
        status: 'error',
        error: error.message,
        updatedAt: new Date().toISOString(),
      });
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }

    throw new HttpsError('internal', error.message || 'Failed to analyze skincare products');
  }
});

