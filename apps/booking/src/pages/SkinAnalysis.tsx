import { useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { SkinAnalysis, Customer } from '@shared/types';
import { compressImage, getCompressionStats } from '@buenobrows/shared/imageUtils';
import { initFirebase } from '@buenobrows/shared/firebase';

type AnalysisType = 'skin' | 'products';

export default function SkinAnalysisPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('skin');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkinAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [pastAnalyses, setPastAnalyses] = useState<SkinAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [customerProfilePic, setCustomerProfilePic] = useState<string>('');
  const [useProfilePic, setUseProfilePic] = useState(false);
  const [photoSource, setPhotoSource] = useState<'upload' | 'profile' | null>(null);
  
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
          // Don't block the page if profile loading fails
        }
      }
      
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Load user's past analyses
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
          })) as SkinAnalysis[];
          setPastAnalyses(analyses);
          
          // Automatically show the most recent completed analysis
          if (analyses.length > 0 && !analysis) {
            const mostRecent = analyses[0];
            if (mostRecent.status === 'completed') {
              setAnalysis(mostRecent);
            }
          }
        },
        (error) => {
          console.error('❌ Error loading past analyses:', error);
          // Don't block the page if past analyses fail to load
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

  const handleAnalyze = async () => {
    if (!user) {
      setError('Please log in to use skin analysis');
      return;
    }

    // Check if user already has an analysis BEFORE creating anything
    if (pastAnalyses.length > 0) {
      setError('You already have a skin analysis. Please click "Request Another Analysis" if you\'d like a new one.');
      return;
    }

    // Validate that we have an image source
    if (!useProfilePic && !selectedImage) {
      setError('Please select an image first');
      return;
    }

    if (useProfilePic && !customerProfilePic) {
      setError('No profile picture found. Please upload a photo instead.');
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

      // Create analysis record
      const analysisData: Partial<SkinAnalysis> = {
        type: analysisType,
        imageUrl,
        customerId: user.uid,
        customerEmail: user.email || user.phoneNumber || '',
        customerName: user.displayName || user.phoneNumber || 'Customer',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'skinAnalyses'), analysisData);

      // Call Cloud Function to analyze image
      const analyzeFn = httpsCallable(functions, analysisType === 'skin' 
        ? 'analyzeSkinPhoto' 
        : 'analyzeSkinCareProducts'
      );
      
      const result = await analyzeFn({
        analysisId: docRef.id,
        imageUrl,
        analysisType,
      });

      const analysisResult = (result.data as any).analysis;
      const fromCache = (result.data as any).fromCache || false;
      
      if (fromCache) {
        console.log('✅ Analysis retrieved from cache - no AI costs incurred!');
      }
      
      setAnalysis({
        ...analysisData,
        id: docRef.id,
        analysis: analysisResult,
        status: 'completed',
      } as SkinAnalysis);

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview('');
    setAnalysis(null);
    setError('');
    setShowHistory(false);
    setRequestSubmitted(false);
    setUseProfilePic(false);
    setPhotoSource(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const requestNewAnalysis = async () => {
    if (!user) {
      setError('Please log in to request a new analysis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { functions } = initFirebase();
      const requestNewSkinAnalysis = httpsCallable(functions, 'requestNewSkinAnalysis');
      
      const result = await requestNewSkinAnalysis({
        reason: 'Customer requested new skin analysis'
      });

      setRequestSubmitted(true);
      console.log('Analysis request submitted:', result.data);
    } catch (error: any) {
      console.error('Error requesting analysis:', error);
      setError(error.message || 'Failed to submit analysis request');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  // Require login
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 md:py-16 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center">
          <div className="text-4xl md:text-6xl mb-4">🔒</div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-slate-600 mb-6 text-base md:text-lg leading-relaxed">
            You need to be logged in to access AI Skin Analysis. This feature saves your results to your profile for future reference.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-4 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta/90 transition-colors text-base"
            >
              Login to Continue
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-4 border border-gray-300 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-base"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-8">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-4">
          <span className="font-brandBueno text-brand-bueno">AI</span>
          <span className="ml-2 font-brandBrows text-brand-brows">SKIN ANALYSIS</span>
        </h1>
        <p className="text-slate-600 text-base md:text-lg leading-relaxed">
          Get personalized skin care recommendations powered by AI
        </p>
        {pastAnalyses.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-4 text-terracotta hover:underline text-base font-medium"
          >
            {showHistory ? 'Hide' : 'View'} Past Analyses ({pastAnalyses.length})
          </button>
        )}
      </div>

      {/* Past Analyses */}
      {showHistory && pastAnalyses.length > 0 && (
        <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Your Past Analyses</h2>
          <div className="space-y-3">
            {pastAnalyses.map((past) => (
              <div
                key={past.id}
                onClick={() => {
                  setAnalysis(past);
                  setShowHistory(false);
                  // Scroll to top to see the full analysis
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="border rounded-lg p-4 cursor-pointer hover:border-terracotta transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={past.imageUrl}
                      alt="Analysis"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-semibold">
                        {past.type === 'skin' ? '📸 Skin Analysis' : '🧴 Product Analysis'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {past.createdAt && new Date(past.createdAt.toDate()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      past.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : past.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {past.status}
                    </span>
                    <span className="text-xs text-terracotta font-medium">
                      Click to view full report
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!analysis ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Notice for customers who already have an analysis */}
          {pastAnalyses.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-800">You Already Have an Analysis</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    You already have {pastAnalyses.length} skin analysis. Click "View Past Analyses" above to see your results, or "Request Another Analysis" if you'd like a new one (requires admin approval).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">What would you like to analyze?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAnalysisType('skin')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  analysisType === 'skin'
                    ? 'border-terracotta bg-terracotta/10'
                    : 'border-gray-200 hover:border-terracotta/50'
                }`}
              >
                <div className="text-4xl mb-2">📸</div>
                <h3 className="font-semibold text-lg mb-2">Skin Analysis</h3>
                <p className="text-sm text-slate-600">
                  Upload a photo of your face for personalized skin type analysis and service recommendations
                </p>
              </button>

              <button
                onClick={() => setAnalysisType('products')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  analysisType === 'products'
                    ? 'border-terracotta bg-terracotta/10'
                    : 'border-gray-200 hover:border-terracotta/50'
                }`}
              >
                <div className="text-4xl mb-2">🧴</div>
                <h3 className="font-semibold text-lg mb-2">Product Analysis</h3>
                <p className="text-sm text-slate-600">
                  Upload photos of your skincare products for usage order and compatibility analysis
                </p>
              </button>
            </div>
          </div>

          {/* Photo Source Selection */}
          {analysisType === 'skin' && customerProfilePic && !photoSource && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Choose Your Photo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setPhotoSource('profile');
                    setUseProfilePic(true);
                    setImagePreview(customerProfilePic);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-terracotta transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <img
                      src={customerProfilePic}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">Use Profile Picture</h3>
                      <p className="text-sm text-slate-600">Use your existing photo</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full py-2 bg-terracotta/10 rounded text-terracotta font-medium text-sm">
                    Select Profile Picture
                  </div>
                </button>

                <button
                  onClick={() => {
                    setPhotoSource('upload');
                    setUseProfilePic(false);
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-terracotta transition-all text-left"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Upload New Photo</h3>
                      <p className="text-sm text-slate-600">Choose from your album</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-full py-2 bg-terracotta/10 rounded text-terracotta font-medium text-sm">
                    Upload from Album
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Upload Section */}
          {(photoSource === 'upload' || !customerProfilePic || analysisType !== 'skin') && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {analysisType === 'skin' 
                  ? 'Upload Your Photo' 
                  : 'Upload Product Photos'}
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-terracotta transition-colors">
                {imagePreview && !useProfilePic ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview('');
                        setPhotoSource(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-sm text-terracotta hover:underline"
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-slate-600 mb-4">
                      {analysisType === 'skin'
                        ? 'Take a clear photo of your face in good lighting'
                        : 'Take photos of your skincare product labels'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-6 py-3 bg-terracotta text-white rounded-lg cursor-pointer hover:bg-terracotta/90 transition-colors"
                    >
                      Choose Image
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Picture Preview (when selected) */}
          {useProfilePic && imagePreview && photoSource === 'profile' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Selected Photo</h2>
              <div className="border-2 border-terracotta rounded-lg p-8 text-center bg-terracotta/5">
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <div className="flex items-center justify-center gap-2 text-terracotta font-medium">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Using Profile Picture
                  </div>
                  <button
                    onClick={() => {
                      setUseProfilePic(false);
                      setImagePreview('');
                      setPhotoSource(null);
                    }}
                    className="text-sm text-slate-600 hover:text-terracotta hover:underline"
                  >
                    Choose Different Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {analysisType === 'skin' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold mb-2">💡 Tips for best results:</p>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Use natural lighting (near a window is ideal)</li>
                <li>Make sure your face is clearly visible and in focus</li>
                <li>Remove makeup for most accurate analysis</li>
                <li>Face the camera directly</li>
              </ul>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={(!selectedImage && !useProfilePic) || loading || pastAnalyses.length > 0}
            className="w-full py-4 bg-terracotta text-white rounded-lg font-semibold text-lg hover:bg-terracotta/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title={pastAnalyses.length > 0 ? "You already have an analysis. Please request a new one to continue." : ""}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : pastAnalyses.length > 0 ? (
              "Analysis Limit Reached - View Your Existing Analysis Above"
            ) : (
              `Analyze ${analysisType === 'skin' ? 'My Skin' : 'My Products'}`
            )}
          </button>
          
          {/* Request New Analysis CTA for existing customers */}
          {pastAnalyses.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={requestNewAnalysis}
                disabled={loading}
                className="text-terracotta hover:underline font-medium"
              >
                Want a new analysis? Click here to request one →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={resetForm}
              className="text-terracotta hover:underline font-medium flex items-center gap-2"
            >
              ← Back to New Analysis
            </button>
            <button
              onClick={requestNewAnalysis}
              disabled={loading}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Submitting Request...' : 'Request Another Analysis'}
            </button>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-terracotta">Your Complete Analysis Results</h2>
              <span className="text-sm text-slate-600">
                {analysis.createdAt && new Date(analysis.createdAt.toDate ? analysis.createdAt.toDate() : analysis.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Request Submitted Message */}
            {requestSubmitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-green-800">Request Submitted Successfully!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your request for a new skin analysis has been submitted. An admin will review your request and once approved, you'll be able to create a fresh analysis. You can continue viewing your current analysis below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Notice */}
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-blue-800">Your Complete Analysis Report</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    This is your full face analysis report with detailed recommendations. Scroll down to see all sections including skin tone analysis, foundation matching, facial features, and personalized service recommendations.
                  </p>
                </div>
              </div>
            </div>

            {/* Uploaded Image */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-slate-800">Your Photo</h3>
              <img
                src={analysis.imageUrl}
                alt="Analyzed"
                className="max-h-64 mx-auto rounded-lg shadow-md"
              />
            </div>

            {/* Summary */}
            <div className="mb-6 p-5 bg-terracotta/10 rounded-lg border-l-4 border-terracotta">
              <h3 className="font-semibold text-lg mb-3 text-slate-800">📋 Summary</h3>
              <p className="text-slate-700 leading-relaxed">{analysis.analysis.summary}</p>
            </div>

            {/* Skin Type */}
            {analysis.type === 'skin' && analysis.analysis.skinType && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">✨ Your Skin Type</h3>
                <div className="inline-block px-6 py-3 bg-green-100 text-green-800 rounded-full font-semibold text-lg">
                  {analysis.analysis.skinType}
                </div>
              </div>
            )}

            {/* Skin Tone */}
            {analysis.type === 'skin' && analysis.analysis.skinTone && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">🎨 Your Skin Tone Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Category</div>
                    <div className="font-semibold text-lg">{analysis.analysis.skinTone.category}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Undertone</div>
                    <div className="font-semibold text-lg">{analysis.analysis.skinTone.undertone}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-slate-600 mb-1">Fitzpatrick Scale</div>
                    <div className="font-semibold text-lg">Type {analysis.analysis.skinTone.fitzpatrickScale}</div>
                  </div>
                  {analysis.analysis.skinTone.hexColor && (
                    <div className="border rounded-lg p-4">
                      <div className="text-sm text-slate-600 mb-1">Approximate Color</div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: analysis.analysis.skinTone.hexColor }}
                        />
                        <div className="font-mono text-sm">{analysis.analysis.skinTone.hexColor}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Foundation Match */}
            {analysis.type === 'skin' && analysis.analysis.foundationMatch && (
              <div className="mb-6 p-4 bg-pink-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">💄 Foundation Match Recommendations</h3>
                <div className="border rounded-lg p-4 bg-pink-50">
                  <div className="mb-3">
                    <div className="text-sm text-slate-600 mb-1">Shade Range</div>
                    <div className="font-semibold">{analysis.analysis.foundationMatch.shadeRange}</div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm text-slate-600 mb-1">Undertone Recommendation</div>
                    <div className="font-semibold">{analysis.analysis.foundationMatch.undertoneRecommendation}</div>
                  </div>
                  {analysis.analysis.foundationMatch.popularBrands && analysis.analysis.foundationMatch.popularBrands.length > 0 && (
                    <div>
                      <div className="text-sm text-slate-600 mb-2">Recommended Brands & Shades</div>
                      <div className="space-y-2">
                        {analysis.analysis.foundationMatch.popularBrands.map((brand, idx) => (
                          <div key={idx} className="bg-white rounded p-3">
                            <div className="font-semibold text-sm mb-1">{brand.brand}</div>
                            <div className="text-xs text-slate-600">{brand.shades.join(', ')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Facial Features */}
            {analysis.type === 'skin' && analysis.analysis.facialFeatures && (
              <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">👤 Your Facial Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  {analysis.analysis.facialFeatures.faceShape && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-slate-600">Face Shape</div>
                      <div className="font-semibold">{analysis.analysis.facialFeatures.faceShape}</div>
                    </div>
                  )}
                  {analysis.analysis.facialFeatures.browShape && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-slate-600">Brow Shape</div>
                      <div className="font-semibold">{analysis.analysis.facialFeatures.browShape}</div>
                    </div>
                  )}
                  {analysis.analysis.facialFeatures.eyeShape && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-slate-600">Eye Shape</div>
                      <div className="font-semibold">{analysis.analysis.facialFeatures.eyeShape}</div>
                    </div>
                  )}
                  {analysis.analysis.facialFeatures.lipShape && (
                    <div className="border rounded-lg p-3">
                      <div className="text-sm text-slate-600">Lip Shape</div>
                      <div className="font-semibold">{analysis.analysis.facialFeatures.lipShape}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Detailed Report */}
            {analysis.analysis.detailedReport && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">📝 Detailed Professional Analysis</h3>
                <div className="border border-amber-200 rounded-lg p-5 bg-white">
                  <p className="text-slate-700 whitespace-pre-line leading-relaxed">{analysis.analysis.detailedReport}</p>
                </div>
              </div>
            )}

            {/* Concerns */}
            {analysis.analysis.concerns && analysis.analysis.concerns.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">⚠️ Areas to Address</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.analysis.concerns.map((concern, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.analysis.recommendations && analysis.analysis.recommendations.length > 0 && (
              <div className="mb-6 p-4 bg-teal-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">💡 Personalized Recommendations</h3>
                <ul className="space-y-2">
                  {analysis.analysis.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-terracotta mt-1">✓</span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Analysis */}
            {analysis.type === 'products' && analysis.analysis.productAnalysis && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Product Routine</h3>
                {analysis.analysis.productAnalysis.products && (
                  <div className="space-y-3 mb-4">
                    {analysis.analysis.productAnalysis.products
                      .sort((a, b) => a.order - b.order)
                      .map((product, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-terracotta text-white rounded-full flex items-center justify-center font-bold">
                              {product.order}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{product.name}</h4>
                              <p className="text-sm text-slate-600 mb-2">{product.usage}</p>
                              <div className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {product.suitability}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {analysis.analysis.productAnalysis.routine && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Complete Routine</h4>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {analysis.analysis.productAnalysis.routine}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recommended Services */}
            {analysis.analysis.recommendedServices && analysis.analysis.recommendedServices.length > 0 && (
              <div className="mb-6 p-4 bg-rose-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-slate-800">💆‍♀️ Services Perfect for You</h3>
                <div className="space-y-3">
                  {analysis.analysis.recommendedServices.map((service, idx) => (
                    <div key={idx} className="border border-terracotta rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-terracotta">{service.serviceName}</h4>
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {service.frequency}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700">{service.reason}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <a
                    href="/book"
                    className="inline-block px-8 py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta/90 transition-colors"
                  >
                    Book a Service
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <strong>Disclaimer:</strong> This analysis is provided by AI and should not replace professional medical advice. 
            For specific skin concerns, please consult with a dermatologist.
          </div>
        </div>
      )}
    </div>
  );
}

