import '../styles/global.css';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from 'next-themes';
import { inter, montserrat } from '../lib/fonts';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';

// NProgress styles — thin primary-colored bar at top of page on route change
const nprogressStyles = `
  #nprogress { pointer-events: none; }
  #nprogress .bar {
    background: #2e5c8a;
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
  }
  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #2e5c8a, 0 0 5px #2e5c8a;
    opacity: 1;
    transform: rotate(3deg) translate(0px, -4px);
  }
`;

NProgress.configure({ showSpinner: false, minimum: 0.15, speed: 300 });

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const start = () => NProgress.start();
    const done  = () => NProgress.done();
    router.events.on('routeChangeStart',    start);
    router.events.on('routeChangeComplete', done);
    router.events.on('routeChangeError',    done);
    return () => {
      router.events.off('routeChangeStart',    start);
      router.events.off('routeChangeComplete', done);
      router.events.off('routeChangeError',    done);
    };
  }, [router]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root { --font-inter: ${inter.style.fontFamily}; --font-montserrat: ${montserrat.style.fontFamily}; }` }} />
      <style dangerouslySetInnerHTML={{ __html: nprogressStyles }} />
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
