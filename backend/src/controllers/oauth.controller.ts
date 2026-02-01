import { Response, NextFunction } from 'express';
import { WorkspaceRequest } from '../middleware/workspace';
import prisma from '../config/database';
import { encrypt, decrypt } from '../config/encryption';
import { AppError } from '../middleware/errorHandler';

/**
 * Initiate Google Ads OAuth flow
 */
export async function initiateGoogleOAuth(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.workspaceId) {
      res.status(400).json({ error: 'Workspace ID required' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      throw new AppError('Google OAuth not configured', 500);
    }

    // Build OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const state = Buffer.from(
      JSON.stringify({ workspaceId: req.workspaceId })
    ).toString('base64');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes.join(' '));
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    res.json({ url: authUrl.toString() });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle Google OAuth callback
 */
export async function googleOAuthCallback(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }

    // Decode state to get workspaceId
    const { workspaceId } = JSON.parse(
      Buffer.from(state as string, 'base64').toString()
    );

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      throw new AppError('Failed to exchange authorization code', 400);
    }

    const tokens: any = await tokenResponse.json();

    // Get account info to store account ID
    const accountResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }
    );

    const accountInfo: any = await accountResponse.json();

    // Calculate token expiry
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Encrypt tokens
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    // Store integration in database
    await prisma.integration.upsert({
      where: {
        workspaceId_platform_accountId: {
          workspaceId,
          platform: 'google',
          accountId: accountInfo.email,
        },
      },
      create: {
        workspaceId,
        platform: 'google',
        accountId: accountInfo.email,
        accountName: accountInfo.name || accountInfo.email,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        isActive: true,
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: expiresAt,
        scopes: tokens.scope ? tokens.scope.split(' ') : [],
        isActive: true,
      },
    });

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?success=google`);
  } catch (error) {
    next(error);
  }
}

/**
 * Initiate Meta Ads OAuth flow
 */
export async function initiateMetaOAuth(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.workspaceId) {
      res.status(400).json({ error: 'Workspace ID required' });
      return;
    }

    const appId = process.env.META_APP_ID;
    const redirectUri = process.env.META_REDIRECT_URI;

    if (!appId || !redirectUri) {
      throw new AppError('Meta OAuth not configured', 500);
    }

    // Build OAuth URL
    const scopes = ['ads_read', 'ads_management', 'business_management'];

    const state = Buffer.from(
      JSON.stringify({ workspaceId: req.workspaceId })
    ).toString('base64');

    const authUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth');
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes.join(','));
    authUrl.searchParams.set('state', state);

    res.json({ url: authUrl.toString() });
  } catch (error) {
    next(error);
  }
}

/**
 * Handle Meta OAuth callback
 */
export async function metaOAuthCallback(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      throw new AppError('Authorization code missing', 400);
    }

    // Decode state
    const { workspaceId } = JSON.parse(
      Buffer.from(state as string, 'base64').toString()
    );

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', process.env.META_APP_ID!);
    tokenUrl.searchParams.set('client_secret', process.env.META_APP_SECRET!);
    tokenUrl.searchParams.set('redirect_uri', process.env.META_REDIRECT_URI!);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    if (!tokenResponse.ok) {
      throw new AppError('Failed to exchange authorization code', 400);
    }

    const tokens: any = await tokenResponse.json();

    // Get user info
    const meResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?access_token=${tokens.access_token}`
    );
    const userInfo: any = await meResponse.json();

    // Encrypt token
    const encryptedAccessToken = encrypt(tokens.access_token);

    // Store integration
    await prisma.integration.upsert({
      where: {
        workspaceId_platform_accountId: {
          workspaceId,
          platform: 'meta',
          accountId: userInfo.id,
        },
      },
      create: {
        workspaceId,
        platform: 'meta',
        accountId: userInfo.id,
        accountName: userInfo.name || userInfo.id,
        accessToken: encryptedAccessToken,
        refreshToken: null,
        tokenExpiresAt: null, // Meta tokens are long-lived
        scopes: [],
        isActive: true,
      },
      update: {
        accessToken: encryptedAccessToken,
        isActive: true,
      },
    });

    // Redirect to success page
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/integrations?success=meta`);
  } catch (error) {
    next(error);
  }
}

/**
 * Get workspace integrations
 */
export async function getIntegrations(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.workspaceId) {
      res.status(400).json({ error: 'Workspace ID required' });
      return;
    }

    const integrations = await prisma.integration.findMany({
      where: { workspaceId: req.workspaceId },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.json({ integrations });
  } catch (error) {
    next(error);
  }
}

/**
 * Disconnect integration
 */
export async function disconnectIntegration(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { integrationId } = req.params;

    if (!integrationId) {
      res.status(400).json({ error: 'Integration ID required' });
      return;
    }

    // Verify integration belongs to workspace
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId as string,
        workspaceId: req.workspaceId as string,
      },
    });

    if (!integration) {
      throw new AppError('Integration not found', 404);
    }

    // Soft delete by marking as inactive
    await prisma.integration.update({
      where: { id: integrationId as string },
      data: { isActive: false },
    });

    res.json({ message: 'Integration disconnected successfully' });
  } catch (error) {
    next(error);
  }
}
