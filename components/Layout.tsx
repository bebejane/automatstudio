import s from './Layout.module.scss'
import React, { useEffect, useState } from 'react'
//import type { MenuItem } from '/lib/menu'
//import { buildMenu } from '/lib/menu'
import { useRouter } from 'next/router'
import { Footer, Content, Menu } from '/components'
import useStore from '/lib/store'

export type LayoutProps = {
	children: React.ReactNode

}

export default function Layout({ children }: LayoutProps) {

	return (
		<>
			<Menu />
			<Content>{children}</Content>
			<Footer />
		</>
	)
}