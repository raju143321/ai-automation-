import { Router } from 'express';
import { exportRequestSchema } from '@researchsphere/shared';
import { exportService } from '../services/export.service.js';
import { validateBody } from '../middleware/validation.js';

export const exportsRouter = Router();

// Generate and download export
exportsRouter.post('/projects/:projectId/exports', validateBody(exportRequestSchema), (req, res, next) => {
  try {
    const { format, citation_style, analysis_id, include_metadata, include_citations } = req.body;
    const result = exportService.generateExport({
      projectId: req.params.projectId,
      analysisId: analysis_id,
      format,
      citationStyle: citation_style,
      includeMetadata: include_metadata,
      includeCitations: include_citations
    });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.content);
  } catch (err) {
    next(err);
  }
});
