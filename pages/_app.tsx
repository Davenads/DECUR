import '../styles/global.css';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import { inter, montserrat } from '../lib/fonts';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { --font-inter: ${inter.style.fontFamily}; --font-montserrat: ${montserrat.style.fontFamily}; }` }} />
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ErrorBoundary>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Analytics />
        <SpeedInsights />
      </ErrorBoundary>
    </ThemeProvider>
    </>
  );
}

export default MyApp;
