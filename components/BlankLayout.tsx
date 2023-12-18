import React, { useEffect, useState } from 'react'

export type LayoutProps = {
	children: React.ReactNode

}

export default function BlankLayout({ children }: LayoutProps) {

	return (
		<>
			{children}
		</>
	)
}