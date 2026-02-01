import { MetaAdsClient } from './client';

export interface MetaCampaignData {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    startTime?: string;
    stopTime?: string;
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
 * Extract conversion data from Meta actions array
 */
function extractConversions(actions: any[]): { conversions: number; value: number } {
  if (!actions || !Array.isArray(actions)) {
    return { conversions: 0, value: 0 };
  }

  // Sum up all conversion actions (purchases, leads, etc.)
  const conversionActions = actions.filter((action) =>
    ['purchase', 'lead', 'complete_registration', 'add_to_cart'].includes(action.action_type)
  );

  const conversions = conversionActions.reduce((sum, action) => sum + parseFloat(action.value || 0), 0);
  
  return { conversions, value: 0 }; // Value comes from action_values
}

/**
 * Extract conversion value from Meta action_values array
 */
function extractConversionValue(actionValues: any[]): number {
  if (!actionValues || !Array.isArray(actionValues)) {
    return 0;
  }

  const purchaseValue = actionValues.find((av) => av.action_type === 'purchase');
  return parseFloat(purchaseValue?.value || 0);
}

/**
 * Fetch campaign data and metrics from Meta Ads
 */
export async function fetchMetaAdsData(
  integrationId: string,
  adAccountId: string,
  startDate: string,
  endDate: string
): Promise<MetaCampaignData> {
  const client = new MetaAdsClient(integrationId);

  // Fetch campaigns
  const campaignsRaw = await client.getCampaigns(adAccountId);
  const campaigns = campaignsRaw.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
    objective: campaign.objective || 'UNKNOWN',
    startTime: campaign.start_time,
    stopTime: campaign.stop_time,
  }));

  // Fetch insights
  const insightsRaw = await client.getCampaignInsights(adAccountId, startDate, endDate);
  const metrics = insightsRaw.map((insight: any) => {
    const { conversions, value } = extractConversions(insight.actions);
    const conversionValue = extractConversionValue(insight.action_values);

    return {
      campaignId: insight.campaign_id,
      date: insight.date_start,
      impressions: parseInt(insight.impressions) || 0,
      clicks: parseInt(insight.clicks) || 0,
      spend: parseFloat(insight.spend) || 0,
      conversions,
      conversionValue,
    };
  });

  return {
    campaigns,
    metrics,
  };
}

/**
 * Get list of Meta ad accounts
 */
export async function getMetaAdAccounts(integrationId: string): Promise<any[]> {
  const client = new MetaAdsClient(integrationId);
  return await client.getAdAccounts();
}
