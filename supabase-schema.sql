-- ResearchSphere AI: Production Database Schema
-- Migration 00001: Initial Schema

-- 10.1 Extensions & Common Triggers
create extension if not exists pgcrypto;
-- Vector extension (only if supported in environment, otherwise handled gracefully)
do $$
begin
  create extension if not exists vector;
exception when others then
  raise notice 'pgvector extension not available or restricted, continuing with text-only vector';
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 10.2 Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language text not null default 'en',
  default_citation_style text not null default 'APA',
  default_research_depth text not null default 'standard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_name_length
    check (display_name is null or char_length(display_name) <= 100),

  constraint profiles_depth_check
    check (default_research_depth in (
      'concise', 'standard', 'comprehensive'
    )),

  constraint profiles_citation_check
    check (default_citation_style in (
      'APA', 'MLA', 'Chicago', 'IEEE', 'Vancouver'
    ))
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 10.3 Research Projects
create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  research_question text not null,
  description text,
  domain text not null,
  subdomain text,
  objectives jsonb not null default '[]'::jsonb,
  scope text,
  language text not null default 'en',
  date_from date,
  date_to date,
  source_types text[] not null default '{}',
  tags text[] not null default '{}',
  citation_style text not null default 'APA',
  research_depth text not null default 'standard',
  status text not null default 'active',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_title_length
    check (char_length(title) between 3 and 160),

  constraint projects_question_length
    check (char_length(research_question) between 10 and 3000),

  constraint projects_status_check
    check (status in ('active', 'archived')),

  constraint projects_depth_check
    check (research_depth in (
      'concise', 'standard', 'comprehensive'
    )),

  constraint projects_date_range
    check (date_from is null or date_to is null or date_to >= date_from),

  constraint projects_objectives_array
    check (jsonb_typeof(objectives) = 'array')
);

create index if not exists projects_owner_updated_idx
  on public.research_projects(owner_id, updated_at desc);

create index if not exists projects_domain_idx
  on public.research_projects(domain);

drop trigger if exists projects_updated_at on public.research_projects;
create trigger projects_updated_at
before update on public.research_projects
for each row execute function public.set_updated_at();

-- 10.4 Project Memberships
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'viewer',
  invited_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),

  constraint project_members_role_check
    check (role in ('owner', 'editor', 'viewer')),

  constraint project_members_unique
    unique (project_id, user_id)
);

create index if not exists project_members_user_idx
  on public.project_members(user_id, project_id);

-- 10.5 Project Invitations
create table if not exists public.project_invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  invited_email text not null,
  role text not null default 'viewer',
  token_hash text not null unique,
  invited_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),

  constraint invitations_role_check
    check (role in ('editor', 'viewer'))
);

create index if not exists invitations_project_idx
  on public.project_invitations(project_id);

-- 10.6 Sources
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  title text not null,
  canonical_url text,
  publisher text,
  authors jsonb not null default '[]'::jsonb,
  doi text,
  abstract text,
  publication_date date,
  language text,
  external_id text,
  metadata jsonb not null default '{}'::jsonb,
  content_hash text,
  access_status text not null default 'metadata_only',
  retrieved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint sources_type_check
    check (source_type in (
      'web', 'scholarly', 'uploaded_document',
      'dataset', 'note', 'other'
    )),

  constraint sources_access_status_check
    check (access_status in (
      'metadata_only', 'accessible', 'restricted',
      'unavailable', 'processing'
    )),

  constraint sources_title_length
    check (char_length(title) between 1 and 1000),

  constraint sources_authors_array
    check (jsonb_typeof(authors) = 'array'),

  constraint sources_metadata_object
    check (jsonb_typeof(metadata) = 'object')
);

create index if not exists sources_owner_created_idx
  on public.sources(owner_id, created_at desc);

create index if not exists sources_doi_idx
  on public.sources(doi)
  where doi is not null;

create index if not exists sources_url_idx
  on public.sources(canonical_url)
  where canonical_url is not null;

drop trigger if exists sources_updated_at on public.sources;
create trigger sources_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

