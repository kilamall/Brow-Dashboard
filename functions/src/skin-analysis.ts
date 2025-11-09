import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as crypto from 'crypto';

try { initializeApp(); } catch {}
const db = getFirestore();
const storage = getStorage();

// Gemini AI Configuration
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Cache configuration
const CACHE_COLLECTION = 'ai_analysis_cache';
const CACHE_TTL_DAYS = 90; // Cache results for 90 days

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
    console.log('Processing image URL:', imageUrl);
    
    // If it's a Firebase Storage URL, get it directly from storage
    if (imageUrl.includes('firebasestorage.googleapis.com')) {
      // Extract the path from the URL
      const url = new URL(imageUrl);
      let filePath: string;
      
      console.log('URL pathname:', url.pathname);
      
      // Try to match /o/ format first (new format)
      const oPathMatch = url.pathname.match(/\/o\/(.+?)(?:\?|$)/);
      if (oPathMatch) {
        filePath = decodeURIComponent(oPathMatch[1]);
        console.log('Matched /o/ format, filePath:', filePath);
      } else {
        // Try to match /v0/b/{bucket}/o/{path} format (old format)
        const vPathMatch = url.pathname.match(/\/v0\/b\/[^/]+\/o\/(.+?)(?:\?|$)/);
        if (vPathMatch) {
          filePath = decodeURIComponent(vPathMatch[1]);
          console.log('Matched /v0/b/ format, filePath:', filePath);
        } else {
          // Try to match /b/{bucket}/o/{path} format (alternative format)
          const bPathMatch = url.pathname.match(/\/b\/[^/]+\/o\/(.+?)(?:\?|$)/);
          if (bPathMatch) {
            filePath = decodeURIComponent(bPathMatch[1]);
            console.log('Matched /b/ format, filePath:', filePath);
          } else {
            // Last resort: just fetch the URL directly
            console.log('Could not parse storage path, fetching directly:', imageUrl);
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return buffer.toString('base64');
          }
        }
      }
      
      console.log('Downloading from storage path:', filePath);
      const bucket = storage.bucket();
      const file = bucket.file(filePath);
      
      const [buffer] = await file.download();
      return buffer.toString('base64');
    }
    
    // For other URLs, fetch directly
    console.log('Fetching non-Firebase URL directly:', imageUrl);
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

// Calculate image hash for caching
function calculateImageHash(imageBase64: string, analysisType: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(imageBase64 + analysisType);
  return hash.digest('hex');
}

// Check cache for existing analysis
async function checkCache(imageHash: string): Promise<any | null> {
  try {
    const cacheDoc = await db.collection(CACHE_COLLECTION).doc(imageHash).get();
    
    if (!cacheDoc.exists) {
      return null;
    }
    
    const cacheData = cacheDoc.data();
    if (!cacheData) {
      return null;
    }
    
    // Check if cache is still valid
    const cachedAt = cacheData.cachedAt?.toDate();
    if (!cachedAt) {
      return null;
    }
    
    const now = new Date();
    const ageInDays = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > CACHE_TTL_DAYS) {
      // Cache expired, delete it
      await db.collection(CACHE_COLLECTION).doc(imageHash).delete();
      return null;
    }
    
    console.log(`Cache hit for image hash: ${imageHash} (${ageInDays.toFixed(1)} days old)`);
    return cacheData.analysis;
  } catch (error) {
    console.error('Error checking cache:', error);
    return null;
  }
}

// Save analysis to cache
async function saveToCache(imageHash: string, analysis: any): Promise<void> {
  try {
    await db.collection(CACHE_COLLECTION).doc(imageHash).set({
      analysis,
      cachedAt: new Date(),
      imageHash,
    });
    console.log(`Analysis cached with hash: ${imageHash}`);
  } catch (error) {
    console.error('Error saving to cache:', error);
    // Don't throw error - caching failure shouldn't break the analysis
  }
}

