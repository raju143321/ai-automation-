import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { retrievalService } from '../services/retrieval.service.js';
import { geminiService } from '../services/gemini.service.js';
import { db } from '../lib/db.js';

export const claimsRouter = Router();

// List project claims
claimsRouter.get('/projects/:projectId/claims', (req, res) => {
  const claims = db.getClaims(req.params.projectId);
  res.json({
    data: claims,
    meta: { requestId: req.requestId, total: claims.length }
  });
});

// Extract claims from project evidence
claimsRouter.post('/projects/:projectId/claims/extract', async (req, res, next) => {
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
      10
    );

    const extraction = await geminiService.extractClaims(evidenceRegistry);

    const createdClaims = [];
    for (const c of extraction.claims) {
      const claimId = uuidv4();
      const evidenceItems = c.evidence.map(e => {
        const regItem = evidenceRegistry.find(r => r.evidence_id === e.evidence_id);
        return {
          id: uuidv4(),
          claim_id: claimId,
          source_id: regItem?.source_id || project.id,
          chunk_id: regItem?.chunk_id || null,
          evidence_relation: e.relation,
          excerpt: regItem?.excerpt || e.explanation,
          page_number: regItem?.page_number || null,
          created_at: new Date().toISOString()
        };
      });

      const claim = db.addClaim({
        id: claimId,
        project_id: projectId,
        created_by: userId,
        analysis_id: null,
        claim_text: c.claim,
        claim_type: c.claim_type,
        assessment: c.assessment,
        confidence: c.confidence,
        rationale: c.rationale,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, evidenceItems);

      createdClaims.push(claim);
    }

    res.status(201).json({
      data: createdClaims,
      meta: { requestId: req.requestId, count: createdClaims.length }
    });
  } catch (err) {
    next(err);
  }
});

// Update claim assessment or annotations
claimsRouter.patch('/claims/:claimId', (req, res) => {
  const updated = db.updateClaim(req.params.claimId, req.body);
  if (!updated) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Claim not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: updated,
    meta: { requestId: req.requestId }
  });
});
