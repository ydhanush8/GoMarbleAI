import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
} from '../services/workspace.service';

/**
 * Create a new workspace
 */
export async function createWorkspaceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { name } = req.body;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Workspace name is required' });
      return;
    }

    const workspace = await createWorkspace(req.auth.userId, name);

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all workspaces for current user
 */
export async function getWorkspacesHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const workspaces = await getUserWorkspaces(req.auth.userId);

    res.json({ workspaces });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a specific workspace
 */
export async function getWorkspaceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { workspaceId } = req.params;

    if (!workspaceId || typeof workspaceId !== 'string') {
      res.status(400).json({ error: 'Workspace ID is required' });
      return;
    }

    const workspace = await getWorkspace(workspaceId, req.auth.userId);

    res.json(workspace);
  } catch (error) {
    next(error);
  }
}

/**
 * Update workspace
 */
export async function updateWorkspaceHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { workspaceId } = req.params;
    const { name } = req.body;

    if (!workspaceId || typeof workspaceId !== 'string') {
      res.status(400).json({ error: 'Workspace ID is required' });
      return;
    }

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Workspace name is required' });
      return;
    }

    const workspace = await updateWorkspace(workspaceId, req.auth.userId, name);

    res.json(workspace);
  } catch (error) {
    next(error);
  }
}
