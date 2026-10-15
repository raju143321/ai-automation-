import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api-client';
import { KnowledgeNode, KnowledgeEdge } from '@researchsphere/shared';
import { KnowledgeGraphCanvas } from '../components/research/KnowledgeGraphCanvas';

export const ProjectKnowledgePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();

  // Fetch knowledge graph
  const { data: graph = { nodes: [], edges: [] }, isLoading } = useQuery<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }>({
    queryKey: ['knowledge-graph', projectId],
    queryFn: () => api.get<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }>(`/projects/${projectId}/knowledge/graph`)
  });

  // Generate graph mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      api.post(`/projects/${projectId}/knowledge/graph/generate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-graph', projectId] });
    }
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full h-[calc(100vh-140px)] flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Network size={22} className="text-cyan-400" />
            <span>Interactive Concept Graph</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize relationships between research topics, concepts, findings, and claims backed by retrieved literature.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KnowledgeGraphCanvas
          nodes={graph.nodes}
          edges={graph.edges}
          onGenerate={() => generateMutation.mutate()}
          isGenerating={generateMutation.isPending}
        />
      </div>
    </div>
  );
};
