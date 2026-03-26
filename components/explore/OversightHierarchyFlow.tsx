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
import rawHierarchy from '../../data/org-hierarchy.json';
import rawPrograms from '../../data/programs.json';
import rawContractors from '../../data/contractors.json';
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

type NodeType = 'branch' | 'agency' | 'legislative' | 'program' | 'contractor';
type EdgeType = 'authority' | 'oversight' | 'contractual' | 'alleged' | 'influenced';
type ProgramStatus = 'active' | 'defunct' | 'classified' | 'unknown';

interface HierarchyNodeRaw {
  id: string;
  label?: string;
  sublabel?: string;
  type: NodeType;
  status?: string;
  description?: string;
}

interface HierarchyEdgeRaw {
  source: string;
  target: string;
  type: EdgeType;
}

interface ProgramRecord {
  id: string;
  name: string;
  status: string;
  active_period: string;
  parent_org: string;
  summary: string;
  key_personnel: Array<{ name: string; role: string; figure_id?: string }>;
}

interface ContractorRecord {
  id: string;
  name: string;
  sublabel: string;
  status: string;
  founded: string;
  headquarters: string;
  summary: string;
  description: string;
  uap_claims: Array<{ claim: string; credibility: string; status: string }>;
  connected_figures: Array<{ id: string; name: string; role: string }>;
}

// Node data shapes for ReactFlow
interface BranchNodeData extends Record<string, unknown> {
  label: string;
  sublabel: string;
  nodeType: NodeType;
}

interface AgencyNodeData extends Record<string, unknown> {
  label: string;
  sublabel: string;
  nodeType: NodeType;
  description: string;
}

interface ProgramNodeData extends Record<string, unknown> {
  label: string;
  period: string;
  status: ProgramStatus;
  parentOrg: string;
  summary: string;
  keyPersonnel: Array<{ name: string; role: string; figure_id?: string }>;
  programId: string;
  nodeType: 'program';
}

interface ContractorNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  sublabel: string;
  nodeType: 'contractor';
  status: string;
  founded?: string;
  headquarters?: string;
  description: string;
  uap_relevance: string;
  key_figures: string[];
}

type HierarchyNodeData = BranchNodeData | AgencyNodeData | ProgramNodeData | ContractorNodeData;

// --------------------------------------------------------------------------
// Style helper functions
// --------------------------------------------------------------------------

function getNodeStyle(type: NodeType, isDark: boolean) {
  const map: Record<NodeType, SemanticColorKey> = {
    branch:      'blueBright',
    agency:      'indigo',
    legislative: 'green',
    program:     'gray',
    contractor:  'violet',
  };
  const s = semColor(map[type], isDark);
  return { bg: s.bg, border: s.border, labelColor: s.badgeText };
}

function getProgramStatusStyle(status: ProgramStatus, isDark: boolean) {
  const map: Record<ProgramStatus, SemanticColorKey> = {
    active:     'green',
    defunct:    'gray',
    classified: 'red',
    unknown:    'amber',
  };
  return semColor(map[status] ?? 'gray', isDark);
}

const PROGRAM_STATUS_LABELS: Record<ProgramStatus, string> = {
  active: 'Active', defunct: 'Defunct', classified: 'Classified', unknown: 'Unknown',
};

const EDGE_STYLES: Record<EdgeType, { stroke: string; strokeDasharray?: string; label: string }> = {
  authority:    { stroke: DARK_STRUCTURAL.edgeStroke,                   label: 'Authority'   },
  oversight:    { stroke: '#15803d', strokeDasharray: '5,4',            label: 'Oversight'   },
  contractual:  { stroke: '#7c3aed', strokeDasharray: '3,3',            label: 'Contractual' },
  alleged:      { stroke: '#991b1b', strokeDasharray: '4,3',            label: 'Alleged'     },
  influenced:   { stroke: '#b45309', strokeDasharray: '6,3',            label: 'Influenced'  },
};

const NODE_W  = 165;
const NODE_H  = 65;
const PROG_H  = 85;

// --------------------------------------------------------------------------
// Build programs map for quick lookup
// --------------------------------------------------------------------------

const programsMap = new Map<string, ProgramRecord>(
  (rawPrograms as unknown as ProgramRecord[]).map(p => [p.id, p])
);

const contractorsMap = new Map<string, ContractorRecord>(
  (rawContractors as unknown as ContractorRecord[]).map(c => [c.id, c])
);

// --------------------------------------------------------------------------
// Custom node: branch
// --------------------------------------------------------------------------

