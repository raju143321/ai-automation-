import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  Loader2,
  X,
  File
} from 'lucide-react';
import { api } from '../lib/api-client';
import { Source, Document, DocumentChunk } from '@researchsphere/shared';

export const ProjectLibraryPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocChunks, setSelectedDocChunks] = useState<DocumentChunk[] | null>(null);
  const [selectedDocName, setSelectedDocName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sources' | 'documents'>('sources');

  // Fetch sources
  const { data: sources = [] } = useQuery<Source[]>({
    queryKey: ['project-sources', projectId],
    queryFn: () => api.get<Source[]>(`/projects/${projectId}/sources`)
  });

  // Fetch documents
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['project-documents', projectId],
    queryFn: () => api.get<Document[]>(`/projects/${projectId}/documents`)
  });

  // View chunks handler
  const handleViewChunks = async (doc: Document) => {
    setSelectedDocName(doc.original_filename);
    try {
      const chunks = await api.get<DocumentChunk[]>(`/documents/${doc.id}/chunks`);
      setSelectedDocChunks(chunks);
    } catch (err) {
      alert('Failed to load chunks: ' + (err as Error).message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <BookOpen size={22} className="text-cyan-400" />
            <span>Project Library & Documents</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your project's scholarly publications, research papers, preprints, and uploaded data files.
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start sm:self-auto transition-all active:scale-[0.98]"
        >
          <UploadCloud size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-[#1b253b] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'sources'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Scholarly Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'documents'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Uploaded Documents ({documents.length})
        </button>
      </div>

      {/* Sources View */}
      {activeTab === 'sources' && (
        <div className="space-y-3">
          {sources.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
              <BookOpen size={32} className="mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No sources attached to this project yet</p>
              <p className="text-xs text-slate-500">Go to Discovery to search OpenAlex and save peer-reviewed papers.</p>
            </div>
          ) : (
            sources.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 mr-2">
                      {s.publisher || 'Peer-Reviewed'}
                    </span>
                    <h3 className="text-sm font-bold text-white inline">{s.title}</h3>
                  </div>

                  {s.doi && (
                    <a
                      href={`https://doi.org/${s.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 shrink-0 font-mono"
                    >
                      <span>DOI: {s.doi}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {s.authors && s.authors.length > 0 && (
                  <p className="text-xs text-slate-300">
                    By {s.authors.map(a => a.name).join(', ')} {s.publication_date ? `(${s.publication_date.split('-')[0]})` : ''}
                  </p>
                )}

                {s.abstract && (
                  <p className="text-xs text-slate-400 line-clamp-2 bg-[#0c101a] p-2.5 rounded border border-[#172033]">
                    {s.abstract}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Documents View */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {documents.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
              <UploadCloud size={32} className="mx-auto text-slate-600" />
              <p className="text-sm font-bold text-slate-300">No documents uploaded yet</p>
              <p className="text-xs text-slate-500">Upload PDF, DOCX, CSV, or XLSX files for full text extraction and chunking.</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-[#0e1422] border border-[#1b253b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-[#151d2f] border border-[#222e47] text-cyan-400 shrink-0">
                    {doc.original_filename.endsWith('.csv') || doc.original_filename.endsWith('.xlsx') ? (
                      <FileSpreadsheet size={20} />
                    ) : (
                      <FileText size={20} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{doc.original_filename}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                      <span>•</span>
                      <span>{doc.page_count || 1} pages</span>
                      <span>•</span>
                      <span>{doc.extracted_text_length.toLocaleString()} characters extracted</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 ${
                    doc.processing_status === 'completed'
                      ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      : doc.processing_status === 'processing'
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  }`}>
                    {doc.processing_status === 'completed' && <CheckCircle2 size={12} />}
                    {doc.processing_status === 'processing' && <Loader2 size={12} className="animate-spin" />}
                    {doc.processing_status === 'failed' && <AlertCircle size={12} />}
                    <span className="capitalize">{doc.processing_status}</span>
                  </span>

                  {doc.processing_status === 'completed' && (
                    <button
                      onClick={() => handleViewChunks(doc)}
                      className="px-3 py-1.5 rounded-lg bg-[#151d2f] hover:bg-[#1d273f] text-cyan-400 border border-[#232f48] text-xs font-medium transition-colors"
                    >
                      View Chunks
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <UploadModal
          projectId={projectId!}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['project-documents', projectId] });
            setUploadModalOpen(false);
          }}
        />
      )}

      {/* Chunk Viewer Modal */}
      {selectedDocChunks && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#232f48] rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1f293d] flex items-center justify-between bg-[#151c2e]">
              <div>
                <h3 className="text-sm font-bold text-white">Extracted Document Chunks</h3>
                <p className="text-[11px] text-cyan-400 font-mono">{selectedDocName} ({selectedDocChunks.length} segments)</p>
              </div>
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3 text-xs">
              {selectedDocChunks.map((chunk, i) => (
                <div key={chunk.id} className="p-3.5 rounded-lg bg-[#0e1422] border border-[#1b253b] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-cyan-400 font-bold">Chunk #{i + 1}</span>
                    <span>Page: {chunk.page_number || 'N/A'} · ~{chunk.token_count || 0} tokens</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed font-sans bg-[#090d16] p-2.5 rounded border border-[#151d2f]">
                    {chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Upload Modal
const UploadModal: React.FC<{
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ projectId, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/v1/projects/${projectId}/documents`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Upload failed');
      }

      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-[#232f48] rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#1f293d] flex items-center justify-between bg-[#151c2e]">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <UploadCloud size={16} className="text-cyan-400" />
            <span>Upload Research Document</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="border-2 border-dashed border-[#243354] rounded-xl p-6 text-center space-y-3 bg-[#0c101a]">
            <UploadCloud size={32} className="mx-auto text-cyan-400" />
            <div>
              <label className="text-cyan-400 font-semibold cursor-pointer hover:underline">
                Click to browse
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  accept=".pdf,.docx,.txt,.md,.csv,.xlsx"
                  className="hidden"
                />
              </label>{' '}
              <span className="text-slate-400">or drop a research file</span>
            </div>
            <p className="text-[10px] text-slate-500">
              PDF, DOCX, TXT, Markdown, CSV, XLSX (Max 20MB)
            </p>
            {file && (
              <div className="pt-2 text-xs font-mono text-emerald-400 font-bold truncate">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
              <span>{isUploading ? 'Extracting Text...' : 'Upload & Process'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
