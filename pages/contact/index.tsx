import s from './index.module.scss'
import { ContactDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import { DatoMarkdown as Markdown } from 'dato-nextjs-utils/components';
import { useLivePreview } from 'dato-nextjs-utils/hooks';

export type Props = {
	contact: ContactRecord
	preview: boolean
}

export default function Contact({ contact: _contact, preview }: Props) {

	const { data: { contact } } = useLivePreview(ContactDocument, { contact: _contact }, { preview })

	return (
		<div className={s.container}>
			<div className="grid">
				<Markdown className={s.contact}>{contact.text}</Markdown>
			</div>
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [ContactDocument] })