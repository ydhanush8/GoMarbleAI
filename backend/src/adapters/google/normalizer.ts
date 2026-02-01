import prisma from '../../config/database';
import { GoogleCampaignData } from './fetcher';
import {
  calculateCTR,
  calculateCPC,
  calculateCPA,
  calculateROAS,
} from '../../services/metrics.service';

/**
 * Normalize Google Ads data into our platform-agnostic schema
 * and store in database
 */
export async function normalizeAndStoreGoogleData(
  workspaceId: string,
  data: GoogleCampaignData
): Promise<void> {
  const platform = 'google';

  // Upsert campaigns
  for (const campaign of data.campaigns) {
    await prisma.campaign.upsert({
      where: {
        workspaceId_platform_platformId: {
          workspaceId,
          platform,
          platformId: campaign.id,
        },
      },
      create: {
        workspaceId,
        platform,
        platformId: campaign.id,
        name: campaign.name,
        status: campaign.status,
        objective: campaign.type,
      },
      update: {
        name: campaign.name,
        status: campaign.status,
        objective: campaign.type,
      },
    });
  }

  // Upsert metrics
  for (const metric of data.metrics) {
    // Get campaign from database
    const campaign = await prisma.campaign.findUnique({
      where: {
        workspaceId_platform_platformId: {
          workspaceId,
          platform,
          platformId: metric.campaignId,
        },
      },
    });

    if (!campaign) {
      console.warn(`Campaign ${metric.campaignId} not found for metrics`);
      continue;
    }

    // Calculate derived metrics
    const ctr = calculateCTR(metric.clicks, metric.impressions);
    const cpc = calculateCPC(metric.spend, metric.clicks);
    const cpa = calculateCPA(metric.spend, metric.conversions);
    const roas = calculateROAS(metric.conversionValue, metric.spend);

    // Store metrics
    await prisma.dailyMetrics.upsert({
      where: {
        workspaceId_platform_date_campaignId_adSetId_adId: {
          workspaceId,
          platform,
          date: new Date(metric.date),
          campaignId: campaign.id,
          adSetId: null,
          adId: null,
        },
      },
      create: {
        workspaceId,
        platform,
        date: new Date(metric.date),
        campaignId: campaign.id,
        impressions: metric.impressions,
        clicks: metric.clicks,
        spend: metric.spend,
        conversions: metric.conversions,
        conversionValue: metric.conversionValue,
        ctr,
        cpc,
        cpa,
        roas,
      },
      update: {
        impressions: metric.impressions,
        clicks: metric.clicks,
        spend: metric.spend,
        conversions: metric.conversions,
        conversionValue: metric.conversionValue,
        ctr,
        cpc,
        cpa,
        roas,
      },
    });
  }

  console.log(
    `✅ Normalized and stored ${data.campaigns.length} campaigns and ${data.metrics.length} metrics from Google Ads`
  );
}
