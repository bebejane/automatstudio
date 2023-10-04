import s from './Footer.module.scss'
import cn from 'classnames'
import { useRouter } from 'next/router'

type Props = {

}

export default function Footer({ }: Props) {


  return (
    <footer className={cn(s.footer)}>
      Automatstudio<br />
      <span>A part of</span><br />
      Skanstull Automatfoto AB < br />
      Rutger Fuchsgatan 9 < br />
      116 67 Stockholm < br />
      info@automatstudio.se<br />
    </footer >
  )
}