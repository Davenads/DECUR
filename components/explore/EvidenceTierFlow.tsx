import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  Handle,
  Position,
  useNodesState,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import rawCases from '../../data/cases.json';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface CaseNodeData extends Record<string, unknown> {
  caseId: string;
  label: string;
  date: string;
  location: string;
  country: string;
  category: string;
  tier: string;
  summary: string;
  witnessCount: number;
}

interface TierLabelNodeData extends Record<string, unknown> {
  tier: string;
  caseCount: number;
  bandHeight: number;
}

interface CaseRecord {
  id: string;
  name: string;
  date: string;
  location: string;
  country: string;
  category: string;
  evidence_tier: string;
  classification_status: string;
  summary: string;
  witnesses?: unknown[];
  insider_connections?: string[];
}

// --------------------------------------------------------------------------
// Category style config (node border + badge)
// --------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, { border: string; bg: string; badge: string; badgeText: string; label: string }> = {
  'military-aviation': { border: '#1e40af', bg: '#0c1635', badge: '#1e40af', badgeText: '#bfdbfe', label: 'Military Aviation' },
  'military-ground':   { border: '#166534', bg: '#0d2818', badge: '#166534', badgeText: '#bbf7d0', label: 'Military Ground'   },
  'military-naval':    { border: '#0e7490', bg: '#07222b', badge: '#0e7490', badgeText: '#a5f3fc', label: 'Military Naval'    },
  'military-nuclear':  { border: '#b45309', bg: '#1a1005', badge: '#b45309', badgeText: '#fde68a', label: 'Military Nuclear'  },
  'civilian':          { border: '#4b5563', bg: '#1a1f2b', badge: '#4b5563', badgeText: '#d1d5db', label: 'Civilian'          },
  'government':        { border: '#5b21b6', bg: '#1a0a3d', badge: '#5b21b6', badgeText: '#ddd6fe', label: 'Government'        },
  'research':          { border: '#0f766e', bg: '#071919', badge: '#0f766e', badgeText: '#99f6e4', label: 'Research'          },
};

const DEFAULT_CAT = { border: '#374151', bg: '#1a1f2b', badge: '#374151', badgeText: '#9ca3af', label: 'Other' };

function getCatStyle(category: string) {
  return CATEGORY_STYLES[category] ?? DEFAULT_CAT;
}

// --------------------------------------------------------------------------
// Tier label config
// --------------------------------------------------------------------------

const TIER_CONFIG: Record<string, { badgeColor: string; label: string }> = {
  'tier-1': { badgeColor: '#f59e0b', label: 'Strongest Evidence' },
  'tier-2': { badgeColor: '#60a5fa', label: 'Strong Evidence'    },
  'tier-3': { badgeColor: '#9ca3af', label: 'Good Evidence'      },
};

// --------------------------------------------------------------------------
// Layout constants
// --------------------------------------------------------------------------

const NODE_W     = 180;
const NODE_H     = 80;
const COLS       = 4;
const X_GAP      = 20;
const Y_GAP      = 16;
const TIER_GAP   = 52;
const LABEL_W    = 80;
const LABEL_GAP  = 20;
const LEFT_OFFSET = LABEL_W + LABEL_GAP;

// --------------------------------------------------------------------------
// Custom node: case card
// --------------------------------------------------------------------------

