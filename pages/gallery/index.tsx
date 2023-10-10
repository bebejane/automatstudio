import { Image } from 'react-datocms';
import s from './index.module.scss'
import { GalleryDocument } from '/graphql';
import withGlobalProps from '/lib/withGlobalProps';
import type { GetStaticProps } from 'next'
import { DatoMarkdown as Markdown } from 'dato-nextjs-utils/components';

export type Props = {
	gallery: GalleryRecord
}

type VideoBlockExtended = VideoBlockRecord & {
	video: {
		video: {
			mp4low: string
			mp4med: string
			mp4high: string
		}
	}
}

export default function Gallery({ gallery }: Props) {

	return (
		<div className={s.container}>
			{gallery.content.map((item) => (
				<div key={item.id} className="grid">
					{item.__typename === 'ImageBlockRecord' ?
						<div className={`m${item.margin} e${item.end}`}>
							<Image data={item.image.responsiveImage} className={s.image} pictureClassName={s.picture} />
						</div>
						: item.__typename === 'ImagesBlockRecord' ?
							item.images.map((item, idx) =>
								<div key={idx} className={`m${item.margin} e${item.end}`}>
									<Image data={item.image.responsiveImage} className={s.image} pictureClassName={s.picture} />
								</div>
							)
							: item.__typename === 'TextBlockRecord' ?
								<div className={`m${item.margin} e${item.end}`}>
									<Markdown className={s.text}>{item.text}</Markdown>
								</div>
								: item.__typename === 'VideoBlockRecord' ?
									<video className={s.video} muted={true} autoPlay={true} playsInline={true}>
										<source src={(item as VideoBlockExtended).video.video.mp4high} type="video/mp4" />
									</video>
									: null
					}
				</div>
			)
			)}
		</div >
	)
}

export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [GalleryDocument] })