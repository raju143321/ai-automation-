import React, { useState } from 'react';
import { Settings, User, Shield, Key, Save, CheckCircle2, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CITATION_STYLES, RESEARCH_DEPTHS } from '@researchsphere/shared';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || 'Lead AI Researcher');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [researchDepth, setResearchDepth] = useState('standard');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <Settings size={22} className="text-cyan-400" />
          <span>User Preferences & Security</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure default citation standards, synthesis depth, and review system configuration.
        </p>
      </div>

      {saved && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 size={15} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-[#0e1422] border border-[#1e2a42] space-y-5 text-xs shadow-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#182338]">
          Researcher Profile
        </h3>

        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            Email Address (Authenticated)
          </label>
          <input
            type="email"
            value={user?.email || 'researcher@researchsphere.ai'}
            disabled
            className="w-full bg-[#0a0e17] border border-[#192233] rounded-lg px-3.5 py-2.5 text-slate-400 font-mono"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Default Citation Standard
            </label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
            >
              {CITATION_STYLES.map((s) => (
                <option key={s} value={s}>{s} Standard</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              Default Synthesis Depth
            </label>
            <select
              value={researchDepth}
              onChange={(e) => setResearchDepth(e.target.value)}
              className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white focus:outline-none cursor-pointer"
            >
              {RESEARCH_DEPTHS.map((d) => (
                <option key={d} value={d}>{d.toUpperCase()} Analysis</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
          >
            <Save size={14} />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* System Engine Status */}
      <div className="p-6 rounded-2xl bg-[#0e1422] border border-[#1e2a42] space-y-4 text-xs shadow-md">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-[#182338] flex items-center space-x-2">
          <Cpu size={16} className="text-cyan-400" />
          <span>System Environment & Provider Diagnostics</span>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-lg bg-[#131b2e] border border-[#1f2a40] space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Scholarly Index Provider</div>
            <div className="font-bold text-white text-sm">OpenAlex + Crossref APIs</div>
            <div className="text-[11px] text-emerald-400 font-mono">Status: Connected (250M+ Works)</div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#131b2e] border border-[#1f2a40] space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Active AI Reasoning Model</div>
            <div className="font-bold text-white text-sm">Gemini 2.5 Flash (@google/genai)</div>
            <div className="text-[11px] text-cyan-400 font-mono">Status: Grounded Synthesis Mode</div>
          </div>
        </div>
      </div>
    </div>
  );
};
