# ResearchSphere AI — Production Deployment Guide

## 1. Prerequisites

Before deploying to production, ensure you have:
1. A **Supabase** account (Free tier or Pro).
2. A **Google AI Studio** account with a Gemini API key.
3. A hosting account for the Node.js API (e.g. Render, Railway, Fly.io, or AWS ECS).
4. A hosting account for the React frontend (e.g. Vercel, Netlify, or Cloudflare Pages).

---

## 2. Supabase Setup (Database, Auth & Storage)

### Step 1: Create Supabase Project
1. Log in to [Supabase Console](https://supabase.com).
2. Create a new project (e.g., `researchsphere-prod`).
3. Note your project URL, anon public key, and service role private key.

### Step 2: Apply Database Migrations
In the Supabase SQL Editor, run the migrations in sequential order:
1. Copy and execute [`supabase/migrations/20261015000001_initial_schema.sql`](file:///c:/Users/deran/OneDrive/Desktop/research%20ai/supabase/migrations/20261015000001_initial_schema.sql)
   - Sets up extensions, 19 tables, indexes, triggers, and full-text search vectors.
2. Copy and execute [`supabase/migrations/20261015000002_row_level_security.sql`](file:///c:/Users/deran/OneDrive/Desktop/research%20ai/supabase/migrations/20261015000002_row_level_security.sql)
   - Enables Row Level Security (RLS) on all tables and creates security functions.
3. (Optional) Run [`supabase/migrations/20261015000003_seed_data.sql`](file:///c:/Users/deran/OneDrive/Desktop/research%20ai/supabase/migrations/20261015000003_seed_data.sql)
   - Populates initial verified peer-reviewed publications for evaluation.

### Step 3: Create Private Storage Buckets
1. In the Supabase Dashboard, navigate to **Storage**.
2. Create a new bucket named `research-documents`.
3. Set bucket access to **Private** (never public).

---

## 3. Backend Deployment (Render / Railway / Node.js)

### Environment Variables
Configure the following in your hosting provider's environment settings:

```dotenv
NODE_ENV=production
PORT=3000
APP_NAME="ResearchSphere AI"
CLIENT_URL=https://your-frontend-app.vercel.app
SERVER_URL=https://your-backend-api.onrender.com
API_PREFIX=/api/v1

SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash

SEARCH_PROVIDER=openalex
CROSSREF_MAILTO=researcher@yourinstitution.org
```

### Build & Start Commands
- **Build Command**: `npm install && npm run build -w @researchsphere/shared && npm run build -w @researchsphere/backend`
- **Start Command**: `node backend/dist/server.js`

---

## 4. Frontend Deployment (Vercel)

### Root Directory & Framework Preset
- Framework Preset: **Vite**
- Root Directory: `frontend`

### Build & Output Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Environment Variables
- `VITE_API_BASE_URL`: `https://your-backend-api.onrender.com` (or leave empty if using Vercel rewrites to proxy `/api` directly to your backend).

---

## 5. Verification Checklist

- [x] `GET /api/v1/health` returns HTTP 200 `{"status":"healthy"}`
- [x] `GET /api/v1/health/ready` confirms AI and database status
- [x] External search queries OpenAlex and Crossref without rate limit errors
- [x] Document upload validates file sizes and parses PDF, DOCX, CSV, XLSX
- [x] Research chat grounds responses and renders interactive citations
- [x] Row Level Security denies cross-user and cross-project access
