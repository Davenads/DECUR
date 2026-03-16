import { FC, useRef, useCallback, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import { graphData, NODE_COLORS, NodeType, GraphNode, GraphLink } from '../../data/network-graph';
import insidersIndex from '../../data/key-figures/index.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FGRef = any;

// Val overrides for particularly prominent figures
const VAL_OVERRIDES: Record<string, number> = {
  'dan-burisch': 5, 'bob-lazar': 5, 'david-grusch': 5,
  'luis-elizondo': 5, 'david-fravor': 5,
};

// Document node IDs that have dedicated /documents/[id] pages
const DOCUMENT_IDS = new Set(graphData.nodes.filter(n => n.type === 'document').map(n => n.id));

// Case node IDs that have dedicated /cases/[id] pages
const CASE_IDS = new Set(graphData.nodes.filter(n => n.type === 'case').map(n => n.id));

// Program node IDs that have dedicated /programs/[id] pages
const PROGRAM_IDS = new Set([
  'project-blue-book', 'project-sign', 'project-grudge',
  'aawsap', 'aaro', 'immaculate-constellation', 'kona-blue',
  'ttsa', 'sol-foundation', 'nids', 'bigelow-aerospace',
  'nicap', 'mufon', 'jsoc', 'afosi', 'ipu', 'oga', 'sdi', 'seti',
]);

// Deep links for concept/technology/facility nodes that are best explained
// within a specific profile's feature tab rather than a standalone page.
// Format: nodeId -> URL path to navigate to on click
const DEEP_LINK_MAP: Record<string, string> = {
  // Burisch concepts
  'looking-glass':      '/figures/dan-burisch',
  'stargates':          '/figures/dan-burisch',
  'timeline-1':         '/figures/dan-burisch',
  'timeline-2':         '/figures/dan-burisch',
  'ganesh-particles':   '/figures/dan-burisch',
  'shiva-portals':      '/figures/dan-burisch',
  'project-aquarius':   '/figures/dan-burisch',
  'project-lotus':      '/figures/dan-burisch',
  'project-crystal':    '/figures/dan-burisch',
  'project-preserve':   '/figures/dan-burisch',
  'chielah':            '/figures/dan-burisch',
  'majestic-12':        '/figures/dan-burisch',
  // Lazar tech
  'element-115':        '/figures/bob-lazar',
  'gravity-amplifiers': '/figures/bob-lazar',
  'sport-model':        '/figures/bob-lazar',
  'gravity-waves':      '/figures/bob-lazar',
  'project-galileo':    '/figures/bob-lazar',
  's4-papoose':         '/figures/bob-lazar',
  // Elizondo concepts
  'five-observables':   '/figures/luis-elizondo',
  'aatip':              '/figures/luis-elizondo',
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
  case:         'Case',
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

// IDs that have a dedicated /figures/[id] profile page
const profileIds = new Set((insidersIndex as Array<{ id: string }>).map(e => e.id));

const NetworkGraph: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<FGRef>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();
  const [graphWidth, setGraphWidth] = useState<number>(800);
  const [highlight, setHighlight] = useState<HighlightState>(EMPTY_HIGHLIGHT);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [clickedNode, setClickedNode] = useState<GraphNode | null>(null);
  const [egoNodeId, setEgoNodeId] = useState<string | null>(null);
  const hoverClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Ego network: 1-hop subgraph around egoNodeId
  const egoNode = useMemo(
    () => (egoNodeId ? filteredNodes.find(n => n.id === egoNodeId) ?? null : null),
    [egoNodeId, filteredNodes]
  );
  const egoData = useMemo(() => {
    if (!egoNodeId) return null;
    const connectedLinks = filteredLinks.filter(l =>
      resolveId(l.source) === egoNodeId || resolveId(l.target) === egoNodeId
    );
    const neighborIds = new Set<string>([egoNodeId]);
    connectedLinks.forEach(l => {
      neighborIds.add(resolveId(l.source));
      neighborIds.add(resolveId(l.target));
    });
    return {
      nodes: filteredNodes.filter(n => neighborIds.has(n.id)),
      links: connectedLinks,
    };
  }, [egoNodeId, filteredNodes, filteredLinks]);

  // Active graph data: ego subgraph when active, otherwise full filtered graph
  const activeData = egoData ?? filtered;

  const enterEgoMode = useCallback((node: GraphNode) => {
    setEgoNodeId(node.id);
    setHighlight(EMPTY_HIGHLIGHT);
    setClickedNode(null);
    setTimeout(() => fgRef.current?.zoomToFit(300, 60), 80);
  }, []);

  const exitEgoMode = useCallback(() => {
    setEgoNodeId(null);
    setTimeout(() => fgRef.current?.zoomToFit(400, 40), 80);
  }, []);

  // Freeze node positions after the simulation converges so filter toggles
  // don't re-run the physics layout from scratch.
  const handleEngineStop = useCallback(() => {
    const nodes = (fgRef.current?.graphData()?.nodes ?? []) as GraphNode[];
    nodes.forEach(n => {
      if (n.x != null && n.y != null) {
        n.fx = n.x;
        n.fy = n.y;
      }
    });
  }, []);

  const handleNodeHover = useCallback((node: object | null) => {
    const gNode = node as GraphNode | null;
    // Clear any pending debounced hover-clear
    if (hoverClearTimer.current) {
      clearTimeout(hoverClearTimer.current);
      hoverClearTimer.current = null;
    }
    if (!gNode) {
      // Debounce the clear by 200ms so the user can reach the Explore button
      hoverClearTimer.current = setTimeout(() => {
        setHoveredNode(null);
        setHighlight(EMPTY_HIGHLIGHT);
      }, 200);
      return;
    }
    setHoveredNode(gNode);
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

  const handleNodeClick = useCallback((node: object) => {
    const gNode = node as GraphNode;
    if (gNode.type === 'person' && profileIds.has(gNode.id)) {
      router.push(`/figures/${gNode.id}?ref=explore`);
    } else if (gNode.type === 'document' && DOCUMENT_IDS.has(gNode.id)) {
      router.push(`/documents/${gNode.id}?ref=explore`);
    } else if (gNode.type === 'case' && CASE_IDS.has(gNode.id)) {
      router.push(`/cases/${gNode.id}?ref=explore`);
    } else if ((gNode.type === 'organization' || gNode.type === 'project') && PROGRAM_IDS.has(gNode.id)) {
      router.push(`/programs/${gNode.id}?ref=explore`);
    } else if (DEEP_LINK_MAP[gNode.id]) {
      router.push(`${DEEP_LINK_MAP[gNode.id]}?ref=explore`);
    } else {
      // Non-navigable node: show info panel
      setClickedNode(prev => prev?.id === gNode.id ? null : gNode);
    }
  }, [router]);

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

      // Navigable ring: draw before fill so it sits behind the main circle
      const isNavigable =
        (gNode.type === 'person' && profileIds.has(id)) ||
        (gNode.type === 'document' && DOCUMENT_IDS.has(id)) ||
        (gNode.type === 'case' && CASE_IDS.has(id)) ||
        ((gNode.type === 'organization' || gNode.type === 'project') && PROGRAM_IDS.has(id)) ||
        DEEP_LINK_MAP[id] != null;
      if (isNavigable) {
        ctx.beginPath();
        ctx.arc(x, y, baseRadius + 3 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = isHighlighted ? `${color}cc` : `${color}44`;
        ctx.lineWidth = 1.5 / globalScale;
        ctx.stroke();
      }

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

  // Whether the currently hovered node navigates somewhere on click
  const isHoveredNavigable = hoveredNode != null && (
    (hoveredNode.type === 'person' && profileIds.has(hoveredNode.id)) ||
    (hoveredNode.type === 'document' && DOCUMENT_IDS.has(hoveredNode.id)) ||
    (hoveredNode.type === 'case' && CASE_IDS.has(hoveredNode.id)) ||
    ((hoveredNode.type === 'organization' || hoveredNode.type === 'project') && PROGRAM_IDS.has(hoveredNode.id)) ||
    (DEEP_LINK_MAP[hoveredNode.id] != null)
  );

  // Count connections for the hover info bar (resolve IDs properly)
  const hoveredConnectionCount = hoveredNode
    ? filteredLinks.filter(l => {
        const src = resolveId(l.source);
        const tgt = resolveId(l.target);
        return src === hoveredNode.id || tgt === hoveredNode.id;
      }).length
    : 0;

  // Cleanup hover timer on unmount
  useEffect(() => () => { if (hoverClearTimer.current) clearTimeout(hoverClearTimer.current); }, []);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Relationship Network</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connections between insiders, facilities, entities, organizations, projects, and concepts.
            Search or hover a node to highlight its connections.
          </p>
        </div>
        <button
          onClick={() => fgRef.current?.zoomToFit(400, 40)}
          className="shrink-0 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
        >
          Reset View
        </button>
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

      {/* Type filter pills OR ego mode banner */}
      {egoNodeId ? (
        <div className="px-6 pb-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: egoNode ? NODE_COLORS[egoNode.type] : '#9ca3af' }}
            />
            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
              Exploring connections for <span className="font-semibold">{egoNode?.name}</span>
            </span>
          </div>
          <button
            onClick={exitEgoMode}
            className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
          >
            ← Exit
          </button>
        </div>
      ) : (
        <div className="px-6 pb-2 flex flex-wrap gap-1.5">
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
      )}

      {/* Graph stats */}
      <div className="px-6 pb-3">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {activeData.nodes.length} nodes · {activeData.links.length} edges
        </span>
      </div>

      {/* Graph canvas */}
      <div ref={containerRef} className="w-full" style={{ height: 520, cursor: isHoveredNavigable || hoveredNode != null ? 'pointer' : 'default' }}>
        <ForceGraph2D
          ref={fgRef}
          graphData={activeData as { nodes: object[]; links: object[] }}
          width={graphWidth}
          height={520}
          backgroundColor="transparent"
          nodeCanvasObject={nodeCanvasObject}
          nodeCanvasObjectMode={() => 'replace'}
          linkColor={linkColor}
          linkWidth={linkWidth}
          onNodeHover={handleNodeHover}
          onNodeClick={handleNodeClick}
          onEngineStop={handleEngineStop}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.004}
          linkDirectionalParticleWidth={particleWidth}
          warmupTicks={80}
          cooldownTicks={120}
          nodeRelSize={4}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
        />
      </div>

      {/* Hover info */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 min-h-[48px] flex items-center justify-between gap-3">
        {hoveredNode ? (
          <>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{hoveredNode.name}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize shrink-0">{TYPE_LABELS[hoveredNode.type]}</span>
              <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">·</span>
              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{hoveredConnectionCount} connections</span>
              {isHoveredNavigable ? (
                <span className="text-xs text-primary font-medium ml-1 shrink-0">Click to view →</span>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 shrink-0">Click for details</span>
              )}
            </div>
            <button
              onMouseDown={() => enterEgoMode(hoveredNode)}
              className="shrink-0 text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
            >
              Explore
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">Hover a node to inspect connections · Click any node for details or to navigate</p>
        )}
      </div>

      {/* Clicked node info panel */}
      {clickedNode && (
        <div className="mx-6 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[clickedNode.type] }} />
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{clickedNode.name}</h4>
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize">{TYPE_LABELS[clickedNode.type]}</span>
            </div>
            <button
              onClick={() => setClickedNode(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5">
            {filteredLinks
              .filter(l => resolveId(l.source) === clickedNode.id || resolveId(l.target) === clickedNode.id)
              .map((l, i) => {
                const src = resolveId(l.source);
                const tgt = resolveId(l.target);
                const isSource = src === clickedNode.id;
                const otherId = isSource ? tgt : src;
                const otherNode = filteredNodes.find(n => n.id === otherId);
                if (!otherNode) return null;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[otherNode.type] }} />
                    <span className="text-gray-500 dark:text-gray-400 italic shrink-0">{(l as GraphLink).label}</span>
                    <span className="text-gray-700 dark:text-gray-300">{otherNode.name}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkGraph;
