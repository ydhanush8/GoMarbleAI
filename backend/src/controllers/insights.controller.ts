import { Response, NextFunction } from 'express';
import { WorkspaceRequest } from '../middleware/workspace';
import { generateInsights } from '../services/insights.service';

/**
 * Handle AI insights requests
 */
export async function getInsightsHandler(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { query } = req.body;
    const workspaceId = req.workspaceId;

    if (!workspaceId) {
      res.status(400).json({ error: 'Workspace ID is required' });
      return;
    }

    if (!query) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const insight = await generateInsights(workspaceId, query);

    res.json({ insight });
  } catch (error) {
    next(error);
  }
}
