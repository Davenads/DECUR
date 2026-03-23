import type { GetServerSideProps } from 'next';
import insiderIndex from '../data/key-figures/index.json';
import casesData from '../data/cases.json';
import { InsiderEntry, CaseEntry } from '../types/data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://decur.app';

interface PageEntry {
  url: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

const STATIC_PAGES: PageEntry[] = [
  { url: '/',          changefreq: 'weekly',  priority: '1.0' },
  { url: '/data',      changefreq: 'weekly',  priority: '0.9' },
  { url: '/explore',   changefreq: 'monthly', priority: '0.8' },
  { url: '/timeline',  changefreq: 'monthly', priority: '0.8' },
  { url: '/resources', changefreq: 'monthly', priority: '0.7' },
  { url: '/blue-book', changefreq: 'monthly', priority: '0.75' },
  { url: '/about',     changefreq: 'monthly', priority: '0.5' },
  { url: '/sources',   changefreq: 'monthly', priority: '0.4' },
];

function buildDynamicPages(): PageEntry[] {
  const figurePages: PageEntry[] = (insiderIndex as unknown as InsiderEntry[])
    .filter(e => e.status === 'detailed')
    .map(e => ({
      url: `/figures/${e.id}`,
      changefreq: 'monthly' as const,
      priority: '0.7',
    }));

  const casePages: PageEntry[] = (casesData as unknown as CaseEntry[]).map(c => ({
    url: `/cases/${c.id}`,
    changefreq: 'monthly' as const,
    priority: '0.7',
  }));

  return [...figurePages, ...casePages];
}

function generateSitemap(): string {
  const allPages = [...STATIC_PAGES, ...buildDynamicPages()];

  const urlsXml = allPages.map(({ url, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSitemap();
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
  res.write(sitemap);
  res.end();
  return { props: {} };
};

// Next.js requires a default export even for server-only pages
export default function Sitemap(): null { return null; }
