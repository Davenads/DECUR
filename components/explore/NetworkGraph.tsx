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
  'aawsap', 'aaro', 'uap-task-force', 'immaculate-constellation', 'kona-blue',
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
  contractor:   'Contractor',
};

/* ─── Helpers ────────────────────────────────────────────────── */

// force-graph mutates source/target from strings → resolved node objects at runtime.
// Always extract the string ID regardless of which form it is.
// Handles null/undefined defensively (force-graph may leave dangling refs on filtered links).
const resolveId = (val: string | GraphNode | object | null | undefined): string => {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  return (val as GraphNode).id ?? '';
};

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

// Build a highlight state for a given node
function buildHighlight(nodeId: string, links: GraphLink[]): HighlightState {
  const connectedLinks = links.filter(l => {
    const src = resolveId(l.source);
    const tgt = resolveId(l.target);
    return src === nodeId || tgt === nodeId;
  });
  const nodes = new Set<string>([nodeId]);
  const linkKeys = new Set<string>();
  connectedLinks.forEach(l => {
    const src = resolveId(l.source);
    const tgt = resolveId(l.target);
    nodes.add(src);
    nodes.add(tgt);
    linkKeys.add(`${src}-${tgt}`);
  });
  return { nodes, linkKeys };
}

/* ─── Component ──────────────────────────────────────────────── */

// IDs that have a dedicated /figures/[id] profile page
const profileIds = new Set((insidersIndex as Array<{ id: string }>).map(e => e.id));