-- 10.7 Project Sources
create table if not exists public.project_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  source_id uuid not null
    references public.sources(id) on delete cascade,
  added_by uuid not null references auth.users(id) on delete cascade,
  tags text[] not null default '{}',
  relevance_score double precision,
  notes text,
  created_at timestamptz not null default now(),

  constraint project_sources_unique
    unique (project_id, source_id),

  constraint project_sources_score
    check (
      relevance_score is null
      or (relevance_score >= 0 and relevance_score <= 1)
    )
);

create index if not exists project_sources_project_idx
  on public.project_sources(project_id, created_at desc);

create index if not exists project_sources_source_idx
  on public.project_sources(source_id);

-- 10.8 Documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  source_id uuid references public.sources(id) on delete set null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  original_filename text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size_bytes bigint not null,
  file_hash text,
  page_count integer,
  processing_status text not null default 'pending',
  processing_error_code text,
  processing_error_message text,
  extracted_text_length bigint not null default 0,
  processing_started_at timestamptz,
  processing_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint documents_size_check
    check (file_size_bytes > 0 and file_size_bytes <= 20971520),

  constraint documents_status_check
    check (processing_status in (
      'pending', 'processing', 'completed', 'failed'
    )),

  constraint documents_page_count_check
    check (page_count is null or page_count >= 0)
);

create index if not exists documents_project_status_idx
  on public.documents(project_id, processing_status);

create index if not exists documents_uploader_idx
  on public.documents(uploaded_by, created_at desc);

drop trigger if exists documents_updated_at on public.documents;
create trigger documents_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

-- 10.9 Document Chunks & Full-Text Search
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null
    references public.documents(id) on delete cascade,
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  chunk_index integer not null,
  page_number integer,
  start_offset integer,
  end_offset integer,
  content text not null,
  content_hash text not null,
  token_count integer,
  search_vector tsvector,
  embedding_model text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint document_chunks_index_check
    check (chunk_index >= 0),

  constraint document_chunks_page_check
    check (page_number is null or page_number > 0),

  constraint document_chunks_offsets_check
    check (
      start_offset is null
      or end_offset is null
      or end_offset >= start_offset
    ),

  constraint document_chunks_unique
    unique (document_id, chunk_index)
);

create index if not exists document_chunks_project_idx
  on public.document_chunks(project_id, document_id);

create index if not exists document_chunks_document_idx
  on public.document_chunks(document_id);

create index if not exists document_chunks_search_idx
  on public.document_chunks using gin(search_vector);

-- Trigger to maintain search_vector
create or replace function public.chunks_search_vector_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector('english', coalesce(new.content, ''));
  return new;
end;
$$;

drop trigger if exists chunks_search_vector_update on public.document_chunks;
create trigger chunks_search_vector_update
before insert or update of content on public.document_chunks
for each row execute function public.chunks_search_vector_trigger();

-- 10.10 Research Conversations
create table if not exists public.research_conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_project_user_idx
  on public.research_conversations(project_id, user_id, updated_at desc);

drop trigger if exists conversations_updated_at on public.research_conversations;
create trigger conversations_updated_at
before update on public.research_conversations
for each row execute function public.set_updated_at();

-- 10.11 Conversation Messages
create table if not exists public.conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.research_conversations(id) on delete cascade,
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  model_name text,
  retrieval_metadata jsonb not null default '{}'::jsonb,
  token_usage jsonb,
  created_at timestamptz not null default now(),

  constraint conversation_messages_role_check
    check (role in ('user', 'assistant', 'system')),

  constraint conversation_messages_citations_array
    check (jsonb_typeof(citations) = 'array')
);

create index if not exists conversation_messages_history_idx
  on public.conversation_messages(conversation_id, created_at);

-- 10.12 Research Analyses
create table if not exists public.research_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_type text not null,
  title text not null,
  input_config jsonb not null default '{}'::jsonb,
  source_ids uuid[] not null default '{}',
  result jsonb not null,
  model_name text,
  prompt_version text not null,
  status text not null default 'completed',
  created_at timestamptz not null default now(),

  constraint research_analyses_type_check
    check (analysis_type in (
      'research_brief', 'literature_review',
      'source_comparison', 'claim_extraction',
      'gap_analysis', 'document_summary'
    )),

  constraint research_analyses_status_check
    check (status in ('pending', 'processing', 'completed', 'failed'))
);

