import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import type { SkinAnalysis } from '@shared/types';

export default function SkinAnalysesPage() {
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SkinAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'skin' | 'products'>('all');

  useEffect(() => {
    const db = getFirestore();
    const q = query(
      collection(db, 'skinAnalyses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as SkinAnalysis[];
      setAnalyses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'skinAnalyses', id));
      setSelectedAnalysis(null);
    } catch (error) {
      console.error('Error deleting analysis:', error);
      alert('Failed to delete analysis');
    }
  };

  const filteredAnalyses = analyses.filter(a => 
    filter === 'all' || a.type === filter
  );

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading analyses...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Skin Analyses</h1>
        <p className="text-slate-600">
          View all customer skin and product analyses powered by AI
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-terracotta text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({analyses.length})
        </button>
        <button
          onClick={() => setFilter('skin')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'skin'
              ? 'bg-terracotta text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Skin Analysis ({analyses.filter(a => a.type === 'skin').length})
        </button>
        <button
          onClick={() => setFilter('products')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'products'
              ? 'bg-terracotta text-white'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Product Analysis ({analyses.filter(a => a.type === 'products').length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Total Analyses</div>
          <div className="text-2xl font-bold text-terracotta">{analyses.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-600">
            {analyses.filter(a => a.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {analyses.filter(a => a.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Errors</div>
          <div className="text-2xl font-bold text-red-600">
            {analyses.filter(a => a.status === 'error').length}
          </div>
        </div>
      </div>

      {/* Analysis List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAnalyses.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No analyses found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(analysis.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        analysis.type === 'skin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {analysis.type === 'skin' ? '📸 Skin' : '🧴 Products'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        {analysis.customerName || 'Guest'}
                      </div>
                      {analysis.customerEmail && (
                        <div className="text-xs text-slate-500">
                          {analysis.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        analysis.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : analysis.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {analysis.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="text-terracotta hover:underline mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(analysis.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {selectedAnalysis.type === 'skin' ? 'Skin Analysis' : 'Product Analysis'}
              </h2>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="bg-gray-50 rounded p-3 text-sm">
                  <div><strong>Name:</strong> {selectedAnalysis.customerName || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedAnalysis.customerEmail || 'N/A'}</div>
                  <div><strong>Date:</strong> {formatDate(selectedAnalysis.createdAt)}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      selectedAnalysis.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedAnalysis.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedAnalysis.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Image */}
              <div>
                <h3 className="font-semibold mb-2">Uploaded Image</h3>
                <img
                  src={selectedAnalysis.imageUrl}
                  alt="Analysis"
                  className="max-h-64 rounded-lg border"
                />
              </div>

              {selectedAnalysis.status === 'completed' && selectedAnalysis.analysis && (
                <>
                  {/* Summary */}
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <div className="bg-terracotta/10 rounded p-4">
                      {selectedAnalysis.analysis.summary}
                    </div>
                  </div>

                  {/* Skin Type */}
                  {selectedAnalysis.analysis.skinType && (
                    <div>
                      <h3 className="font-semibold mb-2">Skin Type</h3>
                      <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                        {selectedAnalysis.analysis.skinType}
                      </div>
                    </div>
                  )}

                  {/* Skin Tone */}
                  {selectedAnalysis.type === 'skin' && selectedAnalysis.analysis.skinTone && (
                    <div>
                      <h3 className="font-semibold mb-3">Skin Tone Analysis</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs text-slate-600 mb-1">Category</div>
                          <div className="font-semibold">{selectedAnalysis.analysis.skinTone.category}</div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs text-slate-600 mb-1">Undertone</div>
                          <div className="font-semibold">{selectedAnalysis.analysis.skinTone.undertone}</div>
                        </div>
                        <div className="border rounded p-3 bg-gray-50">
                          <div className="text-xs text-slate-600 mb-1">Fitzpatrick Scale</div>
                          <div className="font-semibold">Type {selectedAnalysis.analysis.skinTone.fitzpatrickScale}</div>
                        </div>
                        {selectedAnalysis.analysis.skinTone.hexColor && (
                          <div className="border rounded p-3 bg-gray-50">
                            <div className="text-xs text-slate-600 mb-1">Color</div>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: selectedAnalysis.analysis.skinTone.hexColor }}
                              />
                              <div className="font-mono text-xs">{selectedAnalysis.analysis.skinTone.hexColor}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Foundation Match */}
                  {selectedAnalysis.type === 'skin' && selectedAnalysis.analysis.foundationMatch && (
                    <div>
                      <h3 className="font-semibold mb-3">Foundation Matching</h3>
                      <div className="border rounded-lg p-4 bg-pink-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs text-slate-600 mb-1">Shade Range</div>
                            <div className="font-semibold">{selectedAnalysis.analysis.foundationMatch.shadeRange}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600 mb-1">Undertone</div>
                            <div className="font-semibold">{selectedAnalysis.analysis.foundationMatch.undertoneRecommendation}</div>
                          </div>
                        </div>
                        {selectedAnalysis.analysis.foundationMatch.popularBrands && selectedAnalysis.analysis.foundationMatch.popularBrands.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-600 mb-2 font-semibold">Brand Recommendations</div>
                            <div className="space-y-2">
                              {selectedAnalysis.analysis.foundationMatch.popularBrands.map((brand, idx) => (
                                <div key={idx} className="bg-white rounded p-2">
                                  <div className="font-semibold text-sm">{brand.brand}</div>
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
                  {selectedAnalysis.type === 'skin' && selectedAnalysis.analysis.facialFeatures && (
                    <div>
                      <h3 className="font-semibold mb-3">Facial Features</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {selectedAnalysis.analysis.facialFeatures.faceShape && (
                          <div className="border rounded p-3 bg-blue-50">
                            <div className="text-xs text-slate-600">Face Shape</div>
                            <div className="font-semibold">{selectedAnalysis.analysis.facialFeatures.faceShape}</div>
                          </div>
                        )}
                        {selectedAnalysis.analysis.facialFeatures.browShape && (
                          <div className="border rounded p-3 bg-blue-50">
                            <div className="text-xs text-slate-600">Brow Shape</div>
                            <div className="font-semibold">{selectedAnalysis.analysis.facialFeatures.browShape}</div>
                          </div>
                        )}
                        {selectedAnalysis.analysis.facialFeatures.eyeShape && (
                          <div className="border rounded p-3 bg-blue-50">
                            <div className="text-xs text-slate-600">Eye Shape</div>
                            <div className="font-semibold">{selectedAnalysis.analysis.facialFeatures.eyeShape}</div>
                          </div>
                        )}
                        {selectedAnalysis.analysis.facialFeatures.lipShape && (
                          <div className="border rounded p-3 bg-blue-50">
                            <div className="text-xs text-slate-600">Lip Shape</div>
                            <div className="font-semibold">{selectedAnalysis.analysis.facialFeatures.lipShape}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Detailed Report */}
                  {selectedAnalysis.analysis.detailedReport && (
                    <div>
                      <h3 className="font-semibold mb-3">Detailed Report</h3>
                      <div className="border rounded-lg p-4 bg-slate-50">
                        <p className="text-sm whitespace-pre-line text-slate-700">
                          {selectedAnalysis.analysis.detailedReport}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Concerns */}
                  {selectedAnalysis.analysis.concerns && selectedAnalysis.analysis.concerns.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Concerns</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnalysis.analysis.concerns.map((concern, idx) => (
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
                  {selectedAnalysis.analysis.recommendations && selectedAnalysis.analysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <ul className="space-y-2">
                        {selectedAnalysis.analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-terracotta mt-1">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Product Analysis */}
                  {selectedAnalysis.type === 'products' && selectedAnalysis.analysis.productAnalysis && (
                    <div>
                      <h3 className="font-semibold mb-3">Product Routine</h3>
                      {selectedAnalysis.analysis.productAnalysis.products && (
                        <div className="space-y-3 mb-4">
                          {selectedAnalysis.analysis.productAnalysis.products
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
                      {selectedAnalysis.analysis.productAnalysis.routine && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Complete Routine</h4>
                          <p className="text-sm whitespace-pre-line">
                            {selectedAnalysis.analysis.productAnalysis.routine}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommended Services */}
                  {selectedAnalysis.analysis.recommendedServices && selectedAnalysis.analysis.recommendedServices.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Recommended Services</h3>
                      <div className="space-y-3">
                        {selectedAnalysis.analysis.recommendedServices.map((service, idx) => (
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
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => handleDelete(selectedAnalysis.id)}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

