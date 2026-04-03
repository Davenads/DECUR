import Head from 'next/head';
import { useRouter } from 'next/router';
import SubmissionWizard from '../../components/contribute/SubmissionWizard';
import type { ContributionContentType } from '../../lib/validation/contributions';

export default function SubmitPage() {
  const router = useRouter();

  // Gate on router.isReady so query params are fully populated before mounting
  // the wizard. This prevents the router's isReady: false→true transition from
  // causing a remount that resets wizard state on mobile.
  if (!router.isReady) {
    return (
      <>
        <Head><title>Submit Contribution - DECUR</title></Head>
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-2xl mx-auto">
            <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </>
    );
  }

  const initialType = router.query.type as ContributionContentType | undefined;

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
        {/* Key forces a clean mount when type changes but keeps state stable otherwise */}
        <SubmissionWizard key={initialType ?? 'no-type'} initialType={initialType} />
      </div>
    </>
  );
}
