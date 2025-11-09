import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { defineSecret } from 'firebase-functions/params';
import * as crypto from 'crypto';
import * as functions from 'firebase-functions';

const geminiApiKey = defineSecret('GEMINI_API_KEY');

try { initializeApp(); } catch {}
const db = getFirestore();
const storage = getStorage();

// Rate limiting configuration
const RATE_LIMIT_COLLECTION = 'analysis_rate_limits';
const RATE_LIMIT_WINDOW_HOURS = 24; // 24 hour window
const MAX_ANALYSES_PER_DAY = 5; // Maximum analyses per user per day
const MAX_ANALYSES_PER_HOUR = 2; // Maximum analyses per user per hour

// Gemini AI Configuration
const GEMINI_VISION_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Cache configuration
const CACHE_COLLECTION = 'ai_analysis_cache';
const CACHE_TTL_DAYS = 90; // Cache results for 90 days

// Check rate limits for a user
async function checkRateLimit(userId: string): Promise<{ allowed: boolean; reason?: string; resetTime?: Date }> {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get recent analyses for this user
    const recentAnalysesQuery = db.collection('skinAnalyses')
      .where('customerId', '==', userId)
      .where('createdAt', '>=', oneDayAgo)
      .orderBy('createdAt', 'desc');

    const recentAnalysesSnapshot = await recentAnalysesQuery.get();
    const recentAnalyses = recentAnalysesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));

    // Check daily limit
    if (recentAnalyses.length >= MAX_ANALYSES_PER_DAY) {
      const oldestAnalysis = recentAnalyses[recentAnalyses.length - 1];
      const resetTime = new Date(oldestAnalysis.createdAt.getTime() + 24 * 60 * 60 * 1000);
      return {
        allowed: false,
        reason: `You've reached the daily limit of ${MAX_ANALYSES_PER_DAY} analyses. Try again after ${resetTime.toLocaleString()}.`,
        resetTime
      };
    }

    // Check hourly limit
    const hourlyAnalyses = recentAnalyses.filter(analysis => 
      analysis.createdAt >= oneHourAgo
    );

    if (hourlyAnalyses.length >= MAX_ANALYSES_PER_HOUR) {
      const oldestHourlyAnalysis = hourlyAnalyses[hourlyAnalyses.length - 1];
      const resetTime = new Date(oldestHourlyAnalysis.createdAt.getTime() + 60 * 60 * 1000);
      return {
        allowed: false,
        reason: `You've reached the hourly limit of ${MAX_ANALYSES_PER_HOUR} analyses. Try again after ${resetTime.toLocaleString()}.`,
        resetTime
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    // If rate limiting fails, allow the request but log the error
    return { allowed: true };
  }
}

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

// Check analysis cache
async function checkAnalysisCache(imageHash: string): Promise<string | null> {
  try {
    const cacheDoc = await db.collection(CACHE_COLLECTION).doc(imageHash).get();
    
    if (!cacheDoc.exists) {
      return null;
    }
    
    const cacheData = cacheDoc.data();
    if (!cacheData) {
      return null;
    }
    
    const cachedAt = cacheData.cachedAt?.toDate();
    if (!cachedAt) {
      return null;
    }
    
    const now = new Date();
    const ageInDays = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays > CACHE_TTL_DAYS) {
      await db.collection(CACHE_COLLECTION).doc(imageHash).delete();
      return null;
    }
    
    console.log(`Analysis cache hit for hash: ${imageHash}`);
    return cacheData.analysis;
  } catch (error) {
    console.error('Error checking analysis cache:', error);
    return null;
  }
}

// Save analysis to cache
async function saveAnalysisToCache(imageHash: string, analysis: string): Promise<void> {
  try {
    await db.collection(CACHE_COLLECTION).doc(imageHash).set({
      analysis,
      cachedAt: new Date(),
      imageHash,
    });
  } catch (error) {
    console.error('Error saving analysis to cache:', error);
  }
}

