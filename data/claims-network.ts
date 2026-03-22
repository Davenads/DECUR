/**
 * Claims Corroboration Network data layer.
 *
 * Aggregates claims from all profiles that have a `claims` array with `category` fields,
 * then builds a bipartite graph: figure nodes <-> category nodes.
 *
 * Category node size = number of witnesses (bigger = more corroboration)
 * Edge color = dominant claim status for that figure in that category
 */

import { insiderRegistry } from './key-figures/registry';
import insiderIndexRaw from './key-figures/index.json';

interface IndexEntry {
  id: string;
  name: string;
  type: string;
  status: string;
}
const insiderIndex = insiderIndexRaw as IndexEntry[];

// ── Canonical category definitions ─────────────────────────────

export const CLAIM_CATEGORIES: Record<string, { label: string; color: string; description: string }> = {
  'crash-retrieval': {
    label: 'Crash Retrieval',
    color: '#c97840',
    description: 'Recovery and possession of craft of non-human origin',
  },
  'recovered-materials': {
    label: 'Recovered Materials',
    color: '#9d7ec9',
    description: 'Non-human biologics, alloys, and physical materials',
  },
  'gov-programs': {
    label: 'Gov. Programs',
    color: '#3d9e96',
    description: 'Government UAP investigation and research programs',
  },
  'gov-coverup': {
    label: 'Gov. Cover-up',
    color: '#c04060',
    description: 'Concealment from Congress, misappropriation, obstruction',
  },
  'retaliation': {
    label: 'Retaliation',
    color: '#e07090',
    description: 'Whistleblower persecution and career retaliation',
  },
  'observation': {
    label: 'Direct Observation',
    color: '#6da3d8',
    description: 'Firsthand UAP sightings and sensor encounters',
  },
  'technology': {
    label: 'Technology',
    color: '#4ea86a',
    description: 'Craft propulsion, performance, and technical characteristics',
  },
  'nhi': {
    label: 'NHI & Origin',
    color: '#b060c0',
    description: 'Non-human intelligence, contact, and origin hypotheses',
  },
  'phenomenon': {
    label: 'Phenomenon',
    color: '#c0a030',
    description: 'Phenomenon characteristics, consciousness effects, extended encounters',
  },
  'gov-awareness': {
    label: 'Gov. Awareness',
    color: '#7a9a4a',
    description: 'Government knowledge of UAP and institutional responses',
  },
  'credentials': {
    label: 'Background',
    color: '#8090a8',
    description: 'Employment, credentials, clearances, and career context',
  },
  'biological': {
    label: 'Biological Effects',
    color: '#e06040',
    description: 'Physical effects on witnesses including injuries and neurological changes',
  },
  'disclosure': {
    label: 'Disclosure',
    color: '#5a7a9a',
    description: 'Public disclosure, congressional testimony, and documentation',
  },
  'historical': {
    label: 'Historical Cases',
    color: '#a07050',
    description: 'Historical UAP incidents and documented cases',
  },
};

// ── Category normalization map ──────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  'crash retrieval': 'crash-retrieval',
  'craft': 'crash-retrieval',
  'craft description': 'crash-retrieval',
  'non-human materials': 'recovered-materials',
  'recovered materials': 'recovered-materials',
  'physical evidence': 'recovered-materials',
  'government program': 'gov-programs',
  'government programs': 'gov-programs',
  'program existence': 'gov-programs',
  'program management': 'gov-programs',
  'program corroboration': 'gov-programs',
  'government cover-up': 'gov-coverup',
  'reporting suppression': 'gov-coverup',
  'government access': 'gov-coverup',
  'government structure': 'gov-coverup',
  'national security': 'gov-coverup',
  'funding misappropriation': 'gov-coverup',
  'retaliation': 'retaliation',
  'direct observation': 'observation',
  'observation': 'observation',
  'direct encounter': 'observation',
  'electronic detection': 'observation',
  'behavioral observation': 'observation',
  'uap reality': 'phenomenon',
  'extended phenomenon': 'phenomenon',
  'phenomenon characteristics': 'phenomenon',
  'personal experience': 'phenomenon',
  'consciousness phenomena': 'phenomenon',
  'technology assessment': 'technology',
  'technology': 'technology',
  'uap characteristics': 'technology',
  'uap propulsion': 'technology',
  'propulsion': 'technology',
  'physics': 'technology',
  'behavior': 'technology',
  'non-human intelligence': 'nhi',
  'non-human contact': 'nhi',
  'uap origin': 'nhi',
  'government knowledge': 'gov-awareness',
  'government awareness': 'gov-awareness',
  'government response': 'gov-awareness',
  'witness assessment': 'gov-awareness',
  'historical case': 'historical',
  'employment': 'credentials',
  'credentials': 'credentials',
  'los-alamos': 'credentials',
  'clearance': 'credentials',
  'research position': 'credentials',
  'intelligence': 'credentials',
  'briefings': 'disclosure',
  'disclosure': 'disclosure',
  'document': 'disclosure',
  'biological effects': 'biological',
};

// ── Figure type colors ──────────────────────────────────────────

