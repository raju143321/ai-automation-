import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  BookOpen,
  Plus,
  Check,
  ExternalLink,
  ShieldCheck,
  Filter,
  Loader2,
  Calendar,
  Award
} from 'lucide-react';
import { api } from '../lib/api-client';
import { Source } from '@researchsphere/shared';

interface SearchItem {
  id: string;
  title: string;
  url: string | null;
  publisher: string | null;
  authors: Array<{ name: string }>;
  doi: string | null;
  abstract: string | null;
  publication_date: string | null;
  citation_count?: number;
  access_status: string;
  provider: string;
}

export const ProjectDiscoveryPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('state space models attention transformers long context');
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [providerInfo, setProviderInfo] = useState<{ provider: string; status: string } | null>(null);

  // Fetch already saved sources in this project
  const { data: savedSources = [] } = useQuery<Source[]>({
    queryKey: ['project-sources', projectId],
    queryFn: () => api.get<Source[]>(`/projects/${projectId}/sources`)
  });

  const savedSourceUrls = new Set(savedSources.map(s => s.canonical_url || s.doi));

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const response = await fetch('/api/v1/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), page, page_size: 15 })
      });
      const data = await response.json();
      if (data.data) {
        setSearchResults(data.data);
        setProviderInfo({
          provider: data.meta?.provider || 'OpenAlex & Crossref',
          status: data.meta?.providerStatus || 'online'
        });
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (item: SearchItem) =>
      api.post(`/projects/${projectId}/sources`, {
        title: item.title,
        canonical_url: item.url,
        publisher: item.publisher,
        authors: item.authors,
        doi: item.doi,
        abstract: item.abstract,
        publication_date: item.publication_date,
        source_type: 'scholarly',
        access_status: item.access_status || 'accessible'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-sources', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  });

  // Initial search trigger if empty
  React.useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Search size={22} className="text-cyan-400" />
          <span>Scholarly Research Discovery</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Query over 250M+ peer-reviewed papers via OpenAlex and Crossref. Attach verified literature directly to your project.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keywords, hypotheses, DOI, or author..."
              className="w-full bg-[#0e1422] border border-[#1e2a42] rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-lg transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 shrink-0"
          >
            {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            <span>{searching ? 'Querying Index...' : 'Discover'}</span>
          </button>
        </div>

        {providerInfo && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Provider: <strong className="text-slate-200">{providerInfo.provider}</strong> ({providerInfo.status})</span>
            </span>
            <span>Displaying {searchResults.length} verified results</span>
          </div>
        )}
      </form>

      {/* Results List */}
      <div className="space-y-4">
        {searching ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 size={32} className="mx-auto text-cyan-400 animate-spin" />
            <div className="text-xs text-slate-300 font-medium">Fetching peer-reviewed works from OpenAlex...</div>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
            <BookOpen size={32} className="mx-auto text-slate-600" />
            <p className="text-sm text-slate-300 font-semibold">No publications found</p>
            <p className="text-xs text-slate-500">Try broadening your search terms or testing alternative terminology.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((item) => {
              const isSaved = (item.doi && savedSourceUrls.has(item.doi)) || (item.url && savedSourceUrls.has(item.url));

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] hover:border-[#283856] transition-all space-y-3 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.publisher && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                            {item.publisher}
                          </span>
                        )}
                        {item.publication_date && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                            <Calendar size={11} />
                            <span>{item.publication_date}</span>
                          </span>
                        )}
                        {item.citation_count !== undefined && item.citation_count > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                            <Award size={11} />
                            <span>{item.citation_count.toLocaleString()} citations</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                        {item.title}
                      </h3>

                      {item.authors && item.authors.length > 0 && (
                        <p className="text-xs text-slate-300">
                          By {item.authors.map(a => a.name).join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {isSaved ? (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5">
                          <Check size={14} />
                          <span>Saved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => saveMutation.mutate(item)}
                          disabled={saveMutation.isPending}
                          className="px-3.5 py-1.5 rounded-lg bg-[#151d2f] hover:bg-cyan-600 text-slate-200 hover:text-white border border-[#232f48] hover:border-cyan-500 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                        >
                          <Plus size={14} />
                          <span>Save to Project</span>
                        </button>
                      )}

                      {(item.url || item.doi) && (
                        <a
                          href={item.doi ? `https://doi.org/${item.doi}` : item.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#151d2f] hover:bg-[#202b44] text-slate-400 hover:text-cyan-400 border border-[#232f48] transition-colors"
                          title="Open external paper"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  {item.abstract && (
                    <p className="text-xs text-slate-400 leading-relaxed bg-[#0b0f1a] p-3 rounded-lg border border-[#161f33] line-clamp-3">
                      {item.abstract}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
