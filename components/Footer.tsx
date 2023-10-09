import s from './Footer.module.scss'
import cn from 'classnames'
import { useSession, signOut } from 'next-auth/react'

type Props = {

}

export default function Footer({ }: Props) {

  const { data: session, status } = useSession()

  return (
    <footer className={cn(s.footer)}>
      <h1>Automatstudio<br /></h1>
      <p>
        <span>A part of</span><br />
        Skanstull Automatfoto AB < br />
        Rutger Fuchsgatan 9 < br />
        116 67 Stockholm < br />
        <a href="mailto:info@automatstudio.se">info@automatstudio.se</a><br />
      </p>
      {status === 'authenticated' &&
        <button onClick={() => signOut()}>Logout</button>
      }
    </footer >
  )
}