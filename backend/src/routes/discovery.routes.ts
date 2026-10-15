import { Router } from 'express';
import { researchSearchSchema } from '../shared/index.js';
import { searchService } from '../services/search.service.js';
import { db } from '../lib/db.js';
import { validateBody } from '../middleware/validation.js';

export const discoveryRouter = Router();

// External research search
discoveryRouter.post('/search', validateBody(researchSearchSchema), async (req, res, next) => {
  try {
    const { query, page, page_size } = req.body;
    const searchResult = await searchService.search(query, page, page_size);

    res.json({
      data: searchResult.results,
      meta: {
        requestId: req.requestId,
        total: searchResult.total,
        page: searchResult.page,
        pageSize: searchResult.pageSize,
        provider: searchResult.provider,
        providerStatus: searchResult.providerStatus
      }
    });
  } catch (err) {
    next(err);
  }
});

// List project sources
discoveryRouter.get('/projects/:projectId/sources', (req, res) => {
  const sources = db.getSources(req.params.projectId);
  res.json({
    data: sources,
    meta: { requestId: req.requestId, total: sources.length }
  });
});

// Attach a source to a project
discoveryRouter.post('/projects/:projectId/sources', (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const source = db.addSourceToProject(req.params.projectId, req.body, userId);

  res.status(201).json({
    data: source,
    meta: { requestId: req.requestId }
  });
});

// Batch import sources to a project
discoveryRouter.post('/projects/:projectId/sources/import', (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const { sources } = req.body;
  if (!Array.isArray(sources)) {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'Sources must be an array.', requestId: req.requestId }
    });
  }

  const added = sources.map(s => db.addSourceToProject(req.params.projectId, s, userId));
  res.status(201).json({
    data: added,
    meta: { requestId: req.requestId, count: added.length }
  });
});

// Get individual source
discoveryRouter.get('/sources/:sourceId', (req, res) => {
  const source = db.getSources().find(s => s.id === req.params.sourceId);
  if (!source) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Source record not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: source,
    meta: { requestId: req.requestId }
  });
});
