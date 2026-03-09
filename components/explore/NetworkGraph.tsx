import { FC, useRef, useCallback, useState, useMemo } from 'react';
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

/* ─── Helpers ────────────────────────────────────────────────── */

// force-graph mutates source/target from strings → resolved node objects at runtime.
// Always extract the string ID regardless of which form it is.
const resolveId = (val: string | GraphNode | object): string =>
  typeof val === 'string' ? val : (val as GraphNode).id;

const linkKey = (link: GraphLink | object): string => {
  const l = link as GraphLink;
  return `${resolveId(l.source)}-${resolveId(l.target)}`;
};

/* ─── Highlight state ────────────────────────────────────────── */

interface HighlightState {
  nodes: Set<string>;   // highlighted node IDs
  linkKeys: Set<string>; // "sourceId-targetId" keys
}

const EMPTY_HIGHLIGHT: HighlightState = { nodes: new Set(), linkKeys: new Set() };

/* ─── Component ──────────────────────────────────────────────── */

const NetworkGraph: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<HighlightState>(EMPTY_HIGHLIGHT);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(
    new Set(Object.keys(TYPE_LABELS) as NodeType[])
  );

  // Memoize filtered data — only recompute when activeTypes changes, NOT on every hover re-render.
  // Stable object references prevent ForceGraph2D from reheating the physics simulation.
  const filteredNodes = useMemo(
    () => graphData.nodes.filter(n => activeTypes.has(n.type)),
    [activeTypes]
  );
  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map(n => n.id)),
    [filteredNodes]
  );
  const filteredLinks = useMemo(
    () => graphData.links.filter(
      l => filteredNodeIds.has(resolveId(l.source)) && filteredNodeIds.has(resolveId(l.target))
    ),
    [filteredNodeIds]
  );
  const filtered = useMemo(
    () => ({ nodes: filteredNodes, links: filteredLinks }),
    [filteredNodes, filteredLinks]
  );

  const handleNodeHover = useCallback((node: object | null) => {
    const gNode = node as GraphNode | null;
    setHoveredNode(gNode ?? null);
    if (!gNode) {
      setHighlight(EMPTY_HIGHLIGHT);
      return;
    }
    const nodeId = gNode.id;
    // filteredLinks may have already-resolved objects from a previous render cycle
    const connectedLinks = filteredLinks.filter(l => {
      const src = resolveId(l.source);
      const tgt = resolveId(l.target);
      return src === nodeId || tgt === nodeId;
    });
    const connectedNodeIds = new Set<string>([nodeId]);
    const keys = new Set<string>();
    connectedLinks.forEach(l => {
      const src = resolveId(l.source);
      const tgt = resolveId(l.target);
      connectedNodeIds.add(src);
      connectedNodeIds.add(tgt);
      keys.add(`${src}-${tgt}`);
    });
    setHighlight({ nodes: connectedNodeIds, linkKeys: keys });
  }, [filteredLinks]);

  const toggleType = (type: NodeType) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const nodeCanvasObject = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode;
      const id = gNode.id;
      const isHighlighted = highlight.nodes.size === 0 || highlight.nodes.has(id);
      const baseRadius = Math.sqrt((gNode.val ?? 1) * 6);
      const color = NODE_COLORS[gNode.type] ?? '#9ca3af';
      const x = gNode.x as number;
      const y = gNode.y as number;

      ctx.beginPath();
      ctx.arc(x, y, baseRadius, 0, 2 * Math.PI);
      ctx.fillStyle = isHighlighted ? color : `${color}40`;
      ctx.fill();

      if (isHighlighted) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

      if (isHighlighted || globalScale > 1.4) {
        const fontSize = Math.max(10 / globalScale, 2.5);
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isHighlighted ? '#1f2937' : '#9ca3af';
        ctx.fillText(gNode.name, x, y + baseRadius + 2 / globalScale);
      }
    },
    [highlight]
  );

  const linkColor = useCallback(
    (link: object) => {
      if (highlight.nodes.size === 0) return '#d1d5db';
      return highlight.linkKeys.has(linkKey(link)) ? '#0077cc' : '#e9eaec';
    },
    [highlight]
  );

  const linkWidth = useCallback(
    (link: object) => (highlight.nodes.size > 0 && highlight.linkKeys.has(linkKey(link)) ? 2.5 : 1),
    [highlight]
  );

  const particleWidth = useCallback(
    (link: object) => (highlight.nodes.size > 0 && highlight.linkKeys.has(linkKey(link)) ? 2 : 0),
    [highlight]
  );

  // Count connections for the hover info bar (resolve IDs properly)
  const hoveredConnectionCount = hoveredNode
    ? filteredLinks.filter(l => {
        const src = resolveId(l.source);
        const tgt = resolveId(l.target);
        return src === hoveredNode.id || tgt === hoveredNode.id;
      }).length
    : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 space-y-1">
        <h3 className="font-bold text-gray-900 text-lg">Relationship Network</h3>
        <p className="text-sm text-gray-500">
          Connections between insiders, facilities, entities, organizations, projects, and concepts.
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
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeHover={handleNodeHover}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={particleWidth}
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
            <span className="text-xs text-gray-400">{hoveredConnectionCount} connections</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Hover a node to inspect connections</p>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;
