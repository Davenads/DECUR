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

// Fixed node dimensions - used in both the renderer and dagre layout pass
const NODE_WIDTH  = 200;
const NODE_HEIGHT = 80;

// --------------------------------------------------------------------------
// Custom node renderer
// --------------------------------------------------------------------------

function ProgramNode({ data }: { data: ProgramNodeData }) {
  const style = STATUS_STYLES[data.status];
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#475569', border: 'none', width: 8, height: 8 }}
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
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#475569', border: 'none', width: 8, height: 8 }}
      />
    </>
  );
}

const nodeTypes = { program: ProgramNode };

// --------------------------------------------------------------------------
// Status legend (overlaid inside the flow container)
// --------------------------------------------------------------------------

const LEGEND_ENTRIES: Array<{ status: ProgramStatus }> = [
  { status: 'active'     },
  { status: 'defunct'    },
  { status: 'classified' },
  { status: 'unknown'    },
];

function StatusLegend() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        background: 'rgba(15,23,42,0.85)',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '8px 12px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
        Status
      </div>
      {LEGEND_ENTRIES.map(({ status }) => {
        const s = STATUS_STYLES[status];
        return (
          <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: s.badge }} />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{STATUS_LABELS[status]}</span>
          </div>
        );
      })}
    </div>
  );
}

// --------------------------------------------------------------------------
// Raw program data
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
  { id: 'galileo-project',           label: 'The Galileo Project',                   period: '2021-present',            status: 'active'     },
  { id: 'sol-foundation',            label: 'Sol Foundation',                        period: '2023-present',            status: 'active'     },
];

// --------------------------------------------------------------------------
// Succession / relationship edges
// --------------------------------------------------------------------------

const RAW_EDGES: Array<{ source: string; target: string }> = [
  { source: 'ipu',                      target: 'project-sign'          },
  { source: 'project-sign',             target: 'project-grudge'        },
  { source: 'project-grudge',           target: 'project-blue-book'     },
  { source: 'nicap',                    target: 'mufon'                 }, // NICAP (1956) preceded and influenced MUFON (1969)
  { source: 'nicap',                    target: 'project-blue-book'     }, // investigated and critiqued
  { source: 'sdi',                      target: 'aawsap'                }, // black-budget precedent
  { source: 'nids',                     target: 'bigelow-aerospace'     }, // evolved into BAASS
  { source: 'bigelow-aerospace',        target: 'aawsap'                }, // BAASS was the AAWSAP contractor
  { source: 'aawsap',                   target: 'aatip'                 }, // preceded / overlapped with
  { source: 'aatip',                    target: 'uap-task-force'        }, // predecessor
  { source: 'project-moon-dust',        target: 'uap-task-force'        }, // predecessor
  { source: 'immaculate-constellation', target: 'uap-task-force'        }, // related program
  { source: 'ttsa',                     target: 'uap-task-force'        }, // 2017 video releases triggered UAPTF formation
  { source: 'kona-blue',                target: 'aaro'                  }, // assessed by AARO
  { source: 'uap-task-force',           target: 'aaro'                  }, // predecessor of AARO
  { source: 'uap-task-force',           target: 'galileo-project'       }, // UAPTF 2021 report inspired Loeb to launch Galileo
  { source: 'galileo-project',          target: 'sol-foundation'        }, // Loeb leads both; Sol Foundation grew from Galileo work
];

// --------------------------------------------------------------------------
// Dagre layout
// --------------------------------------------------------------------------

function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } {
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
// Build initial nodes and edges
// --------------------------------------------------------------------------

function buildInitialElements(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = RAW_NODES.map(n => ({
    id: n.id,
    type: 'program',
    position: { x: 0, y: 0 },
    data: { label: n.label, period: n.period, status: n.status } as ProgramNodeData,
  }));

  const edges: Edge[] = RAW_EDGES.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    style: { stroke: '#475569', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 16, height: 16 },
    animated: false,
  }));

  return getLayoutedElements(nodes, edges);
}

const { nodes: initialNodes, edges: initialEdges } = buildInitialElements();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function ProgramLineageFlow() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layouted, setLayouted] = useState(false);

  const onInit = useCallback(() => {
    setLayouted(true);
  }, []);

  const handleNodeClick = useCallback((_evt: React.MouseEvent, node: Node) => {
    router.push(`/programs/${node.id}?ref=program-lineage`);
  }, [router]);

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
        position: 'relative',
        width: '100%',
        height: 720,
        background: '#0f172a',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #1e293b',
      }}
    >
      <StatusLegend />
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
