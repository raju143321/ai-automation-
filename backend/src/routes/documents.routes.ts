import { Router } from 'express';
import multer from 'multer';
import { documentService } from '../services/document.service.js';
import { db } from '../lib/db.js';

export const documentsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB
  }
});

// Upload document
documentsRouter.post('/projects/:projectId/documents', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'FILE_REQUIRED', message: 'A research document file is required.', requestId: req.requestId }
      });
    }

    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    const result = await documentService.processUploadedFile(req.params.projectId, userId, {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    });

    res.status(201).json({
      data: {
        ...result.document,
        chunk_count: result.chunks.length
      },
      meta: { requestId: req.requestId }
    });
  } catch (err) {
    next(err);
  }
});

// List project documents
documentsRouter.get('/projects/:projectId/documents', (req, res) => {
  const docs = db.getDocuments(req.params.projectId);
  res.json({
    data: docs,
    meta: { requestId: req.requestId, total: docs.length }
  });
});

// Get document chunks
documentsRouter.get('/documents/:documentId/chunks', (req, res) => {
  const allChunks = db.getStore().document_chunks;
  const chunks = allChunks.filter(c => c.document_id === req.params.documentId);

  res.json({
    data: chunks,
    meta: { requestId: req.requestId, total: chunks.length }
  });
});