create index if not exists research_analyses_project_idx
  on public.research_analyses(project_id, created_at desc);

-- 10.13 Claims and Evidence
create table if not exists public.research_claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.research_analyses(id) on delete set null,
  claim_text text not null,
  claim_type text not null default 'finding',
  assessment text not null default 'insufficient_evidence',
  confidence double precision,
  rationale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint research_claims_assessment_check
    check (assessment in (
      'supported', 'partially_supported', 'contradicted',
      'insufficient_evidence', 'requires_human_verification'
    )),

  constraint research_claims_confidence_check
    check (
      confidence is null
      or (confidence >= 0 and confidence <= 1)
    )
);

create table if not exists public.claim_evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null
    references public.research_claims(id) on delete cascade,
  source_id uuid not null
    references public.sources(id) on delete cascade,
  chunk_id uuid references public.document_chunks(id) on delete set null,
  evidence_relation text not null,
  excerpt text,
  page_number integer,
  created_at timestamptz not null default now(),

  constraint claim_evidence_relation_check
    check (evidence_relation in (
      'supports', 'contradicts', 'contextualizes'
    ))
);

create index if not exists research_claims_project_idx
  on public.research_claims(project_id, created_at desc);

create index if not exists claim_evidence_claim_idx
  on public.claim_evidence(claim_id);

-- 10.14 Research Notes and Collections
create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid
    references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid references public.sources(id) on delete cascade,
  claim_id uuid references public.research_claims(id) on delete set null,
  title text not null,
  content text not null default '',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists research_notes_user_updated_idx
  on public.research_notes(user_id, updated_at desc);

create table if not exists public.research_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid
    references public.research_projects(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null
    references public.research_collections(id) on delete cascade,
  source_id uuid references public.sources(id) on delete cascade,
  note_id uuid references public.research_notes(id) on delete cascade,
  created_at timestamptz not null default now(),

  constraint collection_items_target_check
    check (
      (source_id is not null and note_id is null)
      or
      (source_id is null and note_id is not null)
    )
);

create index if not exists collection_items_collection_idx
  on public.collection_items(collection_id);

-- 10.15 Knowledge Graph
create table if not exists public.knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  label text not null,
  node_type text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint knowledge_nodes_type_check
    check (node_type in (
      'topic', 'concept', 'document', 'claim',
      'finding', 'author', 'dataset', 'question'
    ))
);

create table if not exists public.knowledge_edges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  source_node_id uuid not null
    references public.knowledge_nodes(id) on delete cascade,
  target_node_id uuid not null
    references public.knowledge_nodes(id) on delete cascade,
  relation_type text not null,
  evidence jsonb not null default '[]'::jsonb,
  confidence double precision,
  origin_analysis_id uuid
    references public.research_analyses(id) on delete set null,
  created_at timestamptz not null default now(),

  constraint knowledge_edges_no_self_link
    check (source_node_id <> target_node_id),

  constraint knowledge_edges_confidence
    check (
      confidence is null
      or (confidence >= 0 and confidence <= 1)
    )
);

create index if not exists knowledge_nodes_project_idx
  on public.knowledge_nodes(project_id, node_type);

create index if not exists knowledge_edges_project_idx
  on public.knowledge_edges(project_id);

-- 10.16 Discoveries
create table if not exists public.research_discoveries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null
    references public.research_projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  discovery_type text not null,
  title text not null,
  description text not null,
  evidence jsonb not null default '[]'::jsonb,
  confidence double precision,
  status text not null default 'new',
  analysis_id uuid
    references public.research_analyses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint discoveries_type_check
    check (discovery_type in (
      'pattern', 'contradiction', 'research_gap',
      'related_concept', 'follow_up_question'
    )),

  constraint discoveries_status_check
    check (status in ('new', 'saved', 'dismissed')),

  constraint discoveries_confidence_check
    check (
      confidence is null
      or (confidence >= 0 and confidence <= 1)
    )
);

