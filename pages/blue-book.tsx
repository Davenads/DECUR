import Head from 'next/head';
import Link from 'next/link';
import BlueBookIndex from '../components/data/BlueBookIndex';

export default function BlueBookPage() {
  return (
    <>
      <Head>
        <title>Project Blue Book - Unidentified Cases | DECUR</title>
        <meta
          name="description"
          content="Complete index of 558 cases officially classified as Unidentified by Project Blue Book (1947-1969), verified by NICAP independent review."
        />
      </Head>
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/data" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Data
            </Link>
            <span>/</span>
            <Link href="/programs/project-blue-book" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Project Blue Book
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-gray-100">Unidentified Cases</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                Historical Archive
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">1947-1969</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Project Blue Book - Unidentified Cases
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
              Project Blue Book (1952-1969) was the U.S. Air Force&apos;s official UFO investigation program,
              investigating 12,618 reported sightings. Of these, 701 were officially classified &quot;Unidentified&quot;
              at program closure. The 558 cases below represent NICAP&apos;s independently verified subset - cases
              where the Unidentified classification holds under conservative review standards.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/programs/project-blue-book"
                className="text-sm text-primary hover:underline"
              >
                View Program Overview
              </Link>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <a
                href="https://www.nicap.org/bluebook/bluelist.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Primary Source (NICAP)
              </a>
            </div>
          </div>

          {/* Index Component */}
          <BlueBookIndex />
        </div>
      </main>
    </>
  );
}
