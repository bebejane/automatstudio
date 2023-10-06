import s from './Layout.module.scss'
import React, { useEffect, useState } from 'react'
import { Footer, Content, Menu } from '/components'

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