import { useState, useRef, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import type { SkinAnalysis } from '@shared/types';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  // Load user's past analyses
  useEffect(() => {
    if (!user) return;

    const db = getFirestore();
    const q = query(
      collection(db, 'skinAnalyses'),
      where('customerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const analyses = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as SkinAnalysis[];
      setPastAnalyses(analyses);
    });

    return () => unsubscribe();
  }, [user]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    if (!user) {
      setError('Please log in to use skin analysis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storage = getStorage();
      const db = getFirestore();
      const functions = getFunctions();

      // Upload image to Firebase Storage
      const timestamp = Date.now();
      const storagePath = `skin-analysis/${user.uid}/${timestamp}_${selectedImage.name}`;
      
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, selectedImage);
      const imageUrl = await getDownloadURL(storageRef);

      // Create analysis record
      const analysisData: Partial<SkinAnalysis> = {
        type: analysisType,
        imageUrl,
        customerId: user.uid,
        customerEmail: user.email || '',
        customerName: user.displayName || 'Customer',
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold mb-4">Login Required</h1>
          <p className="text-slate-600 mb-6">
            You need to be logged in to access AI Skin Analysis. This feature saves your results to your profile for future reference.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 py-3 bg-terracotta text-white rounded-lg font-semibold hover:bg-terracotta/90 transition-colors"
            >
              Login to Continue
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-6 py-3 border border-gray-300 text-slate-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">
          <span className="font-brandBueno text-brand-bueno">AI</span>
          <span className="ml-2 font-brandBrows text-brand-brows">SKIN ANALYSIS</span>
        </h1>
        <p className="text-slate-600 text-lg">
          Get personalized skin care recommendations powered by AI
        </p>
        {pastAnalyses.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="mt-4 text-terracotta hover:underline text-sm"
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
                onClick={() => setAnalysis(past)}
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    past.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : past.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {past.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!analysis ? (
        <div className="bg-white rounded-lg shadow-lg p-8">
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

          {/* Upload Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {analysisType === 'skin' 
                ? 'Upload Your Photo' 
                : 'Upload Product Photos'}
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-terracotta transition-colors">
              {imagePreview ? (
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

            {analysisType === 'skin' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-semibold mb-2">💡 Tips for best results:</p>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Use natural lighting (near a window is ideal)</li>
                  <li>Make sure your face is clearly visible and in focus</li>
                  <li>Remove makeup for most accurate analysis</li>
                  <li>Face the camera directly</li>
                </ul>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || loading}
            className="w-full py-4 bg-terracotta text-white rounded-lg font-semibold text-lg hover:bg-terracotta/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              `Analyze ${analysisType === 'skin' ? 'My Skin' : 'My Products'}`
            )}
          </button>
        </div>
      ) : (
        /* Analysis Results */
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-terracotta">Your Analysis Results</h2>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-terracotta text-terracotta rounded-lg hover:bg-terracotta hover:text-white transition-colors"
              >
                New Analysis
              </button>
            </div>

            {/* Uploaded Image */}
            <div className="mb-6">
              <img
                src={analysis.imageUrl}
                alt="Analyzed"
                className="max-h-48 mx-auto rounded-lg"
              />
            </div>

            {/* Summary */}
            <div className="mb-6 p-4 bg-terracotta/10 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Summary</h3>
              <p className="text-slate-700">{analysis.analysis.summary}</p>
            </div>

            {/* Skin Type */}
            {analysis.type === 'skin' && analysis.analysis.skinType && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Your Skin Type</h3>
                <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                  {analysis.analysis.skinType}
                </div>
              </div>
            )}

            {/* Skin Tone */}
            {analysis.type === 'skin' && analysis.analysis.skinTone && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Your Skin Tone</h3>
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
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Foundation Match</h3>
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
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Facial Features</h3>
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
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Detailed Report</h3>
                <div className="border rounded-lg p-4 bg-slate-50">
                  <p className="text-slate-700 whitespace-pre-line">{analysis.analysis.detailedReport}</p>
                </div>
              </div>
            )}

            {/* Concerns */}
            {analysis.analysis.concerns && analysis.analysis.concerns.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Identified Concerns</h3>
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
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Recommendations</h3>
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
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Recommended Services</h3>
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

