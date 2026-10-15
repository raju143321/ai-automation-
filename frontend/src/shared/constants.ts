export const RESEARCH_DOMAINS = [
  { id: 'cs-ai', name: 'Computer Science and Artificial Intelligence', short: 'CS & AI' },
  { id: 'engineering-tech', name: 'Engineering and Emerging Technologies', short: 'Engineering' },
  { id: 'medicine-health', name: 'Medicine and Public Health', short: 'Medicine' },
  { id: 'life-biotech', name: 'Life Sciences and Biotechnology', short: 'Biotech' },
  { id: 'business-econ', name: 'Business, Economics, and Finance', short: 'Business & Econ' },
  { id: 'education-learning', name: 'Education and Learning Science', short: 'Education' },
  { id: 'environment-sustain', name: 'Environment and Sustainability', short: 'Environment' },
  { id: 'social-psych', name: 'Social Sciences and Psychology', short: 'Social Sciences' },
  { id: 'law-policy', name: 'Law, Governance, and Public Policy', short: 'Law & Policy' },
  { id: 'agri-food', name: 'Agriculture and Food Systems', short: 'Agriculture' },
  { id: 'energy-climate', name: 'Energy and Climate Research', short: 'Energy & Climate' },
  { id: 'math-stats', name: 'Mathematics and Statistics', short: 'Math & Stats' },
  { id: 'physics-chem', name: 'Physics and Chemistry', short: 'Physics & Chem' },
  { id: 'humanities-history', name: 'Humanities and History', short: 'Humanities' },
  { id: 'product-market', name: 'Product Research and Market Intelligence', short: 'Market Intel' },
  { id: 'industrial-rd', name: 'Industrial R&D and Innovation', short: 'Industrial R&D' },
  { id: 'interdisciplinary', name: 'Interdisciplinary Research', short: 'Interdisciplinary' },
  { id: 'other', name: 'Other', short: 'Other' }
] as const;

export type DomainId = typeof RESEARCH_DOMAINS[number]['id'];

export const CITATION_STYLES = ['APA', 'MLA', 'Chicago', 'IEEE', 'Vancouver'] as const;
export type CitationStyle = typeof CITATION_STYLES[number];

export const RESEARCH_DEPTHS = ['concise', 'standard', 'comprehensive'] as const;
export type ResearchDepth = typeof RESEARCH_DEPTHS[number];

export const SOURCE_TYPES = ['web', 'scholarly', 'uploaded_document', 'dataset', 'note', 'other'] as const;
export type SourceType = typeof SOURCE_TYPES[number];

export const SOURCE_ACCESS_STATUSES = ['metadata_only', 'accessible', 'restricted', 'unavailable', 'processing'] as const;
export type SourceAccessStatus = typeof SOURCE_ACCESS_STATUSES[number];

export const CLAIM_ASSESSMENTS = [
  'supported',
  'partially_supported',
  'contradicted',
  'insufficient_evidence',
  'requires_human_verification'
] as const;
export type ClaimAssessment = typeof CLAIM_ASSESSMENTS[number];

export const CLAIM_TYPES = [
  'finding',
  'statistic',
  'methodology',
  'interpretation',
  'limitation',
  'hypothesis'
] as const;
export type ClaimType = typeof CLAIM_TYPES[number];

export const EVIDENCE_RELATIONS = ['supports', 'contradicts', 'contextualizes'] as const;
export type EvidenceRelation = typeof EVIDENCE_RELATIONS[number];

export const KNOWLEDGE_NODE_TYPES = [
  'topic',
  'concept',
  'document',
  'claim',
  'finding',
  'author',
  'dataset',
  'question'
] as const;
export type KnowledgeNodeType = typeof KNOWLEDGE_NODE_TYPES[number];

export const KNOWLEDGE_EDGE_TYPES = [
  'supports',
  'contradicts',
  'extends',
  'mentions',
  'related_to',
  'derived_from'
] as const;
export type KnowledgeEdgeType = typeof KNOWLEDGE_EDGE_TYPES[number];

export const DISCOVERY_TYPES = [
  'pattern',
  'contradiction',
  'research_gap',
  'related_concept',
  'follow_up_question'
] as const;
export type DiscoveryType = typeof DISCOVERY_TYPES[number];

export const DISCOVERY_STATUSES = ['new', 'saved', 'dismissed'] as const;
export type DiscoveryStatus = typeof DISCOVERY_STATUSES[number];

export const ANALYSIS_TYPES = [
  'research_brief',
  'literature_review',
  'source_comparison',
  'claim_extraction',
  'gap_analysis',
  'document_summary'
] as const;
export type AnalysisType = typeof ANALYSIS_TYPES[number];

export const COLLABORATOR_ROLES = ['owner', 'editor', 'viewer'] as const;
export type CollaboratorRole = typeof COLLABORATOR_ROLES[number];
