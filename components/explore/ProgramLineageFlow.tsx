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
import rawPrograms from '../../data/programs.json';
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

type ProgramStatus = 'active' | 'defunct' | 'classified' | 'unknown';

interface PersonnelEntry {
  name: string;
  role: string;
  figure_id?: string;
}

interface ProgramNodeData extends Record<string, unknown> {
  label: string;
  period: string;
  status: ProgramStatus;
  parentOrg: string;
  summary: string;
  keyPersonnel: PersonnelEntry[];
  programId: string;
}

interface ProgramRecord {
  id: string;
  name: string;
  status: string;
  active_period: string;
  parent_org: string;
  summary: string;
  key_personnel: PersonnelEntry[];
  relationships: Array<{ target: string; type: string }>;
  includeInLineage?: boolean;
}

// --------------------------------------------------------------------------
// Status colour config
// --------------------------------------------------------------------------

function getStatusStyle(status: ProgramStatus, isDark: boolean) {
  const map: Record<ProgramStatus, SemanticColorKey> = {
    active:     'green',
    defunct:    'gray',
    classified: 'red',
    unknown:    'amber',
  };
  return semColor(map[status] ?? 'gray', isDark);
}

const STATUS_LABELS: Record<ProgramStatus, string> = {
  active:     'Active',
  defunct:    'Defunct',
  classified: 'Classified',
  unknown:    'Unknown',
};

// Fixed node dimensions
const NODE_WIDTH  = 200;
const NODE_HEIGHT = 95;

// --------------------------------------------------------------------------
// Parent org abbreviation
// --------------------------------------------------------------------------

function abbreviateOrg(org: string): string {
  if (!org) return '';
  if (org.includes('Air Force'))             return 'USAF';
  if (org.includes('Defense Intelligence'))  return 'DIA';
  if (org.includes('Secretary of Defense'))  return 'OSD';
  if (org.includes('Department of Defense')) return 'DoD';
  if (org.includes('Army'))                  return 'US Army';
  if (org.includes('Navy'))                  return 'US Navy';
  if (org.includes('Central Intelligence') || org === 'CIA') return 'CIA';
  if (org.includes('Harvard'))               return 'Harvard';
  return org.length > 22 ? org.slice(0, 20) + '\u2026' : org;
}

// --------------------------------------------------------------------------
// Custom node renderer
// --------------------------------------------------------------------------

function ProgramNode({ data }: { data: ProgramNodeData }) {
  const isDark = useFlowIsDark();
  const style = getStatusStyle(data.status, isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
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
          cursor: 'pointer',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: st.text, lineHeight: 1.3, marginBottom: 2 }}>
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: st.textDim, marginBottom: 3 }}>
          {abbreviateOrg(data.parentOrg)}
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
          {STATUS_LABELS[data.status]}
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

const nodeTypes = { program: ProgramNode };

// --------------------------------------------------------------------------
// Status legend
// --------------------------------------------------------------------------

type LegendEntry = { status: ProgramStatus };
const LEGEND_ENTRIES: LegendEntry[] = [
  { status: 'active'     },
  { status: 'defunct'    },
  { status: 'classified' },
  { status: 'unknown'    },
];

