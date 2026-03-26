'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  useNodeId,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
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

function getEventTypeStyle(type: CareerEventType, isDark: boolean) {
  const map: Record<CareerEventType, SemanticColorKey> = {
    testimony:   'amber',
    transition:  'gray',
    publication: 'emerald',
    classified:  'red',
    default:     'blue',
  };
  return semColor(map[type], isDark);
}

const EVENT_TYPE_LABELS: Record<CareerEventType, string> = {
  testimony:   'Testimony',
  transition:  'Transition',
  publication: 'Publication',
  classified:  'Classified',
  default:     'Event',
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
const CON_STEP   = 175;
const STEP_X     = 260;
const CAREER_Y   = 150;
const UPPER_Y    = 0;
const LOWER_Y    = 300;

// --------------------------------------------------------------------------
// Shared truncation registry (nodes report back to parent via ref)
// --------------------------------------------------------------------------

type TruncatedIdsRef = React.MutableRefObject<Set<string>>;

// --------------------------------------------------------------------------
// Node data interfaces
// --------------------------------------------------------------------------

interface CareerNodeData extends Record<string, unknown> {
  year: string;
  event: string;
  eventType: CareerEventType;
  truncatedIdsRef: TruncatedIdsRef;
}

interface ConnectionNodeData extends Record<string, unknown> {
  nodeLabel: string;
  relationship: string;
  connectionType: ConnectionType;
  nodeType: string;
  truncatedIdsRef: TruncatedIdsRef;
}

// Panel payload - discriminated union for both node types
type PanelData =
  | { kind: 'connection'; nodeLabel: string; relationship: string; connectionType: ConnectionType; nodeType: string }
  | { kind: 'event';      year: string; event: string; eventType: CareerEventType };

// --------------------------------------------------------------------------
// Shared truncation hook
// --------------------------------------------------------------------------

function useTruncation(ref: React.RefObject<HTMLParagraphElement | null>, truncatedIdsRef: TruncatedIdsRef): boolean {
  const nodeId = useNodeId() ?? '';
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const truncated = el.scrollHeight > el.clientHeight;
      setIsTruncated(truncated);
      if (truncated) {
        truncatedIdsRef.current.add(nodeId);
      } else {
        truncatedIdsRef.current.delete(nodeId);
      }
    };

    const obs = new ResizeObserver(check);
    obs.observe(el);
    check();

    return () => {
      obs.disconnect();
      truncatedIdsRef.current.delete(nodeId);
    };
  }, [nodeId, ref, truncatedIdsRef]);

  return isTruncated;
}

// --------------------------------------------------------------------------
// Tap-for-more affordance
// --------------------------------------------------------------------------

function TapForMore({ color }: { color: string }) {
  return (
    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 8, color, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        tap for more
      </span>
      <span style={{ fontSize: 9, color }}>&#x2197;</span>
    </div>
  );
}

// --------------------------------------------------------------------------
// Career event node
// --------------------------------------------------------------------------

