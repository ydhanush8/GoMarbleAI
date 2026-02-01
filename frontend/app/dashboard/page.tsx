'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MousePointer, 
  Eye, 
  DollarSign, 
  Target,
  Loader2 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

interface MetricsSummary {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

interface TrendData {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [dateRange, setDateRange] = useState(7); // Last 7 days
  const [platform, setPlatform] = useState<'all' | 'google' | 'meta'>('all');

  useEffect(() => {
    fetchMetrics();
  }, [dateRange, platform]);

  async function fetchMetrics() {
    try {
      setLoading(true);
      const token = await getToken();
      const workspaceId = localStorage.getItem('selectedWorkspaceId');

      if (!workspaceId || !token) return;

      const endDate = new Date();
      const startDate = subDays(endDate, dateRange);
      
      const params = new URLSearchParams({
        workspaceId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
      });

      if (platform !== 'all') {
        params.set('platform', platform);
      }

      // Fetch summary
      const summaryRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metrics/summary?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data);
      }

      // Fetch trends
      const trendsRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metrics/trends?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data.trends || []);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Filters */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-600 mt-2">
            Monitor your ad performance across all platforms
          </p>
        </div>

        <div className="flex gap-3">
          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>

          {/* Platform Filter */}
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as any)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Platforms</option>
            <option value="google">Google Ads</option>
            <option value="meta">Meta Ads</option>
          </select>
        </div>
      </div>

      {summary ? (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Spend"
              value={`$${summary.spend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={null}
              color="purple"
            />
            <MetricCard
              title="Impressions"
              value={summary.impressions.toLocaleString()}
              icon={Eye}
              trend={null}
              color="blue"
            />
            <MetricCard
              title="Clicks"
              value={summary.clicks.toLocaleString()}
              icon={MousePointer}
              trend={null}
              color="green"
            />
            <MetricCard
              title="Conversions"
              value={summary.conversions.toLocaleString()}
              icon={Target}
              trend={null}
              color="orange"
            />
          </div>

          {/* Performance Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="CTR"
              value={`${(summary.ctr * 100).toFixed(2)}%`}
              description="Click-Through Rate"
            />
            <StatCard
              label="CPC"
              value={`$${summary.cpc.toFixed(2)}`}
              description="Cost Per Click"
            />
            <StatCard
              label="CPA"
              value={summary.cpa > 0 ? `$${summary.cpa.toFixed(2)}` : 'N/A'}
              description="Cost Per Acquisition"
            />
            <StatCard
              label="ROAS"
              value={summary.roas > 0 ? `${summary.roas.toFixed(2)}x` : 'N/A'}
              description="Return on Ad Spend"
            />
          </div>

          {/* Charts */}
          {trends.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Spend Trend */}
              <ChartCard title="Spend Over Time">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="spend" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Spend ($)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Clicks Trend */}
              <ChartCard title="Clicks Over Time">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Clicks"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* CTA to Integrations if no data */}
          {summary.impressions === 0 && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-3">
                Connect Your Ad Accounts
              </h3>
              <p className="text-purple-100 mb-6">
                Start by connecting Google Ads or Meta Ads to see your analytics
              </p>
              <a
                href="/dashboard/integrations"
                className="inline-block px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
              >
                Go to Integrations
              </a>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">No data available</p>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  trend: number | null;
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
      {trend !== null && (
        <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{Math.abs(trend).toFixed(1)}% vs last period</span>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="text-sm text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-400">{description}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}
