
import s from './index.module.scss'
import cn from 'classnames'
import { useEffect, useState } from 'react';
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
			setError(null)
			setLoggingIn(true)
			await signIn('credentials', { username, password, callbackUrl: '/client' })
		} catch (err) {
			console.error(err)
			setError(err)
		} finally {
			setLoggingIn(false)
		}
	}

	useEffect(() => {
		if (location.search.includes('error')) {
			setError(new Error('Username or password is incorrect'))
		}
	}, [])

	return (
		<div className={s.container}>

			<form className={cn(s.login, loggingIn && s.loading)} method="POST" onSubmit={login}>
				<label htmlFor="username">Username:</label>
				<input type="text" name="username" /><br />
				<label htmlFor="password">Password:</label>
				<input type="password" name="password" /><br />
				<button className={cn(loggingIn && 'pulse')} type="submit" >Log in</button>
				{error && <div className="error">{error.message}</div>}
			</form>
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [AllClientsDocument] })