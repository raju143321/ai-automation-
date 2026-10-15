import { z } from 'zod';
import {
  CITATION_STYLES,
  RESEARCH_DEPTHS,
  SOURCE_TYPES,
  CLAIM_ASSESSMENTS,
  CLAIM_TYPES,
  EVIDENCE_RELATIONS,
  KNOWLEDGE_NODE_TYPES,
  KNOWLEDGE_EDGE_TYPES,
  DISCOVERY_TYPES,
  DISCOVERY_STATUSES,
  ANALYSIS_TYPES
} from './constants.js';

// Section 9.1: New Research Project Form
export const projectBaseSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(160, 'Title cannot exceed 160 characters'),
  research_question: z.string().trim().min(10, 'Research question must be at least 10 characters').max(3000, 'Question cannot exceed 3000 characters'),
  description: z.string().trim().max(5000).optional().nullable(),
  domain: z.string().min(1, 'Domain is required'),
  subdomain: z.string().trim().max(120).optional().nullable(),
  objectives: z.array(z.string().trim().min(1).max(500)).max(10).default([]),
  scope: z.string().trim().max(3000).optional().nullable(),
  language: z.string().min(2).max(20).default('en'),
  date_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional().nullable(),
  date_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD').optional().nullable(),
  source_types: z.array(z.enum(SOURCE_TYPES)).default(['scholarly', 'uploaded_document', 'web']),
  tags: z.array(z.string().trim().min(1).max(50)).default([]),
  citation_style: z.enum(CITATION_STYLES).default('APA'),
  research_depth: z.enum(RESEARCH_DEPTHS).default('standard')
});

export const createProjectSchema = projectBaseSchema.refine((data) => {
  if (data.date_from && data.date_to) {
    return new Date(data.date_to) >= new Date(data.date_from);
  }
  return true;
}, {
  message: 'End date cannot be earlier than start date',
  path: ['date_to']
});

export const updateProjectSchema = projectBaseSchema.partial();

// Section 9.2: Research Search Form
export const researchSearchSchema = z.object({
  query: z.string().trim().min(3, 'Query must be at least 3 characters').max(1000, 'Query cannot exceed 1000 characters'),
  project_id: z.string().uuid().optional(),
  domain: z.string().optional(),
  source_types: z.array(z.enum(SOURCE_TYPES)).optional(),
  date_from: z.string().optional().nullable(),
  date_to: z.string().optional().nullable(),
  language: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20)
});

// Section 9.4: Research Chat Form
export const researchChatSchema = z.object({
  project_id: z.string().uuid(),
  conversation_id: z.string().uuid().optional(),
  question: z.string().trim().min(3, 'Question must be at least 3 characters').max(5000),
  source_scope: z.array(z.string().uuid()).optional(),
  response_depth: z.enum(['concise', 'standard', 'detailed']).default('standard'),
  include_external_search: z.boolean().default(false),
  language: z.string().default('en')
});

// Section 9.5: Analysis Form
export const createAnalysisSchema = z.object({
  project_id: z.string().uuid(),
  analysis_type: z.enum(ANALYSIS_TYPES),
  source_ids: z.array(z.string().uuid()).default([]),
  depth: z.enum(RESEARCH_DEPTHS).default('standard'),
  language: z.string().default('en'),
  citation_style: z.enum(CITATION_STYLES).default('APA'),
  additional_instructions: z.string().max(2000).optional().nullable()
});

// Section 9.6: Comparison Form
export const crossComparisonSchema = z.object({
  project_id: z.string().uuid(),
  source_ids: z.array(z.string().uuid()).min(2, 'Select at least 2 sources').max(10, 'Maximum 10 sources'),
  comparison_dimensions: z.array(z.string()).default([
    'Research Objectives',
    'Methodology',
    'Principal Findings',
    'Limitations',
    'Theoretical Framework'
  ]),
  include_contradictions: z.boolean().default(true),
  include_limitations: z.boolean().default(true)
});

// Section 9.7: User Preferences Form
export const userPreferencesSchema = z.object({
  display_name: z.string().trim().max(100).optional().nullable(),
  preferred_language: z.string().min(2).max(20).default('en'),
  default_citation_style: z.enum(CITATION_STYLES).default('APA'),
  default_research_depth: z.enum(RESEARCH_DEPTHS).default('standard'),
  email_notifications: z.boolean().default(true)
});

// Claims extraction schema
export const claimExtractionInputSchema = z.object({
  project_id: z.string().uuid(),
  source_ids: z.array(z.string().uuid()).optional(),
  max_claims: z.number().int().min(1).max(50).default(20)
});

// Knowledge graph generate schema
export const graphGenerateInputSchema = z.object({
  project_id: z.string().uuid(),
  source_ids: z.array(z.string().uuid()).optional()
});

