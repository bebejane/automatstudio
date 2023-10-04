import s from './Footer.module.scss'
import cn from 'classnames'
import { useRouter } from 'next/router'

type Props = {

}

export default function Footer({ }: Props) {


  return (
    <footer className={cn(s.footer)}>
      Footer
    </footer >
  )
}