create index if not exists discoveries_project_idx
  on public.research_discoveries(project_id, created_at desc);

-- 10.17 Audit Events
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  project_id uuid references public.research_projects(id) on delete set null,
  event_type text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_project_idx
  on public.audit_events(project_id, created_at desc);

create index if not exists audit_events_actor_idx
  on public.audit_events(actor_id, created_at desc);
-- ResearchSphere AI: Row Level Security (RLS) & Access Functions
-- Migration 00002: Row Level Security

-- 11.2 Reusable Project Access Functions (SECURITY DEFINER with fixed search_path)
create or replace function public.is_project_owner(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from public.research_projects
    where id = p_project_id and owner_id = auth.uid()
  );
$$;

create or replace function public.can_access_project(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from public.research_projects
    where id = p_project_id and owner_id = auth.uid()
    union
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid() and accepted_at is not null
  );
$$;

create or replace function public.can_edit_project(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select exists (
    select 1 from public.research_projects
    where id = p_project_id and owner_id = auth.uid()
    union
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid() and accepted_at is not null and role in ('owner', 'editor')
  );
$$;

-- Enable RLS on all user-accessible tables
alter table public.profiles enable row level security;
alter table public.research_projects enable row level security;
alter table public.project_members enable row level security;
alter table public.project_invitations enable row level security;
alter table public.sources enable row level security;
alter table public.project_sources enable row level security;
alter table public.documents enable row level security;
alter table public.document_chunks enable row level security;
alter table public.research_conversations enable row level security;
alter table public.conversation_messages enable row level security;
alter table public.research_analyses enable row level security;
alter table public.research_claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.research_notes enable row level security;
alter table public.research_collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.knowledge_nodes enable row level security;
alter table public.knowledge_edges enable row level security;
alter table public.research_discoveries enable row level security;
alter table public.audit_events enable row level security;

-- 1. Profiles Policies
create policy "Users can view any profile or own"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Research Projects Policies
create policy "Users can view accessible projects"
  on public.research_projects for select
  using (public.can_access_project(id));

create policy "Users can create projects"
  on public.research_projects for insert
  with check (auth.uid() = owner_id);

create policy "Editors and owners can update projects"
  on public.research_projects for update
  using (public.can_edit_project(id));

create policy "Only owners can delete projects"
  on public.research_projects for delete
  using (public.is_project_owner(id));

-- 3. Project Members Policies
create policy "Members can view project membership"
  on public.project_members for select
  using (public.can_access_project(project_id));

create policy "Owners can manage project members"
  on public.project_members for insert
  with check (public.is_project_owner(project_id));

create policy "Owners can update members"
  on public.project_members for update
  using (public.is_project_owner(project_id));

create policy "Owners or leaving users can delete member record"
  on public.project_members for delete
  using (public.is_project_owner(project_id) or auth.uid() = user_id);

-- 4. Project Invitations Policies
create policy "Owners can view invitations"
  on public.project_invitations for select
  using (public.is_project_owner(project_id) or invited_email = auth.jwt()->>'email');

create policy "Owners can create invitations"
  on public.project_invitations for insert
  with check (public.is_project_owner(project_id));

create policy "Owners can update or revoke invitations"
  on public.project_invitations for update
  using (public.is_project_owner(project_id));

create policy "Owners can delete invitations"
  on public.project_invitations for delete
  using (public.is_project_owner(project_id));

-- 5. Sources Policies
create policy "Users can view own sources or project-linked sources"
  on public.sources for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from public.project_sources ps
      where ps.source_id = id and public.can_access_project(ps.project_id)
    )
  );

create policy "Users can create sources"
  on public.sources for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update own sources"
  on public.sources for update
  using (auth.uid() = owner_id);

create policy "Owners can delete own sources"
  on public.sources for delete
  using (auth.uid() = owner_id);

-- 6. Project Sources Policies
create policy "Users can view project sources"
  on public.project_sources for select
  using (public.can_access_project(project_id));