// Notes schema
export const createNoteSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  source_id: z.string().uuid().optional().nullable(),
  claim_id: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().default(''),
  tags: z.array(z.string().trim()).default([])
});

export const updateNoteSchema = createNoteSchema.partial();

// Collections schema
export const createCollectionSchema = z.object({
  project_id: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(1, 'Collection name is required').max(150),
  description: z.string().trim().max(1000).optional().nullable()
});

// Export schema
export const exportRequestSchema = z.object({
  project_id: z.string().uuid(),
  analysis_id: z.string().uuid().optional(),
  format: z.enum(['markdown', 'json', 'csv', 'txt', 'pdf', 'docx']).default('markdown'),
  citation_style: z.enum(CITATION_STYLES).default('APA'),
  include_metadata: z.boolean().default(true),
  include_citations: z.boolean().default(true)
});

// Collaboration schema
export const inviteMemberSchema = z.object({
  project_id: z.string().uuid(),
  email: z.string().email('Valid email address required'),
  role: z.enum(['editor', 'viewer']).default('viewer')
});

// AI Structured Output Schemas (Sections 15.1 - 15.7)

export const aiQuestionAnswerOutputSchema = z.object({
  answer: z.string(),
  key_findings: z.array(z.object({
    finding: z.string(),
    evidence_ids: z.array(z.string()),
    interpretation: z.string()
  })),
  uncertainties: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  insufficient_evidence: z.boolean()
});

export const aiDocumentSummaryOutputSchema = z.object({
  title: z.string().nullable(),
  research_question: z.string().nullable(),
  objective: z.string(),
  methodology: z.string().nullable(),
  key_findings: z.array(z.object({
    finding: z.string(),
    evidence_ids: z.array(z.string())
  })),
  limitations: z.array(z.string()),
  implications: z.array(z.string()),
  evidence_gaps: z.array(z.string()),
  summary: z.string()
});

export const aiLiteratureReviewOutputSchema = z.object({
  title: z.string(),
  research_question: z.string(),
  introduction: z.string(),
  themes: z.array(z.object({
    name: z.string(),
    synthesis: z.string(),
    evidence_ids: z.array(z.string())
  })),
  agreements: z.array(z.object({
    description: z.string(),
    evidence_ids: z.array(z.string())
  })),
  contradictions: z.array(z.object({
    description: z.string(),
    evidence_ids: z.array(z.string()),
    possible_explanations: z.array(z.string())
  })),
  methodological_limitations: z.array(z.string()),
  research_gaps: z.array(z.object({
    gap: z.string(),
    justification: z.string(),
    evidence_ids: z.array(z.string()),
    speculative: z.boolean()
  })),
  conclusion: z.string(),
  limitations_of_this_review: z.array(z.string())
});

export const aiCrossComparisonOutputSchema = z.object({
  comparison_summary: z.string(),
  dimensions: z.array(z.object({
    dimension: z.string(),
    observations: z.array(z.object({
      source_id: z.string(),
      observation: z.string(),
      evidence_ids: z.array(z.string())
    })),
    synthesis: z.string()
  })),
  agreements: z.array(z.string()),
  disagreements: z.array(z.string()),
  missing_information: z.array(z.string())
});

export const aiClaimExtractionOutputSchema = z.object({
  claims: z.array(z.object({
    claim: z.string(),
    claim_type: z.enum(CLAIM_TYPES),
    assessment: z.enum(CLAIM_ASSESSMENTS),
    evidence: z.array(z.object({
      evidence_id: z.string(),
      relation: z.enum(EVIDENCE_RELATIONS),
      explanation: z.string()
    })),
    rationale: z.string(),
    confidence: z.number().min(0).max(1)
  }))
});

export const aiDiscoveryOutputSchema = z.object({
  discoveries: z.array(z.object({
    type: z.enum(DISCOVERY_TYPES),
    title: z.string(),
    description: z.string(),
    why_it_matters: z.string(),
    evidence_ids: z.array(z.string()),
    speculative: z.boolean(),
    confidence: z.number().min(0).max(1),
    recommended_next_step: z.string()
  })),
  overall_limitations: z.array(z.string())
});

export const aiKnowledgeGraphOutputSchema = z.object({
  nodes: z.array(z.object({
    label: z.string(),
    type: z.enum(KNOWLEDGE_NODE_TYPES),
    description: z.string(),
    evidence_ids: z.array(z.string())
  })),
  edges: z.array(z.object({
    source_label: z.string(),
    target_label: z.string(),
    relation_type: z.enum(KNOWLEDGE_EDGE_TYPES),
    explanation: z.string(),
    evidence_ids: z.array(z.string()),
    confidence: z.number().min(0).max(1)
  }))
});
