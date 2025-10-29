import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import type { ConversionTracking, MonetizedProduct } from '@shared/types';

export default function MonetizationAnalyticsPage() {
  const [conversionData, setConversionData] = useState<ConversionTracking[]>([]);
  const [products, setProducts] = useState<MonetizedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const db = getFirestore();
    
    // Load conversion tracking data
    const conversionQuery = query(
      collection(db, 'conversionTracking'),
      orderBy('recommendationSent', 'desc')
    );

    const unsubscribeConversion = onSnapshot(conversionQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as ConversionTracking[];
      setConversionData(data);
    });

    // Load products data
    const productsQuery = query(
      collection(db, 'monetizedProducts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeProducts = onSnapshot(productsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      })) as MonetizedProduct[];
      setProducts(data);
      setLoading(false);
    });

    return () => {
      unsubscribeConversion();
      unsubscribeProducts();
    };
  }, []);

  const getFilteredData = () => {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return conversionData.filter(record => 
      new Date(record.recommendationSent) >= cutoffDate
    );
  };

  const filteredData = getFilteredData();

  const calculateMetrics = () => {
    const totalRevenue = filteredData
      .filter(record => record.status === 'purchased')
      .reduce((sum, record) => sum + record.revenue, 0);

    const totalCommissions = filteredData
      .filter(record => record.status === 'purchased')
      .reduce((sum, record) => sum + record.commission, 0);

    const totalClicks = filteredData.filter(record => record.status === 'clicked' || record.status === 'purchased').length;
    const totalPurchases = filteredData.filter(record => record.status === 'purchased').length;
    const conversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;

    const recommendationsSent = filteredData.length;
    const clickThroughRate = recommendationsSent > 0 ? (totalClicks / recommendationsSent) * 100 : 0;

    return {
      totalRevenue,
      totalCommissions,
      conversionRate,
      clickThroughRate,
      recommendationsSent,
      totalClicks,
      totalPurchases
    };
  };

  const metrics = calculateMetrics();

  const getTopProducts = () => {
    const productStats = products.map(product => {
      const productConversions = filteredData.filter(record => record.productId === product.id);
      const purchases = productConversions.filter(record => record.status === 'purchased');
      const revenue = purchases.reduce((sum, record) => sum + record.revenue, 0);
      const clicks = productConversions.filter(record => record.status === 'clicked' || record.status === 'purchased').length;
      
      return {
        product,
        conversions: productConversions.length,
        purchases: purchases.length,
        revenue,
        clicks,
        conversionRate: clicks > 0 ? (purchases.length / clicks) * 100 : 0
      };
    });

    return productStats
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  };

  const topProducts = getTopProducts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Monetization Analytics</h1>
        <p className="text-slate-600">
          Track revenue, conversions, and product performance
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '7d'
                ? 'bg-terracotta text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '30d'
                ? 'bg-terracotta text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === '90d'
                ? 'bg-terracotta text-white'
                : 'bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Last 90 Days
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-green-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-800">${metrics.totalRevenue.toFixed(2)}</div>
              <div className="text-xs text-green-500">From affiliate sales</div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-blue-600 mb-1">Total Commissions</div>
              <div className="text-2xl font-bold text-blue-800">${metrics.totalCommissions.toFixed(2)}</div>
              <div className="text-xs text-blue-500">Your earnings</div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg shadow p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-600 mb-1">Conversion Rate</div>
              <div className="text-2xl font-bold text-purple-800">{metrics.conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-purple-500">Clicks to purchases</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-orange-600 mb-1">Click-Through Rate</div>
              <div className="text-2xl font-bold text-orange-800">{metrics.clickThroughRate.toFixed(1)}%</div>
              <div className="text-xs text-orange-500">Recommendations to clicks</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Recommendations Sent</div>
          <div className="text-3xl font-bold text-slate-800">{metrics.recommendationsSent}</div>
          <div className="text-xs text-slate-500 mt-1">Total recommendations</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Clicks</div>
          <div className="text-3xl font-bold text-slate-800">{metrics.totalClicks}</div>
          <div className="text-xs text-slate-500 mt-1">Affiliate link clicks</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Purchases</div>
          <div className="text-3xl font-bold text-slate-800">{metrics.totalPurchases}</div>
          <div className="text-xs text-slate-500 mt-1">Completed purchases</div>
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Products</h3>
          <p className="text-sm text-gray-600">Products ranked by revenue generated</p>
        </div>
        
        {topProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-600">
            No conversion data available for the selected time range
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Purchases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topProducts.map((item) => (
                  <tr key={item.product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ${item.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.purchases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.conversionRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
