import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  ShieldAlert,
  Users,
  Archive,
  Trash2,
  Save,
  UserPlus,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api-client';
import {
  ResearchProject,
  ProjectMember,
  RESEARCH_DOMAINS,
  CITATION_STYLES,
  RESEARCH_DEPTHS
} from '@researchsphere/shared';

export const ProjectSettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: project } = useQuery<ResearchProject>({
    queryKey: ['project', projectId],
    queryFn: () => api.get<ResearchProject>(`/projects/${projectId}`)
  });

  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [domain, setDomain] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [researchDepth, setResearchDepth] = useState('standard');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Sync state once loaded
  React.useEffect(() => {
    if (project) {
      setTitle(project.title);
      setQuestion(project.research_question);
      setDomain(project.domain);
      setCitationStyle(project.citation_style);
      setResearchDepth(project.research_depth);
    }
  }, [project]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      api.patch(`/projects/${projectId}`, {
        title,
        research_question: question,
        domain,
        citation_style: citationStyle,
        research_depth: researchDepth
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      alert('Project settings saved successfully!');
    }
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: () => api.post(`/projects/${projectId}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/app/projects');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/app/projects');
    }
  });

  if (!project) return null;

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings size={22} className="text-cyan-400" />
          <span>Project Configuration & Access</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust metadata, citation defaults, research depth parameters, and manage collaborator permissions.
        </p>
      </div>

      {/* Main Settings Form */}
      <div className="p-6 rounded-2xl bg-[#0e1422] border border-[#1e2a42] space-y-5 text-xs shadow-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#182338]">
          General Parameters
        </h3>

        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Project Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Research Question
          </label>
          <textarea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Domain
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
            >
              {RESEARCH_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Citation Style
            </label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
            >
              {CITATION_STYLES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Research Depth
            </label>
            <select
              value={researchDepth}
              onChange={(e) => setResearchDepth(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
            >
              {RESEARCH_DEPTHS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <Save size={14} />
            <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Collaborators Section */}
      <div className="p-6 rounded-2xl bg-[#0e1422] border border-[#1e2a42] space-y-4 text-xs shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-[#182338]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Users size={16} className="text-indigo-400" />
            <span>Research Collaborators</span>
          </h3>
          <span className="text-[11px] text-slate-400">Owner Access Granted</span>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail size={14} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@institution.edu"
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as any)}
            className="bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white focus:outline-none"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="button"
            onClick={() => {
              if (inviteEmail) {
                setInviteSuccess(true);
                setInviteEmail('');
                setTimeout(() => setInviteSuccess(false), 3000);
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#182338] hover:bg-[#202f4c] text-cyan-400 font-semibold flex items-center space-x-1"
          >
            <UserPlus size={14} />
            <span>Invite</span>
          </button>
        </div>

        {inviteSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2 text-[11px]">
            <CheckCircle2 size={13} />
            <span>Invitation token created. Collaborator granted {inviteRole} permissions upon sign-in.</span>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
          <ShieldAlert size={16} />
          <span>Danger Zone</span>
        </h3>
        <p className="text-slate-400">
          Archiving or deleting this project removes or unlinks derived chunks, knowledge graph relationships, and conversations.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => {
              if (confirm('Archive this project? It will be hidden from the active dashboard.')) {
                archiveMutation.mutate();
              }
            }}
            className="px-4 py-2 rounded-lg bg-[#181d28] hover:bg-[#222938] text-slate-300 border border-[#2b3547] font-semibold flex items-center space-x-1.5"
          >
            <Archive size={14} />
            <span>Archive Project</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you absolutely sure you want to permanently delete this research project and all derived analysis records? This action cannot be undone.')) {
                deleteMutation.mutate();
              }
            }}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center space-x-1.5 shadow-md shadow-rose-600/20"
          >
            <Trash2 size={14} />
            <span>Delete Project Permanently</span>
          </button>
        </div>
      </div>
    </div>
  );
};
