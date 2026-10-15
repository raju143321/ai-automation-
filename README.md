# ResearchSphere AI
> Production-Grade Full-Stack AI Research & Knowledge Discovery Workspace

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-cyan.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ecf8e.svg)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-Gemini%202.5%20Flash-4285F4.svg)](https://ai.google.dev/)

---

## 1. Product Vision & Problem Solved

Researchers, academics, analysts, and organizations struggle to discover relevant information across fragmented sources, manage collections of complex papers, evaluate evidence, and synthesize trustworthy conclusions. Traditional workflows are manual, repetitive, vulnerable to missed connections, and prone to hallucinated citations from generic chatbots.

**ResearchSphere AI** solves this by combining:
1. **Live Scholarly Search**: Direct integration with OpenAlex and Crossref (250M+ peer-reviewed works) without paywalls.
2. **Multi-Format Document Intelligence**: Upload and chunk PDFs, DOCX, XLSX, CSV, TXT, and Markdown files.
3. **Evidence-First AI**: Authoritative evidence registry linking every substantive claim to identifiable source passages.
4. **Multi-Document Synthesis**: Automated literature reviews, comparison matrices, and contradiction detection.
5. **Interactive Concept Graphs**: Visual relationship networks (supports, contradicts, derived from) with provenance.
6. **Granular RLS Security**: 19 PostgreSQL tables with complete Row Level Security.
7. **Multi-Format Exports**: Markdown, structured JSON, tabular CSV, and print-ready academic HTML/PDF in APA, MLA, Chicago, IEEE, and Vancouver styles.

---

## 2. Architecture & Monorepo Structure

```text
researchsphere-ai/
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind CSS + TanStack Query + Lucide Icons
│   │   ├── src/
│   │   │   ├── components/     # AppLayout, ProjectWorkspaceLayout, EvidenceDrawer, KnowledgeGraph, ExportModal
│   │   │   ├── context/        # AuthContext (sessions, tokens, user state)
│   │   │   ├── pages/          # Landing, Dashboard, Projects, Discovery, Library, Chat, Analysis, Claims, Graph, Notes, Settings
│   │   │   ├── lib/            # api-client.ts, query-client.ts
│   │   │   ├── router.tsx      # React Router configuration with 18+ routes
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── api/                    # Node.js + Express + Zod + @google/genai SDK + Multer
│       ├── src/
│       │   ├── config/         # env.ts with strict Zod validation
│       │   ├── lib/            # supabase.ts (client), db.ts (resilient persistence layer)
│       │   ├── middleware/     # auth.ts, rate-limit.ts, request-id.ts, validation.ts, error-handler.ts
│       │   ├── services/       # gemini.service.ts, search.service.ts, document.service.ts, retrieval.service.ts, export.service.ts
│       │   ├── routes/         # health, projects, discovery, documents, chat, analysis, claims, knowledge, notes, discoveries, exports
│       │   ├── app.ts          # Express app configuration
│       │   └── server.ts       # Server entrypoint
│       ├── test/               # Automated integration tests
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared TypeScript types, Zod schemas, domain constants
│       ├── src/                # constants.ts (18 domains, citation styles), types.ts, schemas.ts
│       ├── test/               # Shared schema tests
│       └── package.json
│
├── supabase/
│   └── migrations/
│       ├── 20261015000001_initial_schema.sql     # 19 tables, indexes, triggers, full-text search
│       ├── 20261015000002_row_level_security.sql # Granular RLS policies & SECURITY DEFINER functions
│       └── 20261015000003_seed_data.sql          # Verifiable peer-reviewed seed publications
│
├── docs/                       # architecture.md, deployment.md, api.md
├── .env.example                # Standard environment configuration template
└── package.json                # Monorepo root with npm workspaces
```

---

## 3. Quickstart & Local Installation

### Prerequisites
- **Node.js**: v18.x or higher (Tested on Node.js v24.2)
- **npm**: v9.x or higher (Tested on npm 11.19)
- **Git**

### Installation Steps

```bash
# 1. Clone repository & navigate to directory
cd "research ai"

# 2. Install monorepo dependencies across all packages
npm install

# 3. Create .env file from template
cp .env.example .env

# 4. Build the shared contracts
npm run build -w @researchsphere/shared

# 5. Build API and Web packages
npm run build -w @researchsphere/api
npm run build -w @researchsphere/web
```

---

## 4. Running the Application Locally

You can launch both the backend API and frontend dev server concurrently with one command:

```bash
npm run dev
```

Alternatively, run each service in separate terminal windows:

```bash
# Terminal 1: Backend API (runs on http://localhost:3000)
npm run dev -w @researchsphere/api

# Terminal 2: Web Frontend (runs on http://localhost:5173)
npm run dev -w @researchsphere/web
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to access the application.

---

## 5. Automated Verification & Test Commands

Run the test suite across packages:

```bash
# Run shared schema validations & constants tests
npm run test -w @researchsphere/shared

# Run backend API integration & retrieval tests
npm run test -w @researchsphere/api
```

### Test Outcomes
```text
✔ Shared Schemas - Project Creation Validations
✔ Shared Schemas - Search Query Validations
✔ Shared Schemas - Export Request Validations
✔ Shared Constants - Domain Taxonomy Completeness (18 domains verified)
✔ ResearchSphere API - Health Check
✔ ResearchSphere API - Project Retrieval
✔ ResearchSphere API - Evidence Grounded Retrieval
✔ ResearchSphere API - Claims & Assessment Verification
✔ ResearchSphere API - Knowledge Graph Hierarchy
```

---

## 6. Hackathon Live Demonstration Script

To present a live demonstration:

1. **Visit Landing Page** (`/`):
   - Review the problem statement, Evidence-First AI architecture, and interactive demo tabs.
   - Click **"Launch Workspace"**.

2. **Dashboard** (`/app`):
   - Notice real metrics queried from database records (Projects, Sources, Processed Docs, Syntheses).
   - Click on the pre-seeded project: *"Architectural Trade-offs in Multi-Head Attention and State-Space Models"*.

3. **External Scholarly Discovery** (`/app/projects/:id/discover`):
   - Enter a query (e.g. *"attention mechanism mamba state space"*).
   - Observe live peer-reviewed works returned from OpenAlex & Crossref with DOIs, publication venues, author lists, and citation counts.
   - Click **"Save to Project"** on any paper to instantly attach it to your workspace.

4. **Document Processing** (`/app/projects/:id/library`):
   - Click **"Upload Document"** to upload any PDF, DOCX, CSV, or XLSX file.
   - Inspect the extracted text chunks, page numbers, and token counts.

5. **Grounded Assistant Chat** (`/app/projects/:id/chat`):
   - Ask: *"What is the computational complexity bottleneck of Transformers, and how does Mamba resolve it?"*
   - Watch the model answer with inline citations `[ev_1]`, `[ev_2]`.
   - Click on `[ev_1]` to open the **Evidence Drawer** showing the verbatim passage from Vaswani et al. (2017) and clickable DOI.

6. **Analysis Hub** (`/app/projects/:id/analysis`):
   - Select **"Literature Review"** and click **"Run Synthesis"**.
   - Review synthesized themes, scientific agreements, contradictions, and research gaps.
   - Select **"Cross-Source Comparison"** to see the dimension-by-dimension matrix.

7. **Claim & Evidence Explorer** (`/app/projects/:id/claims`):
   - Filter claims by `Supported`, `Contradicted`, or `Insufficient Evidence`.
   - Reclassify any claim or view linked supporting passages.

8. **Concept Graph** (`/app/projects/:id/knowledge`):
   - Explore interactive SVG nodes representing concepts, findings, and claims.
   - Click on *"Multi-Head Attention"* to inspect relationships (`derived_from`, `contradicts`) with confidence ratings.

9. **Export Report**:
   - Click **"Export Report"** in the top header.
   - Choose **Markdown**, **Printable HTML/PDF**, **JSON**, or **CSV** and select **APA/MLA/Chicago**.
   - Download the clean, formatted research brief with full bibliography!

---

## 7. Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `PORT` | API server port | `3000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `GEMINI_API_KEY` | Google Gemini API key (server-only) | Optional (falls back to local grounded synthesis) |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `SUPABASE_URL` | Supabase project URL | Optional (falls back to local persistent store) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | Optional |
| `CROSSREF_MAILTO` | Polite email for Crossref API | `researcher@researchsphere.ai` |
| `MAX_UPLOAD_BYTES` | Maximum document upload size | `20971520` (20 MB) |

---

## 8. Deployment Documentation

For detailed deployment guides on Supabase, Vercel, and Render/Railway, consult:
- [`docs/architecture.md`](file:///c:/Users/deran/OneDrive/Desktop/research%20ai/docs/architecture.md)
- [`docs/deployment.md`](file:///c:/Users/deran/OneDrive/Desktop/research%20ai/docs/deployment.md)
- [`docs/api.md`](file:///c:/Users/deran/OneDrive/Desktop/research%20ai/docs/api.md)

---

## 9. Security & Intellectual Honesty

- **Zero Hallucination Policy**: Claims are verified against retrieved evidence; citation IDs outside the registry are rejected.
- **Untrusted File Isolation**: Uploaded documents are parsed with format-specific libraries, sanitizing text and preventing spreadsheet formula injection.
- **Data Isolation**: PostgreSQL Row Level Security enforces tenant and collaborator boundaries at the database level.
- **Zero Secret Exposure**: Server credentials and Gemini keys are never accessible to client bundles.
