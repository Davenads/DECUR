import '../styles/global.css';
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ErrorBoundary>
  );
}

export default MyApp;