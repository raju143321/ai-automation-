import { EvidenceRegistryItem, DocumentChunk, Source } from '@researchsphere/shared';
import { db } from '../lib/db.js';

export interface RetrievalResult {
  evidenceRegistry: EvidenceRegistryItem[];
  formattedContext: string;
}

export class RetrievalService {
  /**
   * Hybrid lexical and source search across project chunks, sources, and notes
   */
  public async retrieveEvidence(
    projectId: string,
    query: string,
    sourceScope?: string[],
    maxItems = 12
  ): Promise<RetrievalResult> {
    const allChunks = db.getChunks(projectId);
    const allSources = db.getSources(projectId);
    const allNotes = db.getNotes(projectId);

    // Filter by scope if specified
    const scopedSources = sourceScope && sourceScope.length > 0
      ? allSources.filter(s => sourceScope.includes(s.id))
      : allSources;

    const scopedChunks = sourceScope && sourceScope.length > 0
      ? allChunks.filter(c => {
          const doc = db.getDocuments(projectId).find(d => d.id === c.document_id);
          return doc && doc.source_id && sourceScope.includes(doc.source_id);
        })
      : allChunks;

    const queryTerms = query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 2);

    interface CandidateItem {
      score: number;
      item: EvidenceRegistryItem;
    }

    const candidates: CandidateItem[] = [];

    // 1. Score document chunks
    for (const chunk of scopedChunks) {
      const doc = db.getDocuments(projectId).find(d => d.id === chunk.document_id);
      const source = doc?.source_id ? allSources.find(s => s.id === doc.source_id) : undefined;
      const title = source?.title || doc?.original_filename || 'Uploaded Document';

      const contentLower = chunk.content.toLowerCase();
      let matchCount = 0;
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          matchCount++;
        }
      }

      // Add baseline score
      const score = matchCount * 2 + (chunk.chunk_index === 0 ? 1 : 0);

      candidates.push({
        score,
        item: {
          evidence_id: '', // Assigned after ranking
          source_id: source?.id || doc?.id || chunk.document_id,
          document_id: chunk.document_id,
          chunk_id: chunk.id,
          source_title: title,
          canonical_url: source?.canonical_url || undefined,
          publisher: source?.publisher || undefined,
          authors: source?.authors || undefined,
          publication_date: source?.publication_date || undefined,
          doi: source?.doi || undefined,
          page_number: chunk.page_number || undefined,
          excerpt: chunk.content,
          provenance_type: 'uploaded_document',
          retrieval_score: score
        }
      });
    }

    // 2. Score source abstracts
    for (const source of scopedSources) {
      if (source.abstract) {
        const text = `${source.title} ${source.abstract}`.toLowerCase();
        let matchCount = 0;
        for (const term of queryTerms) {
          if (text.includes(term)) matchCount++;
        }
        const score = matchCount * 2.5 + (source.doi ? 1 : 0);

        candidates.push({
          score,
          item: {
            evidence_id: '',
            source_id: source.id,
            source_title: source.title,
            canonical_url: source.canonical_url || undefined,
            publisher: source.publisher || undefined,
            authors: source.authors,
            publication_date: source.publication_date || undefined,
            doi: source.doi || undefined,
            page_number: 1,
            excerpt: source.abstract,
            provenance_type: 'scholarly_search',
            retrieval_score: score
          }
        });
      }
    }

    // 3. Score research notes
    for (const note of allNotes) {
      const text = `${note.title} ${note.content}`.toLowerCase();
      let matchCount = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) matchCount++;
      }
      if (matchCount > 0) {
        candidates.push({
          score: matchCount * 1.5,
          item: {
            evidence_id: '',
            source_id: note.source_id || note.id,
            source_title: `Research Note: ${note.title}`,
            excerpt: note.content,
            provenance_type: 'note',
            retrieval_score: matchCount * 1.5
          }
        });
      }
    }

    // 4. Rank and deduplicate
    candidates.sort((a, b) => b.score - a.score);

    // Deduplicate near-identical excerpts
    const selected: EvidenceRegistryItem[] = [];
    const seenHashes = new Set<string>();

    for (const candidate of candidates) {
      if (selected.length >= maxItems) break;
      const snippet = candidate.item.excerpt.slice(0, 80).toLowerCase();
      if (!seenHashes.has(snippet)) {
        seenHashes.add(snippet);
        // Assign stable evidence identifier
        const evidenceId = `ev_${selected.length + 1}`;
        selected.push({
          ...candidate.item,
          evidence_id: evidenceId
        });
      }
    }

    // Fallback if no specific matches found: provide primary sources in project
    if (selected.length === 0 && scopedSources.length > 0) {
      for (let i = 0; i < Math.min(scopedSources.length, 3); i++) {
        const s = scopedSources[i];
        selected.push({
          evidence_id: `ev_${selected.length + 1}`,
          source_id: s.id,
          source_title: s.title,
          canonical_url: s.canonical_url || undefined,
          publisher: s.publisher || undefined,
          authors: s.authors,
          publication_date: s.publication_date || undefined,
          doi: s.doi || undefined,
          page_number: 1,
          excerpt: s.abstract || `Source Title: ${s.title}`,
          provenance_type: 'scholarly_search'
        });
      }
    }

    // 5. Build bounded context string with clear IDs
    const formattedContext = selected.map(ev => {
      const authorStr = ev.authors && ev.authors.length > 0
        ? `Authors: ${ev.authors.map(a => a.name).join(', ')} | `
        : '';
      const doiStr = ev.doi ? `DOI: ${ev.doi} | ` : '';
      const pageStr = ev.page_number ? `Page: ${ev.page_number} | ` : '';

      return `[EVIDENCE ${ev.evidence_id}]
Source: "${ev.source_title}"
${authorStr}${doiStr}${pageStr}Type: ${ev.provenance_type}
Excerpt:
${ev.excerpt}
`;
    }).join('\n---\n\n');

    return {
      evidenceRegistry: selected,
      formattedContext
    };
  }
}

export const retrievalService = new RetrievalService();
