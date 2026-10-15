import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { CitationStyle, CITATION_STYLES } from '@researchsphere/shared';

interface ExportModalProps {
  projectId: string;
  citationStyle: CitationStyle;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ projectId, citationStyle: initialStyle, onClose }) => {
  const [format, setFormat] = useState<'markdown' | 'json' | 'csv' | 'pdf' | 'txt'>('markdown');
  const [citationStyle, setCitationStyle] = useState<CitationStyle>(initialStyle);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/v1/projects/${projectId}/exports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          format,
          citation_style: citationStyle,
          include_metadata: includeMetadata,
          include_citations: includeCitations
        })
      });

      if (!response.ok) throw new Error('Export generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-sphere-export.${format === 'pdf' ? 'html' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      onClose();
    } catch (err) {
      alert('Failed to download export: ' + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    { id: 'markdown', label: 'Markdown (.md)', desc: 'Full research brief with formatted headers, tables, and references.' },
    { id: 'pdf', label: 'Printable HTML / PDF', desc: 'Print-ready academic layout ready to save as PDF via browser print.' },
    { id: 'json', label: 'Structured JSON (.json)', desc: 'Machine-readable research schema with all claims, evidence, and provenance.' },
    { id: 'csv', label: 'Tabular CSV (.csv)', desc: 'Extracted findings, confidence ratings, and claim classifications.' },
    { id: 'txt', label: 'Plain Text (.txt)', desc: 'Clean unformatted research outline for notes and emails.' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-[#232f48] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#1f293d] flex items-center justify-between bg-[#151c2e]">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Download size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export Research Findings</h3>
              <p className="text-[11px] text-slate-400">Compile evidence-backed research outputs</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1f2b45]">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Format Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Output Format
            </label>
            <div className="space-y-1.5">
              {formats.map((f) => (
                <label
                  key={f.id}
                  onClick={() => setFormat(f.id as any)}
                  className={`
                    flex items-start space-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors
                    ${format === f.id
                      ? 'bg-cyan-500/10 border-cyan-500/40 text-white'
                      : 'bg-[#151c2c] border-[#1f2a3f] text-slate-300 hover:bg-[#1a2336]'}
                  `}
                >
                  <input
                    type="radio"
                    name="format"
                    checked={format === f.id}
                    onChange={() => setFormat(f.id as any)}
                    className="mt-0.5 text-cyan-500 focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold">{f.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{f.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Citation Style */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Citation Standard
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {CITATION_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setCitationStyle(style)}
                  className={`
                    py-1.5 text-xs font-mono font-medium rounded-md border text-center transition-colors
                    ${citationStyle === style
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-sm'
                      : 'bg-[#161e30] border-[#222e47] text-slate-300 hover:bg-[#1c273e]'}
                  `}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="pt-2 border-t border-[#1d273b] space-y-2">
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-[#293652] bg-[#161e30] text-cyan-500 focus:ring-0"
              />
              <span>Include Research Question, Domain, and Scope Metadata</span>
            </label>
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCitations}
                onChange={(e) => setIncludeCitations(e.target.checked)}
                className="rounded border-[#293652] bg-[#161e30] text-cyan-500 focus:ring-0"
              />
              <span>Include Traceable In-Text Citations & Full Bibliography</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1f293d] flex items-center justify-end space-x-2 bg-[#141b2b]">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>{isExporting ? 'Generating Report...' : 'Download Export'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
