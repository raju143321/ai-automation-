import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  PlusCircle,
  Search,
  BookOpen,
  FileBarChart,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchProject, RESEARCH_DOMAINS } from '@researchsphere/shared';

export const ProjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

  const { data: projects = [], isLoading } = useQuery<ResearchProject[]>({
    queryKey: ['projects'],
    queryFn: () => api.get<ResearchProject[]>('/projects')
  });

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.research_question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'all' || p.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FolderKanban size={22} className="text-cyan-400" />
            <span>Research Projects</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your active investigations, scopes, and grounded knowledge repositories.
          </p>
        </div>

        <button
          onClick={() => navigate('/app/projects/new')}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start md:self-auto transition-all active:scale-[0.98]"
        >
          <PlusCircle size={15} />
          <span>New Research Project</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or research question..."
            className="w-full bg-[#0e1422] border border-[#1e2a42] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-[#0e1422] border border-[#1e2a42] rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Disciplines & Domains</option>
            {RESEARCH_DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-cyan-400 text-xs">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
          <p className="text-sm text-slate-300">No matching projects found.</p>
          <p className="text-xs text-slate-500">Try adjusting your search terms or domain filter.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((proj) => (
            <div
              key={proj.id}
              onClick={() => navigate(`/app/projects/${proj.id}`)}
              className="group p-5 rounded-xl bg-[#0e1422] hover:bg-[#12192a] border border-[#1b263d] hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg space-y-3 flex flex-col justify-between"
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
  );
};
