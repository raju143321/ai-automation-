import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  projectBaseSchema,
  RESEARCH_DOMAINS,
  CITATION_STYLES,
  RESEARCH_DEPTHS,
  ResearchProject
} from '@researchsphere/shared';
import { api } from '../lib/api-client';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [objectives, setObjectives] = useState<string[]>([
    'Evaluate empirical scaling performance and parameter efficiency',
    'Identify theoretical bottlenecks and conflicting literature claims'
  ]);
  const [newObjective, setNewObjective] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(projectBaseSchema),
    defaultValues: {
      title: '',
      research_question: '',
      description: '',
      domain: 'cs-ai',
      subdomain: '',
      scope: '',
      language: 'en',
      citation_style: 'APA',
      research_depth: 'standard'
    }
  });

  const addObjective = () => {
    if (newObjective.trim() && objectives.length < 10) {
      const updated = [...objectives, newObjective.trim()];
      setObjectives(updated);
      setNewObjective('');
    }
  };

  const removeObjective = (idx: number) => {
    setObjectives(objectives.filter((_, i) => i !== idx));
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const created = await api.post<ResearchProject>('/projects', {
        ...values,
        objectives
      });
      navigate(`/app/projects/${created.id}`);
    } catch (err) {
      alert('Failed to create project: ' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/app/projects')}
          className="p-2 rounded-lg bg-[#0e1422] border border-[#1e2a42] text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Sparkles size={20} className="text-cyan-400" />
            <span>Create Research Project</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Define your core question, investigation scope, domain taxonomy, and citation standards.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 rounded-2xl bg-[#0e1422] border border-[#1e2a42] shadow-xl space-y-6 text-xs">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Project Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            {...register('title')}
            placeholder="e.g. Architectural Trade-offs in Multi-Head Attention and State-Space Models"
            className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {errors.title && <p className="text-rose-400 text-[11px]">{errors.title.message as string}</p>}
        </div>

        {/* Research Question */}
        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Primary Research Question <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            {...register('research_question')}
            placeholder="What precise scientific question or hypothesis is this project investigating?"
            className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {errors.research_question && (
            <p className="text-rose-400 text-[11px]">{errors.research_question.message as string}</p>
          )}
        </div>

        {/* Domain and Subdomain */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Academic Domain / Discipline <span className="text-rose-400">*</span>
            </label>
            <select
              {...register('domain')}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {RESEARCH_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.domain && <p className="text-rose-400 text-[11px]">{errors.domain.message as string}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Subdomain / Specific Specialization
            </label>
            <input
              type="text"
              {...register('subdomain')}
              placeholder="e.g. Deep Learning & Natural Language Processing"
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Investigation Objectives (Up to 10)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addObjective(); } }}
              placeholder="Add key objective or target finding..."
              className="flex-1 bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={addObjective}
              className="px-3.5 py-2 bg-[#192338] hover:bg-[#212f4c] text-cyan-400 font-medium rounded-lg flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            {objectives.map((obj, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#141c2c] border border-[#202b42] text-slate-200">
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] font-mono">
                    {i + 1}
                  </span>
                  <span>{obj}</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeObjective(i)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Investigation Scope */}
        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Research Scope & Boundary
          </label>
          <textarea
            rows={2}
            {...register('scope')}
            placeholder="Specify publication date ranges, paper types, benchmark datasets, or explicit exclusions..."
            className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Citation Standard and Research Depth */}
        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Citation Standard
            </label>
            <select
              {...register('citation_style')}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {CITATION_STYLES.map((style) => (
                <option key={style} value={style}>{style} Format</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Synthesis Depth
            </label>
            <select
              {...register('research_depth')}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {RESEARCH_DEPTHS.map((depth) => (
                <option key={depth} value={depth}>{depth.toUpperCase()} analysis</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#1c273e] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/app/projects')}
            className="px-4 py-2.5 text-slate-400 hover:text-white font-medium text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>{isSubmitting ? 'Initializing Workspace...' : 'Create & Enter Workspace'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
