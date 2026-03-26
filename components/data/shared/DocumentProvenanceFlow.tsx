'use client';

import React, { useCallback, useLayoutEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
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
import { type ProvenanceChainNode, type ProvenanceNodeType } from '../../../types/data';
import {
  FlowThemeContext,
  useFlowTheme,
  useFlowIsDark,
  sem as semColor,
  DARK_STRUCTURAL,
  LIGHT_STRUCTURAL,
  type SemanticColorKey,
} from './flowTheme';

// --------------------------------------------------------------------------
// Type colour config
// --------------------------------------------------------------------------

function getTypeStyle(type: ProvenanceNodeType, isDark: boolean) {
  const map: Record<ProvenanceNodeType, SemanticColorKey> = {
    creation:         'blue',
    classification:   'red',
    transfer:         'gray',
    declassification: 'emerald',
    foia:             'emerald',
    leak:             'amber',
    public:           'green',
    archive:          'purple',
  };
  return semColor(map[type] ?? 'gray', isDark);
}

const TYPE_LABELS: Record<ProvenanceNodeType, string> = {
  creation:         'Origin',
  classification:   'Classified',
  transfer:         'Transfer',
  declassification: 'Declassified',
  foia:             'FOIA Release',
  leak:             'Leaked',
  public:           'Public',
  archive:          'Archive',
};

// --------------------------------------------------------------------------
// Node dimensions and layout
// --------------------------------------------------------------------------

const NODE_WIDTH  = 200;
const NODE_HEIGHT = 90;
const STEP_X      = 280; // horizontal spacing between nodes

interface ProvenanceData extends Record<string, unknown> {
  label: string;
  description: string;
  date: string;
  type: ProvenanceNodeType;
}

// --------------------------------------------------------------------------
// Custom node
// --------------------------------------------------------------------------

function ProvenanceNode({ data }: { data: ProvenanceData }) {
  const isDark = useFlowIsDark();
  const style = getTypeStyle(data.type, isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: st.handle, border: 'none', width: 7, height: 7 }}
      />
      <div
        style={{
          background: style.bg,
          border: `1.5px solid ${style.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          width: NODE_WIDTH,
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 12, color: st.text, lineHeight: 1.3, marginBottom: 3 }}>
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: st.textMuted, marginBottom: 5, lineHeight: 1.4 }}>
          {data.description}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: 9,
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 999,
              background: style.badge,
              color: style.badgeText,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {TYPE_LABELS[data.type]}
          </span>
          <span style={{ fontSize: 10, color: st.textDim }}>{data.date}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: st.handle, border: 'none', width: 7, height: 7 }}
      />
    </>
  );
}

const nodeTypes = { provenance: ProvenanceNode };

// --------------------------------------------------------------------------
// Legend
// --------------------------------------------------------------------------

const LEGEND_TYPES: ProvenanceNodeType[] = [
  'creation', 'classification', 'transfer', 'declassification', 'foia', 'leak', 'public', 'archive',
];

interface ProvenanceLegendProps { isDark: boolean }
function ProvenanceLegend({ isDark }: ProvenanceLegendProps) {
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
      {LEGEND_TYPES.map(type => {
        const s = getTypeStyle(type, isDark);
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.badge, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: st.textMuted, whiteSpace: 'nowrap' }}>{TYPE_LABELS[type]}</span>
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------------------
// Build nodes + edges from chain array (simple linear horizontal layout)
// --------------------------------------------------------------------------

function buildElements(chain: ProvenanceChainNode[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = chain.map((n, i) => ({
    id: n.id,
    type: 'provenance',
    position: { x: i * STEP_X, y: 0 },
    data: {
      label: n.label,
      description: n.description,
      date: n.date,
      type: n.type,
    } as ProvenanceData,
  }));

  const edges: Edge[] = chain.slice(0, -1).map((n, i) => ({
    id: `e-${i}`,
    source: n.id,
    target: chain[i + 1].id,
    type: 'smoothstep',
    style: { stroke: DARK_STRUCTURAL.edgeStroke, strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: DARK_STRUCTURAL.edgeStroke, width: 14, height: 14 },
  }));

  return { nodes, edges };
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

interface Props {
  chain: ProvenanceChainNode[];
}

export default function DocumentProvenanceFlow({ chain }: Props) {
  const { isDark, c } = useFlowTheme();
  const { nodes: initNodes, edges: initEdges } = buildElements(chain);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);
  const [ready, setReady] = useState(false);

  const onInit = useCallback(() => setReady(true), []);

  // Suppress unused warning - ready is used to signal fitView trigger
  void ready;

  useLayoutEffect(() => {
    // Nothing to re-layout; positions are pre-computed linearly.
  }, []);

  return (
    <FlowThemeContext.Provider value={isDark}>
      <div
        style={{
          width: '100%',
          background: 'var(--flow-bg)',
          borderRadius: 10,
          border: '1px solid var(--flow-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: 220, position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onInit={onInit}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={2}
            colorMode={isDark ? 'dark' : 'light'}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            elementsSelectable={false}
            zoomOnScroll={false}
            panOnScroll={false}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color={c.dotColor}
            />
          </ReactFlow>
        </div>
        <div style={{ borderTop: `1px solid var(--flow-border)`, padding: '8px 12px' }}>
          <ProvenanceLegend isDark={isDark} />
        </div>
      </div>
    </FlowThemeContext.Provider>
  );
}
