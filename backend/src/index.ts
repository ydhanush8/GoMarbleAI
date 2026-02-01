import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Global Middleware
// ============================================

// Path normalization to handle double slashes from env vars
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/\/+/g, '/');
  }
  next();
});

// ============================================
// Security Middleware
// ============================================

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // Remove trailing slash if present
  'http://localhost:3000',
  'https://go-marble-ai-3d5l.vercel.app'
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Helmet for security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply Clerk middleware globally
app.use(clerkMiddleware({
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Routes
// ============================================

// Import routes
import authRoutes from './routes/auth.routes';
import workspaceRoutes from './routes/workspace.routes';
import oauthRoutes from './routes/oauth.routes';
import metricsRoutes from './routes/metrics.routes';
import insightsRoutes from './routes/insights.routes';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/insights', insightsRoutes);

// ============================================
// Error Handling
// ============================================

app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================
// Start Server & Background Jobs
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start background sync jobs
  if (process.env.NODE_ENV !== 'test') {
    import('./jobs/syncGoogle.job').then((module) => {
      module.scheduleGoogleAdsSync();
    });
    
    import('./jobs/syncMeta.job').then((module) => {
      module.scheduleMetaAdsSync();
    });
  }
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export default app;
