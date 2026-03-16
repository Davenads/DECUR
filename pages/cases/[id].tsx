import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import { CaseEntry } from '../../types/data';
import casesData from '../../data/cases.json';
import CaseDetail from '../../components/data/CaseDetail';

interface Props {
  caseEntry: CaseEntry;
}

const CasePage: NextPage<Props> = ({ caseEntry }) => {
  const router = useRouter();
  const [fromExplore, setFromExplore] = useState(false);

  useEffect(() => {
    setFromExplore(new URLSearchParams(window.location.search).get('ref') === 'explore');
  }, []);

  const onBack = () => router.push(fromExplore ? '/explore#relationship-network' : '/data?category=cases');
  const backLabel = fromExplore ? 'Relationship Network' : 'Cases';

  return (
    <>
      <SeoHead
        title={caseEntry.name}
        description={caseEntry.summary}
        ogSubtitle={`${caseEntry.date} · ${caseEntry.location}`}
        path={`/cases/${caseEntry.id}`}
        type="article"
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
