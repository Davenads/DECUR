'use client';

import { useCallback, useLayoutEffect, useState } from 'react';
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

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type ProgramStatus = 'active' | 'defunct' | 'classified' | 'unknown';

interface ProgramNodeData extends Record<string, unknown> {
  label: string;
  period: string;
  status: ProgramStatus;
}

// --------------------------------------------------------------------------
// Status colour config
// --------------------------------------------------------------------------

const STATUS_STYLES: Record<ProgramStatus, { border: string; bg: string; badge: string; badgeText: string }> = {
  active:     { border: '#166534', bg: '#0d2818',  badge: '#166534', badgeText: '#bbf7d0' },
  defunct:    { border: '#374151', bg: '#1a1f2b',  badge: '#374151', badgeText: '#9ca3af' },
  classified: { border: '#991b1b', bg: '#2a0d0d',  badge: '#991b1b', badgeText: '#fca5a5' },
  unknown:    { border: '#92400e', bg: '#1f1508',  badge: '#92400e', badgeText: '#fcd34d' },
};

const STATUS_LABELS: Record<ProgramStatus, string> = {
  active:     'Active',
  defunct:    'Defunct',
  classified: 'Classified',
  unknown:    'Unknown',
};

// --------------------------------------------------------------------------
// Custom node renderer
// --------------------------------------------------------------------------

function ProgramNode({ data }: { data: ProgramNodeData }) {
  const style = STATUS_STYLES[data.status];
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ background: '#475569', border: 'none', width: 8, height: 8 }} />
      <div
        style={{
          background: style.bg,
          border: `1.5px solid ${style.border}`,
          borderRadius: 8,
          padding: '10px 14px',
          minWidth: 180,
          maxWidth: 220,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 4 }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
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
      <Handle type="source" position={Position.Right} style={{ background: '#475569', border: 'none', width: 8, height: 8 }} />
    </>
  );
}

const nodeTypes = { program: ProgramNode };

// --------------------------------------------------------------------------
// Raw program data
// All government / official programs with clear succession relationships.
// AATIP is included here even though it lives in network-graph.ts (not
// programs.json) because it is a critical link in the AAWSAP -> AATIP ->
// UAPTF succession chain.
// --------------------------------------------------------------------------

const RAW_NODES: Array<{ id: string; label: string; period: string; status: ProgramStatus }> = [
  // Historical Air Force programs
  { id: 'ipu',                       label: 'Interplanetary Phenomenon Unit (IPU)', period: '1947 (alleged)',          status: 'unknown'    },
  { id: 'project-sign',              label: 'Project Sign',                          period: '1947-1949',               status: 'defunct'    },
  { id: 'project-grudge',            label: 'Project Grudge',                        period: '1949-1952',               status: 'defunct'    },
  { id: 'project-blue-book',         label: 'Project Blue Book',                     period: '1952-1969',               status: 'defunct'    },
  { id: 'project-moon-dust',         label: 'Project Moon Dust',                     period: 'c. 1953-1985',            status: 'defunct'    },
  // Civil / research orgs
  { id: 'nicap',                     label: 'NICAP',                                 period: '1956-1980',               status: 'defunct'    },
  { id: 'mufon',                     label: 'MUFON',                                 period: '1969-present',            status: 'active'     },
  // Strategic / black-budget predecessor
  { id: 'sdi',                       label: 'SDI (Star Wars)',                       period: '1983-1993',               status: 'defunct'    },
  // Private research orgs
  { id: 'nids',                      label: 'NIDS',                                  period: '1995-2004',               status: 'defunct'    },
  { id: 'bigelow-aerospace',         label: 'Bigelow Aerospace / BAASS',             period: '1999-2020',               status: 'defunct'    },
  // Modern government programs
  { id: 'aawsap',                    label: 'AAWSAP',                                period: '2008-2012',               status: 'defunct'    },
  { id: 'aatip',                     label: 'AATIP',                                 period: '2007-2012',               status: 'defunct'    },
  { id: 'ttsa',                      label: 'To The Stars Academy',                  period: '2017-2021',               status: 'defunct'    },
  { id: 'kona-blue',                 label: 'Kona Blue',                             period: 'Proposed c. 2018-2021',   status: 'defunct'    },
  { id: 'uap-task-force',            label: 'UAP Task Force (UAPTF)',                period: '2020-2021',               status: 'defunct'    },
  { id: 'immaculate-constellation',  label: 'Immaculate Constellation',              period: 'Alleged ongoing',         status: 'classified' },
  { id: 'aaro',                      label: 'AARO',                                  period: '2022-present',            status: 'active'     },
  // Independent science programs
  { id: 'sol-foundation',            label: 'Sol Foundation',                        period: '2023-present',            status: 'active'     },
  { id: 'galileo-project',           label: 'The Galileo Project',                   period: '2021-present',            status: 'active'     },
];

