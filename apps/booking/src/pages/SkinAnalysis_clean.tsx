import { useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, getDoc, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { SkinAnalysis, Customer } from '@shared/types';
import { compressImage, getCompressionStats } from '@buenobrows/shared/imageUtils';
import { initFirebase } from '@buenobrows/shared/firebase';
import MultiProductUpload from '../components/MultiProductUpload';
import RoutineBuilder from '../components/RoutineBuilder';
import ProductRecommendations from '../components/ProductRecommendations';

type AnalysisType = 'skin' | 'products';

interface ProductUpload {
  id: string;
  file: File;
  preview: string;
  productName: string;
  uploading: boolean;
  error?: string;
}

interface EnhancedProductAnalysis extends SkinAnalysis {
  products?: {
    id: string;
    imageUrl: string;
    productName?: string;
    analysis?: any;
  }[];
  aggregateAnalysis?: {
    recommendedOrder: any[];
    ingredientConflicts: any[];
    applicationTiming: any[];
    personalizedRecommendations: string[];
    suggestedReplacements: any[];
  };
  skinAnalysisReference?: {
    skinType: string;
    concerns: string[];
    compatibilityScore: number;
  };
}

export default function SkinAnalysisPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('skin');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [productUploads, setProductUploads] = useState<ProductUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<EnhancedProductAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [pastAnalyses, setPastAnalyses] = useState<EnhancedProductAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [customerProfilePic, setCustomerProfilePic] = useState<string>('');
  const [useProfilePic, setUseProfilePic] = useState(false);
  const [photoSource, setPhotoSource] = useState<'upload' | 'profile' | null>(null);
  const [hasSkinAnalysis, setHasSkinAnalysis] = useState(false);
  const [hasProductAnalysis, setHasProductAnalysis] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    dailyUsed: number;
    dailyLimit: number;
    hourlyUsed: number;
    hourlyLimit: number;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  // Debug: Log when analysis state changes
  useEffect(() => {
    console.log('🔍 Analysis state changed:', analysis);
    if (analysis) {
      console.log('🔍 Analysis status:', analysis.status);
      console.log('🔍 Analysis type:', analysis.type);
      console.log('🔍 Analysis data:', analysis.analysis);
    }
  }, [analysis]);

  // Check authentication and load customer profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Load customer's profile picture if they have one
      if (currentUser) {
        try {
          const db = getFirestore();
          const customerRef = doc(db, 'customers', currentUser.uid);
          const customerDoc = await getDoc(customerRef);
          
          if (customerDoc.exists()) {
            const customerData = customerDoc.data() as Customer;
            if (customerData.profilePictureUrl) {
              setCustomerProfilePic(customerData.profilePictureUrl);
            }
          } else {
            console.log('ℹ️ Customer profile not found for user:', currentUser.uid);
          }
        } catch (error) {
          console.error('❌ Error loading customer profile:', error);
        }
      }
      
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Email analysis results to user
  const emailAnalysisResults = async (analysisData: SkinAnalysis) => {
    if (!user?.email) return;

    try {
      const { functions } = initFirebase();
      const emailResults = httpsCallable(functions, 'emailAnalysisResults');
      
      const result = await emailResults({
        userEmail: user.email,
        analysisId: analysisData.id,
        analysisType: analysisData.type,
        analysisContent: analysisData.analysis
      });

      console.log('Email sent successfully:', result.data);
    } catch (error) {
      console.error('Error emailing analysis results:', error);
      setError('Failed to email results. Please try again.');
    }
  };

  // Calculate rate limit usage
  const calculateRateLimitUsage = async () => {
    if (!user) return;
    
    try {
      const db = getFirestore();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Get daily usage
      const dailyQuery = query(
        collection(db, 'skinAnalyses'),
        where('customerId', '==', user.uid),
        where('createdAt', '>=', oneDayAgo)
      );
      const dailySnapshot = await getDocs(dailyQuery);
      const dailyUsed = dailySnapshot.size;

      // Get hourly usage
      const hourlyQuery = query(
        collection(db, 'skinAnalyses'),
        where('customerId', '==', user.uid),
        where('createdAt', '>=', oneHourAgo)
      );
      const hourlySnapshot = await getDocs(hourlyQuery);
      const hourlyUsed = hourlySnapshot.size;

      setRateLimitInfo({
        dailyUsed,
        dailyLimit: 5,
        hourlyUsed,
        hourlyLimit: 2
      });
    } catch (error) {
      console.error('Error calculating rate limit usage:', error);
    }
  };

  // Load past analyses
  useEffect(() => {
    if (!user) return;

    try {
      const db = getFirestore();
      const q = query(
        collection(db, 'skinAnalyses'),
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          const analyses = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          })) as EnhancedProductAnalysis[];
          setPastAnalyses(analyses);
          
          // Check for existing analyses
          const skinAnalyses = analyses.filter(a => a.type === 'skin' && a.status === 'completed');
          const productAnalyses = analyses.filter(a => a.type === 'products' && a.status === 'completed');
          
          setHasSkinAnalysis(skinAnalyses.length > 0);
          setHasProductAnalysis(productAnalyses.length > 0);
          
          // Automatically show the most recent completed analysis
          if (analyses.length > 0 && !analysis) {
            const mostRecent = analyses[0];
            console.log('🔍 Most recent analysis:', mostRecent);
            if (mostRecent.status === 'completed') {
              console.log('✅ Setting completed analysis:', mostRecent);
              console.log('🔍 Analysis data structure:', {
                hasAnalysis: !!mostRecent.analysis,
                analysisType: typeof mostRecent.analysis,
                analysisKeys: mostRecent.analysis ? Object.keys(mostRecent.analysis) : 'N/A',
                fullAnalysis: mostRecent.analysis
              });
              console.log('🔍 Full analysis object:', JSON.stringify(mostRecent, null, 2));
              setAnalysis(mostRecent);
            } else {
              console.log('⚠️ Analysis not completed, status:', mostRecent.status);
            }
          }

          // Calculate rate limit usage
          calculateRateLimitUsage();
        },
        (error) => {
          console.error('❌ Error loading past analyses:', error);
          setPastAnalyses([]);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error setting up past analyses listener:', error);
      setPastAnalyses([]);
    }
  }, [user]);

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setPhotoSource('upload');
  };

  const handleSkinAnalysis = async () => {
    if (!selectedImage && !useProfilePic) {
      setError('Please select an image first');
      return;
    }

    if (useProfilePic && !customerProfilePic) {
      setError('No profile picture found. Please upload a photo instead.');
      return;
    }

    if (!user) {
      setError('Please log in to submit an analysis request');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      if (useProfilePic) {
        imageUrl = customerProfilePic;
      } else if (selectedImage) {
        // Compress and upload image
        const compressedFile = await compressImage(selectedImage, 0.8);
        const stats = getCompressionStats(selectedImage, compressedFile);
        console.log('📊 Compression stats:', stats);

        const storage = getStorage();
        const imageRef = ref(storage, `skin-analysis/${user.uid}/${Date.now()}-${compressedFile.name}`);
        const snapshot = await uploadBytes(imageRef, compressedFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create analysis request
      const db = getFirestore();
      const analysisData = {
        customerId: user.uid,
        type: 'skin',
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'skinAnalyses'), analysisData);
      console.log('✅ Skin analysis request created:', docRef.id);

      // Try to process analysis immediately
      try {
        const { functions } = initFirebase();
        const analyzeSkinPhoto = httpsCallable(functions, 'analyzeSkinPhoto');
        await analyzeSkinPhoto({ analysisId: docRef.id });
        console.log('✅ Skin analysis initiated');
      } catch (analysisError) {
        console.error('Error initiating skin analysis:', analysisError);
        // Don't fail the request if analysis fails - it will be processed later
      }

      setRequestSubmitted(true);
      setSelectedImage(null);
      setImagePreview('');
    } catch (error: any) {
      console.error('Error submitting skin analysis:', error);
      setError(error.message || 'Failed to submit analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductAnalysis = async () => {
    if (productUploads.length === 0) {
      setError('Please upload at least one product photo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const db = getFirestore();
      const storage = getStorage();

      // Upload all product images
      const imageUrls = await Promise.all(
        productUploads.map(async (product) => {
          try {
            const imageRef = ref(storage, `product-analysis/${user?.uid}/${Date.now()}-${product.file.name}`);
            const snapshot = await uploadBytes(imageRef, product.file);
            return await getDownloadURL(snapshot.ref);
          } catch (error) {
            console.error('Error uploading product image:', error);
            throw new Error(`Failed to upload ${product.productName || 'product image'}`);
          }
        })
      );

      return imageUrls;
    } catch (error: any) {
      console.error('Error uploading product images:', error);
      setError(error.message || 'Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (analysisType === 'skin') {
      await handleSkinAnalysis();
    } else {
      await handleProductAnalysis();
    }
  };

  const getSmartPrompt = () => {
    if (!hasSkinAnalysis && !hasProductAnalysis) {
      return {
        show: true,
        message: "Start your personalized skincare journey! Upload a clear photo of your face for AI-powered skin analysis.",
        action: "Analyze Your Skin"
      };
    }
    if (hasSkinAnalysis && !hasProductAnalysis) {
      return {
        show: true,
        message: "Great! Now let's analyze your current skincare products to create the perfect routine for your skin type.",
        action: "Analyze Your Products"
      };
    }
    return { show: false };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to use the skin analysis feature.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:bg-terracotta/90 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const prompt = getSmartPrompt();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {analysisType === 'skin' ? '✨ Skin Analysis' : '🧴 Product Analysis'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {analysisType === 'skin'
              ? 'Get personalized skincare recommendations powered by advanced AI analysis of your skin'
              : 'Analyze your skincare products for optimal routine, ingredient compatibility, and personalized recommendations'
            }
          </p>
        </div>

        {/* Smart Prompt */}
        {prompt.show && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-blue-800 font-medium">{prompt.message}</p>
                </div>
                <button
                  onClick={() => setAnalysisType(prompt.action.includes('Skin') ? 'skin' : 'products')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {prompt.action}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-200/50">
            <div className="flex space-x-1">
              <button
                onClick={() => setAnalysisType('skin')}
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  analysisType === 'skin'
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{
                  background: analysisType === 'skin' 
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                    : 'transparent'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>✨</span>
                  Skin Analysis
                </span>
              </button>
              <button
                onClick={() => setAnalysisType('products')}
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  analysisType === 'products'
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={{
                  background: analysisType === 'products' 
                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
                    : 'transparent'
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>🧴</span>
                  Product Analysis
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Rate Limit Info */}
        {rateLimitInfo && (
          <div className="mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">Daily: {rateLimitInfo.dailyUsed}/{rateLimitInfo.dailyLimit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Hourly: {rateLimitInfo.hourlyUsed}/{rateLimitInfo.hourlyLimit}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Resets in 24h
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {analysisType === 'skin' ? (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Photo</h2>
                  <p className="text-gray-600">
                    Take a clear, well-lit photo of your face for the most accurate analysis
                  </p>
                </div>

                {/* Profile Picture Option */}
                {customerProfilePic && (
                  <div className="mb-6">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <img
                        src={customerProfilePic}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">Use Profile Picture</h3>
                        <p className="text-sm text-gray-600">Use your existing profile photo for analysis</p>
                      </div>
                      <button
                        onClick={() => {
                          setUseProfilePic(true);
                          setPhotoSource('profile');
                          setSelectedImage(null);
                          setImagePreview('');
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          useProfilePic && photoSource === 'profile'
                            ? 'bg-terracotta text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {useProfilePic && photoSource === 'profile' ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload New Photo */}
                <div className="mb-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-terracotta transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageSelect(file);
                          setUseProfilePic(false);
                          setPhotoSource('upload');
                        }
                      }}
                      className="hidden"
                    />
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">Upload a new photo</p>
                        <p className="text-gray-600 text-sm mb-4">Supports JPG, PNG, WEBP (max 10MB)</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-terracotta text-white px-6 py-3 rounded-xl font-semibold hover:bg-terracotta/90 transition-colors"
                        >
                          Choose File
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                {(imagePreview || (useProfilePic && customerProfilePic)) && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Selected Image</h3>
                    <div className="relative">
                      <img
                        src={imagePreview || customerProfilePic}
                        alt="Preview"
                        className="w-full max-w-md mx-auto rounded-xl shadow-lg"
                      />
                      <button
                        onClick={() => {
                          setImagePreview('');
                          setSelectedImage(null);
                          setUseProfilePic(false);
                          setPhotoSource(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || (!selectedImage && !useProfilePic)}
                  className="w-full bg-gradient-to-r from-terracotta to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-terracotta/90 hover:to-orange-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>✨</span>
                      <span>
                        {analysisType === 'skin' 
                          ? 'Analyze My Skin' 
                          : 'Analyze My Products'
                        }
                      </span>
                    </div>
                  )}
                </button>

                {/* Success Message */}
                {requestSubmitted && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-800">Analysis Submitted!</h3>
                        <p className="text-green-700 text-sm">
                          {analysisType === 'skin' 
                            ? ' Results are ready below!' 
                            : ' You\'ll see results here once processing is complete.'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mb-12">
            <MultiProductUpload
              uploads={productUploads}
              setUploads={setProductUploads}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          </div>
        )}

        {/* Analysis History */}
        {pastAnalyses.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis History</h2>
                <p className="text-gray-600">View your previous skin and product analyses</p>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-4">
                {pastAnalyses.map((pastAnalysis) => (
                  <div key={pastAnalysis.id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">
                            {pastAnalysis.type === 'skin' ? '✨' : '🧴'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 capitalize">
                            {pastAnalysis.type} Analysis
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {pastAnalysis.createdAt && (() => {
                              try {
                                const date = pastAnalysis.createdAt.toDate ? pastAnalysis.createdAt.toDate() : new Date(pastAnalysis.createdAt);
                                return date.toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                });
                              } catch (error) {
                                console.error('Error formatting date:', error);
                                return 'Date unavailable';
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          pastAnalysis.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : pastAnalysis.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pastAnalysis.status}
                        </div>
                        {pastAnalysis.status === 'completed' && (
                          <button
                            onClick={() => {
                              console.log('🔍 View Results clicked for analysis:', pastAnalysis);
                              console.log('🔍 Analysis status:', pastAnalysis.status);
                              console.log('🔍 Analysis data:', pastAnalysis.analysis);
                              setAnalysis(pastAnalysis);
                            }}
                            className="bg-gradient-to-r from-terracotta to-orange-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-terracotta/90 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          >
                            View Results
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Debug Info */}
        {analysis && (
          <div className="mt-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">Debug: Analysis State</h3>
            <p className="text-sm text-yellow-700">
              Analysis loaded: {analysis ? 'Yes' : 'No'} | 
              Status: {analysis?.status} | 
              Type: {analysis?.type} | 
              Has analysis data: {analysis?.analysis ? 'Yes' : 'No'}
            </p>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && analysis.status === 'completed' && (
          <div className="mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Skin Analysis Results</h2>
                  <p className="text-gray-600 text-lg">Personalized recommendations based on your skin analysis</p>
                </div>
                
                <div className="space-y-6">
                  {analysis.analysis ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-800 mb-4">Analysis Data</h3>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                        {JSON.stringify(analysis.analysis, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center">No analysis data available</p>
                  )}
                </div>

                {/* Email Button */}
                {user?.email && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => emailAnalysisResults(analysis)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      📧 Email Results
                    </button>
                  </div>
                )}

                {/* Product Recommendations */}
                {user && (
                  <ProductRecommendations
                    analysisId={analysis.id}
                    skinAnalysisData={analysis}
                    userId={user.uid}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
