import test from 'node:test';
import assert from 'node:assert';
import {
  createProjectSchema,
  researchSearchSchema,
  exportRequestSchema,
  RESEARCH_DOMAINS,
  CITATION_STYLES
} from '../dist/index.js';

test('Shared Schemas - Project Creation Validations', () => {
  const validData = {
    title: 'Valid Project Title Here',
    research_question: 'What is the precise relationship between attention and recurrent state spaces?',
    domain: 'cs-ai',
    objectives: ['Analyze computational scaling', 'Evaluate benchmarks'],
    citation_style: 'APA',
    research_depth: 'standard'
  };

  const parsed = createProjectSchema.safeParse(validData);
  assert.ok(parsed.success, 'Valid project data should parse successfully');

  // Short title rejection
  const invalidData = {
    ...validData,
    title: 'No'
  };
  const invalidParsed = createProjectSchema.safeParse(invalidData);
  assert.strictEqual(invalidParsed.success, false, 'Title under 3 chars should fail');
});

test('Shared Schemas - Search Query Validations', () => {
  const validSearch = {
    query: 'attention mechanism transformers',
    page: 1,
    page_size: 20
  };
  const parsed = researchSearchSchema.safeParse(validSearch);
  assert.ok(parsed.success, 'Valid search parameters must succeed');

  const shortSearch = {
    query: 'a'
  };
  const shortParsed = researchSearchSchema.safeParse(shortSearch);
  assert.strictEqual(shortParsed.success, false, 'Query under 3 chars must fail');
});

test('Shared Schemas - Export Request Validations', () => {
  const validExport = {
    project_id: '11111111-1111-1111-1111-111111111111',
    format: 'markdown',
    citation_style: 'APA',
    include_metadata: true,
    include_citations: true
  };
  const parsed = exportRequestSchema.safeParse(validExport);
  assert.ok(parsed.success, 'Valid export request must succeed');
});

test('Shared Constants - Domain Taxonomy Completeness', () => {
  assert.strictEqual(RESEARCH_DOMAINS.length, 18, 'All 18 domain taxonomy categories must be present');
  assert.strictEqual(CITATION_STYLES.length, 5, 'All 5 citation styles must be present');
});
