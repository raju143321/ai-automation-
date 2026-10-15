import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { retrievalService } from '../services/retrieval.service.js';
import { geminiService } from '../services/gemini.service.js';
import { db } from '../lib/db.js';

export const knowledgeRouter = Router();

// Get project knowledge graph
knowledgeRouter.get('/projects/:projectId/knowledge/graph', (req, res) => {
  const graph = db.getKnowledgeGraph(req.params.projectId);
  res.json({
    data: graph,
    meta: {
      requestId: req.requestId,
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length
    }
  });
});

// Generate graph elements from project evidence
knowledgeRouter.post('/projects/:projectId/knowledge/graph/generate', async (req, res, next) => {
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

    const extracted = await geminiService.extractKnowledgeGraph(evidenceRegistry);

    // Map of label -> node id
    const labelToNodeId = new Map<string, string>();
    const existing = db.getKnowledgeGraph(projectId);
    for (const n of existing.nodes) {
      labelToNodeId.set(n.label.toLowerCase(), n.id);
    }

    const createdNodes = [];
    for (const n of extracted.nodes) {
      const key = n.label.toLowerCase();
      if (!labelToNodeId.has(key)) {
        const node = db.addKnowledgeNode({
          id: uuidv4(),
          project_id: projectId,
          label: n.label,
          node_type: n.type,
          description: n.description,
          metadata: {},
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        labelToNodeId.set(key, node.id);
        createdNodes.push(node);
      }
    }

    const createdEdges = [];
    for (const e of extracted.edges) {
      const sourceId = labelToNodeId.get(e.source_label.toLowerCase());
      const targetId = labelToNodeId.get(e.target_label.toLowerCase());

      if (sourceId && targetId && sourceId !== targetId) {
        const edge = db.addKnowledgeEdge({
          id: uuidv4(),
          project_id: projectId,
          source_node_id: sourceId,
          target_node_id: targetId,
          relation_type: e.relation_type,
          evidence: e.evidence_ids.map(id => ({ evidence_id: id })),
          confidence: e.confidence,
          origin_analysis_id: null,
          created_at: new Date().toISOString()
        });
        createdEdges.push(edge);
      }
    }

    res.status(201).json({
      data: {
        nodes: createdNodes,
        edges: createdEdges
      },
      meta: { requestId: req.requestId }
    });
  } catch (err) {
    next(err);
  }
});
