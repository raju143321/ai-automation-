import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/request-id.js';
import { apiLimiter } from './middleware/rate-limit.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/error-handler.js';

import { healthRouter } from './routes/health.routes.js';
import { projectsRouter } from './routes/projects.routes.js';
import { discoveryRouter } from './routes/discovery.routes.js';
import { documentsRouter } from './routes/documents.routes.js';
import { chatRouter } from './routes/chat.routes.js';
import { analysisRouter } from './routes/analysis.routes.js';
import { claimsRouter } from './routes/claims.routes.js';
import { knowledgeRouter } from './routes/knowledge.routes.js';
import { notesRouter } from './routes/notes.routes.js';
import { discoveriesRouter } from './routes/discoveries.routes.js';
import { exportsRouter } from './routes/exports.routes.js';

export const app = express();

// Security & Parsing
app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin === env.CLIENT_URL ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(requestIdMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limit API routes
app.use(env.API_PREFIX, apiLimiter);

// Auth context
app.use(env.API_PREFIX, authMiddleware);

// Mount routes
app.use(env.API_PREFIX, healthRouter);
app.use(`${env.API_PREFIX}/projects`, projectsRouter);
app.use(`${env.API_PREFIX}/research`, discoveryRouter);
app.use(env.API_PREFIX, discoveryRouter);
app.use(env.API_PREFIX, documentsRouter);
app.use(env.API_PREFIX, chatRouter);
app.use(env.API_PREFIX, analysisRouter);
app.use(env.API_PREFIX, claimsRouter);
app.use(env.API_PREFIX, knowledgeRouter);
app.use(env.API_PREFIX, notesRouter);
app.use(env.API_PREFIX, discoveriesRouter);
app.use(env.API_PREFIX, exportsRouter);

// Central error handler
app.use(errorHandler);