export const FIGURE_TYPE_COLORS: Record<string, string> = {
  'insider':    '#6da3d8',
  'scientist':  '#4ea86a',
  'pilot':      '#3d9e96',
  'official':   '#c9973a',
  'journalist': '#8090a8',
  'executive':  '#c97840',
};

// ── Claim status colors ─────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  'verified':                '#4ea86a',
  'partially-verified':      '#6da3d8',
  'unverified':              '#6a6a7a',
  'disputed':                '#c97840',
  'partially-contradicted':  '#c04060',
};

export const STATUS_LABELS: Record<string, string> = {
  'verified':                'Verified',
  'partially-verified':      'Partially Verified',
  'unverified':              'Unverified',
  'disputed':                'Disputed',
  'partially-contradicted':  'Partially Contradicted',
};

const STATUS_PRIORITY: Record<string, number> = {
  'verified': 5,
  'partially-verified': 4,
  'disputed': 3,
  'partially-contradicted': 2,
  'unverified': 1,
};

function getDominantStatus(statuses: string[]): string {
  if (statuses.length === 0) return 'unverified';
  return statuses.reduce((best, cur) =>
    (STATUS_PRIORITY[cur] ?? 0) > (STATUS_PRIORITY[best] ?? 0) ? cur : best,
    'unverified'
  );
}

// ── Graph node / link types ─────────────────────────────────────

export interface ClaimNode {
  id: string;
  name: string;
  type: 'figure' | 'category';
  figureType?: string;
  claimCount?: number;
  figureCount?: number;
  val: number;
  x?: number;
  y?: number;
}

export interface ClaimLink {
  source: string | ClaimNode;
  target: string | ClaimNode;
  status: string;
  claimCount: number;
  claimText: string;
}

// ── Builder ─────────────────────────────────────────────────────

function buildClaimsGraphData(): { nodes: ClaimNode[]; links: ClaimLink[] } {
  const indexMap = new Map(insiderIndex.map(e => [e.id, e]));

  const categoryStats: Record<string, { figureCount: number; claimCount: number }> = {};
  const figureStats: Record<string, { name: string; type: string; categoryCount: number }> = {};
  const linkMap: Record<string, { statuses: string[]; claimCount: number; firstClaim: string }> = {};

  for (const [id, data] of Object.entries(insiderRegistry)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyData = data as any;
    const claims = anyData?.claims;
    if (!Array.isArray(claims) || claims.length === 0) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categorized = claims.filter((c: any) => c?.category && typeof c.category === 'string' && c?.claim);
    if (categorized.length === 0) continue;

    const entry = indexMap.get(id);
    if (!entry || entry.status !== 'detailed') continue;

    const figureName = entry.name || anyData?.profile?.name || id;
    const figureType = entry.type || 'insider';

    const byCategory: Record<string, Array<{ status: string; claim: string }>> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const c of categorized as any[]) {
      const raw = (c.category as string).toLowerCase().trim();
      const canon = CATEGORY_MAP[raw];
      if (!canon) continue;
      if (!byCategory[canon]) byCategory[canon] = [];
      byCategory[canon].push({ status: c.status || 'unverified', claim: c.claim as string });
    }

    const catCount = Object.keys(byCategory).length;
    if (catCount === 0) continue;

    figureStats[id] = { name: figureName, type: figureType, categoryCount: catCount };

    for (const [catId, catClaims] of Object.entries(byCategory)) {
      if (!categoryStats[catId]) categoryStats[catId] = { figureCount: 0, claimCount: 0 };
      categoryStats[catId].figureCount++;
      categoryStats[catId].claimCount += catClaims.length;

      const key = `${id}___${catId}`;
      linkMap[key] = {
        statuses: catClaims.map(c => c.status),
        claimCount: catClaims.length,
        firstClaim: catClaims[0].claim,
      };
    }
  }

  const nodes: ClaimNode[] = [];

  // Category nodes - size scales with figure count (corroboration strength)
  for (const [catId, stats] of Object.entries(categoryStats)) {
    if (!CLAIM_CATEGORIES[catId]) continue;
    nodes.push({
      id: `cat_${catId}`,
      name: CLAIM_CATEGORIES[catId].label,
      type: 'category',
      claimCount: stats.claimCount,
      figureCount: stats.figureCount,
      val: Math.max(5, stats.figureCount * 2),
    });
  }

  // Figure nodes - size scales with number of claim categories
  for (const [id, stats] of Object.entries(figureStats)) {
    nodes.push({
      id: `fig_${id}`,
      name: stats.name,
      type: 'figure',
      figureType: stats.type,
      val: Math.max(2, stats.categoryCount),
    });
  }

  const links: ClaimLink[] = [];
  for (const [key, ld] of Object.entries(linkMap)) {
    const [figId, catId] = key.split('___');
    links.push({
      source: `fig_${figId}`,
      target: `cat_${catId}`,
      status: getDominantStatus(ld.statuses),
      claimCount: ld.claimCount,
      claimText: ld.firstClaim,
    });
  }

  return { nodes, links };
}

export const claimsGraphData = buildClaimsGraphData();
