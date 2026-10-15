import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { researchChatSchema } from '../shared/index.js';
import { retrievalService } from '../services/retrieval.service.js';
import { geminiService } from '../services/gemini.service.js';
import { db } from '../lib/db.js';
import { validateBody } from '../middleware/validation.js';

export const chatRouter = Router();

// List project conversations
chatRouter.get('/projects/:projectId/conversations', (req, res) => {
  const convs = db.getConversations(req.params.projectId);
  const enriched = convs.map(c => ({
    ...c,
    messages_count: db.getMessages(c.id).length
  }));

  res.json({
    data: enriched,
    meta: { requestId: req.requestId, total: enriched.length }
  });
});

// Create conversation
chatRouter.post('/projects/:projectId/conversations', (req, res) => {
  const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
  const title = req.body.title || 'New Research Thread';
  const conv = db.createConversation(req.params.projectId, userId, title);

  res.status(201).json({
    data: conv,
    meta: { requestId: req.requestId }
  });
});

// Get messages for conversation
chatRouter.get('/conversations/:conversationId/messages', (req, res) => {
  const messages = db.getMessages(req.params.conversationId);
  res.json({
    data: messages,
    meta: { requestId: req.requestId, total: messages.length }
  });
});

// Post question to conversation
chatRouter.post('/conversations/:conversationId/messages', validateBody(researchChatSchema), async (req, res, next) => {
  try {
    const userId = req.user?.id || '00000000-0000-0000-0000-000000000001';
    const conversationId = req.params.conversationId;
    const { question, project_id, source_scope, response_depth } = req.body;

    // 1. Save user question message
    const userMessage = db.addMessage({
      id: uuidv4(),
      conversation_id: conversationId,
      project_id,
      user_id: userId,
      role: 'user',
      content: question,
      citations: [],
      model_name: null,
      retrieval_metadata: {},
      created_at: new Date().toISOString()
    });

    // 2. Retrieve grounded evidence
    const { evidenceRegistry, formattedContext } = await retrievalService.retrieveEvidence(
      project_id,
      question,
      source_scope,
      12
    );

    // 3. Ask Gemini with bounded evidence context
    const aiResponse = await geminiService.answerQuestion(
      question,
      evidenceRegistry,
      formattedContext,
      response_depth
    );

    // 4. Save assistant response message with resolved citations
    const assistantMessage = db.addMessage({
      id: uuidv4(),
      conversation_id: conversationId,
      project_id,
      user_id: userId,
      role: 'assistant',
      content: aiResponse.answer,
      citations: aiResponse.citations,
      model_name: aiResponse.model_name,
      retrieval_metadata: {
        evidence_count: evidenceRegistry.length,
        insufficient_evidence: aiResponse.insufficient_evidence,
        key_findings: aiResponse.key_findings,
        follow_up_questions: aiResponse.follow_up_questions
      },
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      data: assistantMessage,
      meta: { requestId: req.requestId }
    });
  } catch (err) {
    next(err);
  }
});
