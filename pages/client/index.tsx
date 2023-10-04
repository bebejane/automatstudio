import styles from './index.module.scss'
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import Link from 'next/link';

export type Props = {}

export default function Client({ }: Props) {

	return (
		<div className={styles.container}>
			Login
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
