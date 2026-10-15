import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  AlertCircle,
  Filter,
  Loader2,
  Quote,
  Edit2
} from 'lucide-react';
import { api } from '../lib/api-client';
import { ResearchClaim, ClaimAssessment, CLAIM_ASSESSMENTS } from '@researchsphere/shared';

export const ProjectClaimsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [filterAssessment, setFilterAssessment] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<ResearchClaim | null>(null);

  // Fetch claims
  const { data: claims = [], isLoading } = useQuery<ResearchClaim[]>({
    queryKey: ['claims', projectId],
    queryFn: () => api.get<ResearchClaim[]>(`/projects/${projectId}/claims`)
  });

  // Extract claims mutation
  const extractMutation = useMutation({
    mutationFn: () =>
      api.post<ResearchClaim[]>(`/projects/${projectId}/claims/extract`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', projectId] });
    }
  });

  // Update claim assessment mutation
  const updateClaimMutation = useMutation({
    mutationFn: ({ claimId, assessment }: { claimId: string; assessment: ClaimAssessment }) =>
      api.patch<ResearchClaim>(`/claims/${claimId}`, { assessment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', projectId] });
    }
  });

  const filteredClaims = filterAssessment === 'all'
    ? claims
    : claims.filter(c => c.assessment === filterAssessment);

  const getAssessmentBadge = (assessment: ClaimAssessment) => {
    switch (assessment) {
      case 'supported':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
            <CheckCircle2 size={11} />
            <span>SUPPORTED</span>
          </span>
        );
      case 'partially_supported':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 flex items-center space-x-1">
            <HelpCircle size={11} />
            <span>PARTIALLY SUPPORTED</span>
          </span>
        );
      case 'contradicted':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center space-x-1">
            <AlertTriangle size={11} />
            <span>CONTRADICTED</span>
          </span>
        );
      case 'insufficient_evidence':
      case 'requires_human_verification':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center space-x-1">
            <AlertCircle size={11} />
            <span>{assessment.replace('_', ' ').toUpperCase()}</span>
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldCheck size={22} className="text-cyan-400" />
            <span>Claim & Evidence Explorer</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate individual research assertions against retrieved project literature. Classifications reflect evidentiary backing, not absolute truth.
          </p>
        </div>

        <button
          onClick={() => extractMutation.mutate()}
          disabled={extractMutation.isPending}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 flex items-center space-x-2 self-start sm:self-auto transition-all disabled:opacity-50"
        >
          {extractMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span>{extractMutation.isPending ? 'Extracting Claims...' : 'Extract Claims from Evidence'}</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-3 bg-[#0e1422] p-2.5 rounded-xl border border-[#1b253b] text-xs">
        <Filter size={14} className="text-slate-400 ml-1" />
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Filter Status:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterAssessment('all')}
            className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
              filterAssessment === 'all'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-[#131b2e]'
            }`}
          >
            All ({claims.length})
          </button>
          {CLAIM_ASSESSMENTS.map((ass) => {
            const count = claims.filter(c => c.assessment === ass).length;
            return (
              <button
                key={ass}
                onClick={() => setFilterAssessment(ass)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors capitalize ${
                  filterAssessment === ass
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-[#131b2e]'
                }`}
              >
                {ass.replace('_', ' ')} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-cyan-400 text-xs">Loading verified claims...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#0e1422] border border-[#1b253b] space-y-2">
            <ShieldCheck size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No claims extracted yet</p>
            <p className="text-xs text-slate-500">Click "Extract Claims from Evidence" to scan your documents for material findings.</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="p-5 rounded-xl bg-[#0e1422] border border-[#1b253b] hover:border-[#273652] transition-all space-y-3 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#182338]">
                <div className="flex items-center space-x-2">
                  {getAssessmentBadge(claim.assessment)}
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#141d2f] text-slate-400 border border-[#212e47] uppercase">
                    Type: {claim.claim_type}
                  </span>
                  {claim.confidence !== null && (
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                      Confidence: {Math.round(claim.confidence * 100)}%
                    </span>
                  )}
                </div>

                {/* Status Changer */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-[10px] text-slate-400">Reclassify:</span>
                  <select
                    value={claim.assessment}
                    onChange={(e) => updateClaimMutation.mutate({ claimId: claim.id, assessment: e.target.value as any })}
                    className="bg-[#141b2c] border border-[#222e47] rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {CLAIM_ASSESSMENTS.map((a) => (
                      <option key={a} value={a}>{a.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Claim Statement */}
              <h3 className="text-sm font-bold text-white leading-relaxed">
                "{claim.claim_text}"
              </h3>

              {/* Rationale */}
              {claim.rationale && (
                <div className="text-xs text-slate-300 bg-[#121929] p-3 rounded-lg border border-[#1d273d]">
                  <strong className="text-cyan-400 font-mono text-[11px] block mb-0.5">Assessment Rationale:</strong>
                  {claim.rationale}
                </div>
              )}

              {/* Evidence Items */}
              {claim.evidence_items && claim.evidence_items.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    Linked Supporting Evidence
                  </div>
                  <div className="space-y-1.5">
                    {claim.evidence_items.map((ev) => (
                      <div key={ev.id} className="p-3 rounded-lg bg-[#0b0f1a] border border-[#161f33] space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-emerald-400 font-bold uppercase">{ev.evidence_relation}</span>
                          {ev.page_number && <span className="text-slate-400">Page {ev.page_number}</span>}
                        </div>
                        <p className="text-slate-300 italic">"{ev.excerpt}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
