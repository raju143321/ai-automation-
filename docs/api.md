# ResearchSphere AI — REST API Documentation

Base URL: `/api/v1`

All authenticated endpoints accept a `Bearer <token>` in the `Authorization` header.

## 1. Response Formats

### Success Envelope
```json
{
  "data": {},
  "meta": {
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

### Error Envelope
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body could not be validated.",
    "details": [{ "path": "title", "message": "Title is required" }],
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 2. API Endpoints

### 2.1 System & Health
- `GET /health`: Basic health check. Returns status and timestamp.
- `GET /health/ready`: Dependency check for Gemini model, database, and search provider.
- `GET /config/public`: Safe non-secret client configuration.

### 2.2 Research Projects
- `GET /projects`: List accessible research projects.
- `POST /projects`: Create a new project. Validated by `createProjectSchema`.
- `GET /projects/:projectId`: Retrieve project details with live source and analysis counts.
- `PATCH /projects/:projectId`: Update project metadata.
- `POST /projects/:projectId/archive`: Archive project.
- `POST /projects/:projectId/restore`: Restore archived project.
- `DELETE /projects/:projectId`: Delete project and cascade dependent records.

### 2.3 Scholarly Discovery & Sources
- `POST /research/search`: Search OpenAlex & Crossref for peer-reviewed literature.
- `GET /projects/:projectId/sources`: List sources attached to a project.
- `POST /projects/:projectId/sources`: Attach a source to a project.
- `POST /projects/:projectId/sources/import`: Batch import validated search results.
- `GET /sources/:sourceId`: Inspect individual source metadata and DOI.

### 2.4 Document Processing
- `POST /projects/:projectId/documents`: Multipart file upload (PDF, DOCX, XLSX, CSV, TXT, MD). Chunks and indexes text.
- `GET /projects/:projectId/documents`: List documents uploaded to a project.
- `GET /documents/:documentId/chunks`: Retrieve extracted text chunks with page numbers and token counts.

### 2.5 Research Chat & Grounded Q&A
- `GET /projects/:projectId/conversations`: List project conversation threads.
- `POST /projects/:projectId/conversations`: Start a new conversation thread.
- `GET /conversations/:conversationId/messages`: Retrieve conversation history.
- `POST /conversations/:conversationId/messages`: Ask research question. Bounded retrieval, Gemini inference, and interactive citation resolution.

### 2.6 Research Analysis
- `POST /projects/:projectId/analyses`: Run literature review, brief, or gap analysis.
- `POST /projects/:projectId/compare`: Generate cross-document comparison matrix across multiple sources.
- `GET /projects/:projectId/analyses`: List saved analyses.
- `GET /analyses/:analysisId`: Inspect analysis details.

### 2.7 Claims & Evidence
- `POST /projects/:projectId/claims/extract`: Extract material claims from literature with assessment ratings.
- `GET /projects/:projectId/claims`: List project claims with evidence links.
- `PATCH /claims/:claimId`: Update claim assessment classification or user annotations.

### 2.8 Knowledge Graph
- `GET /projects/:projectId/knowledge/graph`: Retrieve nodes and edges for visualization.
- `POST /projects/:projectId/knowledge/graph/generate`: Automatically extract concepts and relationships from literature.

### 2.9 Discoveries & Notes
- `GET /projects/:projectId/discoveries`: List research gaps, contradictions, and patterns.
- `POST /projects/:projectId/discoveries/generate`: Detect gaps across project literature.
- `PATCH /discoveries/:discoveryId`: Save or dismiss discovery.
- `GET /projects/:projectId/notes`: List project research notes and annotations.
- `POST /projects/:projectId/notes`: Create research note.
- `PATCH /notes/:noteId`: Update note content or tags.
- `DELETE /notes/:noteId`: Remove note.

### 2.10 Exports
- `POST /projects/:projectId/exports`: Compile and download research brief in Markdown, JSON, CSV, or Printable HTML/PDF with citations formatted in APA, MLA, Chicago, IEEE, or Vancouver.
