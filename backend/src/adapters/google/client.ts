import prisma from '../../config/database';
import { decrypt, encrypt } from '../../config/encryption';
import { AppError } from '../../middleware/errorHandler';

interface GoogleAdsTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/**
 * Get valid access token for Google Ads integration
 * Automatically refreshes if expired
 */
export async function getValidGoogleToken(integrationId: string): Promise<string> {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration || integration.platform !== 'google') {
    throw new AppError('Google Ads integration not found', 404);
  }

  // Decrypt tokens
  const accessToken = decrypt(integration.accessToken);
  const refreshToken = integration.refreshToken ? decrypt(integration.refreshToken) : null;

  // Check if token is expired or expiring soon (within 5 minutes)
  const now = new Date();
  const expiresAt = integration.tokenExpiresAt;
  const needsRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < 5 * 60 * 1000;

  if (needsRefresh && refreshToken) {
    console.log(`Refreshing Google Ads token for integration ${integrationId}`);
    
    // Refresh the token
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new AppError('Failed to refresh Google Ads token', 401);
    }

    const tokens: any = await response.json();
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Update integration with new token
    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        accessToken: encrypt(tokens.access_token),
        tokenExpiresAt: newExpiresAt,
      },
    });

    return tokens.access_token;
  }

  return accessToken;
}

/**
 * Google Ads API client with retry logic
 */
export class GoogleAdsClient {
  private integrationId: string;
  private customerId?: string;

  constructor(integrationId: string, customerId?: string) {
    this.integrationId = integrationId;
    this.customerId = customerId;
  }

  /**
   * Make authenticated request to Google Ads API
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const accessToken = await getValidGoogleToken(this.integrationId);
    const baseUrl = 'https://googleads.googleapis.com/v15';

    const url = `${baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN || '',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Google Ads API error: ${error}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retry (exponential backoff)
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Google Ads API request failed');
  }

  /**
   * List accessible customer accounts
   */
  async listAccessibleCustomers(): Promise<string[]> {
    const data: any = await this.request('/customers:listAccessibleCustomers', {
      method: 'GET',
    });

    return data.resourceNames || [];
  }

  /**
   * Get campaign data
   */
  async getCampaigns(customerId: string): Promise<any[]> {
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      WHERE campaign.status != 'REMOVED'
    `;

    const data: any = await this.request(`/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });

    return data.results || [];
  }

  /**
   * Get campaign performance metrics
   */
  async getCampaignMetrics(
    customerId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const query = `
      SELECT 
        campaign.id,
        campaign.name,
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
    `;

    const data: any = await this.request(`/customers/${customerId}/googleAds:search`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });

    return data.results || [];
  }
}
