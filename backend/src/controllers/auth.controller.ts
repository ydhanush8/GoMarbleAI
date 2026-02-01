import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { createOrGetUser, getUserByClerkId } from '../services/user.service';

/**
 * Sync user from Clerk to database
 * Called after successful Clerk authentication
 */
export async function syncUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthRequest;
  try {
    if (!authReq.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await createOrGetUser(authReq.auth.userId);

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authReq = req as AuthRequest;
  try {
    if (!authReq.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserByClerkId(authReq.auth.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      workspaces: user.workspaces.map((wu: any) => ({
        id: wu.workspace.id,
        name: wu.workspace.name,
        role: wu.role,
      })),
    });
  } catch (error) {
    next(error);
  }
}
