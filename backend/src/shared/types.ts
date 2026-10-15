import {
  CitationStyle,
  ResearchDepth,
  SourceType,
  SourceAccessStatus,
  ClaimAssessment,
  ClaimType,
  EvidenceRelation,
  KnowledgeNodeType,
  KnowledgeEdgeType,
  DiscoveryType,
  DiscoveryStatus,
  AnalysisType,
  CollaboratorRole
} from './constants.js';

export interface Profile {
  id: string;
  display_name: string | null;
  preferred_language: string;
  default_citation_style: CitationStyle;
  default_research_depth: ResearchDepth;
  created_at: string;
  updated_at: string;
}

export interface ResearchProject {
  id: string;
  owner_id: string;
  title: string;
  research_question: string;
  description: string | null;
  domain: string;
  subdomain: string | null;
  objectives: string[];
  scope: string | null;
  language: string;
  date_from: string | null;
  date_to: string | null;
  source_types: SourceType[];
  tags: string[];
  citation_style: CitationStyle;
  research_depth: ResearchDepth;
  status: 'active' | 'archived';
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed / aggregated
  sources_count?: number;
  documents_count?: number;
  analyses_count?: number;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: CollaboratorRole;
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string;
  user_email?: string;
  user_display_name?: string;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  invited_email: string;
  role: 'editor' | 'viewer';
  token_hash: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface Author {
  name: string;
  affiliation?: string;
  orcid?: string;
}

export interface Source {
  id: string;
  owner_id: string;
  source_type: SourceType;
  title: string;
  canonical_url: string | null;
  publisher: string | null;
  authors: Author[];
  doi: string | null;
  abstract: string | null;
  publication_date: string | null;
  language: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
  content_hash: string | null;
  access_status: SourceAccessStatus;
  retrieved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSource {
  id: string;
  project_id: string;
  source_id: string;
  added_by: string;
  tags: string[];
  relevance_score: number | null;
  notes: string | null;
  created_at: string;
  source?: Source;
}

export interface Document {
  id: string;
  project_id: string;
  source_id: string | null;
  uploaded_by: string;
  original_filename: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  file_hash: string | null;
  page_count: number | null;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_error_code: string | null;
  processing_error_message: string | null;
  extracted_text_length: number;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  project_id: string;
  chunk_index: number;
  page_number: number | null;
  start_offset: number | null;
  end_offset: number | null;
  content: string;
  content_hash: string;
  token_count: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface EvidenceRegistryItem {
  evidence_id: string;
  source_id: string;
  document_id?: string;
  chunk_id?: string;
  source_title: string;
  canonical_url?: string;
  publisher?: string;
  authors?: Author[];
  publication_date?: string;
  doi?: string;
  page_number?: number;
  excerpt: string;
  provenance_type: 'uploaded_document' | 'scholarly_search' | 'web_search' | 'note';
  retrieval_score?: number;
}

export interface CitationDisplay {
  evidence_id: string;
  source_title: string;
  source_url?: string;
  doi?: string;
  authors?: string[];
  year?: string;
  page_number?: number;
  excerpt: string;
}

export interface ResearchConversation {
  id: string;
  project_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages_count?: number;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  project_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: CitationDisplay[];
  model_name: string | null;
  retrieval_metadata: Record<string, unknown>;
  token_usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  created_at: string;
}

export interface ResearchAnalysis {
  id: string;
  project_id: string;
  user_id: string;
  analysis_type: AnalysisType;
  title: string;
  input_config: Record<string, unknown>;
  source_ids: string[];
  result: Record<string, unknown>;
  model_name: string | null;
  prompt_version: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface ResearchClaim {
  id: string;
  project_id: string;
  created_by: string;
  analysis_id: string | null;
  claim_text: string;
  claim_type: ClaimType;
  assessment: ClaimAssessment;
  confidence: number | null;
  rationale: string | null;
  created_at: string;
  updated_at: string;
  evidence_items?: ClaimEvidence[];
}

export interface ClaimEvidence {
  id: string;
  claim_id: string;
  source_id: string;
  chunk_id: string | null;
  evidence_relation: EvidenceRelation;
  excerpt: string | null;
  page_number: number | null;
  created_at: string;
  source?: Source;
}

export interface ResearchNote {
  id: string;
  project_id: string | null;
  user_id: string;
  source_id: string | null;
  claim_id: string | null;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  source?: Source;
  claim?: ResearchClaim;
}

export interface ResearchCollection {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  items_count?: number;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  source_id: string | null;
  note_id: string | null;
  created_at: string;
  source?: Source;
  note?: ResearchNote;
}

export interface KnowledgeNode {
  id: string;
  project_id: string;
  label: string;
  node_type: KnowledgeNodeType;
  description: string | null;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEdge {
  id: string;
  project_id: string;
  source_node_id: string;
  target_node_id: string;
  relation_type: KnowledgeEdgeType;
  evidence: Array<{ evidence_id: string; excerpt?: string }>;
  confidence: number | null;
  origin_analysis_id: string | null;
  created_at: string;
  source_node?: KnowledgeNode;
  target_node?: KnowledgeNode;
}

export interface ResearchDiscovery {
  id: string;
  project_id: string;
  user_id: string;
  discovery_type: DiscoveryType;
  title: string;
  description: string;
  why_it_matters?: string;
  evidence: Array<{ evidence_id: string; excerpt?: string; source_title?: string }>;
  confidence: number | null;
  status: DiscoveryStatus;
  speculative?: boolean;
  recommended_next_step?: string;
  analysis_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditEvent {
  id: string;
  actor_id: string | null;
  project_id: string | null;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
}