function CaseNode({ data }: { data: CaseNodeData }) {
  const cat = getCatStyle(data.category);
  const shortDate = data.date.replace(/^(\w+ \d+,?\s*)(\d{4}).*$/, '$2') || data.date;
  return (
    <>
      <Handle type="target" position={Position.Left}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <div
        style={{
          background: cat.bg,
          border: `1.5px solid ${cat.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          width: NODE_W,
          height: NODE_H,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {data.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#64748b' }}>{shortDate}</span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 999,
              background: cat.badge,
              color: cat.badgeText,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {cat.label}
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
}

// --------------------------------------------------------------------------
// Custom node: tier label (non-interactive band header)
// --------------------------------------------------------------------------

function TierLabelNode({ data }: { data: TierLabelNodeData }) {
  const cfg = TIER_CONFIG[data.tier] ?? { badgeColor: '#9ca3af', label: '' };
  const tierNum = data.tier.replace('tier-', '');
  return (
    <div
      style={{
        width: LABEL_W,
        height: data.bandHeight,
        background: 'rgba(15,23,42,0.7)',
        border: `1.5px solid ${cfg.badgeColor}22`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        pointerEvents: 'none',
        cursor: 'default',
        userSelect: 'none',
        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ fontSize: 8, fontWeight: 700, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        TIER
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color: cfg.badgeColor, lineHeight: 1 }}>
        {tierNum}
      </div>
      <div style={{ fontSize: 8, color: '#94a3b8', textAlign: 'center', lineHeight: 1.4, maxWidth: 64 }}>
        {cfg.label}
      </div>
      <div style={{ width: 36, borderTop: '1px solid #1e293b', margin: '2px 0' }} />
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{data.caseCount}</div>
      <div style={{ fontSize: 8, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>cases</div>
    </div>
  );
}

const nodeTypes = { caseCard: CaseNode, tierLabel: TierLabelNode };

// --------------------------------------------------------------------------
// Category legend
// --------------------------------------------------------------------------

function CategoryLegend({ categories }: { categories: string[] }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        background: 'rgba(15,23,42,0.88)',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '8px 12px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        Category
      </div>
      {categories.map(cat => {
        const s = getCatStyle(cat);
        return (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: s.badge }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------------------
// Detail panel (click-triggered, no hover)
// --------------------------------------------------------------------------

interface DetailPanelProps {
  data: CaseNodeData;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

function CaseDetailPanel({ data, onClose, onNavigate }: DetailPanelProps) {
  const cat = getCatStyle(data.category);
  const tierCfg = TIER_CONFIG[data.tier] ?? { badgeColor: '#9ca3af', label: '' };
  const truncSummary = data.summary.length > 240
    ? data.summary.slice(0, 240).trimEnd() + '\u2026'
    : data.summary;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 20,
        width: 'min(380px, calc(100vw - 24px))',
        background: 'rgba(15,23,42,0.97)',
        border: `1px solid ${cat.border}`,
        borderRadius: 10,
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
        maxHeight: 380,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px 8px',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
            {data.label}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
            {data.date}{data.location ? ` \u00b7 ${data.location}` : ''}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}
        >
          &times;
        </button>
      </div>

      {/* Badges */}
      <div style={{ padding: '8px 14px 0', flexShrink: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: cat.badge, color: cat.badgeText, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {cat.label}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#1e293b', color: tierCfg.badgeColor, border: `1px solid ${tierCfg.badgeColor}44`, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Tier {data.tier.replace('tier-', '')}
        </span>
        {data.witnessCount > 0 && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: '#1e293b', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {data.witnessCount} {data.witnessCount === 1 ? 'Witness' : 'Witnesses'}
          </span>
        )}
      </div>

      {/* Scrollable body */}
      <div style={{ padding: '10px 14px', overflowY: 'auto', flex: 1 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
          {truncSummary}
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid #1e293b', flexShrink: 0 }}>
        <button
          onClick={() => onNavigate(data.caseId)}
          style={{
            width: '100%',
            padding: '7px 12px',
            background: '#0c1635',
            border: `1px solid ${cat.border}`,
            borderRadius: 6,
            color: '#7dd3fc',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          View Full Case &rarr;
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Build nodes from cases.json
// --------------------------------------------------------------------------

function parseDateYear(dateStr: string): number {
  const m = dateStr.match(/\d{4}/);
  return m ? parseInt(m[0]) : 0;
}

function buildElements(): { nodes: Node[]; presentCategories: string[] } {
  const cases = rawCases as unknown as CaseRecord[];

  // Group by tier and sort chronologically within each tier
  const tiers = ['tier-1', 'tier-2', 'tier-3'];
  const grouped: Record<string, CaseRecord[]> = { 'tier-1': [], 'tier-2': [], 'tier-3': [] };
  const seenCategories = new Set<string>();

  cases.forEach(c => {
    const tier = c.evidence_tier ?? 'tier-3';
    if (!grouped[tier]) grouped[tier] = [];
    grouped[tier].push(c);
    if (c.category) seenCategories.add(c.category);
  });

  // Sort each tier chronologically
  tiers.forEach(t => {
    grouped[t].sort((a, b) => parseDateYear(a.date) - parseDateYear(b.date));
  });

  // Compute tier band heights
  function bandHeight(count: number): number {
    const rows = Math.max(1, Math.ceil(count / COLS));
    return rows * (NODE_H + Y_GAP) - Y_GAP;
  }

  const tierHeights = tiers.map(t => bandHeight(grouped[t].length));
  const tierStarts: number[] = [0];
  for (let i = 1; i < tiers.length; i++) {
    tierStarts.push(tierStarts[i - 1] + tierHeights[i - 1] + TIER_GAP);
  }

  const nodes: Node[] = [];

  tiers.forEach((tier, ti) => {
    const tierCases = grouped[tier];
    const yStart = tierStarts[ti];
    const bHeight = tierHeights[ti];

    // Tier label node
    nodes.push({
      id: `label-${tier}`,
      type: 'tierLabel',
      position: { x: 0, y: yStart },
      selectable: false,
      draggable: false,
      data: {
        tier,
        caseCount: tierCases.length,
        bandHeight: bHeight,
      } as TierLabelNodeData,
    });

    // Case nodes
    tierCases.forEach((c, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = LEFT_OFFSET + col * (NODE_W + X_GAP);
      const y = yStart + row * (NODE_H + Y_GAP);

      nodes.push({
        id: c.id,
        type: 'caseCard',
        position: { x, y },
        draggable: false,
        data: {
          caseId:       c.id,
          label:        c.name,
          date:         c.date,
          location:     c.location,
          country:      c.country,
          category:     c.category,
          tier:         c.evidence_tier,
          summary:      c.summary,
          witnessCount: Array.isArray(c.witnesses) ? c.witnesses.length : 0,
        } as CaseNodeData,
      });
    });
  });

  // Preserve category order for legend
  const catOrder = Object.keys(CATEGORY_STYLES);
  const presentCategories = catOrder.filter(c => seenCategories.has(c));

  return { nodes, presentCategories };
}

const { nodes: initialNodes, presentCategories } = buildElements();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function EvidenceTierFlow() {
  const router = useRouter();
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [selectedNode, setSelectedNode] = useState<CaseNodeData | null>(null);

  const handleNodeClick = useCallback((_evt: React.MouseEvent, node: Node) => {
    if (node.type !== 'caseCard') return;
    const data = node.data as CaseNodeData;
    setSelectedNode(prev =>
      prev?.caseId === data.caseId ? null : data
    );
  }, []);

  const handleNavigate = useCallback((caseId: string) => {
    router.push(`/cases/${caseId}?ref=explore-cases`);
  }, [router]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 720,
        background: '#0f172a',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #1e293b',
      }}
    >
      <CategoryLegend categories={presentCategories} />

      {selectedNode && (
        <CaseDetailPanel
          data={selectedNode}
          onClose={() => setSelectedNode(null)}
          onNavigate={handleNavigate}
        />
      )}

      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.15}
        maxZoom={2}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
        <Controls
          showInteractive={false}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
          }}
        />
      </ReactFlow>
    </div>
  );
}
