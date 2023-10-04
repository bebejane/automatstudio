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
		<div className={s.container}>
			{clients.map((client) => (
				<Link href={`/client/${client.clientId}`} key={client.id}>
					{client.name}
				</Link>
			))}
			<br />
			<form className={s.login} method="POST">
				<label htmlFor="username">Username</label>
				<input type="text" name="username" /><br />
				<label htmlFor="password">Password</label>
				<input type="password" name="password" /><br />
				<button>Log in</button>
			</form>
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [AllClientsDocument] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
