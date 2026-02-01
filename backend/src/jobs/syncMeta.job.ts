import cron from 'node-cron';
import prisma from '../config/database';
import { fetchMetaAdsData } from '../adapters/meta/fetcher';
import { normalizeAndStoreMetaData } from '../adapters/meta/normalizer';

/**
 * Sync Meta Ads data for a workspace
 */
async function syncMetaAdsForWorkspace(workspaceId: string, integrationId: string) {
  try {
    console.log(`🔄 Starting Meta Ads sync for workspace ${workspaceId}`);

    // Get integration to find ad account ID
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      select: { accountId: true },
    });

    if (!integration) {
      console.error(`Integration ${integrationId} not found`);
      return;
    }

    const adAccountId = `act_${integration.accountId}`;

    // Fetch data for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch and normalize data
    const data = await fetchMetaAdsData(integrationId, adAccountId, startDateStr, endDateStr);
    await normalizeAndStoreMetaData(workspaceId, data);

    console.log(`✅ Meta Ads sync complete for workspace ${workspaceId}`);
  } catch (error) {
    console.error(`❌ Meta Ads sync failed for workspace ${workspaceId}:`, error);
  }
}

/**
 * Sync Meta Ads data for all active integrations
 */
export async function syncAllMetaAds() {
  try {
    const integrations = await prisma.integration.findMany({
      where: {
        platform: 'meta',
        isActive: true,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    console.log(`🔄 Syncing ${integrations.length} Meta Ads integrations`);

    for (const integration of integrations) {
      await syncMetaAdsForWorkspace(integration.workspaceId, integration.id);
      
      // Wait a bit between workspaces to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('✅ All Meta Ads syncs complete');
  } catch (error) {
    console.error('❌ Meta Ads sync job failed:', error);
  }
}

/**
 * Schedule Meta Ads sync job
 * Runs every 6 hours
 */
export function scheduleMetaAdsSync() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('⏰ Running scheduled Meta Ads sync');
    syncAllMetaAds();
  });

  console.log('📅 Meta Ads sync scheduled (every 6 hours)');
}
