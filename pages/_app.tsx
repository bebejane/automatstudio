import '/lib/styles/index.scss'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';
import { PageProvider } from '/lib/context/page';
import { Layout, ClientLayout } from '/components';
import { SessionProvider } from 'next-auth/react';
import { DefaultDatoSEO } from 'dato-nextjs-utils/components';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter()
  const { asPath: pathname } = router
  const { site, seo, session, settings, params } = pageProps as any;
  const isClientLayout = pathname.toLowerCase().startsWith('/client')

  useEffect(() => {
    if (!settings) return
    const r = document.querySelector<HTMLElement>(':root')
    r.style.setProperty('--gray', settings?.grid?.hex);
    r.style.setProperty('--white', settings?.background?.hex)
  }, [settings])

  return (
    !isClientLayout ?
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
      :
      <ClientLayout>
        <Component {...pageProps} />
      </ClientLayout>
  )
}

export default MyApp
