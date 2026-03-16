import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import { DocumentEntry } from '../../types/data';
import documentsData from '../../data/documents.json';
import DocumentDetail from '../../components/data/shared/DocumentDetail';

interface Props {
  document: DocumentEntry;
}

const DocumentPage: NextPage<Props> = ({ document }) => {
  const router = useRouter();
  const onBack = () => router.push('/data?category=documents');

  return (
    <>
      <SeoHead
        title={document.name}
        description={document.summary}
        ogSubtitle={`${document.date} · ${document.issuing_authority}`}
        path={`/documents/${document.id}`}
        type="article"
      />
      <div className="container mx-auto px-4 py-4">
        <DocumentDetail d={document} onBack={onBack} />
      </div>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const paths = (documentsData as unknown as DocumentEntry[]).map(d => ({ params: { id: d.id } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const id = params?.id as string;
  const document = (documentsData as unknown as DocumentEntry[]).find(d => d.id === id);
  if (!document) return { notFound: true };
  return { props: { document }, revalidate: 3600 };
};

export default DocumentPage;
