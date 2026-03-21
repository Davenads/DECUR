/**
 * Shared configuration for the "back to Explore" navigation pattern.
 *
 * When a user navigates from an Explore visualization to a detail page,
 * a `ref` query param is appended so the destination page can render a
 * contextual back button that returns to the correct section and tab.
 */

export type ExploreRef =
  | 'explore'              // Relationship Network
  | 'explore-oversight'    // Oversight Hierarchy - figures/[id]
  | 'explore-lineage'      // Program Lineage - figures/[id]
  | 'explore-cases'        // Evidence Tiers - cases/[id]
  | 'oversight-hierarchy'  // Oversight Hierarchy - programs/[id]
  | 'program-lineage';     // Program Lineage - programs/[id]

interface BackConfig {
  label: string;
  href: string;
}

const OVERSIGHT_HREF = '/explore?programs=hierarchy#program-lineage';
const LINEAGE_HREF   = '/explore?programs=lineage#program-lineage';

export const EXPLORE_BACK_CONFIGS: Record<ExploreRef, BackConfig> = {
  'explore':             { label: 'Relationship Network', href: '/explore#relationship-network' },
  'explore-oversight':   { label: 'Oversight Hierarchy',  href: OVERSIGHT_HREF },
  'explore-lineage':     { label: 'Program Lineage',      href: LINEAGE_HREF },
  'explore-cases':       { label: 'Evidence Tiers',       href: '/explore#evidence-tiers' },
  'oversight-hierarchy': { label: 'Oversight Hierarchy',  href: OVERSIGHT_HREF },
  'program-lineage':     { label: 'Program Lineage',      href: LINEAGE_HREF },
};

/**
 * Resolves the back button config from a raw `ref` query param value.
 * Returns null if the ref doesn't correspond to any Explore origin.
 */
export function resolveExploreRef(ref: string | null): BackConfig | null {
  if (ref && ref in EXPLORE_BACK_CONFIGS) {
    return EXPLORE_BACK_CONFIGS[ref as ExploreRef];
  }
  return null;
}
