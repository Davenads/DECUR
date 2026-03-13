import { FC, useRef, useCallback, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { graphData, NODE_COLORS, NodeType, GraphNode, GraphLink } from '../../data/network-graph';
import insidersIndex from '../../data/insiders/index.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FGRef = any;

// Val overrides for particularly prominent figures
const VAL_OVERRIDES: Record<string, number> = {
  'dan-burisch': 5, 'bob-lazar': 5, 'david-grusch': 5,
  'luis-elizondo': 5, 'david-fravor': 5,
};

// Derive person nodes from the insiders index, merging with manually-defined nodes
const existingIds = new Set(graphData.nodes.map(n => n.id));
const derivedPersonNodes: GraphNode[] = (insidersIndex as Array<{ id: string; name: string; includeInExplore?: boolean }>)
  .filter(e => !existingIds.has(e.id))
  .map(e => ({
    id: e.id,
    name: e.name,
    type: 'person' as NodeType,
    val: VAL_OVERRIDES[e.id] ?? (e.includeInExplore ? 4 : 2),
  }));

const mergedGraphData = {
  nodes: [...graphData.nodes, ...derivedPersonNodes],
  links: graphData.links,
};

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
  document:     'Document',
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
  const fgRef = useRef<FGRef>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [graphWidth, setGraphWidth] = useState<number>(800);
  const [highlight, setHighlight] = useState<HighlightState>(EMPTY_HIGHLIGHT);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setGraphWidth(el.clientWidth || 800);
    const observer = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setGraphWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(
    new Set(Object.keys(TYPE_LABELS) as NodeType[])
  );

  // Memoize filtered data — only recompute when activeTypes changes, NOT on every hover re-render.
  // Stable object references prevent ForceGraph2D from reheating the physics simulation.
  const filteredNodes = useMemo(
    () => mergedGraphData.nodes.filter(n => activeTypes.has(n.type)),
    [activeTypes]
  );
  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map(n => n.id)),
    [filteredNodes]
  );
  const filteredLinks = useMemo(
    () => mergedGraphData.links.filter(
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

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return filteredNodes.filter(n => n.name.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, filteredNodes]);

  const focusNode = useCallback((node: GraphNode) => {
    const connectedLinks = filteredLinks.filter(l => {
      const src = resolveId(l.source);
      const tgt = resolveId(l.target);
      return src === node.id || tgt === node.id;
    });
    const connectedNodeIds = new Set<string>([node.id]);
    const keys = new Set<string>();
    connectedLinks.forEach(l => {
      const src = resolveId(l.source);
      const tgt = resolveId(l.target);
      connectedNodeIds.add(src);
      connectedNodeIds.add(tgt);
      keys.add(`${src}-${tgt}`);
    });
    setHighlight({ nodes: connectedNodeIds, linkKeys: keys });
    setHoveredNode(node);
    if (fgRef.current && node.x != null && node.y != null) {
      fgRef.current.centerAt(node.x, node.y, 500);
      fgRef.current.zoom(3, 500);
    }
    setSearchQuery('');
    setSearchFocused(false);
  }, [filteredLinks]);

  const nodeCanvasObject = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode;
      const id = gNode.id;
      const isHighlighted = highlight.nodes.size === 0 || highlight.nodes.has(id);
      const baseRadius = Math.sqrt((gNode.val ?? 1) * 6);
      const color = NODE_COLORS[gNode.type] ?? '#9ca3af';
      const x = gNode.x;
      const y = gNode.y;
      if (x == null || y == null) return; // node not yet positioned by simulation

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
        ctx.fillStyle = isHighlighted ? (isDark ? '#f3f4f6' : '#1f2937') : '#9ca3af';
        ctx.fillText(gNode.name, x, y + baseRadius + 2 / globalScale);
      }
    },
    [highlight, isDark]
  );

  const linkColor = useCallback(
    (link: object) => {
      if (highlight.nodes.size === 0) return isDark ? '#4b5563' : '#d1d5db';
      return highlight.linkKeys.has(linkKey(link)) ? '#0077cc' : (isDark ? '#374151' : '#e9eaec');
    },
    [highlight, isDark]
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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 space-y-1">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Relationship Network</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Connections between insiders, facilities, entities, organizations, projects, and concepts.
          Search or hover a node to highlight its connections.
        </p>
      </div>

      {/* Search */}
      <div className="px-6 pb-3 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          placeholder="Search nodes..."
          className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {searchFocused && searchResults.length > 0 && (
          <div className="absolute z-10 left-6 right-6 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {searchResults.map(node => (
              <button
                key={node.id}
                onMouseDown={() => focusNode(node)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[node.type] }} />
                <span className="text-sm text-gray-800 dark:text-gray-200">{node.name}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{TYPE_LABELS[node.type]}</span>
              </button>
            ))}
          </div>
        )}
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
                : 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600'
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
          ref={fgRef}
          graphData={filtered as { nodes: object[]; links: object[] }}
          width={graphWidth}
          height={520}
          backgroundColor="transparent"
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
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 min-h-[48px] flex items-center">
        {hoveredNode ? (
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
            />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{hoveredNode.name}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{TYPE_LABELS[hoveredNode.type]}</span>
            <span className="text-xs text-gray-300 dark:text-gray-600">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{hoveredConnectionCount} connections</span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">Hover a node to inspect connections</p>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;
