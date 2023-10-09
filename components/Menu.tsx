import s from './Menu.module.scss'
import cn from 'classnames'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export type MenuProps = {

}

export default function Menu({ }: MenuProps) {

  const { data: session, status } = useSession()

  return (
    <nav className={s.menu}>
      <Link href="/">
        <h1>Automatstudio</h1>
      </Link>
      <Link href="/gallery">
        Gallery
      </Link>
      <Link href="/contact">
        Contact
      </Link>
      <Link href={status === 'authenticated' ? '/client' : '/login'}>
        {status === 'authenticated' ? 'Account' : 'Login'}
      </Link>
    </nav>

  )
}