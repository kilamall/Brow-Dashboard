import { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { initFirebase } from '@buenobrows/shared/firebase';
import type { ProductRecommendation, MonetizedProduct } from '@shared/types';

interface ProductRecommendationsProps {
  analysisId: string;
  skinAnalysisData: any;
  userId: string;
}

export default function ProductRecommendations({ 
  analysisId, 
  skinAnalysisData, 
  userId 
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clickedProducts, setClickedProducts] = useState<Set<string>>(new Set());

  // Automatically generate recommendations when component mounts
  useEffect(() => {
    generateRecommendations();
  }, [analysisId, skinAnalysisData]);

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const { functions } = initFirebase();
      const generateProductRecommendations = httpsCallable(functions, 'generateProductRecommendations');
      
      const result = await generateProductRecommendations({
        analysisId,
        skinAnalysisData
      });

      setRecommendations((result.data as any).recommendations || []);
    } catch (err: any) {
      console.error('Error generating recommendations:', err);
      if (err.code === 'functions/resource-exhausted') {
        setError('You have reached the daily limit for product recommendations. Please try again tomorrow.');
      } else {
        setError('Failed to generate product recommendations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product: MonetizedProduct) => {
    try {
      const { functions } = initFirebase();
      const trackProductClick = httpsCallable(functions, 'trackProductClick');
      
      await trackProductClick({
        customerId: userId,
        analysisId,
        productId: product.id,
        affiliateLink: product.affiliateLink
      });

      // Track locally to prevent duplicate clicks
      setClickedProducts(prev => new Set([...prev, product.id]));
      
      // Open affiliate link
      window.open(product.affiliateLink, '_blank');
    } catch (err) {
      console.error('Error tracking product click:', err);
      // Still open the link even if tracking fails
      window.open(product.affiliateLink, '_blank');
    }
  };

  useEffect(() => {
    if (analysisId && skinAnalysisData) {
      generateRecommendations();
    }
  }, [analysisId, skinAnalysisData]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600 font-medium">Generating personalized recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-red-800 text-lg">Recommendation Error</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200/50 rounded-2xl p-6 mb-8 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mb-2">No Recommendations Available</h3>
          <p className="text-gray-600 text-sm mb-4">
            We're working on building our product recommendation database. Check back soon!
          </p>
          <button
            onClick={generateRecommendations}
            className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 mb-8 shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-green-800 text-xl">Recommended Products for Your Skin</h3>
          <p className="text-green-600 text-sm mt-1">
            Personalized recommendations based on your analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.productId}
            className="bg-white rounded-xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-md transition-shadow"
          >
            {rec.product.imageUrl && (
              <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                <img
                  src={rec.product.imageUrl}
                  alt={rec.product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                    {rec.product.name}
                  </h4>
                  <p className="text-gray-600 text-xs mt-1">{rec.product.brand}</p>
                </div>
                <div className="flex items-center ml-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rec.compatibilityScore >= 8 
                      ? 'bg-green-100 text-green-800'
                      : rec.compatibilityScore >= 6
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rec.compatibilityScore}/10
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-xs mb-3 leading-relaxed">
                {rec.reason}
              </p>

              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold text-gray-900">
                  ${rec.product.price.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  {rec.category}
                </div>
              </div>

              <button
                onClick={() => handleProductClick(rec.product)}
                disabled={clickedProducts.has(rec.productId)}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                  clickedProducts.has(rec.productId)
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-terracotta text-white hover:bg-terracotta/90'
                }`}
              >
                {clickedProducts.has(rec.productId) ? '✓ Clicked' : 'Shop Now'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-white/50 rounded-xl border border-white/50">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-700">
              <strong>Complete your routine:</strong> These products are specifically recommended based on your skin analysis. 
              Click "Shop Now" to view the product and complete your personalized skincare routine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
