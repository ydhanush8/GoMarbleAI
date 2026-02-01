import { Request, Response, NextFunction } from 'express';
import { WorkspaceRequest } from '../middleware/workspace';
import prisma from '../config/database';
import {
  calculateCTR,
  calculateCPC,
  calculateCPA,
  calculateROAS,
  formatCurrency,
  formatPercentage,
} from '../services/metrics.service';

/**
 * Get aggregated metrics summary for workspace
 */
export async function getMetricsSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const wsReq = req as WorkspaceRequest;
  try {
    if (!wsReq.workspaceId) {
      res.status(400).json({ error: 'Workspace ID required' });
      return;
    }

    const { startDate, endDate, platform } = wsReq.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Build platform filter
    const platformFilter = platform ? { platform: platform as string } : {};

    // Aggregate metrics
    const metrics = await prisma.dailyMetrics.aggregate({
      where: {
        workspaceId: wsReq.workspaceId,
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...platformFilter,
      },
      _sum: {
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true,
        conversionValue: true,
      },
    });

    const summary = {
      impressions: metrics._sum.impressions || 0,
      clicks: metrics._sum.clicks || 0,
      spend: metrics._sum.spend || 0,
      conversions: metrics._sum.conversions || 0,
      conversionValue: metrics._sum.conversionValue || 0,
      ctr: calculateCTR(
        metrics._sum.clicks || 0,
        metrics._sum.impressions || 0
      ),
      cpc: calculateCPC(metrics._sum.spend || 0, metrics._sum.clicks || 0),
      cpa: calculateCPA(
        metrics._sum.spend || 0,
        metrics._sum.conversions || 0
      ),
      roas: calculateROAS(
        metrics._sum.conversionValue || 0,
        metrics._sum.spend || 0
      ),
    };

    res.json(summary);
  } catch (error) {
    next(error);
  }
}

/**
 * Get campaign performance breakdown
 */
export async function getCampaignMetrics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const wsReq = req as WorkspaceRequest;
  try {
    if (!wsReq.workspaceId) {
      res.status(400).json({ error: 'Workspace ID required' });
      return;
    }

    const { startDate, endDate, platform } = wsReq.query;

    // Build filters
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const platformFilter = platform ? { platform: platform as string } : {};

    // Get campaigns with aggregated metrics
    const campaigns = await prisma.campaign.findMany({
      where: {
        workspaceId: wsReq.workspaceId,
        ...platformFilter,
      },
      include: {
        metrics: {
          where: {
            date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
          },
        },
      },
    });

    // Aggregate metrics per campaign
    const campaignMetrics = campaigns.map((campaign) => {
      const totals = campaign.metrics.reduce(
        (acc, metric) => ({
          impressions: acc.impressions + metric.impressions,
          clicks: acc.clicks + metric.clicks,
          spend: acc.spend + Number(metric.spend),
          conversions: acc.conversions + Number(metric.conversions),
          conversionValue: acc.conversionValue + Number(metric.conversionValue),
        }),
        {
          impressions: 0,
          clicks: 0,
          spend: 0,
          conversions: 0,
          conversionValue: 0,
        }
      );

      return {
        id: campaign.id,
        platformId: campaign.platformId,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        ...totals,
        ctr: calculateCTR(totals.clicks, totals.impressions),
        cpc: calculateCPC(totals.spend, totals.clicks),
        cpa: calculateCPA(totals.spend, totals.conversions),
        roas: calculateROAS(totals.conversionValue, totals.spend),
      };
    });

    res.json({ campaigns: campaignMetrics });
  } catch (error) {
    next(error);
  }
}

/**
 * Get daily trend data
 */
export async function getDailyTrends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const wsReq = req as WorkspaceRequest;
  try {
    if (!wsReq.workspaceId) {
      res.status(400).json({ error: 'Workspace ID required' });
      return;
    }

    const { startDate, endDate, platform } = wsReq.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const platformFilter = platform ? { platform: platform as string } : {};

    // Get metrics grouped by date
    const metrics = await prisma.dailyMetrics.groupBy({
      by: ['date'],
      where: {
        workspaceId: wsReq.workspaceId,
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        ...platformFilter,
      },
      _sum: {
        impressions: true,
        clicks: true,
        spend: true,
        conversions: true,
        conversionValue: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const trends = metrics.map((metric) => ({
      date: metric.date.toISOString().split('T')[0],
      impressions: metric._sum.impressions || 0,
      clicks: metric._sum.clicks || 0,
      spend: metric._sum.spend || 0,
      conversions: metric._sum.conversions || 0,
      conversionValue: metric._sum.conversionValue || 0,
      ctr: calculateCTR(
        metric._sum.clicks || 0,
        metric._sum.impressions || 0
      ),
      cpc: calculateCPC(metric._sum.spend || 0, metric._sum.clicks || 0),
    }));

    res.json({ trends });
  } catch (error) {
    next(error);
  }
}
