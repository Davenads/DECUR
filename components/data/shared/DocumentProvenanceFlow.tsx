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

// --------------------------------------------------------------------------
// Type colour config
// --------------------------------------------------------------------------

const TYPE_STYLES: Record<ProvenanceNodeType, {
  border: string; bg: string; badge: string; badgeText: string; typeLabel: string;
}> = {
  creation:        { border: '#1e3a8a', bg: '#0c1a3a', badge: '#1e3a8a', badgeText: '#bfdbfe', typeLabel: 'Origin'       },
  classification:  { border: '#991b1b', bg: '#2a0d0d', badge: '#991b1b', badgeText: '#fca5a5', typeLabel: 'Classified'   },
  transfer:        { border: '#374151', bg: '#1a1f2b', badge: '#374151', badgeText: '#9ca3af', typeLabel: 'Transfer'     },
  declassification:{ border: '#065f46', bg: '#0a1f18', badge: '#065f46', badgeText: '#a7f3d0', typeLabel: 'Declassified' },
  foia:            { border: '#065f46', bg: '#0a1f18', badge: '#065f46', badgeText: '#a7f3d0', typeLabel: 'FOIA Release' },
  leak:            { border: '#92400e', bg: '#1f1508', badge: '#92400e', badgeText: '#fde68a', typeLabel: 'Leaked'       },
  public:          { border: '#166534', bg: '#0d2818', badge: '#166534', badgeText: '#bbf7d0', typeLabel: 'Public'       },
  archive:         { border: '#4c1d95', bg: '#1a0a3d', badge: '#4c1d95', badgeText: '#ddd6fe', typeLabel: 'Archive'      },
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
  const style = TYPE_STYLES[data.type];
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#475569', border: 'none', width: 7, height: 7 }}
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
        <div style={{ fontWeight: 700, fontSize: 12, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 3 }}>
          {data.label}
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5, lineHeight: 1.4 }}>
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
            {style.typeLabel}
          </span>
          <span style={{ fontSize: 10, color: '#64748b' }}>{data.date}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#475569', border: 'none', width: 7, height: 7 }}
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

function ProvenanceLegend() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
      {LEGEND_TYPES.map(type => {
        const s = TYPE_STYLES[type];
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.badge, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.typeLabel}</span>
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
    style: { stroke: '#475569', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 14, height: 14 },
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
    <div
      style={{
        width: '100%',
        background: '#0f172a',
        borderRadius: 10,
        border: '1px solid #1e293b',
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
          colorMode="dark"
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
            color="#1e293b"
          />
        </ReactFlow>
      </div>
      <div style={{ borderTop: '1px solid #1e293b', padding: '8px 12px' }}>
        <ProvenanceLegend />
      </div>
    </div>
  );
}
