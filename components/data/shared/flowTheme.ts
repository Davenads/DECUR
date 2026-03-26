/**
 * flowTheme.ts - Centralized XYFlow / ReactFlow color tokens
 *
 * SSOT for all theme-aware colors used across the six ReactFlow visualizations:
 *   - ProgramLineageFlow, OversightHierarchyFlow, EvidenceTierFlow,
 *     CongressionalDisclosureFlow (components/explore/)
 *   - FigureCareerFlow, DocumentProvenanceFlow (components/data/shared/)
 *
 * Usage in a parent component:
 *   const { isDark, c, sem } = useFlowTheme();
 *   // c.*   → structural neutral token (bg, border, text, edge, etc.)
 *   // sem() → semantic color tuple for a named color family
 *
 * Usage in a custom node renderer (module-level component):
 *   const isDark = useContext(FlowThemeContext);
 *   const colors = sem('green', isDark);   // or use the semFn helper
 */

import React, { useContext } from 'react';
import { useTheme } from 'next-themes';

// ============================================================
// Structural tokens  (neutral scaffold colors for all canvases)
// ============================================================

export interface StructuralTokens {
  containerBg:   string;
  border:        string;
  text:          string;
  textMuted:     string;
  textDim:       string;
  textValue:     string;
  edgeStroke:    string;
  handle:        string;
  dotColor:      string;
  ctrlBg:        string;
  ctrlBorder:    string;
  divider:       string;
  panelBg:       string;
  legendBg:      string;
  legendBorder:  string;
}

export const DARK_STRUCTURAL: StructuralTokens = {
  containerBg:   '#0f172a',
  border:        '#1e293b',
  text:          '#f1f5f9',
  textMuted:     '#94a3b8',
  textDim:       '#64748b',
  textValue:     '#cbd5e1',
  edgeStroke:    '#475569',
  handle:        '#475569',
  dotColor:      '#1e293b',
  ctrlBg:        '#1e293b',
  ctrlBorder:    '#334155',
  divider:       '#1e293b',
  panelBg:       'rgba(15,23,42,0.97)',
  legendBg:      'rgba(15,23,42,0.85)',
  legendBorder:  '#1e293b',
};

export const LIGHT_STRUCTURAL: StructuralTokens = {
  containerBg:   '#f8fafc',
  border:        '#cbd5e1',
  text:          '#0f172a',
  textMuted:     '#64748b',
  textDim:       '#94a3b8',
  textValue:     '#334155',
  edgeStroke:    '#94a3b8',
  handle:        '#94a3b8',
  dotColor:      '#cbd5e1',
  ctrlBg:        '#ffffff',
  ctrlBorder:    '#cbd5e1',
  divider:       '#e2e8f0',
  panelBg:       'rgba(248,250,252,0.97)',
  legendBg:      'rgba(248,250,252,0.90)',
  legendBorder:  '#cbd5e1',
};

// ============================================================
// Semantic color tuples (for node/edge color maps)
// ============================================================

export interface SemanticColor {
  bg:        string;
  border:    string;
  badge:     string;
  badgeText: string;
}

interface SemanticColorSet {
  dark:  SemanticColor;
  light: SemanticColor;
}

/**
 * Named color families used across the XYFlow components.
 * Each key maps to a dark/light tuple.
 *
 * Naming follows Tailwind color naming where possible.
 */
