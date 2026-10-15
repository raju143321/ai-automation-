import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  BookOpen,
  Network,
  FileBarChart,
  Lock,
  Layers,
  Database,
  CheckCircle2,
  Cpu,
  Quote,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDemoTab, setActiveDemoTab] = useState<'evidence' | 'graph' | 'literature'>('evidence');

  return (
    <div className="min-h-screen bg-[#070a10] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Top Navigation */}
      <header className="border-b border-[#141b2c] bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-violet-600 flex items-center justify-center font-extrabold text-white shadow-lg shadow-cyan-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">ResearchSphere</span>
              <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI 2.5
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-slate-300">
            <a href="#problem" className="hover:text-cyan-400 transition-colors">The Problem</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Core Capabilities</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Interactive Demo</a>
            <a href="#evidence-first" className="hover:text-cyan-400 transition-colors">Evidence-First AI</a>
            <a href="#security" className="hover:text-cyan-400 transition-colors">Security & Ethics</a>
          </nav>

          <div className="flex items-center space-x-3">
            <NavLink
              to="/login"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/app"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center space-x-1.5"
            >
              <span>Launch Workspace</span>
              <ArrowRight size={13} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/15 to-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Autonomous AI Workspace for Scientific & Academic Discovery</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Transform Fragmented Information Into{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Verifiable Knowledge
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            ResearchSphere AI combines real-time scholarly search, multi-document intelligence, traceable evidence extraction, and interactive concept graphs. Every claim links to verifiable publications—guaranteed zero fabrication.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <NavLink
              to="/app"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center space-x-2 active:scale-[0.98]"
            >
              <span>Explore Live Workspace</span>
              <ArrowRight size={16} />
            </NavLink>
            <a
              href="#demo"
              className="px-6 py-3.5 rounded-xl bg-[#131b2e] hover:bg-[#1a253e] border border-[#243354] text-slate-200 font-semibold text-sm transition-all"
            >
              View Interactive Demo
            </a>
          </div>

          {/* Social Proof / Integrations */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1a253c]">
              <div className="text-cyan-400 font-bold text-lg font-mono">250M+</div>
              <div className="text-xs text-slate-400">OpenAlex & Crossref Works</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1a253c]">
              <div className="text-indigo-400 font-bold text-lg font-mono">100%</div>
              <div className="text-xs text-slate-400">Traceable Evidence Citations</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1a253c]">
              <div className="text-emerald-400 font-bold text-lg font-mono">6 Formats</div>
              <div className="text-xs text-slate-400">PDF, DOCX, XLSX, CSV, MD, TXT</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#0e1422] border border-[#1a253c]">
              <div className="text-violet-400 font-bold text-lg font-mono">Row-Level</div>
              <div className="text-xs text-slate-400">PostgreSQL RLS Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section id="problem" className="py-20 px-6 border-t border-[#141b2c] bg-[#080c14]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">The Research Friction</div>
            <h2 className="text-3xl font-bold text-white">Why Modern Research Workflows Break Down</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Researchers waste hundreds of hours manually toggling between disconnected search engines, PDF readers, and generic AI chatbots prone to hallucination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#0f1524] border border-[#1c273e] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
                ✕
              </div>
              <h3 className="text-base font-bold text-white">Hallucinated Citations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generic chatbots regularly invent fictitious DOIs, fake paper titles, and non-existent experimental results, destroying research credibility.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0f1524] border border-[#1c273e] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                !
              </div>
              <h3 className="text-base font-bold text-white">Information Silos</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Downloaded PDFs, web articles, tabular spreadsheets, and personal notes live in separate silos, hiding cross-document contradictions and synthesis opportunities.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0f1524] border border-[#1c273e] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <h3 className="text-base font-bold text-white">The ResearchSphere Solution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                A unified workspace connecting OpenAlex discovery, secure multi-document parsing, evidence-grounded Gemini synthesis, and interactive relationship graphs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="demo" className="py-20 px-6 border-t border-[#141b2c] bg-[#0a0f1b]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
              <span>Interactive Workflow Preview (Sample Data)</span>
            </div>
            <h2 className="text-3xl font-bold text-white">Experience Evidence-First Synthesis</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Inspect how ResearchSphere AI answers questions with verifiable evidence references and relationship graphs.
            </p>
          </div>

          {/* Interactive Demo Tabs */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setActiveDemoTab('evidence')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeDemoTab === 'evidence' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-[#141b2c] text-slate-400 hover:text-white'}`}
            >
              Grounded Assistant Chat
            </button>
            <button
              onClick={() => setActiveDemoTab('graph')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeDemoTab === 'graph' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-[#141b2c] text-slate-400 hover:text-white'}`}
            >
              Concept Knowledge Graph
            </button>
            <button
              onClick={() => setActiveDemoTab('literature')}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${activeDemoTab === 'literature' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-[#141b2c] text-slate-400 hover:text-white'}`}
            >
              Literature Review Synthesis
            </button>
          </div>

          {/* Demo Content Box */}
          <div className="rounded-xl border border-[#222e47] bg-[#0e1422] p-6 shadow-2xl">
            {activeDemoTab === 'evidence' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1b253b] text-xs">
                  <div className="font-mono text-cyan-400 flex items-center space-x-1.5">
                    <Terminal size={14} />
                    <span>Project: Architectural Trade-offs in Multi-Head Attention and State-Space Models</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">2 Sources Cited</span>
                </div>

                <div className="p-3 rounded-lg bg-[#141b2c] border border-[#202b44] text-xs text-slate-200">
                  <div className="text-[10px] text-slate-400 font-mono mb-1">User Question</div>
                  "How does computational complexity scale in Transformers vs Mamba during long-sequence generation?"
                </div>

                <div className="p-4 rounded-lg bg-[#111828] border border-cyan-500/20 space-y-3 text-xs leading-relaxed">
                  <div className="text-[10px] text-cyan-400 font-mono font-bold flex items-center space-x-1">
                    <Sparkles size={12} />
                    <span>ResearchSphere AI Grounded Response</span>
                  </div>
                  <p className="text-slate-200">
                    Standard Multi-Head Attention incurs an <strong className="text-cyan-300">O(n² · d)</strong> complexity per layer with respect to sequence length <span className="px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 font-mono text-[10px] border border-cyan-500/40">[ev_1: Vaswani et al. 2017]</span>. During generation, accumulation of the Key-Value (KV) cache creates severe memory pressure.
                  </p>
                  <p className="text-slate-200">
                    In contrast, <strong className="text-indigo-300">Mamba</strong> utilizes selective state spaces with input-dependent continuous state projections, scaling in <strong className="text-emerald-300">linear O(N)</strong> time and memory <span className="px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono text-[10px] border border-indigo-500/40">[ev_2: Gu & Dao 2023]</span>, yielding up to 5x higher throughput on extended context windows.
                  </p>
                  <div className="pt-2 border-t border-[#1f2b45] flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <ShieldCheck size={13} />
                      <span>All citations mapped to verified peer-reviewed publications</span>
                    </span>
                    <NavLink to="/app" className="text-cyan-400 hover:underline">
                      Open in Interactive Workspace →
                    </NavLink>
                  </div>
                </div>
              </div>
            )}

            {activeDemoTab === 'graph' && (
              <div className="p-6 text-center space-y-4">
                <div className="inline-block p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Network size={36} />
                </div>
                <h3 className="text-base font-bold text-white">Interactive Concept Relationship Network</h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  Automatically extracts concepts, methodologies, and findings from your uploaded papers and maps their relationships (supports, contradicts, derived from) with evidence provenance.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <span className="px-3 py-1 rounded bg-[#162137] border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                    Multi-Head Attention ──(derived_from)──&gt; Quadratic KV Bottleneck
                  </span>
                  <span className="px-3 py-1 rounded bg-[#162137] border border-rose-500/30 text-rose-300 text-xs font-mono">
                    Selective State Spaces ──(contradicts)──&gt; Quadratic KV Bottleneck
                  </span>
                </div>
              </div>
            )}

            {activeDemoTab === 'literature' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#131b2e] rounded-lg border border-[#202b44]">
                  <div className="text-[10px] font-mono text-cyan-400 uppercase">Automated Theme Extraction</div>
                  <h4 className="text-sm font-bold text-white mt-0.5">Theme 1: Sub-Quadratic State Formulations vs Dense Attention</h4>
                  <p className="text-slate-300 mt-1">
                    Synthesis of Vaswani et al. (2017) and Gu & Dao (2023) establishes that while attention provides superior in-context arbitrary associative recall, state-space models overcome inference latency bottlenecks.
                  </p>
                </div>
                <div className="p-3 bg-[#131b2e] rounded-lg border border-[#202b44]">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">Identified Research Gap</div>
                  <h4 className="text-sm font-bold text-white mt-0.5">Associative Recall Degradation in Pure Linear SSMs</h4>
                  <p className="text-slate-300 mt-1">
                    Evidence reveals that pure state-space formulations experience fidelity degradation on synthetic needle-in-a-haystack tasks exceeding 100k tokens compared to full multi-head attention.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Evidence-First AI Section */}
      <section id="evidence-first" className="py-20 px-6 border-t border-[#141b2c] bg-[#070a10]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Provenance & Integrity</div>
            <h2 className="text-3xl font-bold text-white">The Evidence-First AI Architecture</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              How ResearchSphere AI eliminates hallucinations and preserves scientific trust at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-[#0d121e] border border-[#1b253b] space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Database size={16} />
                <span>Authoritative Evidence Registry</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Before Gemini generates a single word, our retrieval service indexes all candidate excerpts with immutable server-side evidence identifiers (<code className="text-cyan-300">ev_1</code>, <code className="text-cyan-300">ev_2</code>). The model is strictly instructed to cite only verified registry entries.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0d121e] border border-[#1b253b] space-y-3">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
                <ShieldCheck size={16} />
                <span>Server-Side Post-Generation Verification</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every AI output passes through Zod schema validation and a strict citation verifier. Any hallucinated citation identifier that did not originate from the retrieved project evidence is discarded or highlighted with a transparent warning.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0d121e] border border-[#1b253b] space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Lock size={16} />
                <span>Untrusted Content Isolation</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uploaded papers and web articles are treated as untrusted data. Embedded instructions attempting prompt injection or behavior alteration are strictly isolated and treated as text to analyze, never commands to execute.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#0d121e] border border-[#1b253b] space-y-3">
              <div className="flex items-center space-x-2 text-violet-400 font-bold text-sm">
                <Layers size={16} />
                <span>Transparent Uncertainty Disclosures</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If the retrieved literature is insufficient to address a question, the assistant explicitly states that evidence is insufficient rather than generating plausible-sounding speculations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Row Level Security Section */}
      <section id="security" className="py-20 px-6 border-t border-[#141b2c] bg-[#090d16]">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
            <Lock size={13} />
            <span>Cybersecurity & Data Isolation</span>
          </div>

          <h2 className="text-3xl font-bold text-white">Enterprise-Grade Security Architecture</h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Your proprietary research, uploaded preprints, and confidential notes are protected with Supabase PostgreSQL Row Level Security (RLS) and strict server-side access controls.
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left pt-4">
            <div className="p-5 rounded-xl bg-[#0d1320] border border-[#192236] space-y-2">
              <h4 className="text-sm font-bold text-white">PostgreSQL RLS Policies</h4>
              <p className="text-xs text-slate-400">
                19 independent tables with granular SELECT, INSERT, UPDATE, and DELETE policies tied to authenticated user UUIDs.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#0d1320] border border-[#192236] space-y-2">
              <h4 className="text-sm font-bold text-white">Private Storage Buckets</h4>
              <p className="text-xs text-slate-400">
                Uploaded PDFs and documents are stored in private buckets accessible only via authorized signed URLs with short lifetimes.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#0d1320] border border-[#192236] space-y-2">
              <h4 className="text-sm font-bold text-white">Never In The Browser</h4>
              <p className="text-xs text-slate-400">
                Gemini API keys, service role credentials, and search secrets remain strictly on the backend Node.js process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 border-t border-[#141b2c] bg-gradient-to-b from-[#090d16] to-[#04060a] text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            Ready to Accelerate Your Scientific Discovery?
          </h2>
          <p className="text-sm text-slate-400">
            Launch your first research project in seconds. Connect OpenAlex, upload your papers, and experience verifiable AI synthesis.
          </p>
          <div className="pt-2">
            <NavLink
              to="/app"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all inline-flex items-center space-x-2"
            >
              <span>Launch ResearchSphere AI</span>
              <ArrowRight size={16} />
            </NavLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#111726] py-8 px-6 text-center text-xs text-slate-500 bg-[#05070c]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            © 2026 ResearchSphere AI. Built for academic, institutional, and industrial discovery.
          </div>
          <div className="flex space-x-6">
            <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">OpenAlex API</a>
            <a href="https://crossref.org" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Crossref Metadata</a>
            <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400">Google Gemini</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
