import '../styles/global.css';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import { Inter, Montserrat } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ErrorBoundary>
        <div className={`${inter.variable} ${montserrat.variable}`}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        </div>
        <Analytics />
        <SpeedInsights />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default MyApp;
