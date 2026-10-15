import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createNoteSchema, updateNoteSchema } from '../shared/index.js';
import { db } from '../lib/db.js';
import { validateBody } from '../middleware/validation.js';

export const notesRouter = Router();

// List notes
notesRouter.get('/projects/:projectId/notes', (req, res) => {
  const notes = db.getNotes(req.params.projectId);
  res.json({
    data: notes,
    meta: { requestId: req.requestId, total: notes.length }
  });
});

// Create note
notesRouter.post('/projects/:projectId/notes', validateBody(createNoteSchema), (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const note = db.addNote({
    id: uuidv4(),
    project_id: req.params.projectId,
    user_id: userId,
    source_id: req.body.source_id || null,
    claim_id: req.body.claim_id || null,
    title: req.body.title,
    content: req.body.content || '',
    tags: req.body.tags || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  res.status(201).json({
    data: note,
    meta: { requestId: req.requestId }
  });
});

// Update note
notesRouter.patch('/notes/:noteId', validateBody(updateNoteSchema), (req, res) => {
  const updated = db.updateNote(req.params.noteId, req.body);
  if (!updated) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Note not found.', requestId: req.requestId }
    });
  }

  res.json({
    data: updated,
    meta: { requestId: req.requestId }
  });
});

// Delete note
notesRouter.delete('/notes/:noteId', (req, res) => {
  const success = db.deleteNote(req.params.noteId);
  if (!success) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Note not found.', requestId: req.requestId }
    });
  }

  res.status(204).send();
});
