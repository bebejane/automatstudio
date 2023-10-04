import s from './Content.module.scss'
import cn from 'classnames'
import React from 'react'
import useStore from '/lib/store'

export type ContentProps = {
	children: React.ReactNode
}

export default function Content({ children }: ContentProps) {


	return (
		<main id="content" className={cn(s.content)}>
			{children}
		</main>
	)
}