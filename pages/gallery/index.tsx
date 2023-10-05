import s from './index.module.scss'
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import Link from 'next/link';

export type Props = {}

export default function Gallery({ }: Props) {

	return (
		<div className={s.container}>
			Gallery
			<div className="grid">
				<div className="m1 e5"><img src="https://www.datocms-assets.com/107061/1696340294-output_medium_validoo.png?auto=format&dpr=1.5&q=50&w=800"></img></div>
			</div>

			<div className="grid">
				<div className="m3 e5"><img src="https://www.datocms-assets.com/107061/1696340294-output_medium_validoo.png?auto=format&dpr=1.5&q=50&w=800"></img></div>
				<div className="m6 e9"><img src="https://www.datocms-assets.com/107061/1696340294-output_medium_validoo.png?auto=format&dpr=1.5&q=50&w=800"></img></div>
			</div >
		</div >
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