// Call Gemini Vision API
async function callGeminiVision(imageBase64: string, prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) {
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
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(`${GEMINI_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      throw new Error(`Gemini API error (${response.status}): ${errorData}`);
    }

    const data = await response.json() as any;
    
    // Check for safety blocking
    if (data.promptFeedback?.blockReason) {
      console.error('Content blocked by safety filters:', data.promptFeedback);
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }
    
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const finishReason = data.candidates?.[0]?.finishReason;
    
    if (!result) {
      console.error('No text in response. Finish reason:', finishReason);
      throw new Error(`No response from Gemini API. Finish reason: ${finishReason || 'unknown'}`);
    }
    
    if (finishReason === 'MAX_TOKENS') {
      console.warn('⚠️ Response truncated due to MAX_TOKENS. Attempting to parse anyway...');
    }
    
    console.log('✅ AI response received, length:', result.length, 'finish reason:', finishReason);
    
    return result.trim();
  } catch (error: any) {
    console.error('Error calling Gemini Vision API:', error);
    const errorMessage = error.message || 'Failed to analyze image with AI';
    console.error('Detailed error:', errorMessage);
    throw new HttpsError('internal', errorMessage);
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
export const analyzeSkinPhoto = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
  // SECURITY FIX: Require authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  
  const userId = request.auth.uid;
  const apiKey = geminiApiKey.value();
  const { analysisId, imageUrl, analysisType } = request.data;

  if (!analysisId || !imageUrl) {
    throw new HttpsError('invalid-argument', 'analysisId and imageUrl are required');
  }

  // Verify the analysis document exists and belongs to this user
  const analysisDoc = await db.collection('skinAnalyses').doc(analysisId).get();
  if (!analysisDoc.exists) {
    throw new HttpsError('not-found', 'Analysis document not found');
  }
  
  const analysisData = analysisDoc.data();
  if (analysisData?.customerId !== userId) {
    throw new HttpsError('permission-denied', 'You do not have permission to analyze this document');
  }

  try {
    console.log('Analyzing skin photo:', analysisId);

    // Convert image to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);
    
    // Calculate image hash for caching
    const imageHash = calculateImageHash(imageBase64, 'skin');
    
    // Check cache first
    const cachedAnalysis = await checkCache(imageHash);
    if (cachedAnalysis) {
      console.log('Using cached analysis for:', analysisId);
      
      // Update Firestore with cached analysis
      await db.collection('skinAnalyses').doc(analysisId).update({
        analysis: cachedAnalysis,
        status: 'completed',
        fromCache: true,
        updatedAt: new Date().toISOString(),
      });
      
      return {
        success: true,
        analysis: cachedAnalysis,
        fromCache: true,
      };
    }

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
    const aiResponse = await callGeminiVision(imageBase64, prompt, apiKey);
    const analysis = parseAIResponse(aiResponse);
    
    // Save to cache for future use
    await saveToCache(imageHash, analysis);

    // Update Firestore with the analysis
    await db.collection('skinAnalyses').doc(analysisId).update({
      analysis,
      status: 'completed',
      fromCache: false,
      updatedAt: new Date().toISOString(),
    });

    console.log('Skin analysis completed:', analysisId);

    return {
      success: true,
      analysis,
      fromCache: false,
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
export const analyzeSkinCareProducts = onCall(
  { secrets: [geminiApiKey] },
  async (request) => {
  // SECURITY FIX: Require authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required');
  }
  
  const userId = request.auth.uid;
  const apiKey = geminiApiKey.value();
  const { analysisId, imageUrl } = request.data;

  if (!analysisId || !imageUrl) {
    throw new HttpsError('invalid-argument', 'analysisId and imageUrl are required');
  }

  // Verify the analysis document exists and belongs to this user
  const analysisDoc = await db.collection('skinAnalyses').doc(analysisId).get();
  if (!analysisDoc.exists) {
    throw new HttpsError('not-found', 'Analysis document not found');
  }
  
  const analysisData = analysisDoc.data();
  if (analysisData?.customerId !== userId) {
    throw new HttpsError('permission-denied', 'You do not have permission to analyze this document');
  }

  try {
    console.log('Analyzing skincare products:', analysisId);

    // Convert image to base64
    const imageBase64 = await imageUrlToBase64(imageUrl);
    
    // Calculate image hash for caching
    const imageHash = calculateImageHash(imageBase64, 'products');
    
    // Check cache first
    const cachedAnalysis = await checkCache(imageHash);
    if (cachedAnalysis) {
      console.log('Using cached product analysis for:', analysisId);
      
      // Update Firestore with cached analysis
      await db.collection('skinAnalyses').doc(analysisId).update({
        analysis: cachedAnalysis,
        status: 'completed',
        fromCache: true,
        updatedAt: new Date().toISOString(),
      });
      
      return {
        success: true,
        analysis: cachedAnalysis,
        fromCache: true,
      };
    }

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
    const aiResponse = await callGeminiVision(imageBase64, prompt, apiKey);
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
    
    // Save to cache for future use
    await saveToCache(imageHash, analysis);

    // Update Firestore with the analysis
    await db.collection('skinAnalyses').doc(analysisId).update({
      analysis,
      status: 'completed',
      fromCache: false,
      updatedAt: new Date().toISOString(),
    });

    console.log('Product analysis completed:', analysisId);

    return {
      success: true,
      analysis,
      fromCache: false,
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

// Scheduled cleanup function - runs daily at 2 AM
// Deletes skin analysis images older than 30 days to reduce storage costs
export const cleanupOldSkinAnalysisImages = onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'America/Los_Angeles',
    region: 'us-central1',
  },
  async (event) => {
    console.log('Starting cleanup of old skin analysis images...');
    
    const RETENTION_DAYS = 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    try {
      // Get all skin analyses older than 30 days
      const oldAnalyses = await db.collection('skinAnalyses')
        .where('createdAt', '<', cutoffDate)
        .get();
      
      console.log(`Found ${oldAnalyses.size} old skin analyses to process`);
      
      let deletedImages = 0;
      let deletedDocs = 0;
      let errors = 0;
      
      const bucket = storage.bucket();
      
      // Process each old analysis
      for (const doc of oldAnalyses.docs) {
        try {
          const data = doc.data();
          const imageUrl = data.imageUrl;
          
          if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
            // Extract file path from URL
            const url = new URL(imageUrl);
            const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
            
            if (pathMatch) {
              const filePath = decodeURIComponent(pathMatch[1]);
              
              // Delete image from storage
              try {
                await bucket.file(filePath).delete();
                deletedImages++;
                console.log(`Deleted image: ${filePath}`);
              } catch (deleteError: any) {
                if (deleteError.code === 404) {
                  console.log(`Image already deleted: ${filePath}`);
                } else {
                  console.error(`Error deleting image ${filePath}:`, deleteError);
                  errors++;
                }
              }
            }
          }
          
          // Delete Firestore document
          await doc.ref.delete();
          deletedDocs++;
          
        } catch (error) {
          console.error(`Error processing document ${doc.id}:`, error);
          errors++;
        }
      }
      
      console.log(`Cleanup completed:
        - Deleted ${deletedImages} images from storage
        - Deleted ${deletedDocs} Firestore documents
        - Errors: ${errors}
      `);
      
      // Also cleanup expired cache entries
      const expiredCacheDate = new Date();
      expiredCacheDate.setDate(expiredCacheDate.getDate() - CACHE_TTL_DAYS);
      
      const expiredCache = await db.collection(CACHE_COLLECTION)
        .where('cachedAt', '<', expiredCacheDate)
        .get();
      
      let deletedCache = 0;
      for (const doc of expiredCache.docs) {
        await doc.ref.delete();
        deletedCache++;
      }
      
      console.log(`Deleted ${deletedCache} expired cache entries`);
      
    } catch (error) {
      console.error('Error in cleanup function:', error);
      throw error;
    }
  }
);