function BranchNode({ data }: { data: BranchNodeData }) {
  const isDark = useFlowIsDark();
  const s = getNodeStyle('branch', isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <div style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: 10, padding: '10px 14px', width: NODE_W, minHeight: NODE_H, cursor: 'default', boxShadow: `0 0 14px ${s.border}33` }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: s.labelColor, lineHeight: 1.2 }}>{data.label}</div>
        <div style={{ fontSize: 10, color: st.textDim, marginTop: 3 }}>{data.sublabel}</div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
}

// --------------------------------------------------------------------------
// Custom node: agency / legislative
// --------------------------------------------------------------------------

function AgencyNode({ data }: { data: AgencyNodeData }) {
  const isDark = useFlowIsDark();
  const s = getNodeStyle(data.nodeType as 'agency' | 'legislative', isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 8, padding: '9px 12px', width: NODE_W, minHeight: NODE_H - 5, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: s.labelColor, lineHeight: 1.25 }}>{data.label}</div>
        {data.sublabel && <div style={{ fontSize: 10, color: st.textDim, marginTop: 2 }}>{data.sublabel}</div>}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
}

// --------------------------------------------------------------------------
// Custom node: program
// --------------------------------------------------------------------------

function ProgramNode({ data }: { data: ProgramNodeData }) {
  const isDark = useFlowIsDark();
  const s = getProgramStatusStyle(data.status, isDark);
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  return (
    <>
      <Handle type="target" position={Position.Top}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 8, padding: '8px 12px', width: NODE_W, minHeight: PROG_H, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: st.text, lineHeight: 1.3, marginBottom: 2 }}>{data.label}</div>
        <div style={{ fontSize: 10, color: st.textDim, marginBottom: 5 }}>{data.period}</div>
        <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: s.badge, color: s.badgeText, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {PROGRAM_STATUS_LABELS[data.status]}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
}

// --------------------------------------------------------------------------
// Custom node: contractor
// --------------------------------------------------------------------------

function ContractorNode({ data }: { data: ContractorNodeData }) {
  const isDark = useFlowIsDark();
  const sem = semColor('violet', isDark);
  const s = { bg: sem.bg, border: sem.border, labelColor: sem.badgeText, badge: sem.badge, badgeText: sem.badgeText };
  return (
    <>
      <Handle type="target" position={Position.Top}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Left}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <div style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 8, padding: '9px 12px', width: NODE_W, minHeight: NODE_H, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: s.labelColor, lineHeight: 1.25 }}>{data.label}</div>
        {data.sublabel && <div style={{ fontSize: 10, color: s.border, marginTop: 2, lineHeight: 1.3 }}>{data.sublabel}</div>}
        <div style={{ marginTop: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: s.badge, color: s.badgeText, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Contractor
          </span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
    </>
  );
}

const nodeTypes = {
  hierarchyBranch:      BranchNode,
  hierarchyAgency:      AgencyNode,
  hierarchyLegislative: AgencyNode,
  hierarchyProgram:     ProgramNode,
  hierarchyContractor:  ContractorNode,
} as const;

// --------------------------------------------------------------------------
// Edge legend
// --------------------------------------------------------------------------

const LEGEND_EDGE_TYPES: EdgeType[] = ['authority', 'oversight', 'contractual', 'alleged', 'influenced'];

