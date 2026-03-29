import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import type { ContractorEntry } from '../../types/data';
import contractorsData from '../../data/contractors.json';
import ContractorDetail from '../../components/data/ContractorDetail';
import { resolveExploreRef } from '../../lib/exploreRef';
import { graphData } from '../../data/network-graph';

// Contractor nodes present in the network graph (for "View in Network" button)
const NETWORK_CONTRACTOR_IDS = new Set(
  graphData.nodes
    .filter(n => n.type === 'organization')
    .map(n => n.id)
);

interface Props {
  contractor: ContractorEntry;
}

const ContractorPage: NextPage<Props> = ({ contractor }) => {
  const router = useRouter();
  const [exploreBack, setExploreBack] = useState<{ label: string; href: string } | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    setExploreBack(resolveExploreRef(ref));
  }, []);

  const onBack = () => router.push(exploreBack ? exploreBack.href : '/data?category=contractors');
  const backLabel = exploreBack ? exploreBack.label : 'Contractors';

  return (
    <>
      <SeoHead
        title={contractor.name}
        description={contractor.summary}
        ogSubtitle={`Est. ${contractor.founded} · ${contractor.headquarters}`}
        path={`/contractors/${contractor.id}`}
        type="article"
      />
      <div className="container mx-auto px-4 py-4">
        <ContractorDetail
          contractor={contractor}
          onBack={onBack}
          backLabel={backLabel}
          networkNodeId={NETWORK_CONTRACTOR_IDS.has(contractor.id) ? contractor.id : undefined}
        />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = (contractorsData as unknown as ContractorEntry[]).map(c => ({
    params: { id: c.id },
  }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const id = params?.id as string;
  const contractor = (contractorsData as unknown as ContractorEntry[]).find(c => c.id === id);
  if (!contractor) return { notFound: true };
  return { props: { contractor }, revalidate: 3600 };
};

export default ContractorPage;
