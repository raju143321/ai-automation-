import test from 'node:test';
import assert from 'node:assert';
import { app } from '../dist/app.js';
import { db } from '../dist/lib/db.js';

test('ResearchSphere API - Health Check', async () => {
  const store = db.getStore();
  assert.ok(store.projects.length > 0, 'Seed project should be loaded');
  assert.ok(store.sources.length >= 2, 'Seed sources should be loaded');
});

test('ResearchSphere API - Project Retrieval', async () => {
  const project = db.getProject('11111111-1111-1111-1111-111111111111');
  assert.ok(project, 'Default project exists');
  assert.strictEqual(project?.domain, 'cs-ai');
  assert.ok(project?.objectives.length > 0);
});

test('ResearchSphere API - Evidence Grounded Retrieval', async () => {
  const chunks = db.getChunks('11111111-1111-1111-1111-111111111111');
  assert.ok(chunks.length >= 2, 'Document chunks must exist');
  assert.ok(chunks[0].content.includes('attention') || chunks[0].content.includes('mapping'));
});

test('ResearchSphere API - Claims & Assessment Verification', async () => {
  const claims = db.getClaims('11111111-1111-1111-1111-111111111111');
  assert.ok(claims.length > 0, 'Claims must exist');
  assert.strictEqual(claims[0].assessment, 'supported');
  assert.ok(claims[0].evidence_items && claims[0].evidence_items.length > 0);
});

test('ResearchSphere API - Knowledge Graph Hierarchy', async () => {
  const graph = db.getKnowledgeGraph('11111111-1111-1111-1111-111111111111');
  assert.ok(graph.nodes.length >= 3, 'Graph should have nodes');
  assert.ok(graph.edges.length >= 2, 'Graph should have edges');
  assert.strictEqual(graph.edges[0].relation_type, 'derived_from');
});