export const SEMANTIC_COLORS = {
  // --- greens ---
  green:   {
    dark:  { bg: '#0d2818', border: '#166534', badge: '#166534', badgeText: '#bbf7d0' },
    light: { bg: '#dcfce7', border: '#166534', badge: '#166534', badgeText: '#ffffff' },
  },
  emerald: {
    dark:  { bg: '#0a1f18', border: '#065f46', badge: '#065f46', badgeText: '#a7f3d0' },
    light: { bg: '#d1fae5', border: '#065f46', badge: '#065f46', badgeText: '#ffffff' },
  },
  // --- reds ---
  red: {
    dark:  { bg: '#2a0d0d', border: '#991b1b', badge: '#991b1b', badgeText: '#fca5a5' },
    light: { bg: '#fee2e2', border: '#991b1b', badge: '#991b1b', badgeText: '#ffffff' },
  },
  // --- ambers / yellows ---
  amber: {
    dark:  { bg: '#1f1508', border: '#92400e', badge: '#92400e', badgeText: '#fde68a' },
    light: { bg: '#fef3c7', border: '#92400e', badge: '#92400e', badgeText: '#ffffff' },
  },
  yellow: {
    dark:  { bg: '#1a1005', border: '#b45309', badge: '#b45309', badgeText: '#fde68a' },
    light: { bg: '#fef9c3', border: '#b45309', badge: '#b45309', badgeText: '#ffffff' },
  },
  // --- neutrals ---
  gray: {
    dark:  { bg: '#1a1f2b', border: '#374151', badge: '#374151', badgeText: '#9ca3af' },
    light: { bg: '#e2e8f0', border: '#94a3b8', badge: '#64748b', badgeText: '#ffffff' },
  },
  // --- blues ---
  blue: {
    dark:  { bg: '#0c1a3a', border: '#1e3a8a', badge: '#1e3a8a', badgeText: '#bfdbfe' },
    light: { bg: '#dbeafe', border: '#1e3a8a', badge: '#1e3a8a', badgeText: '#ffffff' },
  },
  indigo: {
    dark:  { bg: '#0c1635', border: '#1e40af', badge: '#1e40af', badgeText: '#bfdbfe' },
    light: { bg: '#e0e7ff', border: '#1e40af', badge: '#1e40af', badgeText: '#ffffff' },
  },
  // --- purples / violets ---
  violet: {
    dark:  { bg: '#1e1040', border: '#7c3aed', badge: '#7c3aed', badgeText: '#ddd6fe' },
    light: { bg: '#ede9fe', border: '#7c3aed', badge: '#7c3aed', badgeText: '#ffffff' },
  },
  purple: {
    dark:  { bg: '#1a0a3d', border: '#4c1d95', badge: '#4c1d95', badgeText: '#ddd6fe' },
    light: { bg: '#ede9fe', border: '#4c1d95', badge: '#4c1d95', badgeText: '#ffffff' },
  },
  // --- cyans / teals ---
  cyan: {
    dark:  { bg: '#07222b', border: '#0e7490', badge: '#0e7490', badgeText: '#a5f3fc' },
    light: { bg: '#cffafe', border: '#0e7490', badge: '#0e7490', badgeText: '#ffffff' },
  },
  teal: {
    dark:  { bg: '#071919', border: '#0f766e', badge: '#0f766e', badgeText: '#99f6e4' },
    light: { bg: '#ccfbf1', border: '#0f766e', badge: '#0f766e', badgeText: '#ffffff' },
  },
  // --- blues (oversight hierarchy node types) ---
  blueBright: {
    dark:  { bg: '#0c1a40', border: '#3b82f6', badge: '#3b82f6', badgeText: '#93c5fd' },
    light: { bg: '#eff6ff', border: '#3b82f6', badge: '#3b82f6', badgeText: '#1d4ed8' },
  },
} satisfies Record<string, SemanticColorSet>;

export type SemanticColorKey = keyof typeof SEMANTIC_COLORS;

/**
 * Helper to resolve a semantic color tuple.
 * Accepts isDark as an argument so it can be called from module-level node renderers.
 */
export function sem(color: SemanticColorKey, isDark: boolean): SemanticColor {
  return SEMANTIC_COLORS[color][isDark ? 'dark' : 'light'];
}

// ============================================================
// React Context — threads isDark to module-level node renderers
// ============================================================

export const FlowThemeContext = React.createContext<boolean>(true);

/**
 * Convenience hook for module-level node renderers.
 * Returns the current isDark flag from the nearest FlowThemeContext.Provider.
 */
export function useFlowIsDark(): boolean {
  return useContext(FlowThemeContext);
}

// ============================================================
// useFlowTheme hook — used by the parent canvas component
// ============================================================

export interface FlowTheme {
  isDark: boolean;
  /** Structural neutral tokens (bg, border, text, edge, etc.) */
  c: StructuralTokens;
  /** Resolve a semantic color tuple by name */
  sem: (color: SemanticColorKey) => SemanticColor;
}

/**
 * Primary hook for parent ReactFlow canvas components.
 * Returns structural tokens and a sem() resolver bound to the current theme.
 *
 * Usage:
 *   const { isDark, c, sem } = useFlowTheme();
 */
export function useFlowTheme(): FlowTheme {
  const { resolvedTheme } = useTheme();
  // Default to dark during SSR / before hydration
  const isDark = resolvedTheme !== 'light';
  return {
    isDark,
    c: isDark ? DARK_STRUCTURAL : LIGHT_STRUCTURAL,
    sem: (color: SemanticColorKey) => SEMANTIC_COLORS[color][isDark ? 'dark' : 'light'],
  };
}
