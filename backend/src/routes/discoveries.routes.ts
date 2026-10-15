import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { retrievalService } from '../services/retrieval.service.js';
import { geminiService } from '../services/gemini.service.js';
import { db } from '../lib/db.js';

export const discoveriesRouter = Router();

// List project discoveries
discoveriesRouter.get('/projects/:projectId/discoveries', (req, res) => {
  const discoveries = db.getDiscoveries(req.params.projectId);
  res.json({
    data: discoveries,
    meta: { requestId: req.requestId, total: discoveries.length }
  });
});

// Generate discoveries and gaps from evidence
discoveriesRouter.post('/projects/:projectId/discoveries/generate', async (req, res, next) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    const projectId = req.params.projectId;

    const project = db.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Project not found.', requestId: req.requestId }
      });
    }

    const { evidenceRegistry } = await retrievalService.retrieveEvidence(
      projectId,
      project.research_question,
      undefined,
      12
    );

    const result = await geminiService.discoverGaps(evidenceRegistry);

    const created = [];
    for (const d of result.discoveries) {
      const disc = db.addDiscovery({
        id: uuidv4(),
        project_id: projectId,
        user_id: userId,
        discovery_type: d.type,
        title: d.title,
        description: d.description,
        why_it_matters: d.why_it_matters,
        evidence: d.evidence_ids.map(id => {
          const r = evidenceRegistry.find(reg => reg.evidence_id === id);
          return { evidence_id: id, excerpt: r?.excerpt, source_title: r?.source_title };
        }),
        confidence: d.confidence,
        status: 'new',
        speculative: d.speculative,
        recommended_next_step: d.recommended_next_step,
        analysis_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      created.push(disc);
    }

    res.status(201).json({
      data: created,
      meta: { requestId: req.requestId, count: created.length }
    });
  } catch (err) {
    next(err);
  }
});

// Update discovery status (saved or dismissed)
discoveriesRouter.patch('/discoveries/:discoveryId', (req, res) => {
  const updated = db.updateDiscovery(req.params.discoveryId, req.body);
  if (!updated) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Discovery not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: updated,
    meta: { requestId: req.requestId }
  });
});
