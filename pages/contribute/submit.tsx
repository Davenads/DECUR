import Head from 'next/head';
import dynamic from 'next/dynamic';

// SubmissionWizard uses router.query which requires client-side access
const SubmissionWizard = dynamic(() => import('../../components/contribute/SubmissionWizard'), {
  ssr: false,
  loading: () => (
    <div className="max-w-2xl mx-auto">
      <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
    </div>
  ),
});

export default function SubmitPage() {
  return (
    <>
      <Head>
        <title>Submit Contribution - DECUR</title>
      </Head>
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto mb-8 text-center">
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">
            Submit a Contribution
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            All submissions are reviewed by the moderation team before publication.
          </p>
        </div>
        <SubmissionWizard />
      </div>
    </>
  );
}
