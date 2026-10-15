import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquareText,
  Send,
  Sparkles,
  ShieldCheck,
  Plus,
  Loader2,
  Info,
  ExternalLink,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../lib/api-client';
import {
  ResearchConversation,
  ConversationMessage,
  CitationDisplay
} from '@researchsphere/shared';
import { EvidenceDrawer } from '../components/research/EvidenceDrawer';

export const ProjectChatPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [depth, setDepth] = useState<'concise' | 'standard' | 'detailed'>('standard');
  const [selectedCitation, setSelectedCitation] = useState<CitationDisplay | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch project conversations
  const { data: conversations = [], isLoading: convsLoading } = useQuery<ResearchConversation[]>({
    queryKey: ['conversations', projectId],
    queryFn: () => api.get<ResearchConversation[]>(`/projects/${projectId}/conversations`)
  });

  // Select first conversation by default or create one
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<ConversationMessage[]>({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => api.get<ConversationMessage[]>(`/conversations/${selectedConversationId}/messages`),
    enabled: Boolean(selectedConversationId)
  });

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new conversation mutation
  const createConvMutation = useMutation({
    mutationFn: () =>
      api.post<ResearchConversation>(`/projects/${projectId}/conversations`, {
        title: 'New Investigation'
      }),
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations', projectId] });
      setSelectedConversationId(newConv.id);
    }
  });

  // Ask question mutation
  const askMutation = useMutation({
    mutationFn: (q: string) =>
      api.post<ConversationMessage>(`/conversations/${selectedConversationId}/messages`, {
        project_id: projectId,
        question: q,
        response_depth: depth
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      setQuestion('');
    }
  });

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || !selectedConversationId || askMutation.isPending) return;
    askMutation.mutate(question.trim());
  };

  // Render text with clickable citation badges
  const renderMessageContent = (content: string, citations: CitationDisplay[]) => {
    // Regex for [ev_1], [ev_2] etc.
    const parts = content.split(/(\[ev_\d+\])/g);

    return (
      <div className="space-y-2 whitespace-pre-wrap leading-relaxed font-sans text-xs md:text-sm">
        {parts.map((part, idx) => {
          const match = part.match(/\[(ev_\d+)\]/);
          if (match) {
            const evId = match[1];
            const citation = citations.find(c => c.evidence_id === evId);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCitation(citation || { evidence_id: evId, source_title: 'Project Evidence', excerpt: 'Retrieved excerpt' })}
                className="inline-flex items-center space-x-1 mx-1 px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] hover:bg-cyan-900 transition-colors cursor-pointer align-baseline shadow-sm"
                title="Click to view verified evidence excerpt"
              >
                <ShieldCheck size={11} className="text-cyan-400" />
                <span>[{evId}]</span>
              </button>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex min-h-0 bg-[#0a0d14] relative overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-64 bg-[#0d121d] border-r border-[#192233] flex flex-col shrink-0 hidden md:flex">
        <div className="p-3.5 border-b border-[#192233] flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <MessageSquareText size={14} className="text-cyan-400" />
            <span>Threads</span>
          </span>
          <button
            onClick={() => createConvMutation.mutate()}
            disabled={createConvMutation.isPending}
            className="p-1.5 rounded-lg bg-[#151c2c] hover:bg-[#1e273e] text-cyan-400 hover:text-white transition-colors"
            title="Start New Thread"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedConversationId(c.id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between group ${
                selectedConversationId === c.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-[#131b2b]'
              }`}
            >
              <span className="truncate">{c.title || 'Research Thread'}</span>
              <ChevronRight size={13} className="text-slate-600 group-hover:text-cyan-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="p-12 text-center max-w-lg mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-bold text-white">Grounded Research Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ask any question regarding your project literature. Every claim is verified against your indexed excerpts with clickable citations.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setQuestion('What are the main findings and architectural trade-offs across these papers?')}
                  className="px-3 py-1.5 rounded-lg bg-[#121929] hover:bg-[#192338] border border-[#1e2a42] text-xs text-slate-300 transition-colors"
                >
                  "What are the main findings across papers?"
                </button>
                <button
                  onClick={() => setQuestion('Which sources disagree on computational scaling or memory consumption?')}
                  className="px-3 py-1.5 rounded-lg bg-[#121929] hover:bg-[#192338] border border-[#1e2a42] text-xs text-slate-300 transition-colors"
                >
                  "Which sources disagree on complexity?"
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl p-4 md:p-5 space-y-3 shadow-md ${
                      isAssistant
                        ? 'bg-[#0e1422] border border-[#1c273e] text-slate-100'
                        : 'bg-gradient-to-r from-cyan-900/40 to-indigo-900/40 border border-cyan-500/30 text-white'
                    }`}
                  >
                    {isAssistant && (
                      <div className="flex items-center justify-between pb-2 border-b border-[#182338] text-[11px] font-mono">
                        <span className="text-cyan-400 font-bold flex items-center space-x-1">
                          <Sparkles size={12} />
                          <span>ResearchSphere AI ({msg.model_name || 'Gemini 2.5 Flash'})</span>
                        </span>
                        {msg.citations && msg.citations.length > 0 && (
                          <span className="text-emerald-400 flex items-center space-x-1">
                            <ShieldCheck size={12} />
                            <span>{msg.citations.length} Verified Evidence Sources</span>
                          </span>
                        )}
                      </div>
                    )}

                    {renderMessageContent(msg.content, msg.citations || [])}

                    {/* Citations Footer Chips */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-3 border-t border-[#182338] space-y-1.5">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                          Cited Sources (Click to inspect provenance)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.citations.map((c) => (
                            <button
                              key={c.evidence_id}
                              onClick={() => setSelectedCitation(c)}
                              className="px-2.5 py-1 rounded bg-[#131b2e] hover:bg-cyan-950/60 border border-[#222e47] hover:border-cyan-500/40 text-[11px] text-cyan-300 flex items-center space-x-1.5 transition-colors"
                            >
                              <BookOpen size={11} className="text-cyan-400" />
                              <span className="font-semibold">{c.evidence_id}:</span>
                              <span className="truncate max-w-[180px]">{c.source_title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {askMutation.isPending && (
            <div className="flex items-start">
              <div className="p-4 rounded-2xl bg-[#0e1422] border border-[#1c273e] space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-cyan-400 font-mono">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Retrieving project evidence & invoking Gemini...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer */}
        <div className="p-4 bg-[#0d121d] border-t border-[#192233] space-y-2">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question across your research documents (e.g., What are the main contradictions?)..."
              disabled={askMutation.isPending}
              className="flex-1 bg-[#131b2e] border border-[#222e47] rounded-xl px-4 py-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
            <button
              type="submit"
              disabled={!question.trim() || askMutation.isPending}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 disabled:opacity-50 shrink-0"
            >
              <Send size={15} />
              <span>Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center space-x-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>All responses grounded strictly in project evidence registry</span>
            </span>
            <div className="flex items-center space-x-1">
              <span>Depth:</span>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value as any)}
                className="bg-transparent text-cyan-400 font-mono font-medium focus:outline-none cursor-pointer"
              >
                <option value="concise">Concise</option>
                <option value="standard">Standard</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-in Evidence Drawer */}
      <EvidenceDrawer
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
