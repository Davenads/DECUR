import React, { useCallback, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  MarkerType,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';
import {
  FlowThemeContext,
  useFlowTheme,
  useFlowIsDark,
  sem as semColor,
  DARK_STRUCTURAL,
  LIGHT_STRUCTURAL,
  type SemanticColorKey,
} from '../data/shared/flowTheme';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type DisclosureNodeType = 'person' | 'hearing' | 'legislation' | 'committee';

interface DisclosureNodeData extends Record<string, unknown> {
  label: string;
  period: string;
  type: DisclosureNodeType;
  figureId: string | null; // set for person nodes that have a /figures/[id] page
}

// --------------------------------------------------------------------------
// Type colour config
// --------------------------------------------------------------------------

function getTypeStyle(type: DisclosureNodeType, isDark: boolean) {
  const map: Record<DisclosureNodeType, SemanticColorKey> = {
    person:      'blue',
    hearing:     'amber',
    legislation: 'emerald',
    committee:   'purple',
  };
  return semColor(map[type], isDark);
}

const TYPE_LABELS: Record<DisclosureNodeType, string> = {
  person:      'Witness',
  hearing:     'Hearing',
  legislation: 'Legislation',
  committee:   'Committee',
};

// Fixed node dimensions
const NODE_WIDTH  = 200;
const NODE_HEIGHT = 80;

// --------------------------------------------------------------------------
// Custom node renderer
// --------------------------------------------------------------------------

function DisclosureNode({ data }: { data: DisclosureNodeData }) {
  const isDark = useFlowIsDark();
  const style = getTypeStyle(data.type, isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  const navigable = data.type === 'person' && data.figureId != null;
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: st.handle, border: 'none', width: 8, height: 8 }}
      />
      <div
        style={{
          background: style.bg,
          border: `1.5px solid ${style.border}`,
          borderRadius: 8,
          padding: '10px 14px',
          width: NODE_WIDTH,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          cursor: navigable ? 'pointer' : 'default',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: st.text, lineHeight: 1.3, marginBottom: 4 }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, color: st.textMuted, marginBottom: 6 }}>
          {data.period}
        </div>
        <span
          style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 600,
            padding: '1px 7px',
            borderRadius: 999,
            background: style.badge,
            color: style.badgeText,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {TYPE_LABELS[data.type]}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: st.handle, border: 'none', width: 8, height: 8 }}
      />
    </>
  );
}

const nodeTypes = { disclosure: DisclosureNode };

// --------------------------------------------------------------------------
// Type legend
// --------------------------------------------------------------------------

const LEGEND_ENTRIES: DisclosureNodeType[] = ['person', 'hearing', 'legislation', 'committee'];

