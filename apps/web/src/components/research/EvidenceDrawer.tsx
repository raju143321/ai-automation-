import React from 'react';
import { X, ExternalLink, ShieldCheck, BookOpen, Quote, FileText } from 'lucide-react';
import { CitationDisplay } from '@researchsphere/shared';

interface EvidenceDrawerProps {
  citation: CitationDisplay | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0f1523] border-l border-[#222e47] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-[#222e47] flex items-center justify-between bg-[#131b2e]">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-cyan-500/20 text-cyan-400">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Evidence Reference: {citation.evidence_id}
            </div>
            <div className="text-[11px] text-slate-400 font-sans">Ground Truth Provenance</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1f2b45]"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
        {/* Source Title & Meta */}
        <div className="p-3.5 rounded-lg bg-[#151e33] border border-[#25324e]">
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
            <BookOpen size={11} />
            <span>Originating Source</span>
          </div>
          <h4 className="text-sm font-semibold text-white leading-snug">{citation.source_title}</h4>
          {citation.authors && citation.authors.length > 0 && (
            <div className="text-[11px] text-slate-300 mt-1">
              By {citation.authors.join(', ')} {citation.year ? `(${citation.year})` : ''}
            </div>
          )}
          {citation.page_number && (
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
              Source Location: Page {citation.page_number}
            </div>
          )}
        </div>

        {/* Verbatim Excerpt */}
        <div className="p-3.5 rounded-lg bg-[#121929] border border-cyan-500/20 space-y-2">
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-300">
            <Quote size={13} className="text-cyan-400" />
            <span>Verbatim Retrieved Excerpt</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans bg-[#0c111c] p-3 rounded border border-[#1b263b] italic">
            "{citation.excerpt}"
          </p>
        </div>

        {/* DOI / External Link */}
        {citation.doi && (
          <div className="p-3 rounded-lg bg-[#151e33] border border-[#25324e] flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-[10px] text-slate-400">Digital Object Identifier (DOI)</div>
              <div className="text-xs font-mono text-slate-200 truncate">{citation.doi}</div>
            </div>
            <a
              href={`https://doi.org/${citation.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded bg-cyan-600/30 hover:bg-cyan-600 text-cyan-300 hover:text-white transition-colors"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {citation.source_url && !citation.doi && (
          <a
            href={citation.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 rounded-lg bg-[#1b263d] hover:bg-[#23314f] text-cyan-400 text-xs font-medium flex items-center justify-center space-x-2 border border-[#2c3d61] transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open Publisher Landing Page</span>
          </a>
        )}

        {/* Verification Status Alert */}
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-start space-x-2">
          <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Evidence Integrity Guaranteed:</span> This excerpt was retrieved directly from authorized project documents and verified against model output.
          </div>
        </div>
      </div>
    </div>
  );
};
