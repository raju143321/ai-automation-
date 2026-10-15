import { Router } from 'express';
import { env } from '../config/env.js';
import { geminiService } from '../services/gemini.service.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.json({
    data: {
      status: 'healthy',
      app: env.APP_NAME,
      timestamp: new Date().toISOString()
    },
    meta: { requestId: req.requestId }
  });
});

healthRouter.get('/health/ready', (req, res) => {
  res.json({
    data: {
      status: 'ready',
      aiConfigured: geminiService.isAvailable(),
      supabaseConfigured: isSupabaseConfigured(),
      searchProvider: env.SEARCH_PROVIDER,
      model: env.GEMINI_MODEL
    },
    meta: { requestId: req.requestId }
  });
});

healthRouter.get('/config/public', (req, res) => {
  res.json({
    data: {
      appName: env.APP_NAME,
      apiPrefix: env.API_PREFIX,
      searchProvider: env.SEARCH_PROVIDER,
      aiModel: env.GEMINI_MODEL,
      aiAvailable: geminiService.isAvailable(),
      maxUploadBytes: env.MAX_UPLOAD_BYTES,
      supabaseAvailable: isSupabaseConfigured()
    },
    meta: { requestId: req.requestId }
  });
});
