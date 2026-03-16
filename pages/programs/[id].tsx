import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import { ProgramEntry } from '../../types/data';
import programsData from '../../data/programs.json';
import ProgramDetail from '../../components/data/ProgramDetail';

interface Props {
  program: ProgramEntry;
}

const ProgramPage: NextPage<Props> = ({ program }) => {
  const router = useRouter();
  const [fromExplore, setFromExplore] = useState(false);

  useEffect(() => {
    setFromExplore(new URLSearchParams(window.location.search).get('ref') === 'explore');
  }, []);

  const onBack = () => router.push(fromExplore ? '/explore#relationship-network' : '/data?category=programs');
  const backLabel = fromExplore ? 'Relationship Network' : 'Programs';

  return (
    <>
      <SeoHead
        title={program.name}
        description={program.summary}
        ogSubtitle={`${program.active_period} · ${program.parent_org}`}
        path={`/programs/${program.id}`}
        type="article"
      />
      <div className="container mx-auto px-4 py-4">
        <ProgramDetail p={program} onBack={onBack} backLabel={backLabel} />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = (programsData as unknown as ProgramEntry[]).map(p => ({ params: { id: p.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const id = params?.id as string;
  const program = (programsData as unknown as ProgramEntry[]).find(p => p.id === id);
  if (!program) return { notFound: true };
  return { props: { program }, revalidate: 3600 };
};

export default ProgramPage;
