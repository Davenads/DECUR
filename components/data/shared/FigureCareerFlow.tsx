'use client';

import React, { useCallback } from 'react';
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

// --------------------------------------------------------------------------
// Career event type detection (keyword-based)
// --------------------------------------------------------------------------

type CareerEventType = 'testimony' | 'transition' | 'publication' | 'classified' | 'default';

function detectEventType(event: string): CareerEventType {
  const lower = event.toLowerCase();
  if (/testif|congress|senate|house\s+over|committee|hearing/.test(lower)) return 'testimony';
  if (/resign|retir|left\s|depart|step.{0,4}down/.test(lower))             return 'transition';
  if (/publish|book|article|paper|report|wrote|authored/.test(lower))      return 'publication';
  if (/classif|program|clearance|access|cleared|TS\/SCI/.test(lower))      return 'classified';
  return 'default';
}

const EVENT_TYPE_STYLES: Record<CareerEventType, {
  border: string; bg: string; yearBg: string; yearText: string; label: string;
}> = {
  testimony:   { border: '#92400e', bg: '#1f1508', yearBg: '#92400e', yearText: '#fde68a', label: 'Testimony'   },
  transition:  { border: '#374151', bg: '#1a1f2b', yearBg: '#374151', yearText: '#9ca3af', label: 'Transition'  },
  publication: { border: '#065f46', bg: '#0a1f18', yearBg: '#065f46', yearText: '#a7f3d0', label: 'Publication' },
  classified:  { border: '#991b1b', bg: '#2a0d0d', yearBg: '#991b1b', yearText: '#fca5a5', label: 'Classified'  },
  default:     { border: '#1e3a8a', bg: '#0c1a3a', yearBg: '#1e3a8a', yearText: '#bfdbfe', label: 'Event'       },
};

// --------------------------------------------------------------------------
// Connection types (for career_connections enrichment)
// --------------------------------------------------------------------------

export type ConnectionType =
  | 'collaboration'
  | 'mentorship'
  | 'institutional'
  | 'publication'
  | 'testimony'
  | 'investigation'
  | 'opposition';

const CONN_TYPE_STYLES: Record<ConnectionType, { color: string; label: string }> = {
  collaboration: { color: '#2563eb', label: 'Collaboration'    },
  institutional: { color: '#7c3aed', label: 'Institutional'    },
  mentorship:    { color: '#db2777', label: 'Mentorship'        },
  publication:   { color: '#047857', label: 'Publication'       },
  testimony:     { color: '#b45309', label: 'Joint Testimony'   },
  investigation: { color: '#9f1239', label: 'Investigation'     },
  opposition:    { color: '#4b5563', label: 'Opposition'        },
};

// --------------------------------------------------------------------------
// Node dimensions & layout constants
// --------------------------------------------------------------------------

const NODE_WIDTH = 200;
const CON_WIDTH  = 160;
const CON_STEP   = 175;   // horizontal spacing between same-tier sibling connections
const STEP_X     = 260;   // horizontal spacing between career events
const CAREER_Y   = 150;   // y-position of main career chain (when connections present)
const UPPER_Y    = 0;     // y-position of upper connection tier (figures, documents)
const LOWER_Y    = 300;   // y-position of lower connection tier (programs, events)

// --------------------------------------------------------------------------
// Node data interfaces
// --------------------------------------------------------------------------

interface CareerNodeData extends Record<string, unknown> {
  year: string;
  event: string;
  eventType: CareerEventType;
}

interface ConnectionNodeData extends Record<string, unknown> {
  nodeLabel: string;
  relationship: string;
  connectionType: ConnectionType;
  nodeType: string;
}

// --------------------------------------------------------------------------
// Career event node
// --------------------------------------------------------------------------

