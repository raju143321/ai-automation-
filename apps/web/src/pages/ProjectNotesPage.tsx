import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  StickyNote,
  Plus,
  Trash2,
  Tag,
  Clock,
  BookOpen,
  Edit2,
  X
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchNote } from '@researchsphere/shared';

export const ProjectNotesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery<ResearchNote[]>({
    queryKey: ['notes', projectId],
    queryFn: () => api.get<ResearchNote[]>(`/projects/${projectId}/notes`)
  });

  // Create note mutation
  const createMutation = useMutation({
    mutationFn: () =>
      api.post<ResearchNote>(`/projects/${projectId}/notes`, {
        project_id: projectId,
        title,
        content,
        tags
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      setTags([]);
    }
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: (noteId: string) =>
      api.delete(`/notes/${noteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', projectId] });
    }
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <StickyNote size={22} className="text-cyan-400" />
            <span>Research Notes & Highlights</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture annotations, synthetic observations, literature excerpts, and methodological notes.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start sm:self-auto transition-all active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>New Note</span>
        </button>
      </div>

      {/* Notes Grid */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-cyan-400 text-xs">Loading research notes...</div>
        ) : notes.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
            <StickyNote size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No notes written yet</p>
            <p className="text-xs text-slate-500">Record observations and findings while reading research papers.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] hover:border-[#273652] transition-all space-y-3 flex flex-col justify-between shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 flex items-center space-x-1">
                      <Clock size={11} />
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </span>
                    <button
                      onClick={() => deleteMutation.mutate(note.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white">{note.title}</h3>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
                    {note.content}
                  </p>
                </div>

                {note.tags && note.tags.length > 0 && (
                  <div className="pt-3 border-t border-[#172136] flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-[#131b2e] text-cyan-400 text-[10px] font-mono border border-[#1e2a42]">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Note Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111726] border border-[#232f48] rounded-xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1f293d] flex items-center justify-between bg-[#151c2e]">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <StickyNote size={16} className="text-cyan-400" />
                <span>Create Research Note</span>
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (title.trim()) createMutation.mutate();
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Note Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Memory bottleneck findings from Vaswani Table 1"
                  required
                  className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Note Content
                </label>
                <textarea
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Record your research insights, analysis, or excerpts..."
                  className="w-full bg-[#131b2e] border border-[#222e47] rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[11px]">
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                    placeholder="Add tag..."
                    className="flex-1 bg-[#131b2e] border border-[#222e47] rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-[#182338] text-cyan-400 rounded-lg"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {tags.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#131b2e] text-cyan-300 text-[11px] font-mono border border-[#1f2b45]">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#1b253b]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || createMutation.isPending}
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
