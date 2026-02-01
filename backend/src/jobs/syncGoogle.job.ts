import cron from 'node-cron';
import prisma from '../config/database';
import { fetchGoogleAdsData } from '../adapters/google/fetcher';
import { normalizeAndStoreGoogleData } from '../adapters/google/normalizer';

/**
 * Sync Google Ads data for a workspace
 */
async function syncGoogleAdsForWorkspace(workspaceId: string, integrationId: string) {
  try {
    console.log(`🔄 Starting Google Ads sync for workspace ${workspaceId}`);

    // Get integration to find customer ID
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      select: { accountId: true },
    });

    if (!integration) {
      console.error(`Integration ${integrationId} not found`);
      return;
    }

    const customerId = integration.accountId;

    // Fetch data for last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch and normalize data
    const data = await fetchGoogleAdsData(integrationId, customerId, startDateStr, endDateStr);
    await normalizeAndStoreGoogleData(workspaceId, data);

    console.log(`✅ Google Ads sync complete for workspace ${workspaceId}`);
  } catch (error) {
    console.error(`❌ Google Ads sync failed for workspace ${workspaceId}:`, error);
  }
}

/**
 * Sync Google Ads data for all active integrations
 */
export async function syncAllGoogleAds() {
  try {
    const integrations = await prisma.integration.findMany({
      where: {
        platform: 'google',
        isActive: true,
      },
      select: {
        id: true,
        workspaceId: true,
      },
    });

    console.log(`🔄 Syncing ${integrations.length} Google Ads integrations`);

    for (const integration of integrations) {
      await syncGoogleAdsForWorkspace(integration.workspaceId, integration.id);
      
      // Wait a bit between workspaces to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log('✅ All Google Ads syncs complete');
  } catch (error) {
    console.error('❌ Google Ads sync job failed:', error);
  }
}

/**
 * Schedule Google Ads sync job
 * Runs every 6 hours
 */
export function scheduleGoogleAdsSync() {
  // Run every 6 hours
  cron.schedule('0 */6 * * *', () => {
    console.log('⏰ Running scheduled Google Ads sync');
    syncAllGoogleAds();
  });

  console.log('📅 Google Ads sync scheduled (every 6 hours)');
}
