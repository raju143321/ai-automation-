import React, { useState } from 'react';
import { KnowledgeNode, KnowledgeEdge } from '@researchsphere/shared';
import { Network, Sparkles, Filter, Info, ShieldCheck } from 'lucide-react';

interface KnowledgeGraphCanvasProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const KnowledgeGraphCanvas: React.FC<KnowledgeGraphCanvasProps> = ({
  nodes,
  edges,
  onGenerate,
  isGenerating
}) => {
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNodes = filterType === 'all'
    ? nodes
    : nodes.filter(n => n.node_type === filterType);

  // Position nodes in a clean circular layout for deterministic high aesthetic rendering
  const width = 800;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 170;

  const nodePositions = new Map<string, { x: number; y: number }>();
  filteredNodes.forEach((node, i) => {
    const angle = (i / Math.max(1, filteredNodes.length)) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    nodePositions.set(node.id, { x, y });
  });

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'concept': return '#06b6d4'; // Cyan
      case 'finding': return '#10b981'; // Emerald
      case 'claim': return '#6366f1'; // Indigo
      case 'topic': return '#8b5cf6'; // Violet
      default: return '#94a3b8';
    }
  };

  const getEdgeStroke = (relation: string) => {
    switch (relation) {
      case 'supports': return '#10b981';
      case 'contradicts': return '#f43f5e';
      case 'derived_from': return '#06b6d4';
      default: return '#6366f1';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0d14] rounded-xl border border-[#192233] overflow-hidden">
      {/* Controls Bar */}
      <div className="p-3.5 bg-[#0f1523] border-b border-[#1b253b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Network size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Concept Relationship Graph</h3>
            <div className="text-[11px] text-slate-400">
              {filteredNodes.length} nodes · {edges.length} evidence-backed relationships
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter */}
          <div className="flex items-center space-x-1.5 bg-[#141c2c] px-2 py-1 rounded-lg border border-[#202b42] text-xs">
            <Filter size={12} className="text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="concept">Concepts</option>
              <option value="finding">Findings</option>
              <option value="claim">Claims</option>
              <option value="topic">Topics</option>
            </select>
          </div>

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-medium flex items-center space-x-1.5 shadow-md shadow-cyan-500/10 transition-colors disabled:opacity-50"
          >
            <Sparkles size={13} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Synthesizing...' : 'Extract Graph'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Detail Split */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* SVG Canvas */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full max-h-[550px]">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
            </defs>

            {/* Grid background dots */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#182236" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Center orbit circle */}
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#161f33" strokeDasharray="4 4" />

            {/* Edges */}
            {edges.map((edge) => {
              const srcPos = nodePositions.get(edge.source_node_id);
              const tgtPos = nodePositions.get(edge.target_node_id);
              if (!srcPos || !tgtPos) return null;

              const isConnected = selectedNode && (selectedNode.id === edge.source_node_id || selectedNode.id === edge.target_node_id);

              return (
                <g key={edge.id} className="transition-opacity duration-200">
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={getEdgeStroke(edge.relation_type)}
                    strokeWidth={isConnected ? 2.5 : 1.5}
                    strokeOpacity={selectedNode ? (isConnected ? 0.9 : 0.15) : 0.6}
                    markerEnd="url(#arrow)"
                  />
                  {/* Relation label */}
                  <text
                    x={(srcPos.x + tgtPos.x) / 2}
                    y={(srcPos.y + tgtPos.y) / 2 - 4}
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none bg-slate-900"
                  >
                    {edge.relation_type}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const pos = nodePositions.get(node.id);
              if (!pos) return null;
              const isSelected = selectedNode?.id === node.id;
              const color = getNodeColor(node.node_type);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 22 : 18}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all duration-200 drop-shadow-lg"
                  />
                  <circle
                    r={isSelected ? 10 : 7}
                    fill={color}
                    className="transition-all duration-200"
                  />
                  <text
                    y={32}
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize="11"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                    className="select-none"
                  >
                    {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Inspector Drawer */}
        {selectedNode && (
          <div className="w-full lg:w-80 bg-[#0d1320] border-t lg:border-t-0 lg:border-l border-[#1d273d] p-4 flex flex-col justify-between text-xs animate-in slide-in-from-right duration-150">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b253b]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                  {selectedNode.node_type}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-white mb-1">{selectedNode.label}</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedNode.description || 'Core concept extracted from project literature.'}
                </p>
              </div>

              {/* Connected edges */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Relationships
                </div>
                <div className="space-y-1.5">
                  {edges
                    .filter(e => e.source_node_id === selectedNode.id || e.target_node_id === selectedNode.id)
                    .map(e => {
                      const otherNodeId = e.source_node_id === selectedNode.id ? e.target_node_id : e.source_node_id;
                      const otherNode = nodes.find(n => n.id === otherNodeId);
                      const isSource = e.source_node_id === selectedNode.id;

                      return (
                        <div key={e.id} className="p-2 rounded bg-[#131b2e] border border-[#202b44] text-[11px]">
                          <span className="font-mono text-cyan-400 font-bold uppercase">{e.relation_type}</span>{' '}
                          <span className="text-slate-400">{isSource ? '→' : '←'}</span>{' '}
                          <span className="text-white font-medium">{otherNode?.label || 'Linked Node'}</span>
                          {e.confidence && (
                            <div className="text-[10px] text-emerald-400 mt-0.5">
                              Confidence: {Math.round(e.confidence * 100)}%
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#1b253b] text-[11px] text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
              <span>Evidence-grounded graph node</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
