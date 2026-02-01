import { Request, Response, NextFunction } from 'express';
import { clerkMiddleware, requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

/**
 * Middleware to verify Clerk session and attach user info to request
 */
export const authenticateUser = clerkRequireAuth();
