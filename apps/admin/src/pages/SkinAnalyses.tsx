import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDocs, where } from 'firebase/firestore';
import type { SkinAnalysis, SkinAnalysisRequest } from '@shared/types';

export default function SkinAnalysesPage() {
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [requests, setRequests] = useState<SkinAnalysisRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SkinAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'skin' | 'products'>('all');
  const [activeTab, setActiveTab] = useState<'analyses' | 'requests'>('analyses');
  const [aiMetrics, setAiMetrics] = useState({
    completeAnalysisPairs: 0,
    crossReferenceRate: 0,
    pipelineHealth: 'healthy',
    incompleteChains: 0
  });

  const calculateAiMetrics = (analysesData: SkinAnalysis[]) => {
    // Group analyses by customer
    const customerAnalyses = analysesData.reduce((acc, analysis) => {
      if (!acc[analysis.customerId]) {
        acc[analysis.customerId] = { skin: null, products: null };
      }
      if (analysis.type === 'skin') {
        acc[analysis.customerId].skin = analysis;
      } else if (analysis.type === 'products') {
        acc[analysis.customerId].products = analysis;
      }
      return acc;
    }, {} as Record<string, { skin: SkinAnalysis | null, products: SkinAnalysis | null }>);

    const customers = Object.values(customerAnalyses);
    const completePairs = customers.filter(c => c.skin && c.products).length;
    const totalCustomers = customers.length;
    const crossReferenceRate = totalCustomers > 0 ? Math.round((completePairs / totalCustomers) * 100) : 0;
    const incompleteChains = customers.filter(c => c.skin && !c.products).length + customers.filter(c => !c.skin && c.products).length;
    
    let pipelineHealth = 'healthy';
    if (crossReferenceRate < 30) pipelineHealth = 'needs-attention';
    if (crossReferenceRate < 10) pipelineHealth = 'critical';

    setAiMetrics({
      completeAnalysisPairs: completePairs,
      crossReferenceRate,
      pipelineHealth,
      incompleteChains
    });
  };

  const getLinkedAnalysisStatus = (analysis: SkinAnalysis) => {
    const customerAnalyses = analyses.filter(a => a.customerId === analysis.customerId);
    const hasSkin = customerAnalyses.some(a => a.type === 'skin');
    const hasProducts = customerAnalyses.some(a => a.type === 'products');
    
    if (hasSkin && hasProducts) {
      return { status: 'complete', label: 'Complete Chain', color: 'green' };
    } else if (analysis.type === 'skin' && !hasProducts) {
      return { status: 'missing-products', label: 'Missing Products', color: 'yellow' };
    } else if (analysis.type === 'products' && !hasSkin) {
      return { status: 'missing-skin', label: 'Missing Skin', color: 'yellow' };
    } else {
      return { status: 'incomplete', label: 'Incomplete', color: 'gray' };
    }
  };

  useEffect(() => {
    const db = getFirestore();
    
    // Subscribe to analyses
    const analysesQuery = query(
      collection(db, 'skinAnalyses'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeAnalyses = onSnapshot(analysesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as SkinAnalysis[];
      setAnalyses(data);
      calculateAiMetrics(data);
      setLoading(false);
    });

    // Subscribe to requests
    const requestsQuery = query(
      collection(db, 'skinAnalysisRequests'),
      orderBy('requestedAt', 'desc')
    );

    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as SkinAnalysisRequest[];
      setRequests(data);
    });

    return () => {
      unsubscribeAnalyses();
      unsubscribeRequests();
    };
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

  const handleApproveRequest = async (request: SkinAnalysisRequest) => {
    if (!confirm(`Approve skin analysis request for ${request.customerEmail}?\n\nThis will delete any existing analyses for this customer and allow them to create a new one.`)) return;

    try {
      const db = getFirestore();
      
      // Delete any existing analyses for this customer
      const existingAnalysesQuery = query(
        collection(db, 'skinAnalyses'),
        where('customerId', '==', request.customerId)
      );
      
      const snapshot = await getDocs(existingAnalysesQuery);
      
      // Delete all existing analyses
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      if (snapshot.docs.length > 0) {
        console.log(`Deleted ${snapshot.docs.length} existing analysis(es) for customer`);
      }
      
      // Update request status
      await updateDoc(doc(db, 'skinAnalysisRequests', request.id), {
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
      });

      alert(`Request approved! ${snapshot.docs.length > 0 ? `Deleted ${snapshot.docs.length} existing analysis(es). ` : ''}Customer can now create a new analysis.`);
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    try {
      const db = getFirestore();
      await updateDoc(doc(db, 'skinAnalysisRequests', requestId), {
        status: 'rejected',
        rejectedAt: new Date(),
        adminNotes: reason,
        updatedAt: new Date(),
      });

      alert('Request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'skinAnalysisRequests', requestId));
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request');
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

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Skin Analyses</h1>
        <p className="text-slate-600">
          View all customer skin and product analyses powered by AI
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('analyses')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'analyses'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          Completed Analyses ({analyses.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold transition-colors border-b-2 relative ${
            activeTab === 'requests'
              ? 'border-terracotta text-terracotta'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          Customer Requests ({requests.length})
          {pendingRequests.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'analyses' ? (
        <>
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

          {/* AI Feeding Metrics Dashboard */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">AI Analysis Pipeline Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-600 mb-1">Complete Analysis Pairs</div>
                    <div className="text-2xl font-bold text-blue-800">{aiMetrics.completeAnalysisPairs}</div>
                    <div className="text-xs text-blue-500">Both skin + product</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-green-600 mb-1">AI Cross-Reference Rate</div>
                    <div className="text-2xl font-bold text-green-800">{aiMetrics.crossReferenceRate}%</div>
                    <div className="text-xs text-green-500">Analysis chain completion</div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className={`rounded-lg shadow p-4 border ${
                aiMetrics.pipelineHealth === 'healthy' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                  : aiMetrics.pipelineHealth === 'needs-attention'
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-sm mb-1 ${
                      aiMetrics.pipelineHealth === 'healthy' 
                        ? 'text-green-600' 
                        : aiMetrics.pipelineHealth === 'needs-attention'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>Pipeline Health</div>
                    <div className={`text-lg font-bold ${
                      aiMetrics.pipelineHealth === 'healthy' 
                        ? 'text-green-800' 
                        : aiMetrics.pipelineHealth === 'needs-attention'
                        ? 'text-yellow-800'
                        : 'text-red-800'
                    }`}>
                      {aiMetrics.pipelineHealth === 'healthy' ? 'Healthy' : 
                       aiMetrics.pipelineHealth === 'needs-attention' ? 'Needs Attention' : 'Critical'}
                    </div>
                    <div className={`text-xs ${
                      aiMetrics.pipelineHealth === 'healthy' 
                        ? 'text-green-500' 
                        : aiMetrics.pipelineHealth === 'needs-attention'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}>System status</div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    aiMetrics.pipelineHealth === 'healthy' 
                      ? 'bg-green-100' 
                      : aiMetrics.pipelineHealth === 'needs-attention'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      aiMetrics.pipelineHealth === 'healthy' 
                        ? 'text-green-600' 
                        : aiMetrics.pipelineHealth === 'needs-attention'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-purple-600 mb-1">Incomplete Chains</div>
                    <div className="text-2xl font-bold text-purple-800">{aiMetrics.incompleteChains}</div>
                    <div className="text-xs text-purple-500">Missing analysis type</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                </div>
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
                    Linked Analysis
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const linkStatus = getLinkedAnalysisStatus(analysis);
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            linkStatus.color === 'green'
                              ? 'bg-green-100 text-green-800'
                              : linkStatus.color === 'yellow'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {linkStatus.label}
                          </span>
                        );
                      })()}
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
        </>
      ) : (
        /* Requests Tab */
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-slate-600 mb-1">Total Requests</div>
              <div className="text-2xl font-bold text-terracotta">{requests.length}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-slate-600 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">
                {requests.filter(r => r.status === 'pending').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-slate-600 mb-1">Approved</div>
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                No analysis requests yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Reason
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
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(request.requestedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div>
                            {request.customerEmail || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="max-w-xs truncate">
                            {request.reason || 'No reason provided'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveRequest(request)}
                                className="text-green-600 hover:underline font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="text-red-600 hover:underline font-medium"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-slate-600 hover:underline"
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
        </div>
      )}

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

              {/* Linked Analyses */}
              {(() => {
                const customerAnalyses = analyses.filter(a => 
                  a.customerId === selectedAnalysis.customerId && a.id !== selectedAnalysis.id
                );
                
                if (customerAnalyses.length > 0) {
                  return (
                    <div>
                      <h3 className="font-semibold mb-3">Linked Analyses</h3>
                      <div className="space-y-3">
                        {customerAnalyses.map((analysis) => (
                          <div 
                            key={analysis.id}
                            className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors cursor-pointer"
                            onClick={() => setSelectedAnalysis(analysis)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  analysis.type === 'skin' ? 'bg-pink-400' : 'bg-purple-400'
                                }`} />
                                <h4 className="font-semibold">
                                  {analysis.type === 'skin' ? 'Skin Analysis' : 'Product Analysis'}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  analysis.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : analysis.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {analysis.status}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {formatDate(analysis.createdAt)}
                                </span>
                              </div>
                            </div>
                            
                            {analysis.status === 'completed' && analysis.analysis && (
                              <div className="text-sm text-slate-600">
                                {analysis.type === 'skin' && analysis.analysis.skinType && (
                                  <div className="mb-1">
                                    <span className="font-medium">Skin Type:</span> {analysis.analysis.skinType}
                                  </div>
                                )}
                                {analysis.type === 'products' && analysis.analysis.productAnalysis && (
                                  <div className="mb-1">
                                    <span className="font-medium">Products Analyzed:</span> {analysis.analysis.productAnalysis.products?.length || 0}
                                  </div>
                                )}
                                {analysis.analysis.summary && (
                                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {analysis.analysis.summary.substring(0, 100)}...
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="mt-2 text-xs text-blue-600 font-medium">
                              Click to view details →
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Analysis Chain Status */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h4 className="font-semibold text-green-800">Analysis Chain Status</h4>
                        </div>
                        <div className="text-sm text-green-700">
                          {customerAnalyses.some(a => a.type === 'skin') && customerAnalyses.some(a => a.type === 'products') ? (
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✓</span>
                              <span>Complete analysis chain available (Skin + Product analysis)</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-600">⚠</span>
                              <span>
                                Partial analysis chain - {customerAnalyses.some(a => a.type === 'skin') ? 'missing product analysis' : 'missing skin analysis'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

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

                  {/* Monetization Data */}
                  {selectedAnalysis.monetizationData && (
                    <div>
                      <h3 className="font-semibold mb-3">Monetization Analytics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedAnalysis.monetizationData.conversionTracking && (
                          <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-violet-50">
                            <h4 className="font-semibold text-purple-800 mb-3">Conversion Tracking</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Recommendations Sent:</span>
                                <span className="font-semibold">{selectedAnalysis.monetizationData.conversionTracking.recommendationsSent || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Clicks:</span>
                                <span className="font-semibold">{selectedAnalysis.monetizationData.conversionTracking.clicks || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Purchases:</span>
                                <span className="font-semibold">{selectedAnalysis.monetizationData.conversionTracking.purchases || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Revenue:</span>
                                <span className="font-semibold text-green-600">${selectedAnalysis.monetizationData.conversionTracking.revenue || 0}</span>
                              </div>
                              {selectedAnalysis.monetizationData.conversionTracking.lastRecommendationSent && (
                                <div className="text-xs text-slate-500 mt-2">
                                  Last sent: {formatDate(selectedAnalysis.monetizationData.conversionTracking.lastRecommendationSent)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
                          <h4 className="font-semibold text-blue-800 mb-3">AI Pipeline Health</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>AI Feeding Score:</span>
                              <span className={`font-semibold ${
                                (selectedAnalysis.monetizationData.aiFeedingScore || 0) >= 80 ? 'text-green-600' :
                                (selectedAnalysis.monetizationData.aiFeedingScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {selectedAnalysis.monetizationData.aiFeedingScore || 0}/100
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Cross-Reference:</span>
                              <span className={`font-semibold ${
                                selectedAnalysis.monetizationData.crossReferenceSuccess ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {selectedAnalysis.monetizationData.crossReferenceSuccess ? '✓ Success' : '✗ Failed'}
                              </span>
                            </div>
                            {selectedAnalysis.recommendedProducts && selectedAnalysis.recommendedProducts.length > 0 && (
                              <div className="flex justify-between">
                                <span>Products Recommended:</span>
                                <span className="font-semibold">{selectedAnalysis.recommendedProducts.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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