interface StatusLegendProps { isDark: boolean }
function StatusLegend({ isDark }: StatusLegendProps) {
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
        Status
      </div>
      {LEGEND_ENTRIES.map(({ status }) => {
        const s = getStatusStyle(status, isDark);
        return (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: s.badge }} />
            <span style={{ fontSize: 11, color: st.textMuted }}>{STATUS_LABELS[status]}</span>
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
  data: ProgramNodeData;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onFigureNavigate: (figureId: string) => void;
  isDark: boolean;
}

function ProgramDetailPanel({ data, onClose, onNavigate, onFigureNavigate, isDark }: DetailPanelProps) {
  const style = getStatusStyle(data.status, isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 20,
        width: 'min(380px, calc(100vw - 24px))',
        background: st.panelBg,
        border: `1px solid ${style.border}`,
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
          borderBottom: `1px solid ${st.divider}`,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: st.text, lineHeight: 1.3 }}>
            {data.label}
          </div>
          <div style={{ fontSize: 11, color: st.textDim, marginTop: 2 }}>
            {abbreviateOrg(data.parentOrg)}{data.parentOrg ? ' \u00b7 ' : ''}{data.period}
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: 'none',
            border: 'none',
            color: st.textDim,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
            padding: '0 0 0 4px',
            flexShrink: 0,
          }}
        >
          &times;
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ padding: '10px 14px', overflowY: 'auto', flex: 1 }}>
        <p style={{ fontSize: 12, color: st.textMuted, lineHeight: 1.6, margin: '0 0 12px 0' }}>
          {data.summary}
        </p>

        {data.keyPersonnel.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: st.textDim,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Key Personnel
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {data.keyPersonnel.slice(0, 4).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: st.edgeStroke, flexShrink: 0, fontSize: 12, marginTop: 1 }}>
                    &bull;
                  </span>
                  <span style={{ fontSize: 12, color: st.textValue, lineHeight: 1.4 }}>
                    {p.figure_id ? (
                      <button
                        onClick={() => onFigureNavigate(p.figure_id as string)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: '#7dd3fc',
                          cursor: 'pointer',
                          fontSize: 12,
                          textDecoration: 'underline',
                          textDecorationStyle: 'dotted',
                          textUnderlineOffset: '2px',
                        }}
                      >
                        {p.name}
                      </button>
                    ) : (
                      <span>{p.name}</span>
                    )}
                    <span style={{ color: st.textDim }}> - {p.role}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '8px 14px', borderTop: `1px solid ${st.divider}`, flexShrink: 0 }}>
        <button
          onClick={() => onNavigate(data.programId)}
          style={{
            width: '100%',
            padding: '7px 12px',
            background: '#0f2744',
            border: `1px solid ${style.border}`,
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
          View Full Profile &rarr;
        </button>
      </div>
    </div>
  );
}

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
// Build nodes and edges from programs.json
// --------------------------------------------------------------------------

function buildInitialElements(): { nodes: Node[]; edges: Edge[] } {
  const programs = (rawPrograms as unknown as ProgramRecord[]).filter(p => p.includeInLineage);

  const nodes: Node[] = programs.map(p => ({
    id: p.id,
    type: 'program',
    position: { x: 0, y: 0 },
    data: {
      label:        p.name,
      period:       p.active_period,
      status:       (p.status as ProgramStatus) ?? 'unknown',
      parentOrg:    p.parent_org ?? '',
      summary:      p.summary ?? '',
      keyPersonnel: p.key_personnel ?? [],
      programId:    p.id,
    } as ProgramNodeData,
  }));

  const edges: Edge[] = [];
  let edgeIndex = 0;
  programs.forEach(p => {
    (p.relationships ?? []).forEach(rel => {
      edges.push({
        id: `e-${edgeIndex++}`,
        source: p.id,
        target: rel.target,
        type: 'smoothstep',
        style: { stroke: DARK_STRUCTURAL.edgeStroke, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: DARK_STRUCTURAL.edgeStroke, width: 16, height: 16 },
        animated: false,
      });
    });
  });

  return getLayoutedElements(nodes, edges);
}

const { nodes: initialNodes, edges: initialEdges } = buildInitialElements();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function ProgramLineageFlow() {
  const router = useRouter();
  const { isDark, c } = useFlowTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layouted, setLayouted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<ProgramNodeData | null>(null);

  const onInit = useCallback(() => {
    setLayouted(true);
  }, []);

  const handleNodeClick = useCallback((_evt: React.MouseEvent, node: Node) => {
    const data = node.data as ProgramNodeData;
    setSelectedNode(prev =>
      prev?.programId === data.programId ? null : data
    );
  }, []);

  const handleNavigate = useCallback((programId: string) => {
    router.push(`/programs/${programId}?ref=program-lineage`);
  }, [router]);

  const handleFigureNavigate = useCallback((figureId: string) => {
    router.push(`/figures/${figureId}?ref=explore-lineage`);
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
        <StatusLegend isDark={isDark} />

        {selectedNode && (
          <ProgramDetailPanel
            data={selectedNode}
            onClose={() => setSelectedNode(null)}
            onNavigate={handleNavigate}
            onFigureNavigate={handleFigureNavigate}
            isDark={isDark}
          />
        )}

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
