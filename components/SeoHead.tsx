import Head from 'next/head';
import type { FC } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://decur.app';
const SITE_NAME = 'DECUR';

interface SeoHeadProps {
  /** Page-level title. ' - DECUR' suffix is appended automatically unless title already includes 'DECUR'. */
  title: string;
  description: string;
  /** Canonical path, e.g. '/data' or '/explore'. Do not include query params. */
  path?: string;
  type?: 'website' | 'article';
  /**
   * Short subtitle shown in the OG image card (defaults to a truncated description).
   * Kept to ~80 chars for clean rendering.
   */
  ogSubtitle?: string;
  /** Fully override the OG image URL (skips dynamic generation). */
  image?: string;
  /**
   * JSON-LD structured data object (schema.org). Injected as
   * <script type="application/ld+json"> in the head for rich search results.
   * Pass a plain object — serialization is handled internally.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonLd?: Record<string, any>;
  /** Prevent search engines from indexing this page (adds noindex,nofollow robots meta). */
  noindex?: boolean;
}

const SeoHead: FC<SeoHeadProps> = ({
  title,
  description,
  path = '',
  type = 'website',
  ogSubtitle,
  image,
  jsonLd,
  noindex = false,
}) => {
  const fullTitle = title.includes('DECUR') ? title : `${title} - ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${path}`;

  // Build dynamic OG image URL unless an explicit static override is passed
  const subtitle = ogSubtitle ?? description.slice(0, 100);
  const ogImage = image
    ? image
    : `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}`;

  return (
    <Head>
      {/* Standard */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
};

export default SeoHead;