interface EdgeLegendProps { isDark: boolean }
function EdgeLegend({ isDark }: EdgeLegendProps) {
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;
  // authority edge stroke adapts to theme
  const edgeStyles = { ...EDGE_STYLES, authority: { ...EDGE_STYLES.authority, stroke: st.edgeStroke } };
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: st.legendBg, border: `1px solid ${st.legendBorder}`, borderRadius: 8, padding: '8px 12px', backdropFilter: 'blur(4px)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: st.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Edge Type</div>
      {LEGEND_EDGE_TYPES.map(type => {
        const s = edgeStyles[type];
        return (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <svg width="22" height="8" style={{ flexShrink: 0 }}>
              <line x1="0" y1="4" x2="22" y2="4" stroke={s.stroke} strokeWidth="1.5" strokeDasharray={s.strokeDasharray ?? 'none'} />
            </svg>
            <span style={{ fontSize: 11, color: st.textMuted }}>{s.label}</span>
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
  node: Node;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onFigureNavigate: (id: string) => void;
  isDark: boolean;
}

function HierarchyDetailPanel({ node, onClose, onNavigate, onFigureNavigate, isDark }: DetailPanelProps) {
  const data = node.data as HierarchyNodeData;
  const nodeType = (data as { nodeType: NodeType }).nodeType;
  const st = isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL;

  if (nodeType === 'branch') {
    return null; // branch nodes show no panel
  }

  let borderColor = getNodeStyle('agency', isDark).border;
  let title = '';
  let subtitle = '';
  let body: React.ReactNode = null;
  let footerButton: React.ReactNode = null;

  if (nodeType === 'program') {
    const d = data as ProgramNodeData;
    const ps = getProgramStatusStyle(d.status, isDark);
    borderColor = ps.border;
    title = d.label;
    subtitle = `${d.parentOrg ? d.parentOrg + ' \u00b7 ' : ''}${d.period}`;
    body = (
      <>
        <p style={{ fontSize: 12, color: st.textMuted, lineHeight: 1.6, margin: '0 0 12px 0' }}>{d.summary}</p>
        {d.keyPersonnel.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: st.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Key Personnel</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {d.keyPersonnel.slice(0, 4).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <span style={{ color: st.edgeStroke, flexShrink: 0, fontSize: 12, marginTop: 1 }}>&bull;</span>
                  <span style={{ fontSize: 12, color: st.textValue, lineHeight: 1.4 }}>
                    {p.figure_id ? (
                      <button onClick={() => onFigureNavigate(p.figure_id as string)} style={{ background: 'none', border: 'none', padding: 0, color: '#7dd3fc', cursor: 'pointer', fontSize: 12, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: '2px' }}>
                        {p.name}
                      </button>
                    ) : <span>{p.name}</span>}
                    <span style={{ color: st.textDim }}> - {p.role}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
    footerButton = (
      <button onClick={() => onNavigate(d.programId)} style={{ width: '100%', padding: '7px 12px', background: '#0f2744', border: `1px solid ${ps.border}`, borderRadius: 6, color: '#7dd3fc', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        View Full Profile &rarr;
      </button>
    );
  } else if (nodeType === 'contractor') {
    const d = data as ContractorNodeData;
    borderColor = getNodeStyle('contractor', isDark).border;
    title = d.label;
    subtitle = [d.founded ? `Est. ${d.founded}` : '', d.headquarters].filter(Boolean).join(' \u00b7 ');
    body = (
      <>
        <p style={{ fontSize: 12, color: st.textMuted, lineHeight: 1.6, margin: '0 0 10px 0' }}>{d.description}</p>
        <div style={{ fontSize: 10, fontWeight: 700, color: st.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>UAP Relevance</div>
        <p style={{ fontSize: 12, color: st.textMuted, lineHeight: 1.6, margin: '0 0 10px 0' }}>
          {d.uap_relevance.length > 300 ? d.uap_relevance.slice(0, 300).trimEnd() + '\u2026' : d.uap_relevance}
        </p>
        {d.key_figures.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: st.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5 }}>Key Figures</div>
            {d.key_figures.map((f, i) => (
              <div key={i} style={{ fontSize: 12, color: st.textValue, marginBottom: 3 }}>&bull; {f}</div>
            ))}
          </div>
        )}
      </>
    );
  } else {
    // agency / legislative
    const d = data as AgencyNodeData;
    const s = getNodeStyle(nodeType as 'agency' | 'legislative', isDark);
    borderColor = s.border;
    title = d.label;
    subtitle = (d as { sublabel?: string }).sublabel ?? '';
    body = <p style={{ fontSize: 12, color: st.textMuted, lineHeight: 1.6, margin: 0 }}>{d.description}</p>;
  }

  return (
    <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 20, width: 'min(380px, calc(100vw - 24px))', background: st.panelBg, border: `1px solid ${borderColor}`, borderRadius: 10, backdropFilter: 'blur(6px)', boxShadow: '0 4px 24px rgba(0,0,0,0.6)', maxHeight: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${st.divider}`, flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: st.text, lineHeight: 1.3 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: st.textDim, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <button onClick={onClose} aria-label="Close panel" style={{ background: 'none', border: 'none', color: st.textDim, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: '0 0 0 4px', flexShrink: 0 }}>&times;</button>
      </div>
      <div style={{ padding: '10px 14px', overflowY: 'auto', flex: 1 }}>{body}</div>
      {footerButton && (
        <div style={{ padding: '8px 14px', borderTop: `1px solid ${st.divider}`, flexShrink: 0 }}>{footerButton}</div>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Dagre layout (authority + contractual + influenced only - not oversight)
// --------------------------------------------------------------------------

function getLayoutedElements(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const layoutEdges = edges.filter(e => (e.data as { edgeType: EdgeType }).edgeType !== 'oversight');

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 28, ranksep: 70 });

  nodes.forEach(node => {
    const h = node.type === 'hierarchyProgram' ? PROG_H : NODE_H;
    g.setNode(node.id, { width: node.measured?.width ?? NODE_W, height: node.measured?.height ?? h });
  });
  layoutEdges.forEach(e => g.setEdge(e.source, e.target));

  Dagre.layout(g);

  return {
    nodes: nodes.map(node => {
      const pos = g.node(node.id);
      const h = node.type === 'hierarchyProgram' ? PROG_H : NODE_H;
      return {
        ...node,
        position: {
          x: pos.x - (node.measured?.width  ?? NODE_W) / 2,
          y: pos.y - (node.measured?.height ?? h)      / 2,
        },
      };
    }),
    edges,
  };
}

// --------------------------------------------------------------------------
// Build initial elements from org-hierarchy.json + programs.json
// --------------------------------------------------------------------------

function buildInitialElements(): { nodes: Node[]; edges: Edge[] } {
  const hierarchyNodes = rawHierarchy.nodes as HierarchyNodeRaw[];
  const hierarchyEdges = rawHierarchy.edges as HierarchyEdgeRaw[];

  const nodes: Node[] = (hierarchyNodes.map(n => {
    if (n.type === 'program') {
      const prog = programsMap.get(n.id);
      if (!prog) return null;
      return {
        id: n.id,
        type: 'hierarchyProgram',
        position: { x: 0, y: 0 },
        data: {
          label:        prog.name,
          period:       prog.active_period,
          status:       (prog.status as ProgramStatus) ?? 'unknown',
          parentOrg:    prog.parent_org ?? '',
          summary:      prog.summary ?? '',
          keyPersonnel: prog.key_personnel ?? [],
          programId:    prog.id,
          nodeType:     'program',
        } as ProgramNodeData,
      };
    }

    if (n.type === 'contractor') {
      const c = contractorsMap.get(n.id);
      if (!c) return null;
      const uap_relevance = c.uap_claims.length > 0 ? c.uap_claims[0].claim : '';
      const key_figures = c.connected_figures.map(f => `${f.name} (${f.role})`);
      return {
        id: n.id,
        type: 'hierarchyContractor',
        position: { x: 0, y: 0 },
        data: {
          id:           c.id,
          label:        c.name,
          sublabel:     c.sublabel,
          nodeType:     'contractor',
          status:       c.status,
          founded:      c.founded,
          headquarters: c.headquarters,
          description:  c.description,
          uap_relevance,
          key_figures,
        } as ContractorNodeData,
      };
    }

    if (n.type === 'branch') {
      return {
        id: n.id,
        type: 'hierarchyBranch',
        position: { x: 0, y: 0 },
        data: { label: n.label ?? n.id, sublabel: n.sublabel ?? '', nodeType: 'branch', description: n.description ?? '' } as BranchNodeData,
      };
    }

    // agency or legislative
    return {
      id: n.id,
      type: n.type === 'legislative' ? 'hierarchyLegislative' : 'hierarchyAgency',
      position: { x: 0, y: 0 },
      data: {
        label:       n.label ?? n.id,
        sublabel:    n.sublabel ?? '',
        nodeType:    n.type,
        description: n.description ?? '',
      } as AgencyNodeData,
    };
  }) as (Node | null)[]).filter((n): n is Node => n !== null);

  const edges: Edge[] = hierarchyEdges.map((e, i) => {
    const s = EDGE_STYLES[e.type] ?? EDGE_STYLES.authority;
    return {
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      style: { stroke: s.stroke, strokeWidth: 1.5, strokeDasharray: s.strokeDasharray },
      markerEnd: { type: MarkerType.ArrowClosed, color: s.stroke, width: 14, height: 14 },
      animated: false,
      data: { edgeType: e.type },
    };
  });

  return getLayoutedElements(nodes, edges);
}

const { nodes: initialNodes, edges: initialEdges } = buildInitialElements();

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function OversightHierarchyFlow() {
  const router = useRouter();
  const { isDark, c } = useFlowTheme();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [layouted, setLayouted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onInit = useCallback(() => setLayouted(true), []);

  const handleNodeClick = useCallback((_evt: React.MouseEvent, node: Node) => {
    const nodeType = (node.data as { nodeType: NodeType }).nodeType;
    if (nodeType === 'branch') return; // branch nodes are non-interactive
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleNavigate = useCallback((programId: string) => {
    router.push(`/programs/${programId}?ref=oversight-hierarchy`);
  }, [router]);

  const handleFigureNavigate = useCallback((figureId: string) => {
    router.push(`/figures/${figureId}?ref=explore-oversight`);
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
      <div style={{ position: 'relative', width: '100%', height: 720, background: 'var(--flow-bg)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--flow-border)' }}>
        <EdgeLegend isDark={isDark} />

        {selectedNode && (
          <HierarchyDetailPanel
            node={selectedNode}
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
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.12}
          maxZoom={2}
          colorMode={isDark ? 'dark' : 'light'}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={c.dotColor} />
          <Controls showInteractive={false} style={{ background: c.ctrlBg, border: `1px solid ${c.ctrlBorder}`, borderRadius: 8 }} />
        </ReactFlow>
      </div>
    </FlowThemeContext.Provider>
  );
}
