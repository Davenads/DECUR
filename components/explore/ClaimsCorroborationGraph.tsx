import { FC, useRef, useCallback, useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/router';
import {
  claimsGraphData,
  CLAIM_CATEGORIES,
  FIGURE_TYPE_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  ClaimNode,
  ClaimLink,
} from '../../data/claims-network';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FGRef = any;

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// force-graph mutates source/target from strings to node objects at runtime
const resolveId = (val: string | ClaimNode | object): string =>
  typeof val === 'string' ? val : (val as ClaimNode).id;

const linkKey = (l: ClaimLink): string =>
  `${resolveId(l.source)}-${resolveId(l.target)}`;

interface HighlightState {
  nodes: Set<string>;
  linkKeys: Set<string>;
}
const EMPTY_HL: HighlightState = { nodes: new Set(), linkKeys: new Set() };

function buildHighlight(nodeId: string, links: ClaimLink[]): HighlightState {
  const connected = links.filter(l => resolveId(l.source) === nodeId || resolveId(l.target) === nodeId);
  const nodes = new Set<string>([nodeId]);
  const lks = new Set<string>();
  connected.forEach(l => {
    nodes.add(resolveId(l.source));
    nodes.add(resolveId(l.target));
    lks.add(linkKey(l));
  });
  return { nodes, linkKeys: lks };
}

const STATUS_PRIORITY: Record<string, number> = {
  'verified': 5, 'partially-verified': 4, 'disputed': 3, 'partially-contradicted': 2, 'unverified': 1,
};

const ClaimsCorroborationGraph: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<FGRef>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const router = useRouter();

  const [graphWidth, setGraphWidth] = useState(800);
  const [highlight, setHighlight] = useState<HighlightState>(EMPTY_HL);
  const [clickedNode, setClickedNode] = useState<ClaimNode | null>(null);
  const [activeStatuses, setActiveStatuses] = useState<Set<string>>(
    new Set(Object.keys(STATUS_LABELS))
  );
  const [focusCatId, setFocusCatId] = useState<string | null>(null);

  const clickedNodeRef = useRef<ClaimNode | null>(null);
  useEffect(() => { clickedNodeRef.current = clickedNode; }, [clickedNode]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setGraphWidth(el.clientWidth || 800);
    const obs = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setGraphWidth(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const filteredLinks = useMemo(() =>
    claimsGraphData.links.filter(l => {
      if (!activeStatuses.has(l.status)) return false;
      if (focusCatId && resolveId(l.target) !== `cat_${focusCatId}`) return false;
      return true;
    }),
    [activeStatuses, focusCatId]
  );

  const visibleNodeIds = useMemo(() => {
    const ids = new Set<string>();
    filteredLinks.forEach(l => { ids.add(resolveId(l.source)); ids.add(resolveId(l.target)); });
    return ids;
  }, [filteredLinks]);

  const filteredNodes = useMemo(() =>
    claimsGraphData.nodes.filter(n => visibleNodeIds.has(n.id)),
    [visibleNodeIds]
  );

  const filtered = useMemo(() => ({ nodes: filteredNodes, links: filteredLinks }), [filteredNodes, filteredLinks]);

  const handleNodeHover = useCallback((node: object | null) => {
    if (clickedNodeRef.current) return;
    if (!node) { setHighlight(EMPTY_HL); return; }
    const n = node as ClaimNode;
    setHighlight(buildHighlight(n.id, filteredLinks as ClaimLink[]));
  }, [filteredLinks]);

  const handleNodeClick = useCallback((node: object) => {
    const n = node as ClaimNode;
    if (clickedNodeRef.current?.id === n.id) {
      if (n.type === 'figure') {
        router.push(`/figures/${n.id.replace(/^fig_/, '')}`);
      }
      return;
    }
    setClickedNode(n);
    setHighlight(buildHighlight(n.id, filteredLinks as ClaimLink[]));
  }, [filteredLinks, router]);

  const handleBgClick = useCallback(() => {
    setClickedNode(null);
    setHighlight(EMPTY_HL);
  }, []);

  const getNodeColor = useCallback((node: object): string => {
    const n = node as ClaimNode;
    const dimmed = highlight.nodes.size > 0 && !highlight.nodes.has(n.id);
    if (n.type === 'category') {
      const base = CLAIM_CATEGORIES[n.id.replace(/^cat_/, '')]?.color ?? '#8a8a8a';
      return dimmed ? base + '40' : base;
    }
    const base = FIGURE_TYPE_COLORS[n.figureType ?? 'insider'] ?? '#6da3d8';
    return dimmed ? base + '40' : base;
  }, [highlight]);

  const getLinkColor = useCallback((link: object): string => {
    const l = link as ClaimLink;
    const key = linkKey(l);
    const dimmed = highlight.linkKeys.size > 0 && !highlight.linkKeys.has(key);
    const base = STATUS_COLORS[l.status] ?? '#6a6a7a';
    return dimmed ? base + '18' : base + 'cc';
  }, [highlight]);

  const getLinkWidth = useCallback((link: object): number => {
    const l = link as ClaimLink;
    const key = linkKey(l);
    const active = highlight.linkKeys.size === 0 || highlight.linkKeys.has(key);
    return active ? Math.min(3, 0.8 + l.claimCount * 0.5) : 0.3;
  }, [highlight]);

  const getParticleWidth = useCallback((link: object): number => {
    const l = link as ClaimLink;
    const key = linkKey(l);
    return highlight.linkKeys.size === 0 || highlight.linkKeys.has(key) ? 1.5 : 0;
  }, [highlight]);

  const paintNode = useCallback((node: object, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const n = node as ClaimNode & { x: number; y: number };
    const r = Math.sqrt(Math.max(0, n.val)) * 4;
    const color = getNodeColor(node);
    const isCategory = n.type === 'category';
    const fontSize = Math.max(8, (isCategory ? 11 : 9) / globalScale);
    const dimmed = highlight.nodes.size > 0 && !highlight.nodes.has(n.id);

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (isCategory) {
      ctx.strokeStyle = dimmed
        ? 'rgba(128,128,128,0.15)'
        : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)');
      ctx.lineWidth = 1.5 / globalScale;
      ctx.stroke();
    }

    if (globalScale > 0.4 || isCategory) {
      ctx.font = `${isCategory ? 'bold ' : ''}${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = dimmed
        ? (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)')
        : (isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)');
      ctx.fillText(n.name, n.x, n.y + r + 2 / globalScale);
    }
  }, [getNodeColor, highlight, isDark]);

  const getNodeLabel = useCallback((node: object): string => {
    const n = node as ClaimNode;
    if (n.type === 'category') return `${n.name} - ${n.figureCount} witnesses`;
    return `${n.name} (${n.figureType ?? 'insider'}) - click to view profile`;
  }, []);

  // Panel data
  const panelFigures = useMemo(() => {
    if (!clickedNode || clickedNode.type !== 'category') return [];
    return filteredLinks
      .filter(l => resolveId(l.target) === clickedNode.id)
      .map(l => {
        const figNode = claimsGraphData.nodes.find(n => n.id === resolveId(l.source));
        return figNode ? { node: figNode, link: l } : null;
      })
      .filter((x): x is { node: ClaimNode; link: ClaimLink } => x !== null)
      .sort((a, b) => (STATUS_PRIORITY[b.link.status] ?? 0) - (STATUS_PRIORITY[a.link.status] ?? 0));
  }, [clickedNode, filteredLinks]);

  const panelCategories = useMemo(() => {
    if (!clickedNode || clickedNode.type !== 'figure') return [];
    return filteredLinks
      .filter(l => resolveId(l.source) === clickedNode.id)
      .map(l => {
        const catNode = claimsGraphData.nodes.find(n => n.id === resolveId(l.target));
        return catNode ? { node: catNode, link: l } : null;
      })
      .filter((x): x is { node: ClaimNode; link: ClaimLink } => x !== null);
  }, [clickedNode, filteredLinks]);

  const allCategories = useMemo(() =>
    Object.entries(CLAIM_CATEGORIES).filter(([id]) =>
      claimsGraphData.nodes.some(n => n.id === `cat_${id}`)
    ),
    []
  );

  const toggleStatus = (status: string) => {
    setActiveStatuses(prev => {
      const next = new Set(prev);
      if (next.has(status)) { if (next.size > 1) next.delete(status); }
      else next.add(status);
      return next;
    });
    setClickedNode(null);
    setHighlight(EMPTY_HL);
  };

  const toggleFocus = (catId: string) => {
    setFocusCatId(prev => prev === catId ? null : catId);
    setClickedNode(null);
    setHighlight(EMPTY_HL);
  };

  const stats = useMemo(() => ({
    figures: filteredNodes.filter(n => n.type === 'figure').length,
    categories: filteredNodes.filter(n => n.type === 'category').length,
    links: filteredLinks.length,
  }), [filteredNodes, filteredLinks]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3">
        {/* Status filter */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
            Claim verification status
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                style={
                  activeStatuses.has(status)
                    ? { backgroundColor: STATUS_COLORS[status], color: '#fff' }
                    : { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', color: isDark ? '#9ca3af' : '#6b7280' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category focus */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
            Focus category
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => { setFocusCatId(null); setClickedNode(null); setHighlight(EMPTY_HL); }}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
                focusCatId === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              All
            </button>
            {allCategories.map(([catId, cat]) => (
              <button
                key={catId}
                onClick={() => toggleFocus(catId)}
                className="text-xs px-2.5 py-1 rounded-full font-medium transition-all"
                style={
                  focusCatId === catId
                    ? { backgroundColor: cat.color, color: '#fff' }
                    : { backgroundColor: isDark ? '#1f2937' : '#f3f4f6', color: isDark ? '#9ca3af' : '#6b7280' }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          {stats.figures} witnesses {' · '} {stats.categories} claim categories {' · '} {stats.links} connections
          {clickedNode && ' · click again to navigate'}
        </p>
      </div>

      {/* Graph + Side panel */}
      <div className="flex gap-4">
        <div
          ref={containerRef}
          className="flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{ height: 560, background: isDark ? '#111827' : '#1a1f2e' }}
        >
          <ForceGraph2D
            ref={fgRef}
            graphData={filtered}
            width={graphWidth}
            height={560}
            warmupTicks={80}
            cooldownTicks={120}
            nodeRelSize={4}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.35}
            nodeCanvasObject={paintNode}
            nodeCanvasObjectMode={() => 'replace' as const}
            linkColor={getLinkColor}
            linkWidth={getLinkWidth}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.004}
            linkDirectionalParticleWidth={getParticleWidth}
            onNodeHover={handleNodeHover}
            onNodeClick={handleNodeClick}
            onBackgroundClick={handleBgClick}
            nodeLabel={getNodeLabel}
            backgroundColor={isDark ? '#111827' : '#1a1f2e'}
          />
        </div>

        {/* Side panel */}
        {clickedNode && (
          <div
            className="w-60 shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 space-y-3 overflow-y-auto"
            style={{ maxHeight: 560 }}
          >
            {/* Node header */}
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: clickedNode.type === 'category'
                      ? CLAIM_CATEGORIES[clickedNode.id.replace(/^cat_/, '')]?.color
                      : FIGURE_TYPE_COLORS[clickedNode.figureType ?? 'insider'],
                  }}
                />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  {clickedNode.type === 'category' ? 'Claim Category' : (clickedNode.figureType ?? 'Figure')}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{clickedNode.name}</h3>
              {clickedNode.type === 'category' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  {CLAIM_CATEGORIES[clickedNode.id.replace(/^cat_/, '')]?.description}
                </p>
              )}
              {clickedNode.type === 'category' && (
                <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                  {panelFigures.length} witness{panelFigures.length !== 1 ? 'es' : ''} on record
                </p>
              )}
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Category node panel: list witnesses */}
            {clickedNode.type === 'category' && panelFigures.length > 0 && (
              <div className="space-y-2">
                {panelFigures.map(({ node, link }) => (
                  <div
                    key={node.id}
                    onClick={() => router.push(`/figures/${node.id.replace(/^fig_/, '')}`)}
                    className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded p-1.5 -mx-1.5 transition-colors"
                  >
                    <span
                      className="mt-0.5 w-2 h-2 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_COLORS[link.status] }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{node.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {STATUS_LABELS[link.status]} {' · '} {link.claimCount} claim{link.claimCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Figure node panel: list categories + nav button */}
            {clickedNode.type === 'figure' && panelCategories.length > 0 && (
              <div className="space-y-2">
                {panelCategories.map(({ node, link }) => {
                  const catId = node.id.replace(/^cat_/, '');
                  const cat = CLAIM_CATEGORIES[catId];
                  return (
                    <div key={node.id} className="flex items-start gap-2">
                      <span
                        className="mt-0.5 w-2 h-2 shrink-0 rounded-full"
                        style={{ backgroundColor: cat?.color ?? '#8a8a8a' }}
                      />
                      <div>
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{cat?.label ?? node.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {link.claimCount} claim{link.claimCount !== 1 ? 's' : ''} {' · '} {STATUS_LABELS[link.status]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {clickedNode.type === 'figure' && (
              <button
                onClick={() => router.push(`/figures/${clickedNode.id.replace(/^fig_/, '')}`)}
                className="w-full text-xs text-center py-1.5 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                View full profile →
              </button>
            )}

            <button
              onClick={() => { setClickedNode(null); setHighlight(EMPTY_HL); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Clear selection
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-gray-600 dark:text-gray-300">Edge:</span>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1">
              <span className="w-5 h-0.5 inline-block rounded" style={{ backgroundColor: color }} />
              {STATUS_LABELS[status]}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600 dark:text-gray-300">Node size:</span>
          <span>Category nodes scale with witness count (corroboration strength)</span>
        </div>
      </div>
    </div>
  );
};

export default ClaimsCorroborationGraph;
