import '/lib/styles/index.scss'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';
import { PageProvider } from '/lib/context/page';
import { Layout, BlankLayout } from '/components';
import { SessionProvider } from 'next-auth/react';
import { DefaultDatoSEO } from 'dato-nextjs-utils/components';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter()
  const { asPath: pathname } = router
  const { site, seo, session, settings, params } = pageProps as any;
  const isBlankLayout = pathname.toLowerCase().startsWith('/client') || pathname.toLowerCase().startsWith('/account/pricelist/pdf')

  useEffect(() => {
    if (!settings) return
    const r = document.querySelector<HTMLElement>(':root')
    r.style.setProperty('--gray', settings?.grid?.hex);
    r.style.setProperty('--white', settings?.background?.hex)
  }, [settings])

  return (
    !isBlankLayout ?
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
      <BlankLayout>
        <Component {...pageProps} />
      </BlankLayout>
  )
}

export default MyApp
