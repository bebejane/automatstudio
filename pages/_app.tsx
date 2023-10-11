import '/lib/styles/index.scss'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';
import { PageProvider } from '/lib/context/page';
import { Layout } from '/components';
import { SessionProvider } from 'next-auth/react';
import { DefaultDatoSEO } from 'dato-nextjs-utils/components';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter()
  const { asPath: pathname } = router
  const { site, seo, session } = pageProps as any;

  return (
    <>
      <DefaultDatoSEO siteTitle="Automatstudio" site={site} path={pathname} />
      <SessionProvider session={session}>
        <PageProvider value={{ isHome: pathname === '/' }}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </PageProvider>
      </SessionProvider>
    </>
  )
}

export default MyApp
