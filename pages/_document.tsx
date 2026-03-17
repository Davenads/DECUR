import { Html, Head, Main, NextScript } from 'next/document';
import type { DocumentProps } from 'next/document';
import { inter, montserrat } from '../lib/fonts';

export default function Document(_props: DocumentProps) {
  return (
    <Html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="DECUR - Data Exceeding Current Understanding of Reality" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}