import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import { InsiderEntry } from '../../types/data';
import { resolveExploreRef } from '../../lib/exploreRef';
import insiderIndex from '../../data/key-figures/index.json';
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

interface Props {
  entry: InsiderEntry;
}

const FigurePage: NextPage<Props> = ({ entry }) => {
  const router = useRouter();
  const [exploreBack, setExploreBack] = useState<{ label: string; href: string } | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    setExploreBack(resolveExploreRef(ref));
  }, []);

  const onBack = () => router.push(exploreBack ? exploreBack.href : '/data?category=key-figures');
  const backLabel = exploreBack ? exploreBack.label : 'Key Figures';

  const renderProfile = () => {
    const nodeId = entry.id;
    // InsiderProfile (Burisch) has a unique id prop requirement — keep explicit
    if (entry.id === 'dan-burisch') {
      return <InsiderProfile id={entry.id} onBack={onBack} backLabel={backLabel} networkNodeId={nodeId} />;
    }
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
