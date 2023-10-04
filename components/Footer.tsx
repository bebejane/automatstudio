import s from './Footer.module.scss'
import cn from 'classnames'
import { useRouter } from 'next/router'

type Props = {

}

export default function Footer({ }: Props) {


  return (
    <footer className={cn(s.footer)}>
      <h1>AutomatStudio><br /></h1>
      <p>

        <span>A part of</span><br />
        Skanstull Automatfoto AB < br />
        Rutger Fuchsgatan 9 < br />
        116 67 Stockholm < br />
        info@automatstudio.se<br />
      </p>
    </footer >
  )
}