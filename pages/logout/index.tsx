
import { useEffect } from 'react';
import { AllClientsDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import { signOut } from 'next-auth/react';

export type Props = {
	clients: ClientRecord[]
}

export default function Logout({ clients }: Props) {

	useEffect(() => {
		signOut({ callbackUrl: '/login' })
	}, [])

	return null

}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [AllClientsDocument] })