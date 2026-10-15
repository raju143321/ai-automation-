import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  FileBarChart,
  ShieldCheck,
  Network,
  Lightbulb,
  Search,
  UploadCloud,
  MessageSquareText,
  CheckCircle2,
  ArrowRight,
  Target,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchProject } from '@researchsphere/shared';

export const ProjectOverviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { data: project } = useQuery<ResearchProject>({
    queryKey: ['project', projectId],
    queryFn: () => api.get<ResearchProject>(`/projects/${projectId}`)
  });

  if (!project) return null;

  const stages = [
    { name: 'Discover', desc: 'Find literature in OpenAlex', done: (project.sources_count || 0) > 0 },
    { name: 'Collect', desc: 'Attach papers & upload PDFs', done: (project.documents_count || 0) > 0 },
    { name: 'Understand', desc: 'Ask questions with evidence', done: true },
    { name: 'Analyze', desc: 'Generate literature review', done: (project.analyses_count || 0) > 0 },
    { name: 'Connect', desc: 'Build concept graph', done: true },
    { name: 'Verify', desc: 'Inspect claim assessments', done: true },
    { name: 'Publish', desc: 'Export cited briefs', done: false }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Research Question Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#111728] via-[#131d33] to-[#151f38] border border-[#22314f] shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
          <Target size={14} />
          <span>Core Research Mandate</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
          "{project.research_question}"
        </h2>
        {project.description && (
          <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
            {project.description}
          </p>
        )}
      </div>

      {/* 7-Stage Workflow Progress */}
      <div className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
            <Layers size={13} className="text-cyan-400" />
            <span>Research Lifecycle Progression</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-400">7-Stage Provenance Pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {stages.map((stage, idx) => (
            <div
              key={stage.name}
              className={`p-3 rounded-lg border text-xs flex flex-col justify-between transition-colors ${
                stage.done
                  ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
                  : 'bg-[#121929] border-[#1f2b42] text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between font-bold text-xs mb-1">
                  <span>{idx + 1}. {stage.name}</span>
                  {stage.done ? (
                    <CheckCircle2 size={13} className="text-cyan-400 shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  )}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">{stage.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Objectives and Scope Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Objectives */}
        <div className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Key Research Objectives</span>
          </h3>
          <div className="space-y-2 text-xs">
            {project.objectives && project.objectives.length > 0 ? (
              project.objectives.map((obj, i) => (
                <div key={i} className="flex items-start space-x-2.5 p-2 rounded bg-[#131b2c] border border-[#1e2a42]">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-slate-200">{obj}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic text-xs">No explicit objectives defined yet.</p>
            )}
          </div>
        </div>

        {/* Scope and Boundary */}
        <div className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <ShieldCheck size={15} className="text-indigo-400" />
            <span>Scope & Constraints</span>
          </h3>
          <div className="p-3.5 rounded-lg bg-[#131b2c] border border-[#1e2a42] text-xs text-slate-300 leading-relaxed">
            {project.scope || 'No restrictive scope defined; unrestricted exploration enabled across peer-reviewed repositories.'}
          </div>

          {project.tags && project.tags.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Project Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-[#182338] text-slate-300 text-[11px] font-mono border border-[#253654]">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Launchpad to Tools */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Workspace Navigation
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate(`/app/projects/${project.id}/discover`)}
            className="p-4 rounded-xl bg-[#0e1422] hover:bg-[#131c30] border border-[#1b253b] hover:border-cyan-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Search size={18} className="text-cyan-400" />
              <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="font-bold text-sm text-white">External Discovery</div>
            <p className="text-[11px] text-slate-400">Search OpenAlex and Crossref repositories for verified papers.</p>
          </div>

          <div
            onClick={() => navigate(`/app/projects/${project.id}/chat`)}
            className="p-4 rounded-xl bg-[#0e1422] hover:bg-[#131c30] border border-[#1b253b] hover:border-indigo-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <MessageSquareText size={18} className="text-indigo-400" />
              <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="font-bold text-sm text-white">Assistant Chat</div>
            <p className="text-[11px] text-slate-400">Ask questions grounded in authorized project excerpts.</p>
          </div>

          <div
            onClick={() => navigate(`/app/projects/${project.id}/analysis`)}
            className="p-4 rounded-xl bg-[#0e1422] hover:bg-[#131c30] border border-[#1b253b] hover:border-emerald-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <FileBarChart size={18} className="text-emerald-400" />
              <ArrowRight size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="font-bold text-sm text-white">Analysis Hub</div>
            <p className="text-[11px] text-slate-400">Synthesize literature reviews, briefs, and comparison matrices.</p>
          </div>

          <div
            onClick={() => navigate(`/app/projects/${project.id}/knowledge`)}
            className="p-4 rounded-xl bg-[#0e1422] hover:bg-[#131c30] border border-[#1b253b] hover:border-violet-500/40 cursor-pointer transition-all space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <Network size={18} className="text-violet-400" />
              <ArrowRight size={14} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="font-bold text-sm text-white">Concept Graph</div>
            <p className="text-[11px] text-slate-400">Inspect relationships, contradictions, and evidence edges.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
