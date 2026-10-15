import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ResearchProject,
  Source,
  ProjectSource,
  Document,
  DocumentChunk,
  ResearchConversation,
  ConversationMessage,
  ResearchAnalysis,
  ResearchClaim,
  ClaimEvidence,
  KnowledgeNode,
  KnowledgeEdge,
  ResearchDiscovery,
  ResearchNote,
  ResearchCollection,
  CollectionItem,
  ProjectMember,
  AuditEvent
} from '@researchsphere/shared';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase.js';

interface DatabaseStore {
  projects: ResearchProject[];
  sources: Source[];
  project_sources: ProjectSource[];
  documents: Document[];
  document_chunks: DocumentChunk[];
  conversations: ResearchConversation[];
  messages: ConversationMessage[];
  analyses: ResearchAnalysis[];
  claims: ResearchClaim[];
  claim_evidence: ClaimEvidence[];
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  discoveries: ResearchDiscovery[];
  notes: ResearchNote[];
  collections: ResearchCollection[];
  collection_items: CollectionItem[];
  members: ProjectMember[];
  audit_events: AuditEvent[];
}

const candidateDirs = [
  path.resolve(__dirname, '../../data'),
  path.resolve(process.cwd(), 'backend/data'),
  path.resolve(process.cwd(), 'data')
];
const DATA_DIR = candidateDirs.find(d => fs.existsSync(d)) || candidateDirs[0];
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function initializeStore(): DatabaseStore {
  const defaultUserId = '00000000-0000-0000-0000-000000000001';
  const defaultProjectId = '11111111-1111-1111-1111-111111111111';
  const source1Id = '22222222-2222-2222-2222-222222222221';
  const source2Id = '22222222-2222-2222-2222-222222222222';
  const doc1Id = '33333333-3333-3333-3333-333333333331';
  const chunk1Id = '44444444-4444-4444-4444-444444444441';
  const chunk2Id = '44444444-4444-4444-4444-444444444442';
  const claim1Id = '55555555-5555-5555-5555-555555555551';
  const node1Id = '66666666-6666-6666-6666-666666666661';
  const node2Id = '66666666-6666-6666-6666-666666666662';
  const node3Id = '66666666-6666-6666-6666-666666666663';

  return {
    projects: [
      {
        id: defaultProjectId,
        owner_id: defaultUserId,
        title: 'Architectural Trade-offs in Multi-Head Attention and State-Space Models',
        research_question: 'How do State-Space Models (e.g., Mamba) compare with Transformer Multi-Head Self-Attention in computational scaling, long-context retrieval, and reasoning benchmarks?',
        description: 'A comparative synthesis investigating linear-time sequence models versus quadratic-attention architectures across context length and algorithmic reasoning capabilities.',
        domain: 'cs-ai',
        subdomain: 'Deep Learning & NLP',
        objectives: [
          'Evaluate memory complexity (O(N) vs O(N^2)) across sequence lengths up to 1M tokens',
          'Analyze associative recall and in-context learning trade-offs',
          'Identify hybrid architectures combining state-space and local attention'
        ],
        scope: 'Focus on peer-reviewed sequence modeling papers from 2017 to 2024, specifically Transformer, S4, and Mamba architectures.',
        language: 'en',
        date_from: '2017-01-01',
        date_to: '2024-12-31',
        source_types: ['scholarly', 'uploaded_document', 'web'],
        tags: ['transformers', 'attention', 'state-space-models', 'mamba', 'deep-learning'],
        citation_style: 'APA',
        research_depth: 'standard',
        status: 'active',
        archived_at: null,
        created_at: new Date('2024-03-01T10:00:00Z').toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    sources: [
      {
        id: source1Id,
        owner_id: defaultUserId,
        source_type: 'scholarly',
        title: 'Attention Is All You Need',
        canonical_url: 'https://arxiv.org/abs/1706.03762',
        publisher: 'NeurIPS 2017',
        authors: [
          { name: 'Ashish Vaswani' },
          { name: 'Noam Shazeer' },
          { name: 'Niki Parmar' },
          { name: 'Jakob Uszkoreit' },
          { name: 'Aidan N. Gomez' },
          { name: 'Lukasz Kaiser' },
          { name: 'Illia Polosukhin' }
        ],
        doi: '10.48550/arXiv.1706.03762',
        abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and relying entirely on an attention mechanism to draw global dependencies between input and output.',
        publication_date: '2017-06-12',
        language: 'en',
        external_id: 'W2963403868',
        metadata: { citation_count: 115000 },
        content_hash: 'hash_vaswani_1706',
        access_status: 'accessible',
        retrieved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: source2Id,
        owner_id: defaultUserId,
        source_type: 'scholarly',
        title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
        canonical_url: 'https://arxiv.org/abs/2312.00752',
        publisher: 'arXiv preprint',
        authors: [
          { name: 'Albert Gu' },
          { name: 'Tri Dao' }
        ],
        doi: '10.48550/arXiv.2312.00752',
        abstract: 'Foundation models now power most of modern deep learning, predominantly based on the Transformer architecture. However, Transformers have quadratic computational complexity in context length. We introduce Mamba, a selective state space model that achieves linear-time scaling and 5x higher inference throughput.',
        publication_date: '2023-12-01',
        language: 'en',
        external_id: 'W4389578119',
        metadata: { citation_count: 1200 },
        content_hash: 'hash_mamba_2312',
        access_status: 'accessible',
        retrieved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    project_sources: [
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        source_id: source1Id,
        added_by: defaultUserId,
        tags: ['foundational', 'attention'],
        relevance_score: 0.98,
        notes: 'Foundational paper introducing Self-Attention and Transformer architecture.',
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        source_id: source2Id,
        added_by: defaultUserId,
        tags: ['state-space', 'linear-scaling'],
        relevance_score: 0.95,
        notes: 'Seminal paper introducing Selective State-Space Models (Mamba).',
        created_at: new Date().toISOString()
      }
    ],
    documents: [
      {
        id: doc1Id,
        project_id: defaultProjectId,
        source_id: source1Id,
        uploaded_by: defaultUserId,
        original_filename: 'Vaswani2017_AttentionIsAllYouNeed.pdf',
        storage_path: `projects/${defaultProjectId}/Vaswani2017_AttentionIsAllYouNeed.pdf`,
        mime_type: 'application/pdf',
        file_size_bytes: 2150000,
        file_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        page_count: 15,
        processing_status: 'completed',
        processing_error_code: null,
        processing_error_message: null,
        extracted_text_length: 42000,
        processing_started_at: new Date().toISOString(),
        processing_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    document_chunks: [
      {
        id: chunk1Id,
        document_id: doc1Id,
        project_id: defaultProjectId,
        chunk_index: 0,
        page_number: 3,
        start_offset: 0,
        end_offset: 450,
        content: 'An attention function can be described as mapping a query and a set of key-value pairs to an output. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key. We compute Multi-Head Attention by linearly projecting the queries, keys, and values h times with different, learned linear projections to dk, dk and dv dimensions, respectively.',
        content_hash: 'hash_chunk_001',
        token_count: 82,
        metadata: {},
        created_at: new Date().toISOString()
      },
      {
        id: chunk2Id,
        document_id: doc1Id,
        project_id: defaultProjectId,
        chunk_index: 1,
        page_number: 6,
        start_offset: 451,
        end_offset: 920,
        content: 'Computational complexity per layer for Self-Attention is O(n^2 * d), where n is the sequence length and d is the representation dimension. When the sequence length n is larger than the representation dimension d, self-attention layers are faster than recurrent layers, but memory consumption scales quadratically with n during training and key-value cache accumulation during autoregressive generation.',
        content_hash: 'hash_chunk_002',
        token_count: 75,
        metadata: {},
        created_at: new Date().toISOString()
      }
    ],
    conversations: [
      {
        id: '77777777-7777-7777-7777-777777777771',
        project_id: defaultProjectId,
        user_id: defaultUserId,
        title: 'Attention vs SSM Scaling',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    messages: [
      {
        id: uuidv4(),
        conversation_id: '77777777-7777-7777-7777-777777777771',
        project_id: defaultProjectId,
        user_id: defaultUserId,
        role: 'user',
        content: 'What is the theoretical complexity bottleneck of Transformer Multi-Head Attention, and how does Mamba address it?',
        citations: [],
        model_name: null,
        retrieval_metadata: {},
        created_at: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: uuidv4(),
        conversation_id: '77777777-7777-7777-7777-777777777771',
        project_id: defaultProjectId,
        user_id: defaultUserId,
        role: 'assistant',
        content: 'Based on the verified research sources in this workspace:\n\n1. **Transformer Attention Bottleneck**: In standard Multi-Head Self-Attention, computational complexity per layer is O(n² · d) with respect to input sequence length n [ev_1]. During autoregressive decoding, accumulating the Key-Value (KV) cache introduces quadratic memory pressure.\n\n2. **Mamba State-Space Resolution**: Mamba introduces selective state spaces where parameters become input-dependent functions, achieving linear O(N) sequence scaling in both computation and memory [ev_2]. This yields up to 5x higher inference throughput on ultra-long contexts.\n\n3. **Trade-offs**: While Mamba excels at long sequence throughput, full self-attention maintains superior performance on complex associative recall tasks requiring precise arbitrary token-to-token lookups across millions of tokens.',
        citations: [
          {
            evidence_id: 'ev_1',
            source_title: 'Attention Is All You Need',
            source_url: 'https://arxiv.org/abs/1706.03762',
            doi: '10.48550/arXiv.1706.03762',
            authors: ['Vaswani et al.'],
            year: '2017',
            page_number: 6,
            excerpt: 'Computational complexity per layer for Self-Attention is O(n^2 * d), where n is the sequence length and d is the representation dimension.'
          },
          {
            evidence_id: 'ev_2',
            source_title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
            source_url: 'https://arxiv.org/abs/2312.00752',
            doi: '10.48550/arXiv.2312.00752',
            authors: ['Gu & Dao'],
            year: '2023',
            page_number: 1,
            excerpt: 'Mamba, a selective state space model that achieves linear-time scaling and 5x higher inference throughput.'
          }
        ],
        model_name: 'gemini-2.5-flash',
        retrieval_metadata: { chunks_retrieved: 2, sources_searched: 2 },
        created_at: new Date().toISOString()
      }
    ],
    analyses: [
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        user_id: defaultUserId,
        analysis_type: 'research_brief',
        title: 'Executive Brief: Transformer vs SSM Scaling Limits',
        input_config: { depth: 'standard', citation_style: 'APA' },
        source_ids: [source1Id, source2Id],
        result: {
          executive_summary: 'Comparative analysis demonstrates that while Transformers provide robust in-context associative recall, quadratic scaling limits efficient deployment past 32k tokens. Mamba offers linear scaling but faces selective retention trade-offs.',
          key_findings: [
            {
              finding: 'Self-attention memory complexity scales quadratically (O(n²))',
              evidence_ids: ['ev_1'],
              interpretation: 'KV cache dominates memory footprint in long-context inference.'
            },
            {
              finding: 'Selective state spaces enable linear-time sequence processing',
              evidence_ids: ['ev_2'],
              interpretation: 'Hardware-aware scan allows continuous time dynamics without quadratic attention matrix.'
            }
          ],
          uncertainties: ['Degradation rate of state-space associative recall on multi-step algorithmic induction tasks.'],
          follow_up_questions: ['How do hybrid architectures (e.g. Jamba) balance SSM layers with interleaved attention blocks?']
        },
        model_name: 'gemini-2.5-flash',
        prompt_version: 'v1.0',
        status: 'completed',
        created_at: new Date().toISOString()
      }
    ],
    claims: [
      {
        id: claim1Id,
        project_id: defaultProjectId,
        created_by: defaultUserId,
        analysis_id: null,
        claim_text: 'Self-attention mechanisms incur an O(n²) computational complexity and KV cache memory footprint with respect to input sequence length.',
        claim_type: 'finding',
        assessment: 'supported',
        confidence: 0.98,
        rationale: 'Directly verified in Vaswani et al. (2017) Section 4 Table 1: Self-Attention layer complexity is O(n² · d).',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    claim_evidence: [
      {
        id: uuidv4(),
        claim_id: claim1Id,
        source_id: source1Id,
        chunk_id: chunk2Id,
        evidence_relation: 'supports',
        excerpt: 'Computational complexity per layer for Self-Attention is O(n^2 * d), where n is the sequence length and d is the representation dimension.',
        page_number: 6,
        created_at: new Date().toISOString()
      }
    ],
    nodes: [
      {
        id: node1Id,
        project_id: defaultProjectId,
        label: 'Multi-Head Attention',
        node_type: 'concept',
        description: 'Mechanism mapping queries and key-value pairs to weighted outputs across h parallel subspaces.',
        metadata: {},
        created_by: defaultUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: node2Id,
        project_id: defaultProjectId,
        label: 'Selective State Spaces',
        node_type: 'concept',
        description: 'Continuous dynamical systems parameterized to filter information in linear O(N) time.',
        metadata: {},
        created_by: defaultUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: node3Id,
        project_id: defaultProjectId,
        label: 'Quadratic KV Bottleneck',
        node_type: 'finding',
        description: 'Memory complexity scaling O(n²) during long context inference in pure transformers.',
        metadata: {},
        created_by: defaultUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    edges: [
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        source_node_id: node1Id,
        target_node_id: node3Id,
        relation_type: 'derived_from',
        evidence: [{ evidence_id: 'ev_1', excerpt: 'Self-attention layers have O(n^2) complexity' }],
        confidence: 0.96,
        origin_analysis_id: null,
        created_at: new Date().toISOString()
      },
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        source_node_id: node2Id,
        target_node_id: node3Id,
        relation_type: 'contradicts',
        evidence: [{ evidence_id: 'ev_2', excerpt: 'Mamba achieves linear O(N) scaling bypassing KV cache' }],
        confidence: 0.94,
        origin_analysis_id: null,
        created_at: new Date().toISOString()
      }
    ],
    discoveries: [
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        user_id: defaultUserId,
        discovery_type: 'research_gap',
        title: 'Associative Recall Degradation in Pure SSMs on Algorithmic Needle Tasks',
        description: 'While selective state-space models scale in linear O(N) time and memory, evidence reveals degradations in arbitrary associative recall across 100k+ tokens compared to full attention.',
        why_it_matters: 'Critical for determining whether pure SSMs can replace Transformers for multi-hop scientific reasoning and complex code synthesis.',
        evidence: [{ evidence_id: 'ev_1', source_title: 'Attention Is All You Need' }],
        confidence: 0.89,
        status: 'saved',
        speculative: false,
        recommended_next_step: 'Conduct synthetic needle-in-a-haystack evaluation comparing Mamba-2 vs hybrid Attention-Mamba architectures.',
        analysis_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    notes: [
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        user_id: defaultUserId,
        source_id: source1Id,
        claim_id: claim1Id,
        title: 'Quadratic scaling in Section 4 Table 1',
        content: 'Vaswani et al. explicitly tabulates self-attention layer complexity as O(n² · d). Compare this with Recurrent O(n · d²) and Convolutional O(k · n · d²).',
        tags: ['complexity', 'attention', 'table-1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    collections: [
      {
        id: uuidv4(),
        user_id: defaultUserId,
        project_id: defaultProjectId,
        name: 'Foundational Sequence Models',
        description: 'Seminal papers on attention mechanisms and state-space formulations.',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    collection_items: [],
    members: [
      {
        id: uuidv4(),
        project_id: defaultProjectId,
        user_id: defaultUserId,
        role: 'owner',
        invited_by: null,
        accepted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_email: 'researcher@researchsphere.ai',
        user_display_name: 'Lead AI Researcher'
      }
    ],
    audit_events: [
      {
        id: uuidv4(),
        actor_id: defaultUserId,
        project_id: defaultProjectId,
        event_type: 'project_created',
        target_type: 'project',
        target_id: defaultProjectId,
        metadata: { title: 'Architectural Trade-offs in Multi-Head Attention and State-Space Models' },
        created_at: new Date().toISOString()
      }
    ]
  };
}

class DatabaseManager {
  private store: DatabaseStore;

  constructor() {
    this.store = this.loadStore();
  }

  private loadStore(): DatabaseStore {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error reading store.json, reinitializing default data:', e);
    }
    const fresh = initializeStore();
    this.saveStoreDirect(fresh);
    return fresh;
  }

  private saveStoreDirect(data: DatabaseStore) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write store.json:', e);
    }
  }

  public save() {
    this.saveStoreDirect(this.store);
  }

  public getStore(): DatabaseStore {
    return this.store;
  }

  // --- Projects ---
  public getProjects(userId: string): ResearchProject[] {
    return this.store.projects.filter(p => p.owner_id === userId || this.store.members.some(m => m.project_id === p.id && m.user_id === userId));
  }

  public getProject(projectId: string, userId?: string): ResearchProject | null {
    const project = this.store.projects.find(p => p.id === projectId);
    if (!project) return null;
    return project;
  }

  public createProject(data: Partial<ResearchProject> & { owner_id: string; title: string; research_question: string; domain: string }): ResearchProject {
    const project: ResearchProject = {
      id: uuidv4(),
      owner_id: data.owner_id,
      title: data.title,
      research_question: data.research_question,
      description: data.description || null,
      domain: data.domain,
      subdomain: data.subdomain || null,
      objectives: data.objectives || [],
      scope: data.scope || null,
      language: data.language || 'en',
      date_from: data.date_from || null,
      date_to: data.date_to || null,
      source_types: data.source_types || ['scholarly', 'uploaded_document', 'web'],
      tags: data.tags || [],
      citation_style: data.citation_style || 'APA',
      research_depth: data.research_depth || 'standard',
      status: 'active',
      archived_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store.projects.unshift(project);
    // Add owner to members
    this.store.members.push({
      id: uuidv4(),
      project_id: project.id,
      user_id: data.owner_id,
      role: 'owner',
      invited_by: null,
      accepted_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });
    this.save();
    return project;
  }

  public updateProject(projectId: string, data: Partial<ResearchProject>): ResearchProject | null {
    const idx = this.store.projects.findIndex(p => p.id === projectId);
    if (idx === -1) return null;
    this.store.projects[idx] = {
      ...this.store.projects[idx],
      ...data,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.store.projects[idx];
  }

  public deleteProject(projectId: string): boolean {
    const initialLen = this.store.projects.length;
    this.store.projects = this.store.projects.filter(p => p.id !== projectId);
    this.store.project_sources = this.store.project_sources.filter(ps => ps.project_id !== projectId);
    this.store.documents = this.store.documents.filter(d => d.project_id !== projectId);
    this.store.document_chunks = this.store.document_chunks.filter(c => c.project_id !== projectId);
    this.store.claims = this.store.claims.filter(c => c.project_id !== projectId);
    this.store.nodes = this.store.nodes.filter(n => n.project_id !== projectId);
    this.store.edges = this.store.edges.filter(e => e.project_id !== projectId);
    this.store.discoveries = this.store.discoveries.filter(d => d.project_id !== projectId);
    this.save();
    return this.store.projects.length < initialLen;
  }

  // --- Sources ---
  public getSources(projectId?: string): Source[] {
    if (!projectId) return this.store.sources;
    const linkedSourceIds = this.store.project_sources.filter(ps => ps.project_id === projectId).map(ps => ps.source_id);
    return this.store.sources.filter(s => linkedSourceIds.includes(s.id));
  }

  public addSourceToProject(projectId: string, sourceData: Partial<Source> & { title: string }, userId: string): Source {
    let existing = this.store.sources.find(s => (s.doi && s.doi === sourceData.doi) || (s.canonical_url && s.canonical_url === sourceData.canonical_url));
    if (!existing) {
      existing = {
        id: uuidv4(),
        owner_id: userId,
        source_type: sourceData.source_type || 'scholarly',
        title: sourceData.title,
        canonical_url: sourceData.canonical_url || null,
        publisher: sourceData.publisher || null,
        authors: sourceData.authors || [],
        doi: sourceData.doi || null,
        abstract: sourceData.abstract || null,
        publication_date: sourceData.publication_date || null,
        language: sourceData.language || 'en',
        external_id: sourceData.external_id || null,
        metadata: sourceData.metadata || {},
        content_hash: sourceData.content_hash || null,
        access_status: sourceData.access_status || 'accessible',
        retrieved_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      this.store.sources.unshift(existing);
    }
    const alreadyLinked = this.store.project_sources.some(ps => ps.project_id === projectId && ps.source_id === existing!.id);
    if (!alreadyLinked) {
      this.store.project_sources.push({
        id: uuidv4(),
        project_id: projectId,
        source_id: existing.id,
        added_by: userId,
        tags: [],
        relevance_score: 0.9,
        notes: null,
        created_at: new Date().toISOString()
      });
    }
    this.save();
    return existing;
  }

  // --- Documents & Chunks ---
  public getDocuments(projectId: string): Document[] {
    return this.store.documents.filter(d => d.project_id === projectId);
  }

  public addDocument(doc: Document): Document {
    this.store.documents.unshift(doc);
    this.save();
    return doc;
  }

  public addChunks(chunks: DocumentChunk[]) {
    this.store.document_chunks.push(...chunks);
    this.save();
  }

  public getChunks(projectId: string): DocumentChunk[] {
    return this.store.document_chunks.filter(c => c.project_id === projectId);
  }

  // --- Conversations & Messages ---
  public getConversations(projectId: string): ResearchConversation[] {
    return this.store.conversations.filter(c => c.project_id === projectId);
  }

  public createConversation(projectId: string, userId: string, title?: string): ResearchConversation {
    const conv: ResearchConversation = {
      id: uuidv4(),
      project_id: projectId,
      user_id: userId,
      title: title || 'Research Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.store.conversations.unshift(conv);
    this.save();
    return conv;
  }

  public getMessages(conversationId: string): ConversationMessage[] {
    return this.store.messages.filter(m => m.conversation_id === conversationId);
  }

  public addMessage(msg: ConversationMessage): ConversationMessage {
    this.store.messages.push(msg);
    this.save();
    return msg;
  }

  // --- Analyses ---
  public getAnalyses(projectId: string): ResearchAnalysis[] {
    return this.store.analyses.filter(a => a.project_id === projectId);
  }

  public addAnalysis(analysis: ResearchAnalysis): ResearchAnalysis {
    this.store.analyses.unshift(analysis);
    this.save();
    return analysis;
  }

  // --- Claims & Evidence ---
  public getClaims(projectId: string): ResearchClaim[] {
    const claims = this.store.claims.filter(c => c.project_id === projectId);
    return claims.map(c => ({
      ...c,
      evidence_items: this.store.claim_evidence.filter(ce => ce.claim_id === c.id)
    }));
  }

  public addClaim(claim: ResearchClaim, evidenceItems: ClaimEvidence[] = []): ResearchClaim {
    this.store.claims.unshift(claim);
    if (evidenceItems.length > 0) {
      this.store.claim_evidence.push(...evidenceItems);
    }
    this.save();
    return {
      ...claim,
      evidence_items: evidenceItems
    };
  }

  public updateClaim(claimId: string, updates: Partial<ResearchClaim>): ResearchClaim | null {
    const idx = this.store.claims.findIndex(c => c.id === claimId);
    if (idx === -1) return null;
    this.store.claims[idx] = {
      ...this.store.claims[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.store.claims[idx];
  }

  // --- Knowledge Graph ---
  public getKnowledgeGraph(projectId: string): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
    const nodes = this.store.nodes.filter(n => n.project_id === projectId);
    const edges = this.store.edges.filter(e => e.project_id === projectId);
    return { nodes, edges };
  }

  public addKnowledgeNode(node: KnowledgeNode): KnowledgeNode {
    this.store.nodes.push(node);
    this.save();
    return node;
  }

  public addKnowledgeEdge(edge: KnowledgeEdge): KnowledgeEdge {
    this.store.edges.push(edge);
    this.save();
    return edge;
  }

  // --- Discoveries ---
  public getDiscoveries(projectId: string): ResearchDiscovery[] {
    return this.store.discoveries.filter(d => d.project_id === projectId);
  }

  public addDiscovery(discovery: ResearchDiscovery): ResearchDiscovery {
    this.store.discoveries.unshift(discovery);
    this.save();
    return discovery;
  }

  public updateDiscovery(discoveryId: string, updates: Partial<ResearchDiscovery>): ResearchDiscovery | null {
    const idx = this.store.discoveries.findIndex(d => d.id === discoveryId);
    if (idx === -1) return null;
    this.store.discoveries[idx] = {
      ...this.store.discoveries[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.store.discoveries[idx];
  }

  // --- Notes & Collections ---
  public getNotes(projectId?: string, userId?: string): ResearchNote[] {
    return this.store.notes.filter(n => (!projectId || n.project_id === projectId) && (!userId || n.user_id === userId));
  }

  public addNote(note: ResearchNote): ResearchNote {
    this.store.notes.unshift(note);
    this.save();
    return note;
  }

  public updateNote(noteId: string, updates: Partial<ResearchNote>): ResearchNote | null {
    const idx = this.store.notes.findIndex(n => n.id === noteId);
    if (idx === -1) return null;
    this.store.notes[idx] = {
      ...this.store.notes[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.store.notes[idx];
  }

  public deleteNote(noteId: string): boolean {
    const len = this.store.notes.length;
    this.store.notes = this.store.notes.filter(n => n.id !== noteId);
    this.save();
    return this.store.notes.length < len;
  }

  // --- Members & Collaboration ---
  public getMembers(projectId: string): ProjectMember[] {
    return this.store.members.filter(m => m.project_id === projectId);
  }

  public addMember(member: ProjectMember): ProjectMember {
    this.store.members.push(member);
    this.save();
    return member;
  }
}

export const db = new DatabaseManager();
