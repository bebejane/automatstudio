import s from './index.module.scss'
import { ContactDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import { DatoMarkdown as Markdown } from 'dato-nextjs-utils/components';

export type Props = {
	contact: ContactRecord
}

export default function Contact({ contact }: Props) {

	return (
		<div className={s.container}>
			<div className="grid">
				<p>Contact</p>
				<Markdown className={s.contact}>{contact.text}</Markdown>
			</div>
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [ContactDocument] }, async ({ props, revalidate }: any) => {

	return {
		props,
		revalidate
	};
});
