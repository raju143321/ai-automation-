import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileBarChart,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Table,
  Loader2,
  Calendar
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchAnalysis, Source, CITATION_STYLES, CitationStyle } from '@researchsphere/shared';

export const ProjectAnalysisPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [analysisType, setAnalysisType] = useState<'literature_review' | 'research_brief' | 'source_comparison'>('literature_review');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  // Fetch project analyses
  const { data: analyses = [], isLoading: analysesLoading } = useQuery<ResearchAnalysis[]>({
    queryKey: ['analyses', projectId],
    queryFn: () => api.get<ResearchAnalysis[]>(`/projects/${projectId}/analyses`)
  });

  // Select first analysis by default
  React.useEffect(() => {
    if (analyses.length > 0 && !selectedAnalysisId) {
      setSelectedAnalysisId(analyses[0].id);
    }
  }, [analyses, selectedAnalysisId]);

  const activeAnalysis = analyses.find(a => a.id === selectedAnalysisId) || analyses[0];

  // Trigger analysis mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      api.post<ResearchAnalysis>(`/projects/${projectId}/analyses`, {
        project_id: projectId,
        analysis_type: analysisType,
        depth: 'standard',
        citation_style: 'APA'
      }),
    onSuccess: (newAnalysis) => {
      queryClient.invalidateQueries({ queryKey: ['analyses', projectId] });
      setSelectedAnalysisId(newAnalysis.id);
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileBarChart size={22} className="text-cyan-400" />
            <span>Research Analysis & Literature Synthesis Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate evidence-grounded literature reviews, structured research briefs, and multi-document comparison matrices.
          </p>
        </div>

        {/* Generator Trigger */}
        <div className="flex items-center space-x-2">
          <select
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value as any)}
            className="bg-[#111726] border border-[#222e47] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="literature_review">Literature Review</option>
            <option value="research_brief">Structured Research Brief</option>
            <option value="source_comparison">Cross-Source Comparison</option>
          </select>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            {generateMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            <span>{generateMutation.isPending ? 'Synthesizing...' : 'Run Synthesis'}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Left Nav for Saved Analyses, Right for Viewer */}
      <div className="grid lg:grid-cols-4 gap-6 items-start">
        {/* Saved Analyses Selector */}
        <div className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-3 lg:col-span-1">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            Project Syntheses ({analyses.length})
          </div>

          <div className="space-y-1.5">
            {analyses.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAnalysisId(a.id)}
                className={`w-full text-left p-3 rounded-lg text-xs transition-colors space-y-1 ${
                  (activeAnalysis?.id === a.id)
                    ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
                    : 'bg-[#131b2e] border border-[#1f2b42] text-slate-300 hover:bg-[#18233a]'
                }`}
              >
                <div className="font-bold truncate">{a.title}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span className="capitalize">{a.analysis_type.replace('_', ' ')}</span>
                  <span>{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Synthesis Report Viewer */}
        <div className="lg:col-span-3 space-y-6">
          {!activeAnalysis ? (
            <div className="p-16 text-center rounded-2xl bg-[#0e1422] border border-[#1b253b] space-y-3">
              <FileBarChart size={36} className="mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">No Analysis Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select an analysis type above and click "Run Synthesis" to synthesize literature reviews and briefs.
              </p>
            </div>
          ) : (
            <div className="p-6 md:p-8 rounded-2xl bg-[#0e1422] border border-[#1b253b] shadow-xl space-y-6">
              {/* Header */}
              <div className="pb-4 border-b border-[#1b253b] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 uppercase">
                    {activeAnalysis.analysis_type.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck size={13} />
                    <span>Evidence-Verified Synthesis ({activeAnalysis.model_name || 'Gemini 2.5'})</span>
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">{activeAnalysis.title}</h2>
              </div>

              {/* Render Literature Review */}
              {activeAnalysis.analysis_type === 'literature_review' && (
                <div className="space-y-6 text-xs md:text-sm">
                  {/* Introduction */}
                  {(activeAnalysis.result as any).introduction && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Introduction & Objectives</h3>
                      <p className="text-slate-200 leading-relaxed bg-[#131b2e] p-4 rounded-xl border border-[#202b44]">
                        {(activeAnalysis.result as any).introduction}
                      </p>
                    </div>
                  )}

                  {/* Themes */}
                  {(activeAnalysis.result as any).themes && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Synthesized Literature Themes</h3>
                      <div className="space-y-3">
                        {((activeAnalysis.result as any).themes as any[]).map((theme, i) => (
                          <div key={i} className="p-4 rounded-xl bg-[#131b2e] border border-[#202b44] space-y-1.5">
                            <h4 className="font-bold text-white text-sm">{theme.name}</h4>
                            <p className="text-slate-300 leading-relaxed text-xs">{theme.synthesis}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agreements and Contradictions Grid */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Agreements */}
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 size={14} />
                        <span>Areas of Scientific Agreement</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-200">
                        {((activeAnalysis.result as any).agreements || []).map((ag: any, i: number) => (
                          <div key={i} className="p-2.5 rounded bg-[#0d1422] border border-emerald-500/20">
                            {ag.description || ag}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contradictions */}
                    <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                      <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                        <AlertTriangle size={14} />
                        <span>Contradictions & Disagreements</span>
                      </div>
                      <div className="space-y-2 text-xs text-slate-200">
                        {((activeAnalysis.result as any).contradictions || []).map((ct: any, i: number) => (
                          <div key={i} className="p-2.5 rounded bg-[#0d1422] border border-rose-500/20">
                            {ct.description || ct}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Research Gaps */}
                  {(activeAnalysis.result as any).research_gaps && (
                    <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                        <Lightbulb size={14} />
                        <span>Identified Research Gaps</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        {((activeAnalysis.result as any).research_gaps as any[]).map((gap: any, i: number) => (
                          <div key={i} className="p-3 rounded bg-[#0d1422] border border-amber-500/20 space-y-1">
                            <div className="font-bold text-white">{gap.gap || gap.title}</div>
                            <div className="text-slate-300 text-xs">{gap.justification || gap.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conclusion */}
                  {(activeAnalysis.result as any).conclusion && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Synthesis Conclusion</h3>
                      <p className="text-slate-200 leading-relaxed bg-[#131b2e] p-4 rounded-xl border border-[#202b44]">
                        {(activeAnalysis.result as any).conclusion}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Render Research Brief */}
              {activeAnalysis.analysis_type === 'research_brief' && (
                <div className="space-y-5 text-xs md:text-sm">
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Executive Summary</h3>
                    <p className="text-slate-200 leading-relaxed bg-[#131b2e] p-4 rounded-xl border border-[#202b44]">
                      {(activeAnalysis.result as any).executive_summary}
                    </p>
                  </div>

                  {(activeAnalysis.result as any).key_findings && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Principal Findings</h3>
                      <div className="space-y-2">
                        {((activeAnalysis.result as any).key_findings as any[]).map((f, i) => (
                          <div key={i} className="p-3.5 rounded-xl bg-[#131b2e] border border-[#202b44] space-y-1 text-xs">
                            <div className="font-bold text-white">{f.finding}</div>
                            {f.interpretation && (
                              <div className="text-slate-400 italic">Interpretation: {f.interpretation}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Render Cross-Source Comparison */}
              {activeAnalysis.analysis_type === 'source_comparison' && (
                <div className="space-y-5 text-xs">
                  <div className="p-4 rounded-xl bg-[#131b2e] border border-[#202b44]">
                    <div className="text-xs font-mono font-bold text-cyan-400 uppercase mb-1">Comparison Summary</div>
                    <p className="text-slate-200 leading-relaxed">
                      {(activeAnalysis.result as any).comparison_summary}
                    </p>
                  </div>

                  {((activeAnalysis.result as any).dimensions as any[]) && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase">Dimension Matrix</h3>
                      <div className="space-y-3">
                        {((activeAnalysis.result as any).dimensions as any[]).map((dim, i) => (
                          <div key={i} className="p-4 rounded-xl bg-[#131b2e] border border-[#202b44] space-y-2">
                            <h4 className="font-bold text-sm text-white">{dim.dimension}</h4>
                            <div className="space-y-1.5">
                              {(dim.observations || []).map((obs: any, idx: number) => (
                                <div key={idx} className="p-2.5 rounded bg-[#0e1422] border border-[#1b253b] text-slate-300">
                                  {obs.observation}
                                </div>
                              ))}
                            </div>
                            {dim.synthesis && (
                              <div className="text-cyan-300 font-medium italic pt-1 text-[11px]">
                                Synthesis: {dim.synthesis}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