// Enhanced multi-product analysis prompt
const MULTI_PRODUCT_ANALYSIS_PROMPT = `
You are a professional skincare expert analyzing multiple skincare products as a complete routine. 

For each product image provided, identify:
1. Product name and brand (if visible)
2. Active ingredients and their concentrations (if listed)
3. Product type (cleanser, serum, moisturizer, sunscreen, etc.)
4. Skin concerns it addresses
5. Application timing (AM/PM/both)

Then provide an aggregate analysis:
1. OPTIMAL APPLICATION ORDER: Arrange products in the correct order for maximum efficacy
2. INGREDIENT CONFLICTS: Identify any ingredient combinations that could cause irritation or reduce effectiveness
3. TIMING RECOMMENDATIONS: Specify which products should be used AM vs PM
4. FREQUENCY GUIDANCE: Recommend how often each product should be used
5. PERSONALIZED RECOMMENDATIONS: Based on the complete routine, suggest optimizations

If skin analysis data is provided, cross-reference and provide:
- Compatibility assessment with skin type and concerns
- Suggested product replacements for better compatibility
- Routine adjustments based on skin analysis results

Return your analysis in this structured format:

## PRODUCT ANALYSIS
[For each product, provide detailed analysis]

## ROUTINE OPTIMIZATION
### Recommended Application Order
1. [Product] - [Reasoning]
2. [Product] - [Reasoning]
...

### Ingredient Conflicts & Warnings
- [Specific conflict] - [Explanation and recommendation]

### Timing Recommendations
**Morning Routine:**
- [Products and order]

**Evening Routine:**
- [Products and order]

### Personalized Recommendations
[Based on skin analysis if provided, or general optimization advice]

### Suggested Replacements
[If any products are incompatible or suboptimal]

Be thorough, professional, and provide actionable advice for optimal skincare routine.
`;

