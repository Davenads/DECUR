import Head from 'next/head';
import type { FC } from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://decur.app';
const OG_IMAGE = `${SITE_URL}/og-image.png`;
const SITE_NAME = 'DECUR';

interface SeoHeadProps {
  /** Page-level title. ' - DECUR' suffix is appended automatically unless title already includes 'DECUR'. */
  title: string;
  description: string;
  /** Canonical path, e.g. '/data' or '/explore'. Do not include query params. */
  path?: string;
  type?: 'website' | 'article';
  /** Override the default OG image. */
  image?: string;
}

const SeoHead: FC<SeoHeadProps> = ({
  title,
  description,
  path = '',
  type = 'website',
  image,
}) => {
  const fullTitle = title.includes('DECUR') ? title : `${title} - ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImage = image ?? OG_IMAGE;

  return (
    <Head>
      {/* Standard */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
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
    </Head>
  );
};

export default SeoHead;
