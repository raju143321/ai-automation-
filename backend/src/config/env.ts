import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default('ResearchSphere AI'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  SERVER_URL: z.string().default('http://localhost:3000'),
  API_PREFIX: z.string().default('/api/v1'),

  // Supabase (optional at start, validated when provided)
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_ANON_KEY: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),

  // Gemini API (server-side only)
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),

  // Search providers
  SEARCH_PROVIDER: z.string().default('openalex'),
  SEARCH_API_KEY: z.string().optional().default(''),
  CROSSREF_MAILTO: z.string().default('researcher@researchsphere.ai'),

  // Document limits
  MAX_UPLOAD_BYTES: z.coerce.number().default(20971520), // 20 MB
  MAX_DOCUMENT_PAGES: z.coerce.number().default(1000),
  MAX_EXTRACTED_CHARACTERS: z.coerce.number().default(5000000),

  // Rate limits
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  LOG_LEVEL: z.string().default('info')
});

export const env = envSchema.parse(process.env);
