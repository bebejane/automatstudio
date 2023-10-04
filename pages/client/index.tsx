import s from './index.module.scss'
import { AllClientsDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import Link from 'next/link';

export type Props = {
	clients: ClientRecord[]
}

export default function Clients({ clients }: Props) {

	return (
		<div className={styles.container}>
			{clients.map((client) => (
				<Link href={`/client/${client.id}`} key={client.id}>
					{client.name}
				</Link>
			))}
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [AllClientsDocument] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
