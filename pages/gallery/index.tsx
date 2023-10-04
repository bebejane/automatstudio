import styles from './index.module.scss'
import { withGlobalProps } from 'dato-nextjs-utils/hoc';
import type { GetStaticProps } from 'next'
import Link from 'next/link';

export type Props = {}

export default function Gallery({ }: Props) {

	return (
		<div className={styles.container}>
			Gallery
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
