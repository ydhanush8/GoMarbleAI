import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { syncUser, getCurrentUser } from '../controllers/auth.controller';

const router = Router();

// Sync user from Clerk to database
router.post('/sync', authenticateUser, syncUser);

// Get current user profile
router.get('/me', authenticateUser, getCurrentUser);

export default router;
