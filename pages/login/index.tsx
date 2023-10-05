
import s from './index.module.scss'
import cn from 'classnames'
import { useState } from 'react';
import { AllClientsDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import { signIn, signOut } from 'next-auth/react';

export type Props = {
	clients: ClientRecord[]
}

export default function Clients({ clients }: Props) {

	const [loggingIn, setLoggingIn] = useState(false)
	const [error, setError] = useState<Error | null>(null)

	const login = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const formData = new FormData(e.currentTarget)
		const username = formData.get('username') as string
		const password = formData.get('password') as string
		try {
			setLoggingIn(true)
			await signIn('credentials', { username, password, callbackUrl: '/client' })

		} catch (err) {
			console.log(err)
			setError(err)
		} finally {
			setLoggingIn(false)
		}
	}

	return (
		<div className={s.container}>
			<form className={s.login} method="POST" onSubmit={login}>
				<label htmlFor="username">Username:</label>
				<input type="text" name="username" /><br />
				<label htmlFor="password">Password:</label>
				<input type="password" name="password" /><br />
				<button type="submit" className={cn(loggingIn && s.loading)}>Log in</button>
			</form>
			<button onClick={() => signOut()}>Logout</button>
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [AllClientsDocument] })