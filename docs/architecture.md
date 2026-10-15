# ResearchSphere AI — Architecture & Systems Specification

## 1. System Overview

**ResearchSphere AI** is a production-grade research and knowledge discovery workspace designed to transform fragmented information into organized, verifiable evidence, deep discoveries, and actionable scientific briefs.

The platform follows a rigorous research lifecycle:
```
Discover → Collect → Understand → Analyze → Connect → Verify → Publish
```

```
+-----------------------------------------------------------------------------------+
|                                  USER BROWSER                                     |
|  React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query + Lucide Icons      |
+-----------------------------------------------------------------------------------+
                                       |
                   REST API Calls (/api/v1) & Bearer Token
                                       v
+-----------------------------------------------------------------------------------+
|                             NODE.JS + EXPRESS API                                 |
|  Security Middleware: Helmet + CORS + Rate Limiter + Request ID + Zod Validation  |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Search Service     |  | Document Service   |  | Retrieval Service           |  |
|  | OpenAlex + Crossref|  | PDF, DOCX, XLSX,   |  | Lexical TF-IDF + Bounded    |  |
|  | 250M+ Works Index  |  | CSV, TXT, MD Parser|  | Evidence Registry Builder   |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|                                                                                   |
|  +--------------------------------------------+  +-----------------------------+  |
|  | Gemini Service (@google/genai SDK)         |  | Export Service              |  |
|  | - Grounded Question Answering              |  | Markdown, JSON, CSV,        |  |
|  | - Literature Review Multi-Source Synthesis  |  | Printable HTML/PDF, BibTeX  |  |
|  | - Cross-Document Comparison Matrix         |  +-----------------------------+  |
|  | - Claim Extraction & Assessment Status     |                                   |
|  | - Knowledge Graph Entity/Edge Extraction   |                                   |
|  | - Research Gap & Contradiction Detection   |                                   |
|  +--------------------------------------------+                                   |
+-----------------------------------------------------------------------------------+
                    |                                       |
                    v                                       v
+---------------------------------------+  +----------------------------------------+
|        DATABASE & AUTH LAYER          |  |          EXTERNAL PROVIDERS            |
|  Supabase PostgreSQL (or Local Store) |  |  - OpenAlex API (Free REST)            |
|  - 19 Tables with Row Level Security  |  |  - Crossref API (Free REST)            |
|  - Full Text Search (tsvector GIN)    |  |  - Google Gemini API (gemini-2.5-flash)|
|  - Auth Users & Project Memberships   |  +----------------------------------------+
+---------------------------------------+
```

---

## 2. Core Architectural Pillars

### A. Evidence-First Grounded AI
1. **Authoritative Evidence Registry**: When a query or synthesis request is made, candidate excerpts from project documents, papers, and notes are assembled with unique server-generated identifiers (`ev_1`, `ev_2`, etc.).
2. **Strict System Prompt & Schema Validation**: Gemini receives the bounded registry and system instructions strictly prohibiting citation of unprovided sources.
3. **Post-Generation Sanitization**: All citations in the model's response are matched against the request's evidence registry. Any hallucinated IDs are eliminated, and valid citations are enriched with publication year, author list, DOI link, and verbatim passage.

### B. Dual Search & Scholarly Discovery
- **OpenAlex REST API Integration**: Queries over 250 million scholarly publications without requiring paywalls or private API keys.
- **Crossref REST API Integration**: Retrieves authoritative DOI metadata, abstracts, and publisher details.
- **Local Fallback Catalog**: Seeded with real peer-reviewed papers for completely offline or rate-limited environments.

### C. Multi-Format Document Intelligence
- Supports **PDF**, **DOCX**, **TXT**, **Markdown**, **CSV**, and **XLSX**.
- SHA-256 checksum generation for duplicate detection.
- Bounded chunking (~800 characters) preserving estimated page numbers and token counts.
- Strict protection against CSV/spreadsheet formula injection.

### D. PostgreSQL Row Level Security (RLS)
- 19 database tables with granular security policies.
- Functions `can_access_project()`, `can_edit_project()`, and `is_project_owner()` run as `SECURITY DEFINER` with fixed `search_path`.
- Collaborator roles: `owner`, `editor`, and `viewer`.
