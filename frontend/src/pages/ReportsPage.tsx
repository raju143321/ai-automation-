import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ArrowRight, ShieldCheck, FileBarChart } from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchAnalysis } from '@researchsphere/shared';
import { ExportModal } from '../components/research/ExportModal';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch all analyses from primary project
  const { data: analyses = [], isLoading } = useQuery<ResearchAnalysis[]>({
    queryKey: ['global-analyses'],
    queryFn: () => api.get<ResearchAnalysis[]>('/projects/11111111-1111-1111-1111-111111111111/analyses')
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <FileBarChart size={22} className="text-cyan-400" />
          <span>Saved Research Reports & Syntheses</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review, export, and download all generated literature reviews, executive briefs, and comparison matrices.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-cyan-400 text-xs">Loading reports...</div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
            <FileText size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No saved reports yet</p>
            <p className="text-xs text-slate-500">Run a Literature Review or Brief analysis in any project to generate reports.</p>
          </div>
        ) : (
          analyses.map((a) => (
            <div
              key={a.id}
              className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-[#273652] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 uppercase">
                    {a.analysis_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{a.title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Engine: {a.model_name || 'Gemini 2.5'} · Prompt: {a.prompt_version}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setSelectedProjectId(a.project_id)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#151d2f] hover:bg-[#1f2a42] text-cyan-400 border border-[#232f48] text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => navigate(`/app/projects/${a.project_id}/analysis`)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <span>Open</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProjectId && (
        <ExportModal
          projectId={selectedProjectId}
          citationStyle="APA"
          onClose={() => setSelectedProjectId(null)}
        />
      )}
    </div>
  );
};
