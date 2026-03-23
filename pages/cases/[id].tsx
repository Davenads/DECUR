import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import { CaseEntry } from '../../types/data';
import casesData from '../../data/cases.json';
import CaseDetail from '../../components/data/CaseDetail';
import { resolveExploreRef } from '../../lib/exploreRef';

interface Props {
  caseEntry: CaseEntry;
}

const CasePage: NextPage<Props> = ({ caseEntry }) => {
  const router = useRouter();
  const [exploreBack, setExploreBack] = useState<{ label: string; href: string } | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    setExploreBack(resolveExploreRef(ref));
  }, []);

  const onBack = () => router.push(exploreBack ? exploreBack.href : '/data?category=cases');
  const backLabel = exploreBack ? exploreBack.label : 'Cases';

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: caseEntry.name,
    description: caseEntry.summary,
    startDate: caseEntry.date,
    location: {
      '@type': 'Place',
      name: caseEntry.location,
      address: {
        '@type': 'PostalAddress',
        addressCountry: caseEntry.country,
      },
    },
    url: `https://decur.app/cases/${caseEntry.id}`,
    eventStatus: 'https://schema.org/EventScheduled',
  };

  return (
    <>
      <SeoHead
        title={caseEntry.name}
        description={caseEntry.summary}
        ogSubtitle={`${caseEntry.date} · ${caseEntry.location}`}
        path={`/cases/${caseEntry.id}`}
        type="article"
        jsonLd={eventSchema}
      />
      <div className="container mx-auto px-4 py-4">
        <CaseDetail c={caseEntry} onBack={onBack} backLabel={backLabel} />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = (casesData as unknown as CaseEntry[]).map(c => ({ params: { id: c.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const id = params?.id as string;
  const caseEntry = (casesData as unknown as CaseEntry[]).find(c => c.id === id);
  if (!caseEntry) return { notFound: true };
  return { props: { caseEntry }, revalidate: 3600 };
};

export default CasePage;
