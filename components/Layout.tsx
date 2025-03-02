import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import type { FC } from 'react';
import { LayoutProps } from '../types/components';

const Layout: FC<LayoutProps> = ({ 
  children, 
  title = 'DECUR - Data Exceeding Current Understanding of Reality',
  className = ''
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className={`flex-grow container mx-auto px-4 py-8 ${className}`}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;