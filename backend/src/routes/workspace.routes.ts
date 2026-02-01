import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  createWorkspaceHandler,
  getWorkspacesHandler,
  getWorkspaceHandler,
  updateWorkspaceHandler,
} from '../controllers/workspace.controller';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Create workspace
router.post('/', createWorkspaceHandler);

// Get all workspaces for user
router.get('/', getWorkspacesHandler);

// Get specific workspace
router.get('/:workspaceId', getWorkspaceHandler);

// Update workspace
router.put('/:workspaceId', updateWorkspaceHandler);

export default router;
