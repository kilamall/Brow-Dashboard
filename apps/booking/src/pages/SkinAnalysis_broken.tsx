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

  // Debug: Log when analysis state changes
  useEffect(() => {
    console.log('🔍 Analysis state changed:', analysis);
    if (analysis) {
      console.log('🔍 Analysis status:', analysis.status);
      console.log('🔍 Analysis type:', analysis.type);
      console.log('🔍 Analysis data:', analysis.analysis);
    }
  }, [analysis]);
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
      
      console.log('Analysis results emailed successfully:', result.data);
      
      // Show success message
      setError('');
      alert('Analysis results have been emailed to you!');
    } catch (error) {
      console.error('Error emailing analysis results:', error);
      setError('Failed to email results. Please try again.');
    }
  };

  // Calculate rate limit usage
  const calculateRateLimitUsage = async () => {
    if (!user) return;

    try {
      const db = getFirestore(); // Add this line to define db
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const recentAnalysesQuery = query(
        collection(db, 'skinAnalyses'),
        where('customerId', '==', user.uid),
        where('createdAt', '>=', oneDayAgo),
        orderBy('createdAt', 'desc')
      );

      const recentAnalysesSnapshot = await getDocs(recentAnalysesQuery);
      const recentAnalyses = recentAnalysesSnapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      const hourlyAnalyses = recentAnalyses.filter((analysis: any) => 
        analysis.createdAt >= oneHourAgo
      );

      setRateLimitInfo({
        dailyUsed: recentAnalyses.length,
        dailyLimit: 5,
        hourlyUsed: hourlyAnalyses.length,
        hourlyLimit: 2
      });
    } catch (error) {
      console.error('Error calculating rate limit usage:', error);
    }
  };

  // Load user's past analyses and check for existing analyses
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
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
    setLoading(true);

    try {
      // Compress image to reduce storage costs
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      });

      const stats = getCompressionStats(file.size, compressedFile.size);
      console.log(`Image compressed: ${stats.savingsPercent}% reduction (${stats.originalMB}MB → ${stats.compressedMB}MB)`);

      setSelectedImage(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Compression error:', err);
      setError('Failed to process image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductUploadsChange = (products: ProductUpload[]) => {
    setProductUploads(products);
  };

  const uploadProductImages = async (products: ProductUpload[]): Promise<string[]> => {
    const storage = getStorage();
    const imageUrls: string[] = [];

    for (const product of products) {
      try {
        const timestamp = Date.now();
        const storagePath = `product-analysis/${user!.uid}/${timestamp}_${product.file.name}`;
        
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, product.file);
        const imageUrl = await getDownloadURL(storageRef);
        
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error('Error uploading product image:', error);
        throw new Error(`Failed to upload ${product.productName || 'product image'}`);
      }
    }

    return imageUrls;
  };

  const handleAnalyze = async () => {
    if (!user) {
      setError('Please log in to use analysis');
      return;
    }

    if (analysisType === 'skin') {
      await handleSkinAnalysis();
    } else {
      await handleProductAnalysis();
    }
  };

  const handleSkinAnalysis = async () => {
    // Validate that we have an image source
    if (!useProfilePic && !selectedImage) {
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
      const { functions } = initFirebase();
      const storage = getStorage();
      const db = getFirestore();

      let imageUrl: string;

      // Use profile picture or upload new image
      if (useProfilePic && customerProfilePic) {
        imageUrl = customerProfilePic;
      } else if (selectedImage) {
        // Upload image to Firebase Storage
        const timestamp = Date.now();
        const storagePath = `skin-analysis/${user.uid}/${timestamp}_${selectedImage.name}`;
        
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, selectedImage);
        imageUrl = await getDownloadURL(storageRef);
      } else {
        setError('Please select an image first');
        return;
      }

      // Create analysis request
      const analysisData = {
        customerId: user.uid,
        type: 'skin',
        imageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
        customerEmail: user.email,
        customerName: user.displayName || 'Customer',
      };

      const docRef = await addDoc(collection(db, 'skinAnalyses'), analysisData);
      console.log('Skin analysis request created:', docRef.id);

      // Call the skin analysis function
      try {
        const analyzeSkinPhoto = httpsCallable(functions, 'analyzeSkinPhoto');
        await analyzeSkinPhoto({
          analysisId: docRef.id,
          imageUrl: imageUrl,
          analysisType: 'skin'
        });
        console.log('Skin analysis initiated');
      } catch (analysisError: any) {
        console.error('Error initiating skin analysis:', analysisError);
        // Don't fail the request if analysis fails - it will be processed later
      }

      setRequestSubmitted(true);
    } catch (err) {
      console.error('Error creating skin analysis request:', err);
      setError('Failed to submit analysis request. Please try again.');
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
      const { functions } = initFirebase();
      const db = getFirestore();

      // Upload all product images
      const imageUrls = await uploadProductImages(productUploads);

      // Prepare product data
      const products = productUploads.map((product, index) => ({
        id: product.id,
        imageUrl: imageUrls[index],
        productName: product.productName || `Product ${index + 1}`,
      }));

      // Get existing skin analysis for cross-reference
      let skinAnalysisRef = null;
      if (hasSkinAnalysis) {
        const skinQuery = query(
          collection(db, 'skinAnalyses'),
          where('customerId', '==', user!.uid),
          where('type', '==', 'skin'),
          where('status', '==', 'completed'),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const skinSnapshot = await getDocs(skinQuery);
        if (!skinSnapshot.empty) {
          skinAnalysisRef = skinSnapshot.docs[0].data();
        }
      }

      // Create enhanced product analysis request
      const analysisData = {
        customerId: user!.uid,
        type: 'products',
        products,
        skinAnalysisReference: skinAnalysisRef ? {
          skinType: skinAnalysisRef.skinType || 'Unknown',
          concerns: skinAnalysisRef.concerns || [],
          compatibilityScore: 0, // Will be calculated by AI
        } : null,
        status: 'pending',
        createdAt: serverTimestamp(),
        customerEmail: user!.email,
        customerName: user!.displayName || 'Customer',
      };

      const docRef = await addDoc(collection(db, 'skinAnalyses'), analysisData);
      console.log('Enhanced product analysis request created:', docRef.id);

      // Call the multi-product analysis function
      try {
        const analyzeMultipleProducts = httpsCallable(functions, 'analyzeMultipleProducts');
        await analyzeMultipleProducts({
          analysisId: docRef.id,
          imageUrls: imageUrls,
          skinAnalysisData: skinAnalysisRef,
          userId: user!.uid
        });
        console.log('Multi-product analysis initiated');
      } catch (analysisError: any) {
        console.error('Error initiating multi-product analysis:', analysisError);
        
        // Handle rate limiting errors specifically
        if (analysisError.code === 'functions/resource-exhausted') {
          setError(analysisError.message || 'You\'ve reached the analysis limit. Please try again later.');
        } else {
          // Don't fail the request if analysis fails - it will be processed later
          console.log('Analysis will be processed in the background');
        }
      }

      setRequestSubmitted(true);
    } catch (err) {
      console.error('Error creating product analysis request:', err);
      setError('Failed to submit analysis request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAnalysisPrompt = () => {
    if (!hasSkinAnalysis && hasProductAnalysis) {
      return {
        show: true,
        type: 'skin',
        message: "Complete your skin analysis for personalized product recommendations!",
        action: "Analyze Your Skin"
      };
    }
    if (hasSkinAnalysis && !hasProductAnalysis) {
      return {
        show: true,
        type: 'products',
        message: "Analyze your current products to optimize your skincare routine!",
        action: "Analyze Your Products"
      };
    }
    return { show: false };
  };

  const prompt = getAnalysisPrompt();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-terracotta"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to use skin analysis</p>
            <button
              onClick={() => navigate('/login')}
            className="bg-terracotta text-white px-6 py-3 rounded-lg hover:bg-terracotta/90 transition-colors"
          >
            Sign In
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-terracotta/5 via-transparent to-blue-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-terracotta/10 text-terracotta text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI-Powered Analysis
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              {analysisType === 'skin' ? 'Skin Analysis' : 'Product Analysis'}
        </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {analysisType === 'skin' 
                ? 'Get personalized skincare recommendations powered by advanced AI analysis of your skin'
                : 'Analyze your skincare products for optimal routine, ingredient compatibility, and personalized recommendations'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Modern Analysis Type Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-gray-200/50">
            <div className="flex space-x-1">
          <button
                onClick={() => setAnalysisType('skin')}
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  analysisType === 'skin'
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{
                  background: analysisType === 'skin' 
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                    : 'transparent'
                }}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Skin Analysis</span>
                </span>
          </button>
              <button
                onClick={() => setAnalysisType('products')}
                className={`relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  analysisType === 'products'
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={{
                  background: analysisType === 'products' 
                    ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                    : 'transparent'
                }}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>Product Analysis</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modern Rate Limit Info */}
        {rateLimitInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                    <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Analysis Usage</h3>
                  <p className="text-gray-600 text-sm">
                    Track your daily and hourly analysis limits
                  </p>
                      </div>
                      </div>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    rateLimitInfo.dailyUsed >= rateLimitInfo.dailyLimit 
                      ? 'bg-red-100 text-red-800' 
                      : rateLimitInfo.dailyUsed >= rateLimitInfo.dailyLimit * 0.8
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      rateLimitInfo.dailyUsed >= rateLimitInfo.dailyLimit 
                        ? 'bg-red-500' 
                        : rateLimitInfo.dailyUsed >= rateLimitInfo.dailyLimit * 0.8
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}></div>
                    Daily: {rateLimitInfo.dailyUsed}/{rateLimitInfo.dailyLimit}
                    </div>
                  </div>
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    rateLimitInfo.hourlyUsed >= rateLimitInfo.hourlyLimit 
                      ? 'bg-red-100 text-red-800' 
                      : rateLimitInfo.hourlyUsed >= rateLimitInfo.hourlyLimit * 0.8
                        ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      rateLimitInfo.hourlyUsed >= rateLimitInfo.hourlyLimit 
                        ? 'bg-red-500' 
                        : rateLimitInfo.hourlyUsed >= rateLimitInfo.hourlyLimit * 0.8
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}></div>
                    Hourly: {rateLimitInfo.hourlyUsed}/{rateLimitInfo.hourlyLimit}
                  </div>
                </div>
              </div>
          </div>
        </div>
      )}

        {/* Modern Smart Prompting */}
        {prompt.show && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Complete Your Analysis</h3>
                  <p className="text-gray-600 text-sm mt-1">{prompt.message}</p>
                </div>
              </div>
              <button
                onClick={() => setAnalysisType(prompt.type as AnalysisType)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {prompt.action}
              </button>
            </div>
          </div>
        )}

        {/* Modern Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
          <div className="p-8 lg:p-12">
          {analysisType === 'skin' ? (
            <div className="space-y-8">
              {/* Modern Skin Analysis Upload */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Photo</h2>
                  <p className="text-gray-600 text-lg">Get personalized skincare recommendations based on your skin analysis</p>
                </div>
                
                {/* Profile Picture Option */}
                {customerProfilePic && (
                  <div className="mb-8">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                      <label className="flex items-center space-x-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="radio"
                            name="photoSource"
                            checked={useProfilePic}
                            onChange={() => {
                    setUseProfilePic(true);
                              setPhotoSource('profile');
                              setSelectedImage(null);
                              setImagePreview('');
                            }}
                            className="w-5 h-5 text-terracotta focus:ring-terracotta focus:ring-2"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300">
                              <svg className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div>
                              <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Use my profile picture</span>
                              <p className="text-sm text-gray-600 mt-1">Quick and easy option using your existing photo</p>
                            </div>
                          </div>
                        </div>
                      </label>
                      {useProfilePic && (
                        <div className="mt-4 flex justify-center">
                          <div className="relative">
                    <img
                      src={customerProfilePic}
                      alt="Profile"
                              className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-lg"
                            />
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                    </div>
                  </div>
                  </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload New Photo */}
                <div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <label className="flex items-center space-x-4 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="radio"
                          name="photoSource"
                          checked={!useProfilePic}
                          onChange={() => {
                    setUseProfilePic(false);
                            setPhotoSource('upload');
                          }}
                          className="w-5 h-5 text-terracotta focus:ring-terracotta focus:ring-2"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-terracotta/10 to-orange-500/10 rounded-xl flex items-center justify-center group-hover:from-terracotta/20 group-hover:to-orange-500/20 transition-all duration-300">
                            <svg className="w-5 h-5 text-terracotta group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                            <span className="text-lg font-semibold text-gray-900 group-hover:text-terracotta transition-colors">Upload a new photo</span>
                            <p className="text-sm text-gray-600 mt-1">Take a fresh photo for the most accurate analysis</p>
                    </div>
                  </div>
                  </div>
                    </label>
                    
                    {!useProfilePic && (
                      <div className="mt-6">
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-terracotta hover:bg-terracotta/5 transition-all duration-300 group"
                          onClick={() => fileInputRef.current?.click()}
                        >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                          />
                          
                          {imagePreview ? (
                            <div className="space-y-6">
                              <div className="relative inline-block">
                  <img
                    src={imagePreview}
                                  alt="Preview"
                                  className="mx-auto max-h-80 rounded-2xl border-4 border-white shadow-2xl"
                                />
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-terracotta rounded-full flex items-center justify-center shadow-lg">
                                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                              <p className="text-lg font-medium text-gray-700 group-hover:text-terracotta transition-colors">Click to change photo</p>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-terracotta/10 to-terracotta/20 rounded-2xl flex items-center justify-center group-hover:from-terracotta/20 group-hover:to-terracotta/30 transition-all duration-300">
                                <svg className="w-10 h-10 text-terracotta group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-gray-900 group-hover:text-terracotta transition-colors">Upload Skin Photo</p>
                                <p className="text-lg text-gray-600 mt-2">Click to browse or drag and drop</p>
                                <p className="text-sm text-gray-500 mt-3 bg-gray-100 rounded-full px-4 py-2 inline-block">Supports JPG, PNG, WEBP (max 10MB)</p>
              </div>
            </div>
          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Modern Product Analysis Upload */}
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Products</h2>
                  <p className="text-gray-600 text-lg">Analyze up to 5 skincare products for optimal routine recommendations</p>
                </div>
                <MultiProductUpload
                  onProductsChange={handleProductUploadsChange}
                  maxProducts={5}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* Modern Error Display */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 text-lg">Error</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Modern Action Buttons */}
          <div className="flex justify-center mt-12">
          <button
            onClick={handleAnalyze}
              disabled={loading || (analysisType === 'skin' ? (!useProfilePic && !selectedImage) : productUploads.length === 0)}
              className="group relative bg-gradient-to-r from-terracotta to-orange-600 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-terracotta/90 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none"
          >
              <div className="flex items-center space-x-3">
            {loading ? (
                  <>
                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                    <span>Processing Analysis...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                    <span>
                      {analysisType === 'skin' 
                        ? 'Analyze My Skin' 
                        : 'Analyze My Products'
                      }
              </span>
                  </>
                )}
            </div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Modern Success Message */}
          {requestSubmitted && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">Analysis Submitted!</h3>
                    <p className="text-green-700 text-sm mt-1">
                      Your {analysisType} analysis has been submitted and is being processed. 
                      {analysis && analysis.status === 'completed' 
                        ? ' Results are ready below!' 
                        : ' You\'ll see results here once processing is complete.'
                      }
                    </p>
                  </div>
                </div>
                {user?.email && analysis && analysis.status === 'completed' && (
                  <button
                    onClick={() => emailAnalysisResults(analysis)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    📧 Email Results
                  </button>
                )}
              </div>
            </div>
          )}
            </div>
            </div>

        {/* Modern Past Analyses */}
        {pastAnalyses.length > 0 && (
          <div className="mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Analysis History</h2>
                    <p className="text-gray-600 text-lg mt-2">View your previous skin and product analyses</p>
            </div>
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {showHistory ? 'Hide History' : 'Show History'}
                  </button>
                </div>

                {showHistory && (
                  <div className="space-y-6">
                    {pastAnalyses.map((pastAnalysis) => (
                      <div key={pastAnalysis.id} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              pastAnalysis.type === 'skin' 
                                ? 'bg-blue-100' 
                                : 'bg-purple-100'
                            }`}>
                              <svg className={`w-6 h-6 ${
                                pastAnalysis.type === 'skin' 
                                  ? 'text-blue-600' 
                                  : 'text-purple-600'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {pastAnalysis.type === 'skin' ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                )}
                              </svg>
                </div>
                    <div>
                              <h3 className="text-xl font-bold text-gray-900 capitalize">
                                {pastAnalysis.type} Analysis
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {pastAnalysis.createdAt && (() => {
                                  try {
                                    // Handle both Firestore Timestamp and Date objects
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
                </div>
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
        {analysis && analysis.status === 'completed' ? (
          <div className="mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-8 lg:p-12">
                {analysis.type === 'products' ? (
                  <RoutineBuilder analysis={analysis.aggregateAnalysis || {}} />
                ) : (
                  <div className="space-y-8">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Skin Analysis Results</h2>
                      <p className="text-gray-600 text-lg">Personalized recommendations based on your skin analysis</p>
                </div>
                    <div className="prose max-w-none">
                      {(() => {
                        if (!analysis.analysis) {
                          return <p className="text-gray-600">No analysis available</p>;
                        }
                        
                        // If analysis is a string, render as HTML
                        if (typeof analysis.analysis === 'string') {
                          return <div dangerouslySetInnerHTML={{ __html: analysis.analysis }} />;
                        }
                        
                        // If analysis is an object, render it nicely
                        if (typeof analysis.analysis === 'object') {
                          return (
                            <div className="space-y-6">
                              {analysis.analysis.skinType && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-blue-800 mb-2">Skin Type</h3>
                                  <p className="text-blue-700">{analysis.analysis.skinType}</p>
                                </div>
                              )}
                              
                              {analysis.analysis.concerns && analysis.analysis.concerns.length > 0 && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-yellow-800 mb-2">Key Concerns</h3>
                                  <ul className="list-disc list-inside text-yellow-700">
                                    {analysis.analysis.concerns.map((concern: string, index: number) => (
                                      <li key={index}>{concern}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-green-800 mb-2">Recommendations</h3>
                                  <ul className="list-disc list-inside text-green-700">
                                    {analysis.analysis.recommendations.map((rec: string, index: number) => (
                                      <li key={index}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysis.analysis.summary && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
                                  <p className="text-gray-700">{analysis.analysis.summary}</p>
                                </div>
                              )}
                              
                              {/* Fallback: show raw data if none of the above match */}
                              {!analysis.analysis.skinType && !analysis.analysis.concerns && !analysis.analysis.recommendations && !analysis.analysis.summary && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                  <h3 className="font-semibold text-gray-800 mb-2">Analysis Results</h3>
                                  <div className="text-sm text-gray-700">
                                    <p className="mb-2">Raw analysis data:</p>
                                    <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-96">
                                      {JSON.stringify(analysis.analysis, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-4">
                            <p className="text-gray-600">Analysis data format not recognized</p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <h3 className="font-semibold text-yellow-800 mb-2">Debug: Raw Analysis Data</h3>
                              <pre className="text-xs text-yellow-700 whitespace-pre-wrap overflow-auto max-h-64">
                                {JSON.stringify(analysis.analysis, null, 2)}
                              </pre>
                            </div>
                          </div>
                        );
                      })()}
                </div>
              </div>
            )}

                {/* Product Recommendations */}
                {analysis && analysis.status === 'completed' && user && (
                  <ProductRecommendations
                    analysisId={analysis.id}
                    skinAnalysisData={analysis}
                    userId={user.uid}
                  />
                )}

                {/* Skincare Routine Suggestion */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
              </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Skincare Journey</h3>
                      <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                        Upload photos of your current skincare products to get personalized routine recommendations, 
                        ingredient compatibility analysis, and optimal application order.
                      </p>
                      <button
                        onClick={() => setAnalysisType('products')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
                      >
                        📸 Analyze My Skincare Products
                      </button>
                  </div>
              </div>
            )}
          </div>
        ) : pastAnalyses.length > 0 ? (
          <div className="mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-8 lg:p-12 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Analysis in Progress</h3>
                <p className="text-gray-600 text-lg mb-6">
                  Your analysis is being processed. This usually takes a few minutes. 
                  Check back soon or refresh the page to see your results!
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔄 Refresh Page
                </button>
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
}