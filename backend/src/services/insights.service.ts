import { Anthropic } from '@anthropic-ai/sdk';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * Build context for Claude based on workspace metrics
 */
async function buildMetricsContext(workspaceId: string, startDate: string, endDate: string) {
  // Fetch summary metrics
  const summary = await prisma.dailyMetrics.aggregate({
    where: {
      workspaceId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      impressions: true,
      clicks: true,
      spend: true,
      conversions: true,
      conversionValue: true,
    },
  });

  // Fetch performance by platform
  const platformMetrics = await prisma.dailyMetrics.groupBy({
    by: ['platform'],
    where: {
      workspaceId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    _sum: {
      spend: true,
      conversions: true,
    },
  });

  const context = `
    Performance Summary (from ${startDate} to ${endDate}):
    - Total Spend: $${Number(summary._sum.spend || 0).toFixed(2)}
    - Total Impressions: ${summary._sum.impressions || 0}
    - Total Clicks: ${summary._sum.clicks || 0}
    - Total Conversions: ${summary._sum.conversions || 0}
    - Total Conversion Value: $${Number(summary._sum.conversionValue || 0).toFixed(2)}
    
    Platform Breakdown:
    ${platformMetrics.map((p: any) => `- ${p.platform.toUpperCase()}: $${Number(p._sum.spend || 0).toFixed(2)} spend, ${p._sum.conversions || 0} conversions`).join('\n')}
  `;

  return context;
}

/**
 * Generate AI insights for the workspace
 */
export async function generateInsights(workspaceId: string, userQuery: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AppError('Anthropic API key is not configured', 500);
  }

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // Last 30 days

  const metricsContext = await buildMetricsContext(workspaceId, startDate, endDate);

  const systemPrompt = `
    You are an expert Ad Performance Analyst for GoMarble.
    Your goal is to provide actionable insights and recommendations based on ad platform metrics.
    
    Context:
    - You are analyzing performance for a specific workspace.
    - You have access to aggregated metrics for Google Ads and Meta Ads.
    - Be concise, data-driven, and focus on ROI/ROAS.
    - If data is missing or low, mention that.
    
    Current Metrics Context:
    ${metricsContext}
  `;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userQuery },
    ],
  });

  // Handle different response formats based on SDK version
  const content = response.content[0];
  if (content.type === 'text') {
    return content.text;
  }
  
  return 'Could not generate text insight.';
}
