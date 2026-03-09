import { FC, useRef, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { graphData, NODE_COLORS, NodeType, GraphNode, GraphLink } from '../../data/network-graph';

// SSR-safe import — canvas API requires browser
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

/* ─── Type legend config ─────────────────────────────────────── */

const TYPE_LABELS: Record<NodeType, string> = {
  person:       'Person',
  facility:     'Facility',
  entity:       'Entity / Craft',
  organization: 'Organization',
  project:      'Project',
  concept:      'Concept',
  technology:   'Technology',
};

/* ─── Highlighted node state ─────────────────────────────────── */

interface HighlightState {
  nodes: Set<string>;
  links: Set<GraphLink>;
}

const EMPTY_HIGHLIGHT: HighlightState = { nodes: new Set(), links: new Set() };

/* ─── Component ──────────────────────────────────────────────── */

const NetworkGraph: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<HighlightState>(EMPTY_HIGHLIGHT);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(
    new Set(Object.keys(TYPE_LABELS) as NodeType[])
  );

  // Filter graph data by active type toggles
  const filteredNodes = graphData.nodes.filter(n => activeTypes.has(n.type));
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = graphData.links.filter(
    l => filteredNodeIds.has(l.source as string) && filteredNodeIds.has(l.target as string)
  );
  const filtered = { nodes: filteredNodes, links: filteredLinks };

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node ?? null);
    if (!node) {
      setHighlight(EMPTY_HIGHLIGHT);
      return;
    }
    const connectedLinks = filteredLinks.filter(
      l => (l.source as string) === node.id || (l.target as string) === node.id
    );
    const connectedNodeIds = new Set<string>([node.id]);
    connectedLinks.forEach(l => {
      connectedNodeIds.add(l.source as string);
      connectedNodeIds.add(l.target as string);
    });
    setHighlight({ nodes: connectedNodeIds, links: new Set(connectedLinks) });
  }, [filteredLinks]);

  const toggleType = (type: NodeType) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type); // always keep at least one active
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const nodeCanvasObject = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const id = node.id as string;
      const isHighlighted = highlight.nodes.size === 0 || highlight.nodes.has(id);
      const baseRadius = Math.sqrt((node.val ?? 1) * 6);
      const color = NODE_COLORS[node.type] ?? '#9ca3af';
      const x = node.x as number;
      const y = node.y as number;

      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isHighlighted ? color : `${color}40`;
      ctx.fill();

      if (isHighlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      // Label — always show for highlighted, show above a scale threshold for others
      if (isHighlighted || globalScale > 1.4) {
        const fontSize = Math.max(10 / globalScale, 2.5);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHighlighted ? '#1f2937' : '#9ca3af';
        ctx.fillText(node.name, x, y + baseRadius + 2 / globalScale);
      }
    },
    [highlight]
  );

  const linkColor = useCallback(
    (link: GraphLink) => {
      if (highlight.nodes.size === 0) return '#e5e7eb';
      return highlight.links.has(link) ? '#0077cc' : '#f3f4f6';
    },
    [highlight]
  );

  const linkWidth = useCallback(
    (link: GraphLink) => (highlight.links.has(link) ? 2 : 1),
    [highlight]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 space-y-1">
        <h3 className="font-bold text-gray-900 text-lg">Relationship Network</h3>
        <p className="text-sm text-gray-500">
          Connections between whistleblowers, facilities, entities, organizations, projects, and concepts.
          Hover a node to highlight its connections.
        </p>
      </div>

      {/* Type filter pills */}
      <div className="px-6 pb-3 flex flex-wrap gap-1.5">
        {(Object.keys(TYPE_LABELS) as NodeType[]).map(type => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors border ${
              activeTypes.has(type)
                ? 'text-white border-transparent'
                : 'bg-white text-gray-400 border-gray-200'
            }`}
            style={activeTypes.has(type) ? { backgroundColor: NODE_COLORS[type] } : {}}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Graph canvas */}
      <div ref={containerRef} className="w-full" style={{ height: 520 }}>
        <ForceGraph2D
          graphData={filtered as { nodes: object[]; links: object[] }}
          width={containerRef.current?.clientWidth ?? 800}
          height={520}
          backgroundColor="#fafafa"
          nodeCanvasObject={nodeCanvasObject as (node: object, ctx: CanvasRenderingContext2D, scale: number) => void}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={linkColor as (link: object) => string}
          linkWidth={linkWidth as (link: object) => number}
          onNodeHover={handleNodeHover as (node: object | null) => void}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={(link: object) =>
            highlight.links.has(link as GraphLink) ? 2 : 0
          }
          cooldownTicks={120}
          nodeRelSize={4}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>

      {/* Hover info */}
      <div className="px-6 py-3 border-t border-gray-100 min-h-[48px] flex items-center">
        {hoveredNode ? (
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
            />
            <span className="text-sm font-semibold text-gray-800">{hoveredNode.name}</span>
            <span className="text-xs text-gray-400 capitalize">{TYPE_LABELS[hoveredNode.type]}</span>
            <span className="text-xs text-gray-300">·</span>
            <span className="text-xs text-gray-400">
              {filteredLinks.filter(
                l =>
                  (l.source as string) === hoveredNode.id ||
                  (l.target as string) === hoveredNode.id
              ).length} connections
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Hover a node to inspect connections</p>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;
