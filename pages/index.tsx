import { Image } from 'react-datocms';
import s from './index.module.scss'
import { GalleryDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import { DatoMarkdown as Markdown } from 'dato-nextjs-utils/components';
import { useLivePreview } from 'dato-nextjs-utils/hooks';

export type Props = {
	gallery: GalleryRecord
	preview: boolean
}

type MediaBlock = {
	media: {
		video: {
			mp4low: string
			mp4med: string
			mp4high: string
		}
	}
}

type MediaBlockExtended = MediaBlockRecord & MediaBlock

export default function Start({ gallery: _gallery, preview }: Props) {

	const { data: { gallery } } = useLivePreview(GalleryDocument, { gallery: _gallery }, { preview })

	return (
		<div className={s.container}>
			{gallery.content.map((item) => (
				<div key={item.id} className="grid">
					{item.__typename === 'MediaBlockRecord' &&
						<MediaBlock data={item as MediaBlockExtended} />
					}
					{item.__typename === 'MediasBlockRecord' && item.medias.map((item, idx) =>
						<MediaBlock key={idx} data={item as MediaBlockExtended} />
					)}
					{item.__typename === 'TextBlockRecord' &&
						<div className={`m${item.margin} e${item.end}`}>
							<Markdown className={s.text}>{item.text}</Markdown>
						</div>
					}
				</div>
			))}
		</div>
	)
}


const MediaBlock = ({ data: { media, margin, end } }: { data: MediaBlockExtended }) => {

	return (
		<div className={`m${margin} e${end}`}>
			{media.video !== null ?
				<video className={s.video} muted={true} autoPlay={true} playsInline={true}>
					<source src={media.video.mp4high} type="video/mp4" />
				</video>
				:
				<Image
					data={media.responsiveImage}
					className={s.image}
					pictureClassName={s.picture}
				/>}
		</div>
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [GalleryDocument] })