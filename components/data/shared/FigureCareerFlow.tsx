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
// Event type detection (keyword-based, no data schema changes needed)
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

const TYPE_STYLES: Record<CareerEventType, {
  border: string; bg: string; yearBg: string; yearText: string; label: string;
}> = {
  testimony:   { border: '#92400e', bg: '#1f1508', yearBg: '#92400e', yearText: '#fde68a', label: 'Testimony'   },
  transition:  { border: '#374151', bg: '#1a1f2b', yearBg: '#374151', yearText: '#9ca3af', label: 'Transition'  },
  publication: { border: '#065f46', bg: '#0a1f18', yearBg: '#065f46', yearText: '#a7f3d0', label: 'Publication' },
  classified:  { border: '#991b1b', bg: '#2a0d0d', yearBg: '#991b1b', yearText: '#fca5a5', label: 'Classified'  },
  default:     { border: '#1e3a8a', bg: '#0c1a3a', yearBg: '#1e3a8a', yearText: '#bfdbfe', label: 'Event'       },
};

// --------------------------------------------------------------------------
// Node dimensions
// --------------------------------------------------------------------------

const NODE_WIDTH = 200;
const STEP_X     = 260;

// --------------------------------------------------------------------------
// Node data interface
// --------------------------------------------------------------------------

interface CareerNodeData extends Record<string, unknown> {
  year: string;
  event: string;
  eventType: CareerEventType;
}

// --------------------------------------------------------------------------
// Custom career node
// --------------------------------------------------------------------------

function CareerNode({ data }: { data: CareerNodeData }) {
  const style = TYPE_STYLES[data.eventType];
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
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#475569', border: 'none', width: 7, height: 7 }}
      />
    </>
  );
}

const nodeTypes = { career: CareerNode };

// --------------------------------------------------------------------------
// Legend
// --------------------------------------------------------------------------

function CareerLegend() {
  const entries = Object.entries(TYPE_STYLES) as Array<[CareerEventType, typeof TYPE_STYLES[CareerEventType]]>;
  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        background: 'rgba(15,23,42,0.88)',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '7px 10px',
        backdropFilter: 'blur(4px)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3px 12px',
      }}
    >
      {entries.map(([type, s]) => (
        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.yearBg, flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap' }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------------------------------------
// Build elements from key_events array
// --------------------------------------------------------------------------

interface KeyEvent {
  year: string;
  event: string;
}

function buildElements(keyEvents: KeyEvent[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = keyEvents.map((e, i) => ({
    id: `event-${i}`,
    type: 'career',
    position: { x: i * STEP_X, y: 0 },
    data: {
      year: e.year,
      event: e.event,
      eventType: detectEventType(e.event),
    } as CareerNodeData,
  }));

  const edges: Edge[] = keyEvents.slice(0, -1).map((_, i) => ({
    id: `edge-${i}`,
    source: `event-${i}`,
    target: `event-${i + 1}`,
    type: 'smoothstep',
    style: { stroke: '#334155', strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#475569', width: 14, height: 14 },
  }));

  return { nodes, edges };
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

interface Props {
  keyEvents: KeyEvent[];
}

export default function FigureCareerFlow({ keyEvents }: Props) {
  const { nodes: initNodes, edges: initEdges } = buildElements(keyEvents);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  const onInit = useCallback(() => {/* fitView handles initial positioning */}, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 240,
        background: '#0f172a',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #1e293b',
      }}
    >
      <CareerLegend />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
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
