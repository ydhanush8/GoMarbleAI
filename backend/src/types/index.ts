export interface MetricsSummary {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalConversionValue: number;
  averageCTR: number;
  averageCPC: number;
  averageCPA: number;
  averageROAS: number;
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  platform: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
}

export interface DateRangeMetrics {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scopes: string[];
}

export interface Integration {
  id: string;
  platform: 'google' | 'meta';
  accountId: string;
  accountName?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AIInsightRequest {
  question: string;
  workspaceId: string;
  context?: 'overview' | 'campaign' | 'platform';
}

export interface AIInsightResponse {
  answer: string;
  recommendedMetrics?: string[];
  timestamp: Date;
}
