import s from './Menu.module.scss'
import cn from 'classnames'
import { useSession } from 'next-auth/react'
import { SessionExtended } from '../pages/api/auth/[...nextauth]'
import Link from 'next/link'
import { useRouter } from 'next/router'

export type MenuProps = {

}

export default function Menu({ }: MenuProps) {

  const router = useRouter()
  const { data, status } = useSession()
  const user = data?.user as SessionExtended

  return (
    <>
      <nav className={s.menu}>
        <Link href="/">
          <h1>Automatstudio</h1>
        </Link>
        <Link href="/contact">
          Contact
        </Link>
        <Link href={status === 'authenticated' ? '/account' : '/login'}>
          {status === 'authenticated' ? 'Account' : 'Login'}
        </Link>
        {status === 'authenticated' && user && router.asPath.startsWith('/account') &&
          <nav className={s.sub}>
            <Link href="/account/pricelist">
              Pricelist
            </Link>
            <Link href={`/client/${user.slug}`} >
              Website
            </Link>
          </nav>
        }
      </nav>
    </>
  )
}