interface TypeLegendProps { isDark: boolean }
function TypeLegend({ isDark }: TypeLegendProps) {
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        background: st.legendBg,
        border: `1px solid ${st.legendBorder}`,
        borderRadius: 8,
        padding: '8px 12px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: st.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        Type
      </div>
      {LEGEND_ENTRIES.map(type => {
        const s = getTypeStyle(type, isDark);
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: s.badge }} />
            <span style={{ fontSize: 11, color: st.textMuted }}>{TYPE_LABELS[type]}</span>
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------------------
// Raw node data
// --------------------------------------------------------------------------

const RAW_NODES: Array<{
  id: string; label: string; period: string;
  type: DisclosureNodeType; figureId: string | null;
}> = [
  // Witnesses
  { id: 'elizondo',    label: 'Luis Elizondo',    period: '2017-present',  type: 'person',      figureId: 'luis-elizondo'   },
  { id: 'grusch',      label: 'David Grusch',     period: '2021-present',  type: 'person',      figureId: 'david-grusch'    },
  { id: 'graves',      label: 'Ryan Graves',      period: '2019-present',  type: 'person',      figureId: 'ryan-graves'     },
  { id: 'fravor',      label: 'David Fravor',     period: '2004; 2019+',   type: 'person',      figureId: 'david-fravor'    },
  { id: 'kirkpatrick', label: 'Sean Kirkpatrick', period: '2022-2023',     type: 'person',      figureId: 'sean-kirkpatrick'},
  { id: 'nell',        label: 'Karl Nell',        period: '2023',          type: 'person',      figureId: 'karl-nell'       },
  { id: 'borland',     label: 'Dylan Borland',    period: '2025',          type: 'person',      figureId: 'dylan-borland'   },
  // Committees
  { id: 'hasc-cmte',          label: 'House Armed Services Cmte.',  period: 'HASC',  type: 'committee',   figureId: null },
  { id: 'house-oversight',    label: 'House Oversight Committee',   period: 'HOC',   type: 'committee',   figureId: null },
  { id: 'sasc-cmte',          label: 'Senate Armed Services Cmte.', period: 'SASC',  type: 'committee',   figureId: null },
  // Hearings
  { id: 'hearing-may-2022', label: 'HASC UAP Hearing',        period: 'May 2022', type: 'hearing', figureId: null },
  { id: 'hearing-jul-2023', label: 'House Oversight Hearing', period: 'Jul 2023', type: 'hearing', figureId: null },
  { id: 'hearing-apr-2024', label: 'SASC UAP Hearing',        period: 'Apr 2024', type: 'hearing', figureId: null },
  { id: 'hearing-sep-2025', label: 'House Oversight Hearing', period: 'Sep 2025', type: 'hearing', figureId: null },
  // Legislation
  { id: 'uaptf-mandate',        label: 'NDAA FY2020: UAP Task Force',         period: '2020', type: 'legislation', figureId: null },
  { id: 'aaro-creation',        label: 'NDAA FY2022: AARO Created',           period: '2021', type: 'legislation', figureId: null },
  { id: 'uap-disclosure-act',   label: 'UAP Disclosure Act',                  period: '2023', type: 'legislation', figureId: null },
  { id: 'ndaa-2024-provisions', label: 'NDAA FY2024: Disclosure Provisions',  period: '2023', type: 'legislation', figureId: null },
];

// --------------------------------------------------------------------------
// Edges
// --------------------------------------------------------------------------

const RAW_EDGES: Array<{ source: string; target: string }> = [
  // Legislation flow chain
  { source: 'uaptf-mandate',        target: 'hearing-may-2022'    }, // mandate led to first public hearing
  { source: 'hearing-may-2022',     target: 'aaro-creation'       }, // congressional pressure -> AARO
  { source: 'hearing-jul-2023',     target: 'uap-disclosure-act'  }, // Grusch testimony drove bill
  { source: 'uap-disclosure-act',   target: 'ndaa-2024-provisions'}, // provisions incorporated into NDAA
  { source: 'ndaa-2024-provisions', target: 'hearing-sep-2025'    }, // provisions enabled further disclosure
  // Hearing chain (chronological momentum)
  { source: 'hearing-may-2022',     target: 'hearing-jul-2023'    },
  { source: 'hearing-jul-2023',     target: 'hearing-apr-2024'    },
  { source: 'hearing-apr-2024',     target: 'hearing-sep-2025'    },
  // Committee -> Hearing (hosted)
  { source: 'hasc-cmte',        target: 'hearing-may-2022' },
  { source: 'house-oversight',  target: 'hearing-jul-2023' },
  { source: 'sasc-cmte',        target: 'hearing-apr-2024' },
  { source: 'house-oversight',  target: 'hearing-sep-2025' },
  // Witnesses -> Hearings (testified)
  { source: 'elizondo',    target: 'hearing-may-2022' },
  { source: 'graves',      target: 'hearing-may-2022' },
  { source: 'grusch',      target: 'hearing-jul-2023' },
  { source: 'graves',      target: 'hearing-jul-2023' },
  { source: 'fravor',      target: 'hearing-jul-2023' },
  { source: 'nell',        target: 'hearing-jul-2023' },
  { source: 'kirkpatrick', target: 'hearing-apr-2024' },
  { source: 'borland',     target: 'hearing-sep-2025' },
];

// --------------------------------------------------------------------------
// Dagre layout
// --------------------------------------------------------------------------

function getLayoutedElements(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100 });

  nodes.forEach(node =>
    g.setNode(node.id, {
      width:  node.measured?.width  ?? NODE_WIDTH,
      height: node.measured?.height ?? NODE_HEIGHT,
    })
  );
  edges.forEach(edge => g.setEdge(edge.source, edge.target));
  Dagre.layout(g);

  return {
    nodes: nodes.map(node => {
      const pos = g.node(node.id);
      return {
        ...node,
        position: {
          x: pos.x - (node.measured?.width  ?? NODE_WIDTH)  / 2,
          y: pos.y - (node.measured?.height ?? NODE_HEIGHT) / 2,
        },
      };
    }),
    edges,
  };
}

// --------------------------------------------------------------------------
// Build initial elements
// --------------------------------------------------------------------------

function buildInitialElements(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = RAW_NODES.map(n => ({
    id: n.id,
    type: 'disclosure',
    position: { x: 0, y: 0 },
    data: {
      label: n.label,
      period: n.period,
      type: n.type,
      figureId: n.figureId,
    } as DisclosureNodeData,
  }));

  const edges: Edge[] = RAW_EDGES.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    style: { stroke: DARK_STRUCTURAL.edgeStroke, strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: DARK_STRUCTURAL.edgeStroke, width: 16, height: 16 },
    animated: false,
  }));

  return getLayoutedElements(nodes, edges);
}

const { nodes: initialNodes, edges: initialEdges } = buildInitialElements();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function CongressionalDisclosureFlow() {
  const router = useRouter();
  const { isDark, c } = useFlowTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layouted, setLayouted] = useState(false);

  const onInit = useCallback(() => setLayouted(true), []);

  const handleNodeClick = useCallback((_evt: React.MouseEvent, node: Node) => {
    const figureId = (node.data as DisclosureNodeData).figureId;
    if (figureId) {
      router.push(`/figures/${figureId}?ref=explore-disclosure`);
    }
  }, [router]);

  useLayoutEffect(() => {
    if (!layouted) return;
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
    setNodes(ln);
    setEdges(le);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layouted]);

  return (
    <FlowThemeContext.Provider value={isDark}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 720,
          background: 'var(--flow-bg)',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid var(--flow-border)',
        }}
      >
        <TypeLegend isDark={isDark} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onInit={onInit}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={2}
          colorMode={isDark ? 'dark' : 'light'}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={c.dotColor}
          />
          <Controls
            showInteractive={false}
            style={{
              background: c.ctrlBg,
              border: `1px solid ${c.ctrlBorder}`,
              borderRadius: 8,
            }}
          />
        </ReactFlow>
      </div>
    </FlowThemeContext.Provider>
  );
}
