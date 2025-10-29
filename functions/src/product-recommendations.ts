import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try { initializeApp(); } catch {}
const db = getFirestore();

// Local interface definition for MonetizedProduct
interface MonetizedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  commission: number;
  affiliateLink: string;
  imageUrl?: string;
  description?: string;
  targetSkinTypes: string[];
  targetConcerns: string[];
  activeIngredients?: string[];
  compatibilityScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Rate limiting functions
async function checkRateLimit(userId: string, action: string): Promise<{ allowed: boolean; message: string }> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Check daily limit (5 recommendations per day)
  const dailyQuery = db.collection('conversionTracking')
    .where('customerId', '==', userId)
    .where('recommendationSent', '>=', oneDayAgo);
  
  const dailySnapshot = await dailyQuery.get();
  if (dailySnapshot.size >= 5) {
    return { allowed: false, message: 'Daily recommendation limit reached (5 per day)' };
  }

  // Check hourly limit (2 recommendations per hour)
  const hourlyQuery = db.collection('conversionTracking')
    .where('customerId', '==', userId)
    .where('recommendationSent', '>=', oneHourAgo);
  
  const hourlySnapshot = await hourlyQuery.get();
  if (hourlySnapshot.size >= 2) {
    return { allowed: false, message: 'Hourly recommendation limit reached (2 per hour)' };
  }

  return { allowed: true, message: 'Rate limit check passed' };
}

async function consumeRateLimit(userId: string, action: string): Promise<void> {
  // This will be called after successful recommendation generation
  // The actual tracking record will be created in the calling function
}

// Generate product recommendations based on skin analysis
export const generateProductRecommendations = onCall(
  { 
    timeoutSeconds: 60,
    memory: '512MiB'
  },
  async (request) => {
    try {
      const { analysisId, skinAnalysisData } = request.data;
      
      if (!analysisId || !skinAnalysisData) {
        throw new HttpsError('invalid-argument', 'Missing required parameters: analysisId and skinAnalysisData');
      }

      // Check rate limit
      const { allowed, message } = await checkRateLimit(skinAnalysisData.customerId, 'productRecommendations');
      if (!allowed) {
        throw new HttpsError('resource-exhausted', message);
      }

      // Load active monetized products from Firestore
      const productsSnapshot = await db.collection('monetizedProducts')
        .where('isActive', '==', true)
        .get();

      if (productsSnapshot.empty) {
        return {
          recommendations: [],
          compatibilityScores: [],
          message: 'No active products available for recommendations'
        };
      }

      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MonetizedProduct[];

      // Generate compatibility scores based on skin analysis
      const recommendations = products.map(product => {
        let compatibilityScore = 5; // Base score
        let reason = 'General recommendation';

        // Match skin type
        if (skinAnalysisData.analysis?.skinType && product.targetSkinTypes?.includes(skinAnalysisData.analysis.skinType)) {
          compatibilityScore += 2;
          reason = `Perfect for ${skinAnalysisData.analysis.skinType} skin`;
        }

        // Match concerns
        if (skinAnalysisData.analysis?.concerns && product.targetConcerns) {
          const matchingConcerns = skinAnalysisData.analysis.concerns.filter((concern: string) => 
            product.targetConcerns.includes(concern)
          );
          if (matchingConcerns.length > 0) {
            compatibilityScore += matchingConcerns.length;
            reason = `Targets your concerns: ${matchingConcerns.join(', ')}`;
          }
        }

        // Adjust for skin tone compatibility
        if (skinAnalysisData.analysis?.skinTone?.category) {
          const skinTone = skinAnalysisData.analysis.skinTone.category.toLowerCase();
          if (skinTone.includes('fair') || skinTone.includes('light')) {
            if (product.category === 'sunscreen' || product.category === 'foundation') {
              compatibilityScore += 1;
            }
          }
        }

        // Cap score at 10
        compatibilityScore = Math.min(compatibilityScore, 10);

        return {
          productId: product.id,
          product: product,
          compatibilityScore,
          reason,
          category: product.category
        };
      });

      // Sort by compatibility score and return top 5-10
      const sortedRecommendations = recommendations
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 8);

      // Consume rate limit
      await consumeRateLimit(skinAnalysisData.customerId, 'productRecommendations');

      return {
        recommendations: sortedRecommendations,
        compatibilityScores: sortedRecommendations.map(r => r.compatibilityScore),
        message: `Generated ${sortedRecommendations.length} personalized recommendations`
      };

    } catch (error: any) {
      console.error('Error generating product recommendations:', error);
      throw new HttpsError('internal', `Failed to generate recommendations: ${error.message}`);
    }
  }
);

// Track product recommendation clicks and conversions
export const trackProductClick = onCall(
  { 
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (request) => {
    try {
      const { customerId, analysisId, productId, affiliateLink } = request.data;
      
      if (!customerId || !analysisId || !productId || !affiliateLink) {
        throw new HttpsError('invalid-argument', 'Missing required parameters');
      }

      // Create conversion tracking record
      const trackingData = {
        customerId,
        analysisId,
        productId,
        recommendationSent: new Date(),
        linkClicked: new Date(),
        revenue: 0, // Will be updated if purchase is completed
        commission: 0, // Will be updated if purchase is completed
        status: 'clicked',
        metadata: {
          clickSource: 'analysis_recommendation',
          deviceType: request.rawRequest.headers['user-agent'] || 'unknown'
        }
      };

      const docRef = await db.collection('conversionTracking').add(trackingData);
      
      console.log(`Product click tracked: ${docRef.id} for customer ${customerId}`);

      return { 
        success: true, 
        trackingId: docRef.id,
        message: 'Click tracked successfully' 
      };

    } catch (error: any) {
      console.error('Error tracking product click:', error);
      throw new HttpsError('internal', `Failed to track click: ${error.message}`);
    }
  }
);

// Update conversion tracking when purchase is completed
export const updateConversionTracking = onCall(
  { 
    timeoutSeconds: 30,
    memory: '256MiB'
  },
  async (request) => {
    try {
      const { trackingId, revenue, commission } = request.data;
      
      if (!trackingId || revenue === undefined || commission === undefined) {
        throw new HttpsError('invalid-argument', 'Missing required parameters');
      }

      // Update the tracking record
      await db.collection('conversionTracking').doc(trackingId).update({
        purchaseCompleted: new Date(),
        revenue: parseFloat(revenue),
        commission: parseFloat(commission),
        status: 'purchased',
        updatedAt: new Date()
      });

      console.log(`Conversion tracking updated: ${trackingId} - Revenue: $${revenue}, Commission: $${commission}`);

      return { 
        success: true, 
        message: 'Conversion tracking updated successfully' 
      };

    } catch (error: any) {
      console.error('Error updating conversion tracking:', error);
      throw new HttpsError('internal', `Failed to update tracking: ${error.message}`);
    }
  }
);