// Call Gemini Vision API for multi-product analysis
async function callGeminiVisionAPI(imageUrls: string[], skinAnalysisData: any, apiKey: string): Promise<string> {
  try {
    console.log(`Calling Gemini Vision API for ${imageUrls.length} products`);
    
    // Convert all images to base64
    const imageParts = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const imageBase64 = await imageUrlToBase64(imageUrls[i]);
      imageParts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: imageBase64
        }
      });
    }
    
    // Prepare the request payload
    const requestBody = {
      contents: [{
        parts: [
          {
            text: MULTI_PRODUCT_ANALYSIS_PROMPT + (skinAnalysisData ? `\n\nSKIN ANALYSIS DATA:\n${JSON.stringify(skinAnalysisData, null, 2)}` : '')
          },
          ...imageParts
        ]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(`${GEMINI_VISION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini response:', data);
      throw new Error('No analysis generated');
    }

    const analysis = data.candidates[0].content.parts[0].text;
    console.log('Gemini analysis generated successfully');
    
    return analysis;
  } catch (error: any) {
    console.error('Error calling Gemini Vision API:', error);
    throw error;
  }
}

// Enhanced multi-product analysis function with rate limiting
export const analyzeMultipleProducts = onCall(
  { 
    timeoutSeconds: 300,
    memory: '1GiB',
    secrets: [geminiApiKey]
  },
  async (request) => {
    try {
      const { analysisId, imageUrls, skinAnalysisData, userId } = request.data;
      
      if (!analysisId || !imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
        throw new HttpsError('invalid-argument', 'Missing required parameters');
      }

      if (imageUrls.length > 5) {
        throw new HttpsError('invalid-argument', 'Maximum 5 products allowed');
      }

      if (!userId) {
        throw new HttpsError('unauthenticated', 'User authentication required');
      }

      // Check rate limits
      const rateLimitCheck = await checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        throw new HttpsError('resource-exhausted', rateLimitCheck.reason || 'Rate limit exceeded');
      }

      console.log(`Starting multi-product analysis for ${imageUrls.length} products`);

      // Check cache for each image (use first image as cache key for now)
      const firstImageHash = await imageUrlToBase64(imageUrls[0]).then(base64 => 
        calculateImageHash(base64, 'multi-product')
      );
      
      const cachedAnalysis = await checkAnalysisCache(firstImageHash);
      if (cachedAnalysis) {
        console.log('Using cached analysis');
        
        // Update the analysis document with cached results
        await db.collection('skinAnalyses').doc(analysisId).update({
          status: 'completed',
          analysis: cachedAnalysis,
          completedAt: new Date(),
          cached: true
        });
        
        return { success: true, analysis: cachedAnalysis, cached: true };
      }

      // Get API key
      const apiKey = geminiApiKey.value();
      if (!apiKey) {
        throw new HttpsError('internal', 'Gemini API key not configured');
      }

      // Call Gemini Vision API
      const analysis = await callGeminiVisionAPI(imageUrls, skinAnalysisData, apiKey);

      // Save to cache
      await saveAnalysisToCache(firstImageHash, analysis);

      // Update the analysis document
      await db.collection('skinAnalyses').doc(analysisId).update({
        status: 'completed',
        analysis: analysis,
        completedAt: new Date(),
        cached: false
      });

      console.log('Multi-product analysis completed successfully');
      
      return { 
        success: true, 
        analysis: analysis,
        cached: false,
        productsAnalyzed: imageUrls.length
      };

    } catch (error: any) {
      console.error('Error in multi-product analysis:', error);
      
      // Update the analysis document with error status
      if (request.data.analysisId) {
        try {
          await db.collection('skinAnalyses').doc(request.data.analysisId).update({
            status: 'error',
            error: error.message,
            completedAt: new Date()
          });
        } catch (updateError) {
          console.error('Error updating analysis document:', updateError);
        }
      }
      
      throw new HttpsError('internal', `Analysis failed: ${error.message}`);
    }
  }
);

// Enhanced single product analysis (backwards compatibility) with rate limiting
export const analyzeProduct = onCall(
  { 
    timeoutSeconds: 300,
    memory: '1GiB',
    secrets: [geminiApiKey]
  },
  async (request) => {
    try {
      const { analysisId, imageUrl, skinAnalysisData, userId } = request.data;
      
      if (!analysisId || !imageUrl) {
        throw new HttpsError('invalid-argument', 'Missing required parameters');
      }

      if (!userId) {
        throw new HttpsError('unauthenticated', 'User authentication required');
      }

      // Check rate limits
      const rateLimitCheck = await checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        throw new HttpsError('resource-exhausted', rateLimitCheck.reason || 'Rate limit exceeded');
      }

      console.log('Starting single product analysis');

      // Check cache
      const imageBase64 = await imageUrlToBase64(imageUrl);
      const imageHash = calculateImageHash(imageBase64, 'single-product');
      
      const cachedAnalysis = await checkAnalysisCache(imageHash);
      if (cachedAnalysis) {
        console.log('Using cached analysis');
        
        await db.collection('skinAnalyses').doc(analysisId).update({
          status: 'completed',
          analysis: cachedAnalysis,
          completedAt: new Date(),
          cached: true
        });
        
        return { success: true, analysis: cachedAnalysis, cached: true };
      }

      // Get API key
      const apiKey = geminiApiKey.value();
      if (!apiKey) {
        throw new HttpsError('internal', 'Gemini API key not configured');
      }

      // Call Gemini Vision API with single product
      const analysis = await callGeminiVisionAPI([imageUrl], skinAnalysisData, apiKey);

      // Save to cache
      await saveAnalysisToCache(imageHash, analysis);

      // Update the analysis document
      await db.collection('skinAnalyses').doc(analysisId).update({
        status: 'completed',
        analysis: analysis,
        completedAt: new Date(),
        cached: false
      });

      console.log('Single product analysis completed successfully');
      
      return { 
        success: true, 
        analysis: analysis,
        cached: false
      };

    } catch (error: any) {
      console.error('Error in single product analysis:', error);
      
      if (request.data.analysisId) {
        try {
          await db.collection('skinAnalyses').doc(request.data.analysisId).update({
            status: 'error',
            error: error.message,
            completedAt: new Date()
          });
        } catch (updateError) {
          console.error('Error updating analysis document:', updateError);
        }
      }
      
      throw new HttpsError('internal', `Analysis failed: ${error.message}`);
    }
  }
);