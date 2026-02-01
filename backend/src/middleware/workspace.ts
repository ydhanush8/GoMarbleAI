import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import prisma from '../config/database';
import { createOrGetUser } from '../services/user.service';

export interface WorkspaceRequest extends AuthRequest {
  workspaceId?: string;
}

/**
 * Middleware to validate workspace access and attach workspaceId to request
 * Requires: workspaceId in query params, body, or headers
 */
export async function validateWorkspaceAccess(
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    // Extract workspaceId from request
    const workspaceId =
      req.body?.workspaceId ||
      req.query?.workspaceId ||
      req.headers['x-workspace-id'];

    if (!workspaceId || typeof workspaceId !== 'string') {
      res.status(400).json({ error: 'Bad Request: workspaceId is required' });
      return;
    }

    // Verify user has access to this workspace
    // Ensure user exists (sync from Clerk if needed)
    await createOrGetUser(req.auth.userId);

    const user = await prisma.user.findUnique({
      where: { clerkId: req.auth.userId },
      include: {
        workspaces: {
          where: { workspaceId },
        },
      },
    });

    if (!user || user.workspaces.length === 0) {
      res.status(403).json({ error: 'Forbidden: No access to this workspace' });
      return;
    }

    // Attach workspaceId to request for use in controllers
    req.workspaceId = workspaceId;

    next();
  } catch (error: any) {
    console.error('Workspace validation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
}
