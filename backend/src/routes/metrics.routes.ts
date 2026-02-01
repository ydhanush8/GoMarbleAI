import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateWorkspaceAccess } from '../middleware/workspace';
import {
  getMetricsSummary,
  getCampaignMetrics,
  getDailyTrends,
} from '../controllers/metrics.controller';

const router = Router();

// All metrics routes require authentication and workspace access
router.use(authenticateUser);
router.use(validateWorkspaceAccess);

// GET /api/metrics/summary - Aggregated metrics
router.get('/summary', getMetricsSummary);

// GET /api/metrics/campaigns - Campaign performance breakdown
router.get('/campaigns', getCampaignMetrics);

// GET /api/metrics/trends - Daily trends
router.get('/trends', getDailyTrends);

export default router;
