import '/lib/styles/index.scss'
import type { AppProps } from 'next/app'
import { DatoSEO } from 'dato-nextjs-utils/components';
import { useRouter } from 'next/router';
import { PageProvider } from '/lib/context/page';
import { Layout } from '/components';
import { SessionProvider, getSession } from 'next-auth/react';
import { DefaultDatoSEO } from 'dato-nextjs-utils/components';

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter()
  const { asPath: pathname } = router
  const { site, seo } = pageProps as any;

  return (
    <>
      <DefaultDatoSEO siteTitle="Automatstudio" site={site} path={pathname} />
      <SessionProvider session={pageProps.session}>
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