function CareerNode({ data }: { data: CareerNodeData }) {
  const style = EVENT_TYPE_STYLES[data.eventType];
  return (
    <>
      <Handle type="target" position={Position.Left}   style={{ background: '#475569', border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Right}  style={{ background: '#475569', border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Top}    style={{ background: '#334155', border: 'none', width: 6, height: 6 }} id="top" />
      <Handle type="source" position={Position.Bottom} style={{ background: '#334155', border: 'none', width: 6, height: 6 }} id="bottom" />
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
        <span
          style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 7px',
            borderRadius: 999,
            background: style.yearBg,
            color: style.yearText,
            marginBottom: 6,
            letterSpacing: '0.03em',
          }}
        >
          {data.year}
        </span>
        <p
          style={{
            fontSize: 11,
            color: '#cbd5e1',
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {data.event}
        </p>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
// Connection node (enrichment: figure, program, document, event)
// --------------------------------------------------------------------------

function ConnectionNode({ data }: { data: ConnectionNodeData }) {
  const style = CONN_TYPE_STYLES[data.connectionType] ?? { color: '#64748b', label: 'Connection' };
  const typePrefix =
    data.nodeType === 'figure'   ? 'Person'   :
    data.nodeType === 'program'  ? 'Program'  :
    data.nodeType === 'document' ? 'Document' : 'Event';

  return (
    <>
      <Handle type="target" position={Position.Bottom} style={{ background: style.color, border: 'none', width: 6, height: 6 }} id="bottom" />
      <Handle type="target" position={Position.Top}    style={{ background: style.color, border: 'none', width: 6, height: 6 }} id="top" />
      <Handle type="source" position={Position.Left}   style={{ background: style.color, border: 'none', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right}  style={{ background: style.color, border: 'none', width: 6, height: 6 }} />
      <div
        style={{
          background: 'rgba(15,23,42,0.95)',
          border: `1.5px dashed ${style.color}`,
          borderRadius: 8,
          padding: '6px 10px',
          width: CON_WIDTH,
          boxShadow: `0 0 10px ${style.color}1a`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <span
            style={{
              fontSize: 8,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: '#64748b',
              background: '#1e293b',
              padding: '1px 5px',
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            {typePrefix}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: style.color,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {style.label}
          </span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', margin: '0 0 3px', lineHeight: 1.3 }}>
          {data.nodeLabel}
        </p>
        <p
          style={{
            fontSize: 10,
            color: '#94a3b8',
            margin: 0,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {data.relationship}
        </p>
      </div>
    </>
  );
}

const nodeTypes = { career: CareerNode, connection: ConnectionNode };

// --------------------------------------------------------------------------
// Legend
// --------------------------------------------------------------------------

function CareerLegend({ connectionTypes }: { connectionTypes: ConnectionType[] }) {
  const eventEntries = Object.entries(EVENT_TYPE_STYLES) as Array<[CareerEventType, typeof EVENT_TYPE_STYLES[CareerEventType]]>;
  const seen = new Set<string>();
  const uniqueConnTypes = connectionTypes.filter(ct => {
    if (seen.has(ct)) return false;
    seen.add(ct);
    return true;
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        background: 'rgba(15,23,42,0.90)',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '7px 10px',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Event types */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
        {eventEntries.map(([type, s]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.yearBg, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Connection types (shown only if enrichment data present) */}
      {uniqueConnTypes.length > 0 && (
        <>
          <div style={{ height: 1, background: '#1e293b', margin: '6px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 12px' }}>
            {uniqueConnTypes.map(ct => {
              const s = CONN_TYPE_STYLES[ct as ConnectionType];
              return s ? (
                <div key={ct} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    display: 'inline-block', width: 8, height: 8, borderRadius: 2,
                    border: `1.5px dashed ${s.color}`, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</span>
                </div>
              ) : null;
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Data types
// --------------------------------------------------------------------------

interface KeyEvent {
  year: string;
  event: string;
}

export interface CareerConnection {
  event_index: number;
  node_type: 'figure' | 'program' | 'document' | 'event';
  node_id: string;
  node_label: string;
  relationship: string;
  connection_type: ConnectionType;
}

// --------------------------------------------------------------------------
// Build React Flow elements
// --------------------------------------------------------------------------

function buildElements(
  keyEvents: KeyEvent[],
  connections: CareerConnection[],
): { nodes: Node[]; edges: Edge[] } {
  const hasConn = connections.length > 0;
  const careerY  = hasConn ? CAREER_Y : 0;

  // --- Career chain ---
  const careerNodes: Node[] = keyEvents.map((e, i) => ({
    id: `event-${i}`,
    type: 'career',
    position: { x: i * STEP_X, y: careerY },
    data: {
      year: e.year,
      event: e.event,
      eventType: detectEventType(e.event),
    } as CareerNodeData,
  }));

  const careerEdges: Edge[] = keyEvents.slice(0, -1).map((_, i) => ({
    id: `chain-${i}`,
    source: `event-${i}`,
    target: `event-${i + 1}`,
    type: 'smoothstep',
    style: { stroke: '#334155', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 14, height: 14 },
  }));

  if (!hasConn) return { nodes: careerNodes, edges: careerEdges };

  // --- Connection nodes ---
  // figures / documents → upper tier; programs / events → lower tier
  const upperByEvent: Record<number, CareerConnection[]> = {};
  const lowerByEvent: Record<number, CareerConnection[]> = {};

  connections.forEach(conn => {
    const isUpper = conn.node_type === 'figure' || conn.node_type === 'document';
    const bucket = isUpper ? upperByEvent : lowerByEvent;
    if (!bucket[conn.event_index]) bucket[conn.event_index] = [];
    bucket[conn.event_index].push(conn);
  });

  const connNodes: Node[] = [];
  const connEdges: Edge[] = [];

  function buildTier(
    byEvent: Record<number, CareerConnection[]>,
    tierY: number,
    handle: 'top' | 'bottom',
  ) {
    Object.entries(byEvent).forEach(([idxStr, conns]) => {
      const idx   = parseInt(idxStr, 10);
      const baseX = idx * STEP_X;
      const totalW = conns.length * CON_STEP - 15;
      const startX = baseX + (NODE_WIDTH - totalW) / 2;

      conns.forEach((conn, ci) => {
        const nodeId = `conn-${idx}-${handle}-${ci}`;
        connNodes.push({
          id: nodeId,
          type: 'connection',
          position: { x: startX + ci * CON_STEP, y: tierY },
          data: {
            nodeLabel: conn.node_label,
            relationship: conn.relationship,
            connectionType: conn.connection_type,
            nodeType: conn.node_type,
          } as ConnectionNodeData,
        });

        const color = CONN_TYPE_STYLES[conn.connection_type]?.color ?? '#64748b';
        connEdges.push({
          id: `edge-${nodeId}`,
          source: `event-${idx}`,
          sourceHandle: handle,
          target: nodeId,
          targetHandle: handle === 'top' ? 'bottom' : 'top',
          type: 'smoothstep',
          style: { stroke: color, strokeWidth: 1.5, strokeDasharray: '4 3' },
          markerEnd: { type: MarkerType.ArrowClosed, color, width: 12, height: 12 },
        });
      });
    });
  }

  buildTier(upperByEvent, UPPER_Y, 'top');
  buildTier(lowerByEvent, LOWER_Y, 'bottom');

  return {
    nodes: [...careerNodes, ...connNodes],
    edges: [...careerEdges, ...connEdges],
  };
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

interface Props {
  keyEvents: KeyEvent[];
  careerConnections?: CareerConnection[];
}

export default function FigureCareerFlow({ keyEvents, careerConnections = [] }: Props) {
  const { nodes: initNodes, edges: initEdges } = buildElements(keyEvents, careerConnections);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  const onInit = useCallback(() => {/* fitView handles initial positioning */}, []);

  const hasConn = careerConnections.length > 0;
  const connTypes = careerConnections.map(c => c.connection_type);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: hasConn ? 440 : 240,
        background: '#0f172a',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #1e293b',
      }}
    >
      <CareerLegend connectionTypes={connTypes} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        elementsSelectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
        <Controls
          showInteractive={false}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}
