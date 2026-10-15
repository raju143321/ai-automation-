import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  BookOpen,
  FileBarChart,
  Lightbulb,
  PlusCircle,
  Search,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchProject } from '@researchsphere/shared';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const { data: projects = [], isLoading: projectsLoading } = useQuery<ResearchProject[]>({
    queryKey: ['projects'],
    queryFn: () => api.get<ResearchProject[]>('/projects')
  });

  const totalSources = projects.reduce((acc, p) => acc + (p.sources_count || 0), 0);
  const totalDocuments = projects.reduce((acc, p) => acc + (p.documents_count || 0), 0);
  const totalAnalyses = projects.reduce((acc, p) => acc + (p.analyses_count || 0), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#11192b] via-[#121c33] to-[#151a2e] border border-[#1f2c47] p-6 md:p-8 overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
            <Sparkles size={12} />
            <span>ResearchSphere Knowledge Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Scientific Discovery & Literature Synthesis Hub
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Investigate research questions across 250M+ scholarly works, analyze multi-document evidence, uncover research gaps, and generate traceable literature reviews.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/app/projects/new')}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 transition-all active:scale-[0.98]"
            >
              <PlusCircle size={15} />
              <span>Create New Project</span>
            </button>
            <button
              onClick={() => navigate(projects[0] ? `/app/projects/${projects[0].id}/discover` : '/app/projects')}
              className="px-4 py-2.5 rounded-lg bg-[#162035] hover:bg-[#1e2b47] border border-[#243354] text-slate-200 font-semibold text-xs flex items-center space-x-2 transition-colors"
            >
              <Search size={14} className="text-cyan-400" />
              <span>External Scholarly Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row (Actual DB Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Projects</span>
            <FolderKanban size={16} className="text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {projectsLoading ? '...' : projects.length}
          </div>
          <div className="text-[10px] text-cyan-400 font-medium">Scoped Knowledge Contexts</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Scholarly Sources</span>
            <BookOpen size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {projectsLoading ? '...' : totalSources}
          </div>
          <div className="text-[10px] text-indigo-400 font-medium">Peer-Reviewed & Preprints</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Processed Documents</span>
            <Cpu size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {projectsLoading ? '...' : totalDocuments}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">Parsed & Chunked Papers</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Syntheses & Briefs</span>
            <FileBarChart size={16} className="text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {projectsLoading ? '...' : totalAnalyses}
          </div>
          <div className="text-[10px] text-violet-400 font-medium">Evidence-Backed Analyses</div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Active Research Projects</h2>
            <p className="text-xs text-slate-400">Select a project to enter its dedicated discovery workspace.</p>
          </div>
          <NavLink
            to="/app/projects"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All ({projects.length})</span>
            <ArrowRight size={13} />
          </NavLink>
        </div>

        {projects.length === 0 ? (
          <div className="p-10 rounded-2xl bg-[#0e1422] border border-[#1b253b] text-center space-y-3">
            <FolderKanban size={36} className="mx-auto text-slate-600" />
            <h3 className="text-sm font-bold text-white">No research projects created yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start your first research investigation by defining a research question and domain scope.
            </p>
            <button
              onClick={() => navigate('/app/projects/new')}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
            >
              Start First Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/app/projects/${proj.id}`)}
                className="group p-5 rounded-xl bg-[#0e1422] hover:bg-[#12192a] border border-[#1b263d] hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30">
                      {proj.domain}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {proj.citation_style} Standard
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 italic">
                    "{proj.research_question}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#172136] flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-3 text-[11px]">
                    <span className="flex items-center space-x-1">
                      <BookOpen size={12} className="text-cyan-400" />
                      <span>{proj.sources_count || 0} sources</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <FileBarChart size={12} className="text-indigo-400" />
                      <span>{proj.analyses_count || 0} analyses</span>
                    </span>
                  </div>
                  <ArrowRight size={13} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
