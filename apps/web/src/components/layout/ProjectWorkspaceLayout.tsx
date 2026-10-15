import React, { useState } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Search,
  BookOpen,
  MessageSquareText,
  FileBarChart,
  ShieldCheck,
  Network,
  Lightbulb,
  StickyNote,
  Settings,
  Download,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../lib/api-client';
import { ResearchProject } from '@researchsphere/shared';
import { ExportModal } from '../research/ExportModal';

export const ProjectWorkspaceLayout: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const { data: project, isLoading } = useQuery<ResearchProject>({
    queryKey: ['project', projectId],
    queryFn: () => api.get<ResearchProject>(`/projects/${projectId}`),
    enabled: Boolean(projectId)
  });

  const tabs = [
    { to: `/app/projects/${projectId}`, label: 'Overview', icon: BookOpen, end: true },
    { to: `/app/projects/${projectId}/discover`, label: 'Discovery', icon: Search },
    { to: `/app/projects/${projectId}/library`, label: 'Library & Docs', icon: BookOpen },
    { to: `/app/projects/${projectId}/chat`, label: 'Assistant Chat', icon: MessageSquareText },
    { to: `/app/projects/${projectId}/analysis`, label: 'Analysis Hub', icon: FileBarChart },
    { to: `/app/projects/${projectId}/claims`, label: 'Claims & Evidence', icon: ShieldCheck },
    { to: `/app/projects/${projectId}/knowledge`, label: 'Concept Graph', icon: Network },
    { to: `/app/projects/${projectId}/discoveries`, label: 'Discovery Feed', icon: Lightbulb },
    { to: `/app/projects/${projectId}/notes`, label: 'Notes', icon: StickyNote },
    { to: `/app/projects/${projectId}/settings`, label: 'Settings', icon: Settings }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center space-x-3 text-cyan-400">
        <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading research project workspace...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Research Project Not Found</h2>
        <p className="text-slate-400 text-sm mb-4">The requested project could not be located or you lack access.</p>
        <button
          onClick={() => navigate('/app/projects')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0a0d14]">
      {/* Project Workspace Header */}
      <div className="px-6 py-4 bg-[#0d121d] border-b border-[#192233]">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <button
              onClick={() => navigate('/app/projects')}
              className="flex items-center space-x-1 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft size={13} />
              <span>Projects</span>
            </button>
            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-slate-200 font-medium truncate max-w-xs">{project.title}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setExportModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-[#151c2c] hover:bg-[#1d273d] border border-[#232f48] text-xs font-medium text-slate-200 flex items-center space-x-1.5 transition-colors shadow-sm"
            >
              <Download size={13} className="text-cyan-400" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Title and Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>{project.title}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
              "{project.research_question}"
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium font-mono">
              {project.domain}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium font-mono">
              {project.citation_style}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium font-mono">
              {project.research_depth} depth
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto mt-4 pt-1 border-t border-[#161f31] scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) => `
                  flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
                  ${isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#141b2b]'}
                `}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <Outlet />
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <ExportModal
          projectId={project.id}
          citationStyle={project.citation_style}
          onClose={() => setExportModalOpen(false)}
        />
      )}
    </div>
  );
};
