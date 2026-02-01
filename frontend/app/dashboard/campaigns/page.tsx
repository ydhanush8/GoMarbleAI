'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { Loader2, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';

interface Campaign {
  id: string;
  platformId: string;
  name: string;
  platform: string;
  status: string;
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

type SortField = 'name' | 'platform' | 'impressions' | 'clicks' | 'spend' | 'conversions' | 'ctr' | 'cpc' | 'cpa' | 'roas';
type SortDirection = 'asc' | 'desc';

export default function CampaignsPage() {
  const { getToken } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('spend');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dateRange, setDateRange] = useState(30);
  const [platform, setPlatform] = useState<'all' | 'google' | 'meta'>('all');

  useEffect(() => {
    fetchCampaigns();
  }, [dateRange, platform]);

  async function fetchCampaigns() {
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/metrics/campaigns?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-600 mt-2">
            Detailed performance breakdown by campaign
          </p>
        </div>

        <div className="flex gap-3">
          {/* Date Range */}
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : sortedCampaigns.length > 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <SortableHeader
                    label="Campaign"
                    field="name"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Platform"
                    field="platform"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Impressions"
                    field="impressions"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Clicks"
                    field="clicks"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Spend"
                    field="spend"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="Conversions"
                    field="conversions"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="CTR"
                    field="ctr"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="CPC"
                    field="cpc"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                  <SortableHeader
                    label="ROAS"
                    field="roas"
                    currentField={sortField}
                    direction={sortDirection}
                    onClick={handleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{campaign.name}</div>
                      <div className="text-sm text-slate-500">{campaign.platformId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.platform === 'google'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {campaign.platform === 'google' ? '🔵 Google' : '🔴 Meta'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {campaign.impressions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {campaign.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      ${campaign.spend.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {campaign.conversions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {(campaign.ctr * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      ${campaign.cpc.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {campaign.roas > 0 ? (
                        <span className={campaign.roas >= 1 ? 'text-green-600 font-medium' : 'text-orange-600'}>
                          {campaign.roas.toFixed(2)}x
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {sortedCampaigns.length} campaign{sortedCampaigns.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">No campaigns found</p>
          <a
            href="/dashboard/integrations"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Connect Ad Accounts
          </a>
        </div>
      )}
    </div>
  );
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onClick,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onClick: (field: SortField) => void;
}) {
  const isActive = currentField === field;

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
      onClick={() => onClick(field)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown
          className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`}
        />
        {isActive && (
          <span className="text-purple-600">
            {direction === 'desc' ? '↓' : '↑'}
          </span>
        )}
      </div>
    </th>
  );
}
