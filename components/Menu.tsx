import s from './Menu.module.scss'
import cn from 'classnames'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import useStore from '/lib/store'
import { useScrollInfo } from 'dato-nextjs-utils/hooks'

export type MenuProps = {}

export default function Menu({ }: MenuProps) {


  return (
    <nav>
      <Link href="/">
        Home
      </Link>,
      <Link href="/gallery">
        Gallery
      </Link>,
      <Link href="/contact">
        Contact
      </Link>,
      <Link href="/client">
        Login
      </Link>
    </nav>

  )
}