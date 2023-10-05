import s from './index.module.scss'
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import Link from 'next/link';

export type Props = {}

export default function Contact({ }: Props) {

	return (
		<div className={s.container}>
			<div className="grid">
				<p>Contact</p>
			</div>
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