const NetworkGraph: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<FGRef>(null);
  const initialFocusDone = useRef(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();
  const [graphWidth, setGraphWidth] = useState<number>(800);
  const [highlight, setHighlight] = useState<HighlightState>(EMPTY_HIGHLIGHT);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [clickedNode, setClickedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [egoNodeId, setEgoNodeId] = useState<string | null>(null);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(
    new Set(Object.keys(TYPE_LABELS) as NodeType[])
  );

  // Ref so hover handler can check click state without it as a dependency
  const clickedNodeRef = useRef<GraphNode | null>(null);
  useEffect(() => { clickedNodeRef.current = clickedNode; }, [clickedNode]);

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
    setTimeout(() => fgRef.current?.zoomToFit?.(300, 60), 80);
  }, []);

  const exitEgoMode = useCallback(() => {
    setEgoNodeId(null);
    setTimeout(() => fgRef.current?.zoomToFit?.(400, 40), 80);
  }, []);

  // Hover: passive highlight only. Does not override an active click selection.
  const handleNodeHover = useCallback((node: object | null) => {
    const gNode = node as GraphNode | null;
    setHoveredNode(gNode);
    // If a node is currently clicked/selected, hover doesn't change the highlight
    if (clickedNodeRef.current) return;
    if (!gNode) {
      setHighlight(EMPTY_HIGHLIGHT);
      return;
    }
    setHighlight(buildHighlight(gNode.id, filteredLinks as GraphLink[]));
  }, [filteredLinks]);

  // Click: always selects the node and shows the action panel.
  // Second click on an already-selected navigable node navigates to its page.
  // Second click on a non-navigable node deselects it.
  const handleNodeClick = useCallback((node: object) => {
    const gNode = node as GraphNode;
    const id = gNode.id;

    if (clickedNodeRef.current?.id === id) {
      // Determine navigability inline so we can act without a separate callback
      const isNav =
        (gNode.type === 'person' && profileIds.has(id)) ||
        (gNode.type === 'document' && DOCUMENT_IDS.has(id)) ||
        (gNode.type === 'case' && CASE_IDS.has(id)) ||
        ((gNode.type === 'organization' || gNode.type === 'project') && PROGRAM_IDS.has(id)) ||
        DEEP_LINK_MAP[id] != null;

      if (isNav) {
        if (gNode.type === 'person') router.push(`/figures/${id}?ref=explore`);
        else if (gNode.type === 'document') router.push(`/documents/${id}?ref=explore`);
        else if (gNode.type === 'case') router.push(`/cases/${id}?ref=explore`);
        else if (gNode.type === 'organization' || gNode.type === 'project') router.push(`/programs/${id}?ref=explore`);
        else if (DEEP_LINK_MAP[id]) router.push(`${DEEP_LINK_MAP[id]}?ref=explore`);
        return;
      }
      // Non-navigable: deselect
      setHighlight(EMPTY_HIGHLIGHT);
      setClickedNode(null);
      return;
    }

    setClickedNode(gNode);
    setHighlight(buildHighlight(id, filteredLinks as GraphLink[]));
  }, [filteredLinks, profileIds, router]);

  // Background click dismisses selection
  const handleBackgroundClick = useCallback(() => {
    setClickedNode(null);
    setHighlight(EMPTY_HIGHLIGHT);
  }, []);

  // Navigate from the action panel to the node's dedicated page
  const navigateToClickedNode = useCallback(() => {
    if (!clickedNode) return;
    const id = clickedNode.id;
    if (clickedNode.type === 'person' && profileIds.has(id)) {
      router.push(`/figures/${id}?ref=explore`);
    } else if (clickedNode.type === 'document' && DOCUMENT_IDS.has(id)) {
      router.push(`/documents/${id}?ref=explore`);
    } else if (clickedNode.type === 'case' && CASE_IDS.has(id)) {
      router.push(`/cases/${id}?ref=explore`);
    } else if ((clickedNode.type === 'organization' || clickedNode.type === 'project') && PROGRAM_IDS.has(id)) {
      router.push(`/programs/${id}?ref=explore`);
    } else if (DEEP_LINK_MAP[id]) {
      router.push(`${DEEP_LINK_MAP[id]}?ref=explore`);
    }
  }, [clickedNode, router]);

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

  // Search result focus: selects the node and zooms to it
  const focusNode = useCallback((node: GraphNode) => {
    setHighlight(buildHighlight(node.id, filteredLinks as GraphLink[]));
    setClickedNode(node);
    setHoveredNode(null);
    // Number.isFinite guards against both null/undefined AND NaN (NaN != null === true in JS,
    // so the old != null check would pass for NaN and fire centerAt(NaN, NaN), causing a
    // console.error inside force-graph's camera system — the source of the "1 Issue" flash).
    if (fgRef.current && Number.isFinite(node.x) && Number.isFinite(node.y)) {
      try {
        fgRef.current.centerAt?.(node.x, node.y, 500);
        fgRef.current.zoom?.(3, 500);
      } catch {
        // Swallow camera errors (e.g. graph not yet fully initialized)
      }
    }
    setSearchQuery('');
    setSearchFocused(false);
    setSearchIndex(-1);
  }, [filteredLinks]);

  // Deep-link focus: if ?node=<id> is in the URL, select and center that node after simulation settles
  const deepLinkNodeId = router.query.node as string | undefined;
  useEffect(() => {
    if (!deepLinkNodeId || initialFocusDone.current) return;
    const timer = setTimeout(() => {
      const target = mergedGraphData.nodes.find(n => n.id === deepLinkNodeId) as GraphNode | undefined;
      if (target) {
        focusNode(target);
        initialFocusDone.current = true;
      }
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepLinkNodeId, focusNode]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex(i => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = searchIndex >= 0 ? searchResults[searchIndex] : searchResults[0];
      if (target) focusNode(target);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setSearchFocused(false);
      setSearchIndex(-1);
    }
  }, [searchResults, searchIndex, focusNode]);

  const nodeCanvasObject = useCallback(
    (node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const gNode = node as GraphNode;
      const id = gNode.id;
      const isHighlighted = highlight.nodes.size === 0 || highlight.nodes.has(id);
      const isSelected = clickedNode?.id === id;
      const baseRadius = Math.sqrt((gNode.val ?? 1) * 6);
      const color = NODE_COLORS[gNode.type] ?? '#9ca3af';
      const x = gNode.x;
      const y = gNode.y;
      if (x == null || y == null) return; // node not yet positioned by simulation

      // Selection ring: outermost, distinct from navigable ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, baseRadius + 6 / globalScale, 0, 2 * Math.PI);
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

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
    [highlight, isDark, clickedNode]
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

  // Derivations for the action panel
  const isClickedNavigable = clickedNode != null && (
    (clickedNode.type === 'person' && profileIds.has(clickedNode.id)) ||
    (clickedNode.type === 'document' && DOCUMENT_IDS.has(clickedNode.id)) ||
    (clickedNode.type === 'case' && CASE_IDS.has(clickedNode.id)) ||
    ((clickedNode.type === 'organization' || clickedNode.type === 'project') && PROGRAM_IDS.has(clickedNode.id)) ||
    DEEP_LINK_MAP[clickedNode.id] != null
  );

  const clickedConnectionCount = useMemo(() => {
    if (!clickedNode) return 0;
    return filteredLinks.filter(l => {
      const src = resolveId(l.source);
      const tgt = resolveId(l.target);
      return src === clickedNode.id || tgt === clickedNode.id;
    }).length;
  }, [clickedNode, filteredLinks]);

  // Hover info (passive, desktop only)
  const hoveredConnectionCount = useMemo(() => {
    if (!hoveredNode) return 0;
    return filteredLinks.filter(l => {
      const src = resolveId(l.source);
      const tgt = resolveId(l.target);
      return src === hoveredNode.id || tgt === hoveredNode.id;
    }).length;
  }, [hoveredNode, filteredLinks]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Relationship Network</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connections between insiders, facilities, entities, organizations, projects, and concepts.
            Tap any node to select it and reveal actions.
          </p>
        </div>
        <button
          onClick={() => fgRef.current?.zoomToFit?.(400, 40)}
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
          onChange={e => { setSearchQuery(e.target.value); setSearchIndex(-1); }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => { setSearchFocused(false); setSearchIndex(-1); }, 150)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search nodes..."
          className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {searchFocused && searchResults.length > 0 && (
          <div className="absolute z-10 left-6 right-6 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            {searchResults.map((node, idx) => (
              <button
                key={node.id}
                onMouseDown={() => focusNode(node)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left ${idx === searchIndex ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
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
      <div ref={containerRef} className="w-full" style={{ height: 520, cursor: hoveredNode != null ? 'pointer' : 'default' }}>
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
          onBackgroundClick={handleBackgroundClick}
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

      {/* Bottom bar: action panel (selected node) or passive hover info or default hint */}
      <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800">
        {clickedNode ? (
          /* Action panel */
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: NODE_COLORS[clickedNode.type] }}
                />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {clickedNode.name}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize shrink-0">
                  {TYPE_LABELS[clickedNode.type]}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                  {clickedConnectionCount} connection{clickedConnectionCount !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => { setClickedNode(null); setHighlight(EMPTY_HIGHLIGHT); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs shrink-0 leading-none pt-0.5"
              >
                ✕
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mb-3">
              {isClickedNavigable && (
                <button
                  onClick={navigateToClickedNode}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
                >
                  {clickedNode?.type === 'document' ? 'View Document →'
                    : clickedNode?.type === 'case' ? 'View Case →'
                    : (clickedNode?.type === 'organization' || clickedNode?.type === 'project') ? 'View Program →'
                    : 'View Profile →'}
                </button>
              )}
              <button
                onClick={() => enterEgoMode(clickedNode)}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Explore connections
              </button>
            </div>

            {/* Connection list */}
            {clickedConnectionCount > 0 && (
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {filteredLinks
                  .filter(l => resolveId(l.source) === clickedNode.id || resolveId(l.target) === clickedNode.id)
                  .map((l) => {
                    const src = resolveId(l.source);
                    const tgt = resolveId(l.target);
                    const isSource = src === clickedNode.id;
                    const otherId = isSource ? tgt : src;
                    const otherNode = filteredNodes.find(n => n.id === otherId);
                    if (!otherNode) return null;
                    return (
                      <div key={`${src}-${tgt}`} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: NODE_COLORS[otherNode.type] }} />
                          <span className="font-medium text-gray-700 dark:text-gray-300">{otherNode.name}</span>
                        </div>
                        <p className="pl-3.5 text-gray-400 dark:text-gray-500 italic leading-snug">{(l as GraphLink).label}</p>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        ) : hoveredNode ? (
          /* Passive hover info - desktop only, no action buttons */
          <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: NODE_COLORS[hoveredNode.type] }}
            />
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
              {hoveredNode.name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 capitalize shrink-0">
              {TYPE_LABELS[hoveredNode.type]}
            </span>
            <span className="text-xs text-gray-300 dark:text-gray-600 shrink-0">·</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {hoveredConnectionCount} connection{hoveredConnectionCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">- click to select</span>
          </div>
        ) : (
          /* Default hint */
          <p className="text-xs text-gray-400 dark:text-gray-500 min-h-[28px] flex items-center">
            Click any node to select it - click again to navigate to its page
          </p>
        )}
      </div>
    </div>
  );
};

export default NetworkGraph;
