import { GoogleAdsClient } from './client';

export interface GoogleCampaignData {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    type: string;
    startDate?: string;
    endDate?: string;
  }>;
  metrics: Array<{
    campaignId: string;
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    conversionValue: number;
  }>;
}

/**
 * Fetch campaign data and metrics from Google Ads
 */
export async function fetchGoogleAdsData(
  integrationId: string,
  customerId: string,
  startDate: string,
  endDate: string
): Promise<GoogleCampaignData> {
  const client = new GoogleAdsClient(integrationId, customerId);

  // Fetch campaigns
  const campaignsRaw = await client.getCampaigns(customerId);
  const campaigns = campaignsRaw.map((row: any) => ({
    id: row.campaign.id.toString(),
    name: row.campaign.name,
    status: row.campaign.status,
    type: row.campaign.advertisingChannelType || 'UNKNOWN',
    startDate: row.campaign.startDate,
    endDate: row.campaign.endDate,
  }));

  // Fetch metrics
  const metricsRaw = await client.getCampaignMetrics(customerId, startDate, endDate);
  const metrics = metricsRaw.map((row: any) => ({
    campaignId: row.campaign.id.toString(),
    date: row.segments.date,
    impressions: parseInt(row.metrics.impressions) || 0,
    clicks: parseInt(row.metrics.clicks) || 0,
    spend: parseInt(row.metrics.costMicros) / 1000000, // Convert micros to currency
    conversions: parseFloat(row.metrics.conversions) || 0,
    conversionValue: parseFloat(row.metrics.conversionsValue) || 0,
  }));

  return {
    campaigns,
    metrics,
  };
}

/**
 * Get list of accessible Google Ads accounts
 */
export async function getGoogleAdsAccounts(integrationId: string): Promise<string[]> {
  const client = new GoogleAdsClient(integrationId);
  return await client.listAccessibleCustomers();
}