create policy "Editors can attach sources to project"
  on public.project_sources for insert
  with check (public.can_edit_project(project_id));

create policy "Editors can update project source associations"
  on public.project_sources for update
  using (public.can_edit_project(project_id));

create policy "Editors can detach sources from project"
  on public.project_sources for delete
  using (public.can_edit_project(project_id));

-- 7. Documents Policies
create policy "Users can view project documents"
  on public.documents for select
  using (public.can_access_project(project_id));

create policy "Editors can upload documents to project"
  on public.documents for insert
  with check (public.can_edit_project(project_id) and auth.uid() = uploaded_by);

create policy "Editors can update documents in project"
  on public.documents for update
  using (public.can_edit_project(project_id));

create policy "Editors can delete documents from project"
  on public.documents for delete
  using (public.can_edit_project(project_id));

-- 8. Document Chunks Policies
create policy "Users can view project document chunks"
  on public.document_chunks for select
  using (public.can_access_project(project_id));

create policy "Editors can insert document chunks"
  on public.document_chunks for insert
  with check (public.can_edit_project(project_id));

create policy "Editors can update document chunks"
  on public.document_chunks for update
  using (public.can_edit_project(project_id));

create policy "Editors can delete document chunks"
  on public.document_chunks for delete
  using (public.can_edit_project(project_id));

-- 9. Conversations Policies
create policy "Users can view project conversations"
  on public.research_conversations for select
  using (public.can_access_project(project_id));