function CareerNode({ data }: { data: CareerNodeData }) {
  const isDark = useFlowIsDark();
  const style = getEventTypeStyle(data.eventType, isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  const textRef = useRef<HTMLParagraphElement>(null);
  const isTruncated = useTruncation(textRef, data.truncatedIdsRef);

  return (
    <>
      <Handle type="target" position={Position.Left}   style={{ background: st.handle,  border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Right}  style={{ background: st.handle,  border: 'none', width: 7, height: 7 }} />
      <Handle type="source" position={Position.Top}    style={{ background: st.divider, border: 'none', width: 6, height: 6 }} id="top" />
      <Handle type="source" position={Position.Bottom} style={{ background: st.divider, border: 'none', width: 6, height: 6 }} id="bottom" />
      <div
        style={{
          background: style.bg,
          border: `1.5px solid ${style.border}`,
          borderRadius: 8,
          padding: '8px 12px',
          width: NODE_WIDTH,
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          cursor: isTruncated ? 'pointer' : 'default',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 7px',
            borderRadius: 999,
            background: style.badge,
            color: style.badgeText,
            marginBottom: 6,
            letterSpacing: '0.03em',
          }}
        >
          {data.year}
        </span>
        <p
          ref={textRef}
          style={{
            fontSize: 11,
            color: st.textValue,
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
        {isTruncated && <TapForMore color={style.badgeText} />}
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
// Connection node (enrichment: figure, program, document, event)
// --------------------------------------------------------------------------

function ConnectionNode({ data }: { data: ConnectionNodeData }) {
  const isDark = useFlowIsDark();
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  const style = CONN_TYPE_STYLES[data.connectionType] ?? { color: '#64748b', label: 'Connection' };
  const typePrefix =
    data.nodeType === 'figure'   ? 'Person'   :
    data.nodeType === 'program'  ? 'Program'  :
    data.nodeType === 'document' ? 'Document' : 'Event';

  const relRef = useRef<HTMLParagraphElement>(null);
  const isTruncated = useTruncation(relRef, data.truncatedIdsRef);

  return (
    <>
      <Handle type="target" position={Position.Bottom} style={{ background: style.color, border: 'none', width: 6, height: 6 }} id="bottom" />
      <Handle type="target" position={Position.Top}    style={{ background: style.color, border: 'none', width: 6, height: 6 }} id="top" />
      <Handle type="source" position={Position.Left}   style={{ background: style.color, border: 'none', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right}  style={{ background: style.color, border: 'none', width: 6, height: 6 }} />
      <div
        style={{
          background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(248,250,252,0.95)',
          border: `1.5px dashed ${style.color}`,
          borderRadius: 8,
          padding: '6px 10px',
          width: CON_WIDTH,
          boxShadow: `0 0 10px ${style.color}1a`,
          cursor: isTruncated ? 'pointer' : 'default',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
          <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: st.textDim, background: st.divider, padding: '1px 5px', borderRadius: 3, flexShrink: 0 }}>
            {typePrefix}
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: style.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {style.label}
          </span>
        </div>
        <p style={{ fontSize: 11, fontWeight: 600, color: st.text, margin: '0 0 3px', lineHeight: 1.3 }}>
          {data.nodeLabel}
        </p>
        <p
          ref={relRef}
          style={{
            fontSize: 10,
            color: st.textMuted,
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
        {isTruncated && <TapForMore color={style.color} />}
      </div>
    </>
  );
}

const nodeTypes = { career: CareerNode, connection: ConnectionNode };

// --------------------------------------------------------------------------
// Legend
// --------------------------------------------------------------------------

interface CareerLegendProps { connectionTypes: ConnectionType[]; isDark: boolean }
function CareerLegend({ connectionTypes, isDark }: CareerLegendProps) {
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  const eventEntries = (['testimony', 'transition', 'publication', 'classified', 'default'] as CareerEventType[]);
  const seen = new Set<string>();
  const uniqueConnTypes = connectionTypes.filter(ct => {
    if (seen.has(ct)) return false;
    seen.add(ct);
    return true;
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'center' }}>
      {eventEntries.map(type => {
        const s = getEventTypeStyle(type, isDark);
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: s.badge, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: st.textMuted, whiteSpace: 'nowrap' }}>{EVENT_TYPE_LABELS[type]}</span>
          </div>
        );
      })}
      {uniqueConnTypes.length > 0 && (
        <>
          <span style={{ display: 'inline-block', width: 1, height: 12, background: st.ctrlBorder, margin: '0 2px', flexShrink: 0 }} />
          {uniqueConnTypes.map(ct => {
            const s = CONN_TYPE_STYLES[ct as ConnectionType];
            return s ? (
              <div key={ct} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, border: `1.5px dashed ${s.color}`, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: st.textMuted, whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
            ) : null;
          })}
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
  truncatedIdsRef: TruncatedIdsRef,
): { nodes: Node[]; edges: Edge[] } {
  const hasConn = connections.length > 0;
  const careerY  = hasConn ? CAREER_Y : 0;

  const careerNodes: Node[] = keyEvents.map((e, i) => ({
    id: `event-${i}`,
    type: 'career',
    position: { x: i * STEP_X, y: careerY },
    data: {
      year: e.year,
      event: e.event,
      eventType: detectEventType(e.event),
      truncatedIdsRef,
    } as CareerNodeData,
  }));

  const careerEdges: Edge[] = keyEvents.slice(0, -1).map((_, i) => ({
    id: `chain-${i}`,
    source: `event-${i}`,
    target: `event-${i + 1}`,
    type: 'smoothstep',
    style: { stroke: DARK_STRUCTURAL.ctrlBorder, strokeWidth: 1.5 },
    markerEnd: { type: MarkerType.ArrowClosed, color: DARK_STRUCTURAL.edgeStroke, width: 14, height: 14 },
  }));

  if (!hasConn) return { nodes: careerNodes, edges: careerEdges };

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

  function buildTier(byEvent: Record<number, CareerConnection[]>, tierY: number, handle: 'top' | 'bottom') {
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
            nodeLabel:      conn.node_label,
            relationship:   conn.relationship,
            connectionType: conn.connection_type,
            nodeType:       conn.node_type,
            truncatedIdsRef,
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

  return { nodes: [...careerNodes, ...connNodes], edges: [...careerEdges, ...connEdges] };
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

interface Props {
  keyEvents: KeyEvent[];
  careerConnections?: CareerConnection[];
}

export default function FigureCareerFlow({ keyEvents, careerConnections = [] }: Props) {
  const { isDark, c } = useFlowTheme();
  const [selectedPanel, setSelectedPanel] = useState<PanelData | null>(null);

  // Stable ref - nodes register their truncation state here
  const truncatedIds = useRef<Set<string>>(new Set());

  const { nodes: initNodes, edges: initEdges } = useMemo(
    () => buildElements(keyEvents, careerConnections, truncatedIds),
    // truncatedIds is a stable ref - safe to omit from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyEvents, careerConnections],
  );

  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);

  // Deferred fitView - fires after ReactFlow measures custom nodes (ResizeObserver cycle).
  // The built-in fitView prop can fire before node dimensions are known on mobile,
  // leaving the viewport at scale=1 and clipping nodes that are off the initial screen.
  const onInit = useCallback((instance: ReactFlowInstance) => {
    requestAnimationFrame(() => instance.fitView({ padding: 0.2 }));
  }, []);

  // onNodeClick fixes the pointer-events: none issue - React Flow keeps pointer events
  // active on nodes when this prop is provided, allowing inner cursor/hover styles to work too.
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (!truncatedIds.current.has(node.id)) return;

    if (node.type === 'connection') {
      const d = node.data as ConnectionNodeData;
      setSelectedPanel({ kind: 'connection', nodeLabel: d.nodeLabel, relationship: d.relationship, connectionType: d.connectionType, nodeType: d.nodeType });
    } else if (node.type === 'career') {
      const d = node.data as CareerNodeData;
      setSelectedPanel({ kind: 'event', year: d.year, event: d.event, eventType: d.eventType });
    }
  }, []);

  const onPaneClick = useCallback(() => setSelectedPanel(null), []);

  const hasConn = careerConnections.length > 0;
  const connTypes = careerConnections.map(cc => cc.connection_type);

  return (
    <FlowThemeContext.Provider value={isDark}>
      <div style={{ width: '100%', background: 'var(--flow-bg)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--flow-border)' }}>
        <div style={{ position: 'relative', height: hasConn ? 440 : 240 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={onInit}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          colorMode={isDark ? 'dark' : 'light'}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          elementsSelectable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={c.dotColor} />
          <Controls showInteractive={false} style={{ background: c.ctrlBg, border: `1px solid ${c.ctrlBorder}`, borderRadius: 8 }} />
        </ReactFlow>

          {/* Detail panel - shown when a truncated node is clicked */}
          {selectedPanel && (() => {
          if (selectedPanel.kind === 'connection') {
            const connStyle = CONN_TYPE_STYLES[selectedPanel.connectionType] ?? { color: '#64748b', label: 'Connection' };
            const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
            return (
              <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 20, background: st.panelBg, border: `1px solid ${connStyle.color}`, borderRadius: 8, padding: '10px 14px', maxWidth: 380, backdropFilter: 'blur(4px)', boxShadow: `0 0 16px ${connStyle.color}33` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: connStyle.color, background: st.divider, padding: '2px 6px', borderRadius: 3, flexShrink: 0 }}>
                    {connStyle.label}
                  </span>
                  <p style={{ fontSize: 12, fontWeight: 700, color: st.text, margin: 0, flex: 1 }}>
                    {selectedPanel.nodeLabel}
                  </p>
                  <button onClick={() => setSelectedPanel(null)} style={{ background: 'none', border: 'none', color: st.edgeStroke, fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: '0 2px', flexShrink: 0 }} aria-label="Close">&#x00D7;</button>
                </div>
                <p style={{ fontSize: 11, color: st.textMuted, margin: 0, lineHeight: 1.55 }}>
                  {selectedPanel.relationship}
                </p>
              </div>
            );
          }

          // kind === 'event'
          const evStyle = getEventTypeStyle(selectedPanel.eventType, isDark);
          const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
          return (
            <div style={{ position: 'absolute', bottom: 10, left: 10, zIndex: 20, background: st.panelBg, border: `1px solid ${evStyle.border}`, borderRadius: 8, padding: '10px 14px', maxWidth: 380, backdropFilter: 'blur(4px)', boxShadow: `0 0 16px ${evStyle.border}33` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: evStyle.badge, color: evStyle.badgeText, letterSpacing: '0.03em', flexShrink: 0 }}>
                  {selectedPanel.year}
                </span>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: evStyle.badgeText, flex: 1 }}>
                  {EVENT_TYPE_LABELS[selectedPanel.eventType]}
                </span>
                <button onClick={() => setSelectedPanel(null)} style={{ background: 'none', border: 'none', color: st.edgeStroke, fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: '0 2px', flexShrink: 0 }} aria-label="Close">&#x00D7;</button>
              </div>
              <p style={{ fontSize: 11, color: st.textValue, margin: 0, lineHeight: 1.55 }}>
                {selectedPanel.event}
              </p>
            </div>
          );
        })()}
        </div>
        <div style={{ borderTop: `1px solid var(--flow-border)`, padding: '8px 12px' }}>
          <CareerLegend connectionTypes={connTypes} isDark={isDark} />
        </div>
      </div>
    </FlowThemeContext.Provider>
  );
}
