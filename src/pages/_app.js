// Import required dependencies.
import Head from 'next/head';

// Import global styles.
import './global.css';

function KenyonWx({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="keywords" content="weather, mnwx, kenyon minnesota" />
        <meta name="author" content="KenyonWX" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main>
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default KenyonWx;