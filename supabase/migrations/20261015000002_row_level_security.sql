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
