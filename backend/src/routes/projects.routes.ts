import { Router } from 'express';
import { createProjectSchema, updateProjectSchema } from '../shared/index.js';
import { db } from '../lib/db.js';
import { validateBody } from '../middleware/validation.js';

export const projectsRouter = Router();

// List accessible projects
projectsRouter.get('/', (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const projects = db.getProjects(userId);

  // Compute live counts
  const enriched = projects.map(p => ({
    ...p,
    sources_count: db.getSources(p.id).length,
    documents_count: db.getDocuments(p.id).length,
    analyses_count: db.getAnalyses(p.id).length
  }));

  res.json({
    data: enriched,
    meta: { requestId: req.requestId, total: enriched.length }
  });
});

// Create project
projectsRouter.post('/', validateBody(createProjectSchema), (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const created = db.createProject({
    ...req.body,
    owner_id: userId
  });

  res.status(201).json({
    data: created,
    meta: { requestId: req.requestId }
  });
});

// Get project by ID
projectsRouter.get('/:projectId', (req, res) => {
  const project = db.getProject(req.params.projectId);
  if (!project) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Research project not found.', requestId: req.requestId }
    });
  }

  const enriched = {
    ...project,
    sources_count: db.getSources(project.id).length,
    documents_count: db.getDocuments(project.id).length,
    analyses_count: db.getAnalyses(project.id).length
  };

  res.json({
    data: enriched,
    meta: { requestId: req.requestId }
  });
});

// Update project
projectsRouter.patch('/:projectId', validateBody(updateProjectSchema), (req, res) => {
  const updated = db.updateProject(req.params.projectId, req.body);
  if (!updated) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Research project not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: updated,
    meta: { requestId: req.requestId }
  });
});

// Archive project
projectsRouter.post('/:projectId/archive', (req, res) => {
  const updated = db.updateProject(req.params.projectId, {
    status: 'archived',
    archived_at: new Date().toISOString()
  });
  if (!updated) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Research project not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: updated,
    meta: { requestId: req.requestId }
  });
});

// Restore project
projectsRouter.post('/:projectId/restore', (req, res) => {
  const updated = db.updateProject(req.params.projectId, {
    status: 'active',
    archived_at: null
  });
  if (!updated) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Research project not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: updated,
    meta: { requestId: req.requestId }
  });
});

// Delete project
projectsRouter.delete('/:projectId', (req, res) => {
  const success = db.deleteProject(req.params.projectId);
  if (!success) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Research project not found.', requestId: req.requestId }
    });
  }

  res.status(204).send();
});
