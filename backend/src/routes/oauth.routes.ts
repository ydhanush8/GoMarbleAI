import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateWorkspaceAccess } from '../middleware/workspace';
import {
  initiateGoogleOAuth,
  googleOAuthCallback,
  initiateMetaOAuth,
  metaOAuthCallback,
  getIntegrations,
  disconnectIntegration,
} from '../controllers/oauth.controller';

const router = Router();

// Google Ads OAuth
router.post(
  '/google/initiate',
  authenticateUser,
  validateWorkspaceAccess,
  initiateGoogleOAuth
);

router.get('/google/callback', googleOAuthCallback);

// Meta Ads OAuth
router.post(
  '/meta/initiate',
  authenticateUser,
  validateWorkspaceAccess,
  initiateMetaOAuth
);

router.get('/meta/callback', metaOAuthCallback);

// Get integrations
router.get(
  '/',
  authenticateUser,
  validateWorkspaceAccess,
  getIntegrations
);

// Disconnect integration
router.delete(
  '/:integrationId',
  authenticateUser,
  validateWorkspaceAccess,
  disconnectIntegration
);

export default router;
