import { useEffect, useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { CostMetrics, UsageStats, CostMonitoringSettings } from '@buenobrows/shared/types';

interface EfficiencyMetrics {
  totalAppointments: number;
  completedAppointments: number;
  totalRevenue: number;
  costPerAppointment: number;
  costPerCompletedAppointment: number;
  costPerCustomer: number;
  revenueToCostratio: number;
  efficiencyScore: number;
  activeCustomers: number;
}

interface Recommendation {
  category: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  potentialSavings?: number;
}

interface CostData {
  usage: UsageStats;
  costs: Omit<CostMetrics, 'date' | 'createdAt'>;
  efficiency: EfficiencyMetrics;
  recommendations: Recommendation[];
  timestamp: string;
}

interface CostHistory {
  history: CostMetrics[];
  period: string;
  startDate: string;
  endDate: string;
}

export default function CostMonitoring() {
  const { app } = useFirebase();
  const [costData, setCostData] = useState<CostData | null>(null);
  const [costHistory, setCostHistory] = useState<CostHistory | null>(null);
  const [settings, setSettings] = useState<CostMonitoringSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCostData();
    loadCostHistory();
    loadSettings();
  }, []);

  const loadCostData = async () => {
    try {
      setLoading(true);
      const functions = getFunctions(app, 'us-central1');
      const getCurrentUsage = httpsCallable(functions, 'getCurrentUsage');
      const result = await getCurrentUsage();
      
      if (result.data && typeof result.data === 'object' && 'data' in result.data) {
        setCostData(result.data.data as CostData);
      } else {
        // Fallback mock data if function doesn't return expected format
        setCostData({
          usage: {
            firestore: { reads: 0, writes: 0, deletes: 0, storage: 0 },
            functions: { invocations: 0, computeTime: 0 },
            storage: { totalGB: 0, downloadsGB: 0 },
            hosting: { bandwidthGB: 0 },
            geminiAI: { requests: 0, tokens: 0 },
            sendGrid: { emails: 0 }
          },
          costs: {
            totalCost: 0,
            services: {
              firestore: { reads: 0, writes: 0, cost: 0 },
              functions: { invocations: 0, cost: 0 },
              storage: { gb: 0, bandwidth: 0, cost: 0 },
              hosting: { bandwidth: 0, cost: 0 },
              geminiAI: { calls: 0, cost: 0 },
              sendGrid: { emails: 0, cost: 0 }
            },
            projectedMonthly: 0
          },
          efficiency: {
            totalAppointments: 0,
            completedAppointments: 0,
            totalRevenue: 0,
            costPerAppointment: 0,
            costPerCompletedAppointment: 0,
            costPerCustomer: 0,
            revenueToCostratio: 0,
            efficiencyScore: 0,
            activeCustomers: 0
          },
          recommendations: [],
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Error loading cost data:', err);
      setError(err.message || 'Failed to load cost data');
    } finally {
      setLoading(false);
    }
  };

  const loadCostHistory = async () => {
    try {
      const functions = getFunctions(app, 'us-central1');
      const getCostHistory = httpsCallable(functions, 'getCostHistory');
      const result = await getCostHistory({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
        period: 'daily'
      });
      
      if (result.data && typeof result.data === 'object' && 'data' in result.data) {
        setCostHistory(result.data.data as CostHistory);
      }
    } catch (err: any) {
      console.error('Error loading cost history:', err);
    }
  };

  const loadSettings = async () => {
    try {
      // This would typically come from Firestore
      // For now, we'll use default settings
      setSettings({
        projectId: 'bueno-brows-7cce7',
        budgetThresholds: {
          warning: 25,
          critical: 40,
          max: 50
        },
        alertEmails: [],
        autoSync: true,
        currency: 'USD',
        lastSyncAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error loading settings:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCostData();
    await loadCostHistory();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBudgetStatus = (current: number, thresholds: CostMonitoringSettings['budgetThresholds']) => {
    if (current >= thresholds.max) return { status: 'exceeded', color: 'text-red-600', bg: 'bg-red-50' };
    if (current >= thresholds.critical) return { status: 'critical', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (current >= thresholds.warning) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'safe', color: 'text-green-600', bg: 'bg-green-50' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cost data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Cost Data</h3>
            <p className="text-red-600 mt-1">{error}</p>
            <button 
              onClick={loadCostData}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const budgetStatus = settings ? getBudgetStatus(costData?.costs?.projectedMonthly || 0, settings.budgetThresholds) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-slate-800">Cost Monitoring</h1>
          <p className="text-slate-600 mt-1">Track your Firebase usage and costs in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Monthly Cost */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Monthly Cost</h3>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-slate-800 mb-2">
            {formatCurrency(costData?.costs?.totalCost || 0)}
          </div>
          <div className="text-sm text-slate-600">
            Projected: {formatCurrency(costData?.costs?.projectedMonthly || 0)}
          </div>
        </div>

        {/* Budget Status */}
        <div className={`bg-white rounded-xl shadow-soft p-6 ${budgetStatus?.bg || 'bg-slate-50'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Budget Status</h3>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className={`text-2xl font-bold mb-2 ${budgetStatus?.color || 'text-slate-600'}`}>
            {budgetStatus?.status?.toUpperCase() || 'UNKNOWN'}
          </div>
          <div className="text-sm text-slate-600">
            {settings && `Max: ${formatCurrency(settings.budgetThresholds.max)}`}
          </div>
        </div>

        {/* Usage Efficiency */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Efficiency</h3>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className={`text-3xl font-bold mb-2 ${
            (costData?.efficiency?.efficiencyScore || 0) >= 90 ? 'text-green-600' :
            (costData?.efficiency?.efficiencyScore || 0) >= 70 ? 'text-yellow-600' :
            'text-orange-600'
          }`}>
            {costData?.efficiency?.efficiencyScore || 0}%
          </div>
          <div className="text-sm text-slate-600">
            Cost per appointment: {formatCurrency(costData?.efficiency?.costPerAppointment || 0)}
          </div>
        </div>

        {/* Last Updated */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Last Updated</h3>
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-slate-800 mb-2">
            {costData?.timestamp ? new Date(costData.timestamp).toLocaleTimeString() : 'Never'}
          </div>
          <div className="text-sm text-slate-600">
            Auto-sync: {settings?.autoSync ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Business Insights */}
      {costData?.efficiency && (
        <div className="bg-gradient-to-br from-terracotta/5 to-terracotta/10 rounded-xl shadow-soft p-6 border border-terracotta/20">
          <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Business Insights (This Month)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(costData.efficiency.totalRevenue)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {costData.efficiency.completedAppointments} completed appts
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Costs</div>
              <div className="text-2xl font-bold text-slate-800">{formatCurrency(costData.costs.totalCost)}</div>
              <div className="text-xs text-slate-500 mt-1">
                {costData.efficiency.revenueToCostratio.toFixed(2)}% of revenue
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Appointments</div>
              <div className="text-2xl font-bold text-slate-800">{costData.efficiency.totalAppointments}</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatCurrency(costData.efficiency.costPerAppointment)} per appointment
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Active Customers</div>
              <div className="text-2xl font-bold text-slate-800">{costData.efficiency.activeCustomers}</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatCurrency(costData.efficiency.costPerCustomer)} per customer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Recommendations */}
      {costData?.recommendations && costData.recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Optimization Recommendations
          </h2>
          <div className="space-y-3">
            {costData.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded-r-lg ${
                  rec.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  rec.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                        rec.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        rec.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.category}
                      </span>
                      <h3 className="font-semibold text-slate-800">{rec.title}</h3>
                    </div>
                    <p className="text-sm text-slate-600">{rec.description}</p>
                  </div>
                  {rec.potentialSavings && (
                    <div className="ml-4 text-right">
                      <div className="text-xs text-slate-500">Potential Savings</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(rec.potentialSavings)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cost Trends */}
      {costHistory && costHistory.history.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="font-serif text-xl mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Cost Trends (Last 30 Days)
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px] h-64 flex items-end gap-2 px-4">
              {costHistory.history.map((day, idx) => {
                const maxCost = Math.max(...costHistory.history.map(d => d.totalCost), 1);
                const heightPercent = (day.totalCost / maxCost) * 100;
                const isToday = idx === costHistory.history.length - 1;
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className={`w-full rounded-t transition-all hover:opacity-80 ${
                        isToday ? 'bg-terracotta' : 'bg-terracotta/60'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      title={`${day.date}: ${formatCurrency(day.totalCost)}`}
                    />
                    <div className="text-xs text-slate-500 transform -rotate-45 origin-top-left mt-8">
                      {new Date(day.date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">Average Daily Cost</div>
              <div className="text-lg font-bold text-slate-800">
                {formatCurrency(costHistory.history.reduce((sum, d) => sum + d.totalCost, 0) / costHistory.history.length)}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">Highest Daily Cost</div>
              <div className="text-lg font-bold text-slate-800">
                {formatCurrency(Math.max(...costHistory.history.map(d => d.totalCost)))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">Total This Period</div>
              <div className="text-lg font-bold text-slate-800">
                {formatCurrency(costHistory.history.reduce((sum, d) => sum + d.totalCost, 0))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Breakdown */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-serif text-xl mb-6">Service Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costData?.costs?.services && Object.entries(costData.costs.services).map(([service, data]: [string, any]) => (
            <div key={service} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 capitalize">
                  {service.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="text-lg font-bold text-terracotta">
                  {formatCurrency(data.cost || 0)}
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {Object.entries(data).filter(([key]) => key !== 'cost').map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span>{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="font-serif text-xl mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href={`https://console.firebase.google.com/project/${settings?.projectId}/usage`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-terracotta hover:bg-terracotta/5 transition-colors"
          >
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div>
              <div className="font-medium text-slate-800">Firebase Console</div>
              <div className="text-sm text-slate-600">View detailed usage</div>
            </div>
          </a>

          <a
            href="https://console.cloud.google.com/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-terracotta hover:bg-terracotta/5 transition-colors"
          >
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <div>
              <div className="font-medium text-slate-800">Google Cloud Billing</div>
              <div className="text-sm text-slate-600">View billing details</div>
            </div>
          </a>

          <a
            href="/settings?tab=costmonitoring"
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-terracotta hover:bg-terracotta/5 transition-colors"
          >
            <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <div className="font-medium text-slate-800">Configure Alerts</div>
              <div className="text-sm text-slate-600">Set budget thresholds</div>
            </div>
          </a>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:border-terracotta hover:bg-terracotta/5 transition-colors disabled:opacity-50"
          >
            <svg className={`w-6 h-6 text-terracotta ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <div className="font-medium text-slate-800">Sync Data</div>
              <div className="text-sm text-slate-600">Update metrics now</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
