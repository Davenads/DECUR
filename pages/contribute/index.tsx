import Head from 'next/head';
import Link from 'next/link';

const CONTRIBUTION_TYPES = [
  {
    type: 'figure',
    label: 'Key Figure',
    description: 'A person with firsthand testimony, government service, or significant research relevant to UAP/NHI.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    type: 'case',
    label: 'Documented Case',
    description: 'A well-documented UAP encounter with credible witnesses, physical evidence, or official investigation.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    type: 'timeline_event',
    label: 'Timeline Event',
    description: 'A historically significant event for the historical timeline.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    type: 'correction',
    label: 'Correction / Source',
    description: 'A factual correction, missing source, or data improvement for existing platform content.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
];

export default function ContributePage() {
  return (
    <>
      <Head>
        <title>Contribute - DECUR</title>
      </Head>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-3">
            Contribute to DECUR
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            DECUR is a community-supported research platform. Help expand the record by submitting new figures, cases, events, and corrections. All submissions are reviewed before publication.
          </p>
        </div>

        {/* Contribution type cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {CONTRIBUTION_TYPES.map(({ type, label, description, icon }) => (
            <Link
              key={type}
              href={`/contribute/submit?type=${type}`}
              className="group p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  {icon}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{label}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Guidelines */}
        <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10">
          <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Contribution guidelines
          </h3>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5 list-disc list-inside">
            <li>All claims must be supported by at least one verifiable source URL.</li>
            <li>Do not submit speculation, personal interpretations, or unverifiable accounts.</li>
            <li>Submissions are reviewed by the moderation team before going live.</li>
            <li>Duplicate submissions (figures or cases already in the database) will be declined.</li>
            <li>You must have a verified email address to submit contributions.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
