import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  XCircle,
  Loader2,
  ShieldCheck,
  PlusCircle
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchDiscovery, DiscoveryType } from '@researchsphere/shared';

export const ProjectDiscoveriesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch discoveries
  const { data: discoveries = [], isLoading } = useQuery<ResearchDiscovery[]>({
    queryKey: ['discoveries', projectId],
    queryFn: () => api.get<ResearchDiscovery[]>(`/projects/${projectId}/discoveries`)
  });

  // Generate discoveries mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      api.post<ResearchDiscovery[]>(`/projects/${projectId}/discoveries/generate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveries', projectId] });
    }
  });

  // Update status mutation (save / dismiss)
  const statusMutation = useMutation({
    mutationFn: ({ discoveryId, status }: { discoveryId: string; status: 'saved' | 'dismissed' }) =>
      api.patch<ResearchDiscovery>(`/discoveries/${discoveryId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discoveries', projectId] });
    }
  });

  // Convert to note
  const convertToNoteMutation = useMutation({
    mutationFn: (d: ResearchDiscovery) =>
      api.post(`/projects/${projectId}/notes`, {
        project_id: projectId,
        title: `Discovery: ${d.title}`,
        content: `${d.description}\n\nWhy it matters: ${d.why_it_matters || ''}\nRecommended Next Step: ${d.recommended_next_step || ''}`,
        tags: ['discovery', d.discovery_type]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      alert('Discovery converted and saved to project notes!');
    }
  });

  const getTypeBadge = (type: DiscoveryType) => {
    switch (type) {
      case 'research_gap':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 uppercase">Research Gap</span>;
      case 'contradiction':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30 uppercase">Contradiction</span>;
      case 'pattern':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 uppercase">Recurring Pattern</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 uppercase">{type}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Lightbulb size={22} className="text-amber-400" />
            <span>Research Discovery Feed & Gaps</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated intelligence identifying unresolved questions, recurring cross-source patterns, and research opportunities.
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start sm:self-auto transition-all disabled:opacity-50"
        >
          {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>{generateMutation.isPending ? 'Detecting Gaps...' : 'Scan Project for Gaps'}</span>
        </button>
      </div>

      {/* Discoveries List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-cyan-400 text-xs">Scanning project literature...</div>
        ) : discoveries.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
            <Lightbulb size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No discoveries surfaced yet</p>
            <p className="text-xs text-slate-500">Click "Scan Project for Gaps" to analyze your sources for cross-study contradictions and unexplored topics.</p>
          </div>
        ) : (
          discoveries.map((disc) => (
            <div
              key={disc.id}
              className={`p-5 rounded-xl border transition-all space-y-3 shadow-md ${
                disc.status === 'dismissed'
                  ? 'bg-[#0a0e17] border-[#151c2a] opacity-50'
                  : 'bg-[#0e1422] border-[#1b253b] hover:border-[#273652]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#182338]">
                <div className="flex items-center space-x-2">
                  {getTypeBadge(disc.discovery_type)}
                  {disc.confidence !== null && (
                    <span className="text-[11px] font-mono text-cyan-400">
                      Significance: {Math.round(disc.confidence * 100)}%
                    </span>
                  )}
                  {disc.speculative && (
                    <span className="text-[10px] font-mono text-slate-400 bg-[#162035] px-2 py-0.5 rounded">
                      Speculative Hypothesis
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => convertToNoteMutation.mutate(disc)}
                    className="p-1.5 rounded bg-[#131b2e] hover:bg-[#1a253e] text-slate-300 hover:text-cyan-400 transition-colors flex items-center space-x-1"
                    title="Convert to Project Note"
                  >
                    <PlusCircle size={13} />
                    <span className="text-[11px]">Save Note</span>
                  </button>

                  {disc.status !== 'saved' && (
                    <button
                      onClick={() => statusMutation.mutate({ discoveryId: disc.id, status: 'saved' })}
                      className="p-1.5 rounded bg-[#131b2e] hover:bg-emerald-950 text-slate-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                      title="Save Discovery"
                    >
                      <Bookmark size={13} />
                      <span className="text-[11px]">Save</span>
                    </button>
                  )}

                  {disc.status !== 'dismissed' && (
                    <button
                      onClick={() => statusMutation.mutate({ discoveryId: disc.id, status: 'dismissed' })}
                      className="p-1.5 rounded bg-[#131b2e] hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Dismiss"
                    >
                      <XCircle size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm md:text-base font-bold text-white mb-1">{disc.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{disc.description}</p>
              </div>

              {disc.why_it_matters && (
                <div className="p-3 rounded-lg bg-[#121929] border border-[#1e2a42] text-xs space-y-0.5">
                  <span className="text-amber-400 font-mono text-[10px] uppercase font-bold tracking-wider block">Why this matters:</span>
                  <span className="text-slate-200">{disc.why_it_matters}</span>
                </div>
              )}

              {disc.recommended_next_step && (
                <div className="p-3 rounded-lg bg-[#0e1628] border border-cyan-500/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-wider block">Recommended Investigation:</span>
                    <span className="text-slate-200">{disc.recommended_next_step}</span>
                  </div>
                  <button
                    onClick={() => navigate(`/app/projects/${projectId}/chat`)}
                    className="p-1.5 text-cyan-400 hover:text-white"
                    title="Investigate with Assistant"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
