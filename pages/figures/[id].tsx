import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SeoHead from '../../components/SeoHead';
import { InsiderEntry } from '../../types/data';
import { resolveExploreRef } from '../../lib/exploreRef';
import insiderIndex from '../../data/key-figures/index.json';
import casesData from '../../data/cases.json';
import documentsData from '../../data/documents.json';
import papersData from '../../data/research/papers.json';
import GenericInsiderProfile from '../../components/data/key-figures/GenericInsiderProfile';
import InsiderProfile from '../../components/data/InsiderProfile';
import LazarProfile from '../../components/data/LazarProfile';
import GruschProfile from '../../components/data/GruschProfile';
import ElizondoProfile from '../../components/data/ElizondoProfile';
import FravorProfile from '../../components/data/FravorProfile';
import NellProfile from '../../components/data/NellProfile';
import NolanProfile from '../../components/data/NolanProfile';
import PuthoffProfile from '../../components/data/PuthoffProfile';
import MellonProfile from '../../components/data/MellonProfile';
import DavisProfile from '../../components/data/DavisProfile';
import BigelowProfile from '../../components/data/BigelowProfile';
import ValleeProfile from '../../components/data/ValleeProfile';
import PopeProfile from '../../components/data/PopeProfile';
import BarberProfile from '../../components/data/BarberProfile';
import GallaudetProfile from '../../components/data/GallaudetProfile';

interface BespokeProps { onBack: () => void; backLabel: string; networkNodeId?: string; }

/** Registry of bespoke profile components. Add new entries here when creating a Tier 2 component. */
const BESPOKE_REGISTRY: Record<string, React.ComponentType<BespokeProps>> = {
  'dan-burisch':    InsiderProfile,
  'bob-lazar':      LazarProfile,
  'david-grusch':   GruschProfile,
  'luis-elizondo':  ElizondoProfile,
  'david-fravor':   FravorProfile,
  'hal-puthoff':    PuthoffProfile,
  'garry-nolan':    NolanProfile,
  'karl-nell':      NellProfile,
  'chris-mellon':   MellonProfile,
  'eric-davis':     DavisProfile,
  'robert-bigelow': BigelowProfile,
  'jacques-vallee': ValleeProfile,
  'nick-pope':      PopeProfile,
  'jake-barber':    BarberProfile,
  'tim-gallaudet':  GallaudetProfile,
};

interface RelatedCase { id: string; name: string; date: string; location: string; evidence_tier: string; }
interface RelatedDocument { id: string; name: string; date: string; document_type: string; }
interface RelatedPaper { id: string; title: string; authors: string[]; year: number; journal: string | null; decur_url?: string; }

const TIER_COLORS: Record<string, string> = {
  'tier-1': '#10b981', 'tier-2': '#f59e0b', 'tier-3': '#94a3b8',
};
const TIER_LABELS: Record<string, string> = {
  'tier-1': 'Tier 1', 'tier-2': 'Tier 2', 'tier-3': 'Tier 3',
};

