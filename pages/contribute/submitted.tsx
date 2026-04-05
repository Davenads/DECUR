import Head from 'next/head';
import Link from 'next/link';

export default function SubmittedPage() {
  return (
    <>
      <Head>
        <title>Contribution Submitted - DECUR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-10">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-2">
              Contribution submitted
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Thank you. Your submission has been received and is queued for review. You can track its status on your profile page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/contribute"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Submit another
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                View my profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
