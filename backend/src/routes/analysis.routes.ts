import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createAnalysisSchema, crossComparisonSchema } from '@researchsphere/shared';
import { retrievalService } from '../services/retrieval.service.js';
import { geminiService } from '../services/gemini.service.js';
import { db } from '../lib/db.js';
import { validateBody } from '../middleware/validation.js';

export const analysisRouter = Router();

// List project analyses
analysisRouter.get('/projects/:projectId/analyses', (req, res) => {
  const analyses = db.getAnalyses(req.params.projectId);
  res.json({
    data: analyses,
    meta: { requestId: req.requestId, total: analyses.length }
  });
});

// Create analysis (Literature Review, Brief, Gap Analysis)
analysisRouter.post('/projects/:projectId/analyses', validateBody(createAnalysisSchema), async (req, res, next) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    const projectId = req.params.projectId;
    const { analysis_type, source_ids, depth, citation_style, additional_instructions } = req.body;

    const project = db.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Project not found.', requestId: req.requestId }
      });
    }

    // Retrieve evidence
    const { evidenceRegistry, formattedContext } = await retrievalService.retrieveEvidence(
      projectId,
      `${project.title} ${project.research_question}`,
      source_ids,
      15
    );

    let result: Record<string, unknown> = {};
    let title = '';

    if (analysis_type === 'literature_review') {
      title = `Literature Review: ${project.title}`;
      result = await geminiService.generateLiteratureReview(
        project.research_question,
        evidenceRegistry,
        formattedContext
      );
    } else if (analysis_type === 'source_comparison') {
      title = `Cross-Document Comparison: ${project.title}`;
      const sources = db.getSources(projectId).filter(s => source_ids.includes(s.id));
      result = await geminiService.compareSources(
        sources.map(s => ({ id: s.id, title: s.title, excerpts: [s.abstract || ''] })),
        ['Research Objectives', 'Methodology', 'Key Findings', 'Limitations']
      );
    } else if (analysis_type === 'gap_analysis') {
      title = `Research Gap Analysis: ${project.title}`;
      result = await geminiService.discoverGaps(evidenceRegistry);
    } else {
      // Default: research_brief
      title = `Structured Research Brief: ${project.title}`;
      const qa = await geminiService.answerQuestion(
        project.research_question,
        evidenceRegistry,
        formattedContext,
        depth
      );
      result = {
        executive_summary: qa.answer,
        key_findings: qa.key_findings,
        uncertainties: qa.uncertainties,
        follow_up_questions: qa.follow_up_questions,
        citations: qa.citations
      };
    }

    const analysis = db.addAnalysis({
      id: uuidv4(),
      project_id: projectId,
      user_id: userId,
      analysis_type,
      title,
      input_config: { depth, citation_style, additional_instructions },
      source_ids: source_ids || [],
      result,
      model_name: 'gemini-2.5-flash',
      prompt_version: 'v1.0',
      status: 'completed',
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      data: analysis,
      meta: { requestId: req.requestId }
    });
  } catch (err) {
    next(err);
  }
});

// Cross document comparison endpoint
analysisRouter.post('/projects/:projectId/compare', validateBody(crossComparisonSchema), async (req, res, next) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    const projectId = req.params.projectId;
    const { source_ids, comparison_dimensions } = req.body;

    const sources = db.getSources(projectId).filter(s => source_ids.includes(s.id));
    const comparison = await geminiService.compareSources(
      sources.map(s => ({ id: s.id, title: s.title, excerpts: [s.abstract || ''] })),
      comparison_dimensions
    );

    const analysis = db.addAnalysis({
      id: uuidv4(),
      project_id: projectId,
      user_id: userId,
      analysis_type: 'source_comparison',
      title: `Comparative Matrix (${sources.length} sources)`,
      input_config: { source_ids, comparison_dimensions },
      source_ids,
      result: comparison,
      model_name: 'gemini-2.5-flash',
      prompt_version: 'v1.0',
      status: 'completed',
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      data: analysis,
      meta: { requestId: req.requestId }
    });
  } catch (err) {
    next(err);
  }
});

// Get individual analysis
analysisRouter.get('/analyses/:analysisId', (req, res) => {
  const analysis = db.getStore().analyses.find(a => a.id === req.params.analysisId);
  if (!analysis) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Analysis not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: analysis,
    meta: { requestId: req.requestId }
  });
});