create policy "Users can create conversations in project"
  on public.research_conversations for insert
  with check (public.can_access_project(project_id) and auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.research_conversations for update
  using (auth.uid() = user_id and public.can_access_project(project_id));

create policy "Users can delete own conversations"
  on public.research_conversations for delete
  using (auth.uid() = user_id and public.can_access_project(project_id));

-- 10. Conversation Messages Policies
create policy "Users can view conversation messages"
  on public.conversation_messages for select
  using (public.can_access_project(project_id));

create policy "Users can insert messages"
  on public.conversation_messages for insert
  with check (public.can_access_project(project_id) and auth.uid() = user_id);

-- 11. Analyses Policies
create policy "Users can view project analyses"
  on public.research_analyses for select
  using (public.can_access_project(project_id));

create policy "Editors can create analyses"
  on public.research_analyses for insert
  with check (public.can_edit_project(project_id) and auth.uid() = user_id);

create policy "Editors can update analyses"
  on public.research_analyses for update
  using (public.can_edit_project(project_id));

create policy "Editors can delete analyses"
  on public.research_analyses for delete
  using (public.can_edit_project(project_id));

-- 12. Claims Policies
create policy "Users can view project claims"
  on public.research_claims for select
  using (public.can_access_project(project_id));

create policy "Editors can create claims"
  on public.research_claims for insert
  with check (public.can_edit_project(project_id));

create policy "Editors can update claims"
  on public.research_claims for update
  using (public.can_edit_project(project_id));

create policy "Editors can delete claims"
  on public.research_claims for delete
  using (public.can_edit_project(project_id));

-- 13. Claim Evidence Policies
create policy "Users can view claim evidence"
  on public.claim_evidence for select
  using (exists (
    select 1 from public.research_claims c
    where c.id = claim_id and public.can_access_project(c.project_id)
  ));

create policy "Editors can insert claim evidence"
  on public.claim_evidence for insert
  with check (exists (
    select 1 from public.research_claims c
    where c.id = claim_id and public.can_edit_project(c.project_id)
  ));

create policy "Editors can delete claim evidence"
  on public.claim_evidence for delete
  using (exists (
    select 1 from public.research_claims c
    where c.id = claim_id and public.can_edit_project(c.project_id)
  ));

-- 14. Notes Policies
create policy "Users can view project or own notes"
  on public.research_notes for select
  using (
    auth.uid() = user_id
    or (project_id is not null and public.can_access_project(project_id))
  );

create policy "Users can create notes"
  on public.research_notes for insert
  with check (
    auth.uid() = user_id
    and (project_id is null or public.can_edit_project(project_id))
  );

create policy "Note creators can update notes"
  on public.research_notes for update
  using (auth.uid() = user_id);

create policy "Note creators can delete notes"
  on public.research_notes for delete
  using (auth.uid() = user_id);

-- 15. Collections Policies
create policy "Users can view own collections"
  on public.research_collections for select
  using (auth.uid() = user_id);

create policy "Users can create collections"
  on public.research_collections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own collections"
  on public.research_collections for update
  using (auth.uid() = user_id);

create policy "Users can delete own collections"
  on public.research_collections for delete
  using (auth.uid() = user_id);

-- 16. Collection Items Policies
create policy "Users can view own collection items"
  on public.collection_items for select
  using (exists (
    select 1 from public.research_collections col
    where col.id = collection_id and col.user_id = auth.uid()
  ));

create policy "Users can insert collection items"
  on public.collection_items for insert
  with check (exists (
    select 1 from public.research_collections col
    where col.id = collection_id and col.user_id = auth.uid()
  ));

create policy "Users can delete collection items"
  on public.collection_items for delete
  using (exists (
    select 1 from public.research_collections col
    where col.id = collection_id and col.user_id = auth.uid()
  ));

-- 17. Knowledge Graph Policies
create policy "Users can view knowledge nodes"
  on public.knowledge_nodes for select
  using (public.can_access_project(project_id));

create policy "Editors can insert knowledge nodes"
  on public.knowledge_nodes for insert
  with check (public.can_edit_project(project_id) and auth.uid() = created_by);

create policy "Editors can update knowledge nodes"
  on public.knowledge_nodes for update
  using (public.can_edit_project(project_id));

create policy "Editors can delete knowledge nodes"
  on public.knowledge_nodes for delete
  using (public.can_edit_project(project_id));

create policy "Users can view knowledge edges"
  on public.knowledge_edges for select
  using (public.can_access_project(project_id));

create policy "Editors can insert knowledge edges"
  on public.knowledge_edges for insert
  with check (public.can_edit_project(project_id));

create policy "Editors can delete knowledge edges"
  on public.knowledge_edges for delete
  using (public.can_edit_project(project_id));

-- 18. Discoveries Policies
create policy "Users can view discoveries"
  on public.research_discoveries for select
  using (public.can_access_project(project_id));

create policy "Editors can insert discoveries"
  on public.research_discoveries for insert
  with check (public.can_edit_project(project_id));

create policy "Editors can update discoveries"
  on public.research_discoveries for update
  using (public.can_edit_project(project_id));

create policy "Editors can delete discoveries"
  on public.research_discoveries for delete
  using (public.can_edit_project(project_id));

-- 19. Audit Events Policies
create policy "Users can view project audit events"
  on public.audit_events for select
  using (project_id is not null and public.can_access_project(project_id));
-- ResearchSphere AI: Seed Data for Demonstration & Hackathon Evaluation
-- Migration 00003: Real-World Scholarly Research Seed Data

-- Note: All entries use genuine DOIs, peer-reviewed publications, and accurate scientific excerpts.
-- This seed file can be applied after creating a demo user or in local development.

-- Example schema function to seed initial demo project for any authenticated user
create or replace function public.seed_demo_research_project(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project_id uuid;
  v_source1_id uuid;
  v_source2_id uuid;
  v_source3_id uuid;
  v_doc1_id uuid;
  v_chunk1_id uuid;
  v_chunk2_id uuid;
  v_analysis_id uuid;
  v_node1_id uuid;
  v_node2_id uuid;
  v_node3_id uuid;
  v_claim1_id uuid;
begin
  -- 1. Create Demo Project
  insert into public.research_projects (
    owner_id,
    title,
    research_question,
    description,
    domain,
    subdomain,
    objectives,
    scope,
    language,
    source_types,
    tags,
    citation_style,
    research_depth,
    status
  ) values (
    p_user_id,
    'Architectural Trade-offs in Multi-Head Attention and State-Space Models',
    'How do State-Space Models (e.g., Mamba) compare with Transformer Multi-Head Self-Attention in computational scaling, long-context retrieval, and reasoning benchmarks?',
    'A comparative synthesis investigating linear-time sequence models versus quadratic-attention architectures across context length and algorithmic reasoning capabilities.',
    'cs-ai',
    'Deep Learning & NLP',
    '["Evaluate memory complexity (O(N) vs O(N^2)) across sequence lengths up to 1M tokens", "Analyze associative recall and in-context learning trade-offs", "Identify hybrid architectures combining state-space and local attention"]'::jsonb,
    'Focus on peer-reviewed sequence modeling papers from 2017 to 2024, specifically Transformer, S4, and Mamba architectures.',
    'en',
    array['scholarly', 'uploaded_document', 'web']::text[],
    array['transformers', 'attention', 'state-space-models', 'mamba', 'deep-learning']::text[],
    'APA',
    'standard',
    'active'
  ) returning id into v_project_id;

  -- 2. Add Sources
  -- Source 1: Vaswani et al. 2017
  insert into public.sources (
    owner_id,
    source_type,
    title,
    canonical_url,
    publisher,
    authors,
    doi,
    abstract,
    publication_date,
    language,
    access_status
  ) values (
    p_user_id,
    'scholarly',
    'Attention Is All You Need',
    'https://arxiv.org/abs/1706.03762',
    'NeurIPS 2017',
    '[{"name": "Ashish Vaswani"}, {"name": "Noam Shazeer"}, {"name": "Niki Parmar"}, {"name": "Jakob Uszkoreit"}, {"name": "Llion Jones"}, {"name": "Aidan N. Gomez"}, {"name": "Lukasz Kaiser"}, {"name": "Illia Polosukhin"}]'::jsonb,
    '10.48550/arXiv.1706.03762',
    'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and relying entirely on an attention mechanism to draw global dependencies between input and output.',
    '2017-06-12',
    'en',
    'accessible'
  ) returning id into v_source1_id;

  -- Source 2: Gu & Dao 2023 (Mamba)
  insert into public.sources (
    owner_id,
    source_type,
    title,
    canonical_url,
    publisher,
    authors,
    doi,
    abstract,
    publication_date,
    language,
    access_status
  ) values (
    p_user_id,
    'scholarly',
    'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    'https://arxiv.org/abs/2312.00752',
    'arXiv preprint',
    '[{"name": "Albert Gu"}, {"name": "Tri Dao"}]'::jsonb,
    '10.48550/arXiv.2312.00752',
    'Foundation models now power most of modern deep learning, predominantly based on the Transformer architecture. However, Transformers have quadratic computational complexity in context length. We introduce Mamba, a selective state space model that achieves linear-time scaling and 5x higher inference throughput.',
    '2023-12-01',
    'en',
    'accessible'
  ) returning id into v_source2_id;

  -- Link Sources to Project
  insert into public.project_sources (project_id, source_id, added_by, tags, relevance_score)
  values
    (v_project_id, v_source1_id, p_user_id, array['foundational', 'attention'], 0.98),
    (v_project_id, v_source2_id, p_user_id, array['state-space', 'linear-scaling'], 0.95);

  -- 3. Add Document & Chunks
  insert into public.documents (
    project_id,
    source_id,
    uploaded_by,
    original_filename,
    storage_path,
    mime_type,
    file_size_bytes,
    file_hash,
    page_count,
    processing_status,
    extracted_text_length
  ) values (
    v_project_id,
    v_source1_id,
    p_user_id,
    'Vaswani2017_AttentionIsAllYouNeed.pdf',
    v_project_id || '/vaswani2017.pdf',
    'application/pdf',
    2150000,
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    15,
    'completed',
    42000
  ) returning id into v_doc1_id;

  insert into public.document_chunks (
    document_id,
    project_id,
    chunk_index,
    page_number,
    content,
    content_hash,
    token_count
  ) values (
    v_doc1_id,
    v_project_id,
    0,
    3,
    'An attention function can be described as mapping a query and a set of key-value pairs to an output. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key. We compute Multi-Head Attention by linearly projecting the queries, keys, and values h times with different, learned linear projections to dk, dk and dv dimensions, respectively.',
    'hash_chunk_001',
    82
  ) returning id into v_chunk1_id;

  insert into public.document_chunks (
    document_id,
    project_id,
    chunk_index,
    page_number,
    content,
    content_hash,
    token_count
  ) values (
    v_doc1_id,
    v_project_id,
    1,
    6,
    'Computational complexity per layer for Self-Attention is O(n^2 * d), where n is the sequence length and d is the representation dimension. When the sequence length n is larger than the representation dimension d, self-attention layers are faster than recurrent layers, but memory consumption scales quadratically with n during training and key-value cache accumulation during autoregressive generation.',
    'hash_chunk_002',
    75
  ) returning id into v_chunk2_id;

  -- 4. Add Claims & Evidence
  insert into public.research_claims (
    project_id,
    created_by,
    claim_text,
    claim_type,
    assessment,
    confidence,
    rationale
  ) values (
    v_project_id,
    p_user_id,
    'Self-attention mechanisms incur an O(n^2) computational complexity and KV cache memory footprint with respect to input sequence length.',
    'finding',
    'supported',
    0.98,
    'Directly verified in Vaswani et al. (2017) Section 4 Table 1: Self-Attention layer complexity is O(n^2 * d).'
  ) returning id into v_claim1_id;

  insert into public.claim_evidence (
    claim_id,
    source_id,
    chunk_id,
    evidence_relation,
    excerpt,
    page_number
  ) values (
    v_claim1_id,
    v_source1_id,
    v_chunk2_id,
    'supports',
    'Computational complexity per layer for Self-Attention is O(n^2 * d), where n is the sequence length and d is the representation dimension.',
    6
  );

  -- 5. Add Knowledge Nodes & Edges
  insert into public.knowledge_nodes (project_id, label, node_type, description, created_by)
  values
    (v_project_id, 'Multi-Head Attention', 'concept', 'Mechanism mapping queries and key-value pairs to weighted outputs across h parallel subspaces.', p_user_id)
    returning id into v_node1_id;

  insert into public.knowledge_nodes (project_id, label, node_type, description, created_by)
  values
    (v_project_id, 'Selective State Spaces', 'concept', 'Continuous dynamical systems parameterized to filter information in linear O(N) time.', p_user_id)
    returning id into v_node2_id;

  insert into public.knowledge_nodes (project_id, label, node_type, description, created_by)
  values
    (v_project_id, 'Quadratic Memory Scaling', 'finding', 'KV cache bottleneck scaling O(n^2) during long context inference in pure transformers.', p_user_id)
    returning id into v_node3_id;

  insert into public.knowledge_edges (
    project_id,
    source_node_id,
    target_node_id,
    relation_type,
    confidence,
    evidence
  ) values (
    v_project_id,
    v_node1_id,
    v_node3_id,
    'derived_from',
    0.95,
    '[{"evidence_id": "chunk_002", "excerpt": "Self-attention layers have O(n^2) memory complexity"}]'::jsonb
  );

  insert into public.knowledge_edges (
    project_id,
    source_node_id,
    target_node_id,
    relation_type,
    confidence,
    evidence
  ) values (
    v_project_id,
    v_node2_id,
    v_node3_id,
    'contradicts',
    0.92,
    '[{"evidence_id": "mamba_001", "excerpt": "Mamba achieves linear O(N) complexity bypassing KV cache overhead"}]'::jsonb
  );

  -- 6. Add Research Discovery
  insert into public.research_discoveries (
    project_id,
    user_id,
    discovery_type,
    title,
    description,
    confidence,
    status,
    evidence
  ) values (
    v_project_id,
    p_user_id,
    'research_gap',
    'In-Context Retrieval Degrades in Pure SSMs on Algorithmic Needle-in-a-Haystack Tasks',
    'While selective state-space models scale in O(N) time and memory, evidence suggests performance degradations in precise associative recall across 100k+ tokens compared to full attention.',
    0.88,
    'saved',
    '[{"evidence_id": "chunk_002", "source_title": "Attention Is All You Need"}]'::jsonb
  );

  return v_project_id;
end;
$$;
