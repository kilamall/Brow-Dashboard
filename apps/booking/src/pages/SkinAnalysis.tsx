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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [mostRecentSkinAnalysis, setMostRecentSkinAnalysis] = useState<EnhancedProductAnalysis | null>(null);
  const [mostRecentProductAnalysis, setMostRecentProductAnalysis] = useState<EnhancedProductAnalysis | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);


  // Check authentication and load customer profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? `User: ${currentUser.uid}` : 'No user');
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

    setEmailStatus('sending');
    setError('');

    try {
      const { functions } = initFirebase();
      const emailResults = httpsCallable(functions, 'emailAnalysisResults');
      
      const result = await emailResults({
        userEmail: user.email,
        analysisId: analysisData.id,
        analysisType: analysisData.type,
        analysisContent: analysisData.analysis
      });

      setEmailStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setEmailStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error emailing analysis results:', error);
      setEmailStatus('error');
      setError('Failed to email results. Please try again.');
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setEmailStatus('idle');
      }, 5000);
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
          
          // Set most recent analyses
          setMostRecentSkinAnalysis(skinAnalyses.length > 0 ? skinAnalyses[0] : null);
          setMostRecentProductAnalysis(productAnalyses.length > 0 ? productAnalyses[0] : null);
          
          // Automatically show the most recent analysis (regardless of status)
          if (analyses.length > 0 && !analysis) {
            const mostRecent = analyses[0];
              setAnalysis(mostRecent);
            }

          // Calculate rate limit usage - temporarily disabled due to index issue
          // calculateRateLimitUsage();
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

  const handleImageSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    const previews: string[] = [];

    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i];
      
    if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not a valid image file`);
        continue;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} is too large (max 10MB)`);
        continue;
      }

      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (validFiles.length === 0) {
      setError('Please select valid image files');
      return;
    }

    setError('');
    setSelectedImages(validFiles);
    setImagePreviews(previews);
    setPhotoSource('upload');
  };

  const handleSkinAnalysis = async () => {
    if (selectedImages.length === 0 && !useProfilePic) {
      setError('Please select at least one image first');
      return;
    }

    if (useProfilePic && !customerProfilePic) {
      setError('No profile picture found. Please upload photos instead.');
      return;
    }

    if (!user) {
      setError('Please log in to submit an analysis request');
      return;
    }

    if (!user.uid) {
      setError('User authentication error. Please log out and log back in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrls: string[] = [];

      if (useProfilePic) {
        imageUrls = [customerProfilePic];
      } else if (selectedImages.length > 0) {
        // Upload all selected images
        const storage = getStorage();
        for (const image of selectedImages) {
          // Compress and upload image
          const compressedFile = await compressImage(image, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.8,
          });
          const stats = getCompressionStats(image.size, compressedFile.size);

          // Ensure user.uid is valid before creating the path
          if (!user.uid) {
            throw new Error('User ID is not available. Please log out and log back in.');
          }

          const imageRef = ref(storage, `skin-analysis/${user.uid}/${Date.now()}-${compressedFile.name}`);
          console.log('Uploading to path:', `skin-analysis/${user.uid}/${Date.now()}-${compressedFile.name}`);
          const snapshot = await uploadBytes(imageRef, compressedFile);
          const imageUrl = await getDownloadURL(snapshot.ref);
          imageUrls.push(imageUrl);
        }
      }

      // Create analysis request
      const db = getFirestore();
      const analysisData = {
        customerId: user.uid,
        type: 'skin',
        imageUrls: imageUrls, // Changed from imageUrl to imageUrls
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'skinAnalyses'), analysisData);

      // Try to process analysis immediately
      try {
        const { functions } = initFirebase();
        const analyzeSkinPhoto = httpsCallable(functions, 'analyzeSkinPhoto');
        await analyzeSkinPhoto({ 
        analysisId: docRef.id,
          imageUrl: imageUrls[0] // Pass the first image URL
        });
      } catch (analysisError) {
        console.error('Error initiating skin analysis:', analysisError);
        // Don't fail the request if analysis fails - it will be processed later
      }

      setRequestSubmitted(true);
      setSelectedImages([]);
      setImagePreviews([]);
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

      // Create products data for analysis
      const products = productUploads.map((product, index) => ({
        imageUrl: imageUrls[index],
        productName: product.productName || `Product ${index + 1}`
      }));

      // Fetch most recent completed skin analysis for cross-referencing
      let skinAnalysisRef = null;
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

      // Create enhanced product analysis request
      const analysisData = {
        customerId: user!.uid,
        type: 'products',
        products,
        skinAnalysisReference: skinAnalysisRef ? {
          skinType: skinAnalysisRef.analysis?.skinType || 'Unknown',
          concerns: skinAnalysisRef.analysis?.concerns || [],
          compatibilityScore: 0, // Will be calculated by AI
        } : null,
        status: 'pending',
        createdAt: serverTimestamp(),
        customerEmail: user!.email,
        customerName: user!.displayName || 'Customer',
      };

      const docRef = await addDoc(collection(db, 'skinAnalyses'), analysisData);

      // Call the multi-product analysis function
      try {
        const { functions } = initFirebase();
        const analyzeMultipleProducts = httpsCallable(functions, 'analyzeMultipleProducts');
        await analyzeMultipleProducts({
          analysisId: docRef.id,
          imageUrls: imageUrls,
          skinAnalysisData: skinAnalysisRef,
          userId: user!.uid
        });
      } catch (analysisError: any) {
        console.error('Error initiating multi-product analysis:', analysisError);
        
        // Handle rate limiting errors specifically
        if (analysisError.code === 'functions/resource-exhausted') {
          setError(analysisError.message || 'You\'ve reached the analysis limit. Please try again later.');
        } else {
          // Don't fail the request if analysis fails - it will be processed later
        }
      }

      setRequestSubmitted(true);
    } catch (error: any) {
      console.error('Error creating product analysis request:', error);
      setError(error.message || 'Failed to submit analysis request. Please try again.');
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
                   onClick={() => setAnalysisType(prompt.action?.includes('Skin') ? 'skin' : 'products')}
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
                           setSelectedImages([]);
                           setImagePreviews([]);
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

                 {/* Upload Multiple Photos */}
                 <div className="mb-6">
                   <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-terracotta transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                       multiple
                       onChange={(e) => {
                         handleImageSelect(e.target.files);
                         setUseProfilePic(false);
                         setPhotoSource('upload');
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
                         <p className="text-lg font-medium text-gray-900 mb-2">Upload photos (up to 3)</p>
                         <p className="text-gray-600 text-sm mb-4">Supports JPG, PNG, WEBP (max 10MB each)</p>
                         <button
                           onClick={() => fileInputRef.current?.click()}
                           className="bg-terracotta text-white px-6 py-3 rounded-xl font-semibold hover:bg-terracotta/90 transition-colors"
                         >
                           Choose Files
                         </button>
                  </div>
              </div>
            </div>
                 </div>

                 {/* Image Previews */}
                 {(imagePreviews.length > 0 || (useProfilePic && customerProfilePic)) && (
            <div className="mb-6">
                     <h3 className="font-semibold text-gray-900 mb-3">Selected Images</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {useProfilePic && customerProfilePic && (
                         <div className="relative">
                           <img
                             src={customerProfilePic}
                             alt="Profile"
                             className="w-full h-48 object-cover rounded-xl shadow-lg"
                           />
                           <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                             Profile Picture
                  </div>
                  <button
                    onClick={() => {
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
                       )}
                       {imagePreviews.map((preview, index) => (
                         <div key={index} className="relative">
                           <img
                             src={preview}
                             alt={`Preview ${index + 1}`}
                             className="w-full h-48 object-cover rounded-xl shadow-lg"
                           />
                           <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                             Photo {index + 1}
              </div>
                           <button
                             onClick={() => {
                               const newImages = selectedImages.filter((_, i) => i !== index);
                               const newPreviews = imagePreviews.filter((_, i) => i !== index);
                               setSelectedImages(newImages);
                               setImagePreviews(newPreviews);
                             }}
                             className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                             </svg>
                           </button>
            </div>
                       ))}
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
                   disabled={loading || (analysisType === 'skin' ? (selectedImages.length === 0 && !useProfilePic) : productUploads.length === 0)}
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
               onProductsChange={setProductUploads}
               maxProducts={5}
               disabled={loading}
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
                              setAnalysis(pastAnalysis);
                              setShowHistory(true); // Show history when viewing results
                              // Auto-scroll to middle of page where report begins
                              setTimeout(() => {
                                const reportSection = document.querySelector('[data-testid="analysis-results"]') || 
                                                   document.querySelector('.space-y-6') ||
                                                   document.querySelector('h2');
                                if (reportSection) {
                                  reportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                } else {
                                  // Fallback: scroll to middle of page
                                  window.scrollTo({ top: window.innerHeight * 0.5, behavior: 'smooth' });
                                }
                              }, 100);
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


        {/* Analysis Results */}
        {analysis && showHistory && (
          <div className="mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
              <div className="p-8 lg:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {analysis.type === 'skin' ? 'Your Skin Analysis Results' : 'Your Product Analysis Results'}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {analysis.status === 'completed' 
                      ? 'Personalized recommendations based on your analysis'
                      : `Analysis status: ${analysis.status}`
                    }
                  </p>
            </div>

                <div className="space-y-6">
                  {analysis.status === 'completed' ? (
                    analysis.analysis ? (
                      <div className="space-y-6" data-testid="analysis-results">
                        {/* Analysis Images */}
                        {(() => {
                          const imageUrls = (analysis as any).imageUrls || (analysis as any).imageUrl || analysis.imageUrl;
                          const images = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];
                          return images.length > 0;
                        })() && (
                          <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Analysis Photos ({(() => {
                                const imageUrls = (analysis as any).imageUrls || (analysis as any).imageUrl || analysis.imageUrl;
                                const images = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];
                                return images.length;
                              })()})
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {(() => {
                                const imageUrls = (analysis as any).imageUrls || (analysis as any).imageUrl || analysis.imageUrl;
                                const images = Array.isArray(imageUrls) ? imageUrls : imageUrls ? [imageUrls] : [];
                                return images.filter(Boolean);
                              })().map((imageUrl: string, index: number) => (
                                <div key={index} className="flex-shrink-0 relative group">
                                  <img
                                    src={imageUrl}
                                    alt={`Analysis photo ${index + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => {
                                      window.open(imageUrl, '_blank');
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                                    <svg className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
            </div>
                                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                                    {index + 1}
            </div>
                </div>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Click any photo to view full size</p>
              </div>
            )}

                        {/* Try to render structured analysis data */}
                        {typeof analysis.analysis === 'object' && analysis.analysis !== null ? (
                          <div className="space-y-6">
                            {/* Product Analysis Results */}
                            {analysis.type === 'products' && analysis.analysis.productAnalysis ? (
                              <RoutineBuilder analysis={(analysis.analysis as any).aggregateAnalysis || analysis.analysis.productAnalysis} />
                            ) : null}
                            {analysis.analysis.skinType && (
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-blue-800 text-lg mb-4 flex items-center">
                                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                  </div>
                                  Skin Type
                                </h3>
                                <div className="bg-white rounded-xl p-4 border border-blue-100">
                                  <p className="text-blue-800 text-lg font-semibold">{analysis.analysis.skinType}</p>
                  </div>
                  </div>
                            )}

                            {analysis.analysis.concerns && Array.isArray(analysis.analysis.concerns) && analysis.analysis.concerns.length > 0 && (
                              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-amber-800 text-lg mb-4 flex items-center">
                                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                      </div>
                                  Key Concerns
                                </h3>
                                <div className="space-y-3">
                                  {analysis.analysis.concerns.map((concern: string, index: number) => (
                                    <div key={index} className="bg-white rounded-xl p-4 border border-amber-100 flex items-center">
                                      <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                                      <span className="text-amber-800 font-medium">{concern}</span>
                    </div>
                                  ))}
                </div>
              </div>
            )}

                            {analysis.analysis.recommendations && Array.isArray(analysis.analysis.recommendations) && analysis.analysis.recommendations.length > 0 && (
                              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-emerald-800 text-lg mb-4 flex items-center">
                                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                  </div>
                                  Recommendations
                                </h3>
                                <div className="space-y-3">
                                  {analysis.analysis.recommendations.map((rec: string, index: number) => (
                                    <div key={index} className="bg-white rounded-xl p-4 border border-emerald-100 flex items-start">
                                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                                        <span className="text-emerald-600 font-bold text-sm">{index + 1}</span>
                  </div>
                                      <span className="text-emerald-800 font-medium leading-relaxed">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                            {analysis.analysis.summary && (
                              <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center">
                                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </div>
                                  Summary
                                </h3>
                                <div className="bg-white rounded-xl p-5 border border-gray-100">
                                  <p className="text-gray-800 leading-relaxed text-base">{analysis.analysis.summary}</p>
                </div>
              </div>
            )}

            {/* Facial Features */}
                            {analysis.analysis.facialFeatures && (
                              <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-purple-800 text-lg mb-4 flex items-center">
                                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </div>
                                  Facial Features
                                </h3>
                                <div className="bg-white rounded-xl p-5 border border-purple-100">
                                  <div className="grid grid-cols-2 gap-4">
                                    {Object.entries(analysis.analysis.facialFeatures).map(([key, value]) => (
                                      <div key={key} className="flex justify-between items-center py-2">
                                        <span className="text-purple-700 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                        <span className="text-purple-800 font-semibold bg-purple-50 px-3 py-1 rounded-full text-sm">{value as string}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                    </div>
                  )}

                            {/* Foundation Match */}
                            {analysis.analysis.foundationMatch && (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h3 className="font-semibold text-orange-800 mb-3">Foundation Match</h3>
                                {analysis.analysis.foundationMatch.undertoneRecommendation && (
                                  <div className="mb-3">
                                    <h4 className="font-medium text-orange-700 mb-1">Undertone Recommendation</h4>
                                    <p className="text-orange-600">{analysis.analysis.foundationMatch.undertoneRecommendation}</p>
                    </div>
                  )}
                                {analysis.analysis.foundationMatch.shadeRange && (
                                  <div className="mb-3">
                                    <h4 className="font-medium text-orange-700 mb-1">Shade Range</h4>
                                    <p className="text-orange-600">{analysis.analysis.foundationMatch.shadeRange}</p>
                    </div>
                  )}
                                {analysis.analysis.foundationMatch.popularBrands && Array.isArray(analysis.analysis.foundationMatch.popularBrands) && (
                                  <div>
                                    <h4 className="font-medium text-orange-700 mb-2">Recommended Brands</h4>
                                    <div className="space-y-2">
                                      {analysis.analysis.foundationMatch.popularBrands.map((brand: any, index: number) => (
                                        <div key={index} className="bg-white rounded p-2">
                                          <div className="font-medium text-orange-800">{brand.brand}</div>
                                          {brand.shades && Array.isArray(brand.shades) && (
                                            <div className="text-sm text-orange-600 mt-1">
                                              Shades: {brand.shades.join(', ')}
                    </div>
                  )}
                </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
              </div>
            )}

            {/* Detailed Report */}
            {analysis.analysis.detailedReport && (
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h3 className="font-semibold text-indigo-800 mb-2">Detailed Analysis Report</h3>
                                <p className="text-indigo-700 leading-relaxed">{analysis.analysis.detailedReport}</p>
              </div>
            )}

                            {/* Recommended Services */}
                            {analysis.analysis.recommendedServices && Array.isArray(analysis.analysis.recommendedServices) && analysis.analysis.recommendedServices.length > 0 && (
                              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                                <h3 className="font-semibold text-teal-800 mb-3">Recommended Services</h3>
                                <div className="space-y-3">
                                  {analysis.analysis.recommendedServices.map((service: any, index: number) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-teal-100">
                                      <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-teal-800">{service.serviceName}</h4>
                                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          service.priority === 'high' ? 'bg-red-100 text-red-800' :
                                          service.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-gray-100 text-gray-800'
                                        }`}>
                                          {service.priority} priority
                                        </div>
                                      </div>
                                      <p className="text-teal-700 text-sm mb-2">{service.reason}</p>
                                      {service.frequency && (
                                        <div className="text-xs text-teal-600">
                                          <strong>Frequency:</strong> {service.frequency}
                                        </div>
                                      )}
                                    </div>
                  ))}
                </div>
              </div>
            )}

                            {/* If it's a string, render as HTML */}
                            {typeof analysis.analysis === 'string' && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Analysis Results</h3>
                                <div dangerouslySetInnerHTML={{ __html: analysis.analysis }} />
              </div>
            )}

                            {/* Fallback: show raw data if none of the above match */}
                            {!analysis.analysis.skinType && !analysis.analysis.concerns && !analysis.analysis.recommendations && !analysis.analysis.summary && typeof analysis.analysis !== 'string' && (
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                <h3 className="font-semibold text-gray-800 mb-4">Raw Analysis Data</h3>
                                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                                  {JSON.stringify(analysis.analysis, null, 2)}
                                </pre>
                            </div>
                            )}
                              </div>
                        ) : analysis.type === 'products' && typeof analysis.analysis === 'string' ? (
                          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-purple-800 text-lg mb-4 flex items-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                              Product Analysis Results
                            </h3>
                            <div className="bg-white rounded-xl p-5 border border-purple-100">
                              <div className="prose prose-sm max-w-none text-purple-700">
                                {(() => {
                                  const content = typeof analysis.analysis === 'string' ? analysis.analysis : JSON.stringify(analysis.analysis, null, 2);
                                  
                                  // Clean up escaped characters first
                                  let htmlContent = content
                                    .replace(/\\n\\n/g, '\n\n')
                                    .replace(/\\n/g, '\n')
                                    .replace(/\\"/g, '"')
                                    .replace(/\\'/g, "'");
                                  
                                  // Convert markdown to HTML
                                  htmlContent = htmlContent
                                    // Headers
                                    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mt-6 mb-3 text-purple-800">$1</h2>')
                                    .replace(/^### (.*$)/gim, '<h3 class="text-md font-semibold mt-4 mb-2 text-purple-800">$1</h3>')
                                    // Bold and italic
                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                                    // Lists
                                    .replace(/^\* (.*$)/gim, '<li class="mb-1">$1</li>')
                                    .replace(/^(\d+)\. (.*$)/gim, '<li class="mb-1">$1. $2</li>')
                                    // Line breaks
                                    .replace(/\n\n/g, '</p><p class="mb-3">')
                                    .replace(/\n/g, '<br>');
                                  
                                  // Wrap in paragraphs and lists
                                  htmlContent = '<p class="mb-3">' + htmlContent + '</p>';
                                  
                                  // Fix list structure
                                  htmlContent = htmlContent
                                    .replace(/<li class="mb-1">/g, '<ul class="list-disc ml-6 mb-3"><li class="mb-1">')
                                    .replace(/<\/li>/g, '</li></ul>')
                                    .replace(/<\/ul><ul class="list-disc ml-6 mb-3">/g, '');
                                  
                                  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
                                })()}
                          </div>
                        </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Analysis Data</h3>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
                              {JSON.stringify(analysis.analysis, null, 2)}
                            </pre>
                  </div>
                )}
                          </div>
                    ) : (
                      <p className="text-gray-600 text-center">No analysis data available</p>
                    )
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis {analysis.status}</h3>
                      <p className="text-gray-600">
                        {analysis.status === 'pending' 
                          ? 'Your analysis is being processed. This usually takes a few minutes.'
                          : 'There was an issue processing your analysis. Please try again.'
                        }
                    </p>
                  </div>
                )}
              </div>

                {/* Complete Skin Care Analysis - Show when both skin and product analyses are completed */}
                {analysis.status === 'completed' && hasSkinAnalysis && hasProductAnalysis && (
                  <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-8 shadow-lg">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-indigo-900 mb-2">Complete Skin Care Analysis</h2>
                      <p className="text-indigo-700">Your comprehensive skin and product analysis is ready!</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Skin Analysis Summary */}
                      <div className="bg-white rounded-xl p-6 border border-indigo-100">
                        <h3 className="font-bold text-indigo-800 text-lg mb-4 flex items-center">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          Skin Analysis
                        </h3>
                <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium">Skin Type:</span>
                            <span className="text-indigo-800 font-semibold bg-indigo-50 px-3 py-1 rounded-full text-sm">
                              {mostRecentSkinAnalysis?.analysis?.skinType || 'Oily'}
                        </span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium">Key Concerns:</span>
                            <span className="text-indigo-800 text-sm">
                              {mostRecentSkinAnalysis?.analysis?.concerns?.length || 0} identified
                            </span>
                    </div>
                          <div className="flex justify-between items-center">
                            <span className="text-indigo-700 font-medium">Recommendations:</span>
                            <span className="text-indigo-800 text-sm">
                              {mostRecentSkinAnalysis?.analysis?.recommendations?.length || 0} provided
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setAnalysis(mostRecentSkinAnalysis);
                            setShowHistory(true);
                          }}
                          className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                          View Full Skin Analysis
                        </button>
                </div>
                
                      {/* Product Analysis Summary */}
                      <div className="bg-white rounded-xl p-6 border border-purple-100">
                        <h3 className="font-bold text-purple-800 text-lg mb-4 flex items-center">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                          </div>
                          Product Analysis
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Products Analyzed:</span>
                            <span className="text-purple-800 font-semibold bg-purple-50 px-3 py-1 rounded-full text-sm">
                              {(mostRecentProductAnalysis?.analysis as any)?.products?.length || 0} products
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Routine Created:</span>
                            <span className="text-purple-800 text-sm">
                              {(mostRecentProductAnalysis?.analysis as any)?.routine ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-purple-700 font-medium">Recommendations:</span>
                            <span className="text-purple-800 text-sm">
                              Personalized routine provided
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setAnalysis(mostRecentProductAnalysis);
                            setShowHistory(true);
                          }}
                          className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          View Full Product Analysis
                        </button>
                      </div>
                    </div>

                    {/* Combined Recommendations */}
                    <div className="bg-white rounded-xl p-6 border border-indigo-100">
                      <h3 className="font-bold text-indigo-800 text-lg mb-4 flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        Combined Recommendations
                      </h3>
                      <p className="text-indigo-700 mb-4">
                        Based on your skin analysis and product evaluation, here are your personalized recommendations:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                          <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-indigo-800 mb-1">Morning Routine</h4>
                          <p className="text-indigo-600 text-sm">Cleanser → Toner → Serum → Moisturizer → Sunscreen</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-purple-800 mb-1">Evening Routine</h4>
                          <p className="text-purple-600 text-sm">Cleanser → Treatment → Moisturizer → Night Cream</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                          <h4 className="font-semibold text-green-800 mb-1">Weekly Treatments</h4>
                          <p className="text-green-600 text-sm">Exfoliation → Masks → Professional Treatments</p>
                        </div>
                      </div>
                </div>
              </div>
                )}

                {/* Email Button */}
                {user?.email && analysis.status === 'completed' && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => emailAnalysisResults(analysis)}
                      disabled={emailStatus === 'sending'}
                      className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                        emailStatus === 'sending' 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : emailStatus === 'success'
                          ? 'bg-green-600 text-white'
                          : emailStatus === 'error'
                          ? 'bg-red-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                      }`}
                    >
                      {emailStatus === 'sending' && '📧 Sending...'}
                      {emailStatus === 'success' && '✅ Email Sent Successfully!'}
                      {emailStatus === 'error' && '❌ Failed to Send Email'}
                      {emailStatus === 'idle' && '📧 Email Results'}
                    </button>
                    {emailStatus === 'success' && (
                      <p className="text-green-600 text-sm mt-2">
                        Your analysis results have been sent to {user.email}
                      </p>
                    )}
                    {emailStatus === 'error' && (
                      <p className="text-red-600 text-sm mt-2">
                        Failed to send email. Please try again.
                      </p>
            )}
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
