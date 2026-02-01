import prisma from '../../config/database';
import { decrypt, encrypt } from '../../config/encryption';
import { AppError } from '../../middleware/errorHandler';

/**
 * Get valid access token for Meta Ads integration
 * Meta tokens are long-lived (60 days) and can be exchanged for new ones
 */
export async function getValidMetaToken(integrationId: string): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration || integration.platform !== 'meta') {
    throw new AppError('Meta Ads integration not found', 404);
  }

  // Decrypt token
  const accessToken = decrypt(integration.accessToken);

  // Meta tokens are long-lived (60 days), but can be exchanged for a fresh one
  // For now, we'll use the existing token. In production, you'd implement
  // token exchange logic before expiry

  return accessToken;
}

/**
 * Meta Ads API client with retry logic
 */
export class MetaAdsClient {
  private integrationId: string;
  private apiVersion = 'v18.0';

  constructor(integrationId: string) {
    this.integrationId = integrationId;
  }

  /**
   * Make authenticated request to Meta Graph API
   */
  async request<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const accessToken = await getValidMetaToken(this.integrationId);
    
    const url = new URL(`https://graph.facebook.com/${this.apiVersion}${endpoint}`);
    url.searchParams.set('access_token', accessToken);
    
    // Add other params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url.toString());

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Meta API error: ${JSON.stringify(error)}`);
        }

        return await response.json() as T;
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retry (exponential backoff)
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Meta API request failed');
  }

  /**
   * Get ad accounts
   */
  async getAdAccounts(): Promise<any[]> {
    const data: any = await this.request('/me/adaccounts', {
      fields: 'id,name,account_status,currency',
    });

    return data.data || [];
  }

  /**
   * Get campaigns for an ad account
   */
  async getCampaigns(adAccountId: string): Promise<any[]> {
    const data: any = await this.request(`/${adAccountId}/campaigns`, {
      fields: 'id,name,status,objective,start_time,stop_time',
    });

    return data.data || [];
  }

  /**
   * Get campaign insights (metrics)
   */
  async getCampaignInsights(
    adAccountId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const data: any = await this.request(`/${adAccountId}/insights`, {
      level: 'campaign',
      time_range: JSON.stringify({ since: startDate, until: endDate }),
      time_increment: 1, // Daily breakdown
      fields: 'campaign_id,campaign_name,date_start,impressions,clicks,spend,actions,action_values',
    });

    return data.data || [];
  }
}
