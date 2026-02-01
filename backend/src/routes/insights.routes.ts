import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateWorkspaceAccess } from '../middleware/workspace';
import { getInsightsHandler } from '../controllers/insights.controller';

const router = Router();

// Protect all insights routes
router.use(authenticateUser);
router.use(validateWorkspaceAccess);

/**
 * POST /api/insights/ask
 * Get AI-powered insights for the current workspace
 */
router.post('/ask', getInsightsHandler);

export default router;