// --------------------------------------------------------------------------
// Succession / relationship edges (program-to-program only)
// Sourced from the GraphLink[] array in data/network-graph.ts.
// --------------------------------------------------------------------------

const RAW_EDGES: Array<{ source: string; target: string; label: string }> = [
  { source: 'ipu',                      target: 'project-sign',       label: 'alleged predecessor of'    },
  { source: 'project-sign',             target: 'project-grudge',     label: 'predecessor of'             },
  { source: 'project-grudge',           target: 'project-blue-book',  label: 'predecessor of'             },
  { source: 'sdi',                      target: 'aawsap',             label: 'black-budget precedent for' },
  { source: 'nids',                     target: 'bigelow-aerospace',  label: 'evolved into BAASS'         },
  { source: 'nicap',                    target: 'project-blue-book',  label: 'investigated and critiqued' },
  { source: 'mufon',                    target: 'nicap',              label: 'succeeded as primary civilian org' },
  { source: 'aawsap',                   target: 'aatip',              label: 'preceded / overlapped with' },
  { source: 'aatip',                    target: 'uap-task-force',     label: 'predecessor of'             },
  { source: 'project-moon-dust',        target: 'uap-task-force',     label: 'predecessor of'             },
  { source: 'immaculate-constellation', target: 'uap-task-force',     label: 'related program'            },
  { source: 'kona-blue',                target: 'aaro',               label: 'assessed by'                },
  { source: 'uap-task-force',           target: 'aaro',               label: 'predecessor of'             },
];

// --------------------------------------------------------------------------
// Dagre layout
// --------------------------------------------------------------------------

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 120 });

  nodes.forEach(node =>
    g.setNode(node.id, {
      width: node.measured?.width ?? 220,
      height: node.measured?.height ?? 90,
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
          x: pos.x - (node.measured?.width ?? 220) / 2,
          y: pos.y - (node.measured?.height ?? 90) / 2,
        },
      };
    }),
    edges,
  };
}

// --------------------------------------------------------------------------
// Build initial nodes and edges
// --------------------------------------------------------------------------

function buildInitialElements(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = RAW_NODES.map(n => ({
    id: n.id,
    type: 'program',
    position: { x: 0, y: 0 }, // will be overwritten by dagre
    data: { label: n.label, period: n.period, status: n.status } as ProgramNodeData,
  }));

  const edges: Edge[] = RAW_EDGES.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    labelStyle: { fill: '#94a3b8', fontSize: 10 },
    labelBgStyle: { fill: '#0f172a', fillOpacity: 0.85 },
    style: { stroke: '#475569', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
    animated: false,
  }));

  // Run initial dagre layout with default node sizes
  return getLayoutedElements(nodes, edges);
}

const { nodes: initialNodes, edges: initialEdges } = buildInitialElements();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function ProgramLineageFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layouted, setLayouted] = useState(false);

  // Re-run layout once nodes have been measured by React Flow
  const onInit = useCallback(() => {
    setLayouted(true);
  }, []);

  useLayoutEffect(() => {
    if (!layouted) return;
    const { nodes: ln, edges: le } = getLayoutedElements(nodes, edges);
    setNodes(ln);
    setEdges(le);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layouted]);

  return (
    <div
      style={{
        width: '100%',
        height: 640,
        background: '#0f172a',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #1e293b',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.25}
        maxZoom={2}
        colorMode="dark"
        proOptions={{ hideAttribution: false }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#1e293b"
        />
        <Controls
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
