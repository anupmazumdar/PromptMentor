import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from backend/.env or root .env
dotenv.config();

import { helmetMiddleware } from '../../security/helmetConfig';
import { corsMiddleware } from '../../security/corsConfig';
import { inputSanitizerMiddleware } from '../../security/inputSanitizer';
import { generalApiLimiter } from '../../security/rateLimiter';
import { errorHandler } from './middlewares/error.middleware';
import { setupKeepAlive } from './utils/keepAlive';
import { checkDatabaseHealth } from './utils/prisma';

import authRoutes from './routes/auth.routes';
import lessonsRoutes from './routes/lessons.routes';
import tutorRoutes from './routes/tutor.routes';
import progressRoutes from './routes/progress.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(inputSanitizerMiddleware);

// Base rate limiting on all API routes
app.use('/api', generalApiLimiter);

// Health check endpoint for monitoring & Render keep-alive
app.get('/api/health', async (req, res) => {
  const dbHealthy = await checkDatabaseHealth();
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealthy ? 'connected' : 'memory-fallback-mode',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.path}` });
});

// Centralized error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`
  🚀 PromptMentor API Server running on port ${PORT}
  📡 Health check: http://localhost:${PORT}/api/health
  🤖 AI Mode: ${process.env.OPENROUTER_API_KEY ? 'OpenRouter Connected' : 'Resilient Fallback Mode'}
  `);

  // Activate 24/7 keep-alive mechanism if running on Render/cloud
  setupKeepAlive();
});

export default app;