const RelatedCrossLinksSection: React.FC<{ cases: RelatedCase[]; documents: RelatedDocument[]; papers: RelatedPaper[] }> = ({ cases, documents, papers }) => {
  if (cases.length === 0 && documents.length === 0 && papers.length === 0) return null;
  return (
    <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Cross-References</h2>
      {cases.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Related Documented Cases</h3>
          {cases.map(c => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{c.name}</p>
                  {TIER_COLORS[c.evidence_tier] && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{ backgroundColor: `${TIER_COLORS[c.evidence_tier]}20`, color: TIER_COLORS[c.evidence_tier] }}
                    >
                      {TIER_LABELS[c.evidence_tier]}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.date} · {c.location}</p>
              </div>
              <svg className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Related Primary Documents</h3>
          {documents.map(d => (
            <Link
              key={d.id}
              href={`/documents/${d.id}`}
              className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">{d.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{d.date} · {d.document_type.replace(/-/g, ' ')}</p>
              </div>
              <svg className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
      {papers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Research Publications</h3>
          {papers.map(p => (
            <Link
              key={p.id}
              href={p.decur_url ?? `/research/papers/${p.id}`}
              className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">{p.title}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {p.authors.length > 2 ? `${p.authors[0]} et al.` : p.authors.join(', ')}
                  {p.journal ? ` · ${p.journal}` : ''}
                  {` · ${p.year}`}
                </p>
              </div>
              <svg className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

interface Props {
  entry: InsiderEntry;
}

const FigurePage: NextPage<Props> = ({ entry }) => {
  const router = useRouter();
  const [exploreBack, setExploreBack] = useState<{ label: string; href: string } | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { ref, backHref, backLabel, paperId } = router.query as Record<string, string | undefined>;
    if (backHref && backLabel) {
      setExploreBack({ label: backLabel, href: backHref });
    } else if (ref === 'paper' && paperId) {
      const sourcePaper = (papersData as Array<{ id: string; title: string }>)
        .find(p => p.id === paperId);
      if (sourcePaper) {
        setExploreBack({ label: sourcePaper.title, href: `/research/papers/${paperId}` });
      }
    } else {
      setExploreBack(resolveExploreRef(ref ?? null));
    }
  }, [router.isReady, router.query]);

  const onBack = () => router.push(exploreBack ? exploreBack.href : '/data?category=key-figures');
  const backLabel = exploreBack ? exploreBack.label : 'Key Figures';

  const isBespoke = !!BESPOKE_REGISTRY[entry.id];

  // For bespoke profiles, derive cross-links here (GenericInsiderProfile handles its own internally).
  const bespokeRelatedCases: RelatedCase[] = isBespoke
    ? (casesData as Array<{ id: string; name: string; date: string; location: string; evidence_tier: string; insider_connections: Array<{ id: string }> }>)
        .filter(c => c.insider_connections.some(conn => conn.id === entry.id))
        .map(({ id, name, date, location, evidence_tier }) => ({ id, name, date, location, evidence_tier }))
    : [];

  const bespokeRelatedDocuments: RelatedDocument[] = isBespoke
    ? (documentsData as Array<{ id: string; name: string; date: string; document_type: string; insider_connections: Array<{ id: string }> }>)
        .filter(d => d.insider_connections.some(conn => conn.id === entry.id))
        .map(({ id, name, date, document_type }) => ({ id, name, date, document_type }))
    : [];

  const relatedPapers: RelatedPaper[] = (papersData as Array<{ id: string; title: string; authors: string[]; year: number; journal: string | null; author_ids: string[]; decur_url?: string }>)
    .filter(p => p.author_ids.includes(entry.id))
    .map(({ id, title, authors, year, journal, decur_url }) => ({ id, title, authors, year, journal, decur_url }));

  const renderProfile = () => {
    const nodeId = entry.id;
    const BespokeComponent = BESPOKE_REGISTRY[entry.id];
    if (BespokeComponent) {
      return <BespokeComponent onBack={onBack} backLabel={backLabel} networkNodeId={nodeId} />;
    }
    return <GenericInsiderProfile id={entry.id} onBack={onBack} backLabel={backLabel} networkNodeId={nodeId} />;
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: entry.name,
    description: entry.summary,
    jobTitle: entry.role,
    affiliation: entry.affiliation
      ? { '@type': 'Organization', name: entry.affiliation }
      : undefined,
    url: `https://decur.app/figures/${entry.id}`,
  };

  const metaDescription = entry.role
    ? `${entry.role} - ${entry.summary}`
    : entry.summary;

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://decur.app' },
      { '@type': 'ListItem', position: 2, name: 'Key Figures', item: 'https://decur.app/data?category=key-figures' },
      { '@type': 'ListItem', position: 3, name: entry.name, item: `https://decur.app/figures/${entry.id}` },
    ],
  };

  return (
    <>
      <SeoHead
        title={entry.name}
        description={metaDescription}
        ogSubtitle={entry.role}
        path={`/figures/${entry.id}`}
        type="article"
        jsonLd={[personSchema, breadcrumbSchema]}
      />
      <div className="container mx-auto px-4 py-4">
        {renderProfile()}
        <RelatedCrossLinksSection
          cases={isBespoke ? bespokeRelatedCases : []}
          documents={isBespoke ? bespokeRelatedDocuments : []}
          papers={relatedPapers}
        />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = (insiderIndex as unknown as InsiderEntry[])
    .filter(e => e.status === 'detailed')
    .map(e => ({ params: { id: e.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const id = params?.id as string;
  const entry = (insiderIndex as unknown as InsiderEntry[]).find(e => e.id === id);
  if (!entry) return { notFound: true };
  return { props: { entry }, revalidate: 3600 };
};

export default FigurePage;
