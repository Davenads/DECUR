import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import { InsiderEntry } from '../../types/data';
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

interface Props {
  entry: InsiderEntry;
}

const FigurePage: NextPage<Props> = ({ entry }) => {
  const router = useRouter();
  const onBack = () => router.push('/data?category=key-figures');

  const renderProfile = () => {
    switch (entry.id) {
      case 'dan-burisch':    return <InsiderProfile id={entry.id} onBack={onBack} />;
      case 'bob-lazar':      return <LazarProfile onBack={onBack} />;
      case 'david-grusch':   return <GruschProfile onBack={onBack} />;
      case 'luis-elizondo':  return <ElizondoProfile onBack={onBack} />;
      case 'david-fravor':   return <FravorProfile onBack={onBack} />;
      case 'hal-puthoff':    return <PuthoffProfile onBack={onBack} />;
      case 'garry-nolan':    return <NolanProfile onBack={onBack} />;
      case 'karl-nell':      return <NellProfile onBack={onBack} />;
      case 'chris-mellon':   return <MellonProfile onBack={onBack} />;
      case 'eric-davis':     return <DavisProfile onBack={onBack} />;
      case 'robert-bigelow': return <BigelowProfile onBack={onBack} />;
      case 'jacques-vallee': return <ValleeProfile onBack={onBack} />;
      case 'nick-pope':      return <PopeProfile onBack={onBack} />;
      case 'jake-barber':    return <BarberProfile onBack={onBack} />;
      case 'tim-gallaudet':  return <GallaudetProfile onBack={onBack} />;
      default:               return <GenericInsiderProfile id={entry.id} onBack={onBack} />;
    }
  };

  return (
    <>
      <SeoHead
        title={entry.name}
        description={entry.summary}
        ogSubtitle={entry.role}
        path={`/figures/${entry.id}`}
        type="article"
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
