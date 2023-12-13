import s from './[product].module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll, } from "dato-nextjs-utils/api"
import { AllClientTagsDocument, ProductDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { useState } from 'react';
import { DownloadZipButton } from '/components';
import { TagForm, MetaForm } from '/components';

export type Props = {
  product: ProductRecord
  tags: TagRecord[]
}

const sizes = [
  { width: 1080, height: 1920, label: 'Instagram Story', prop: 'istory' },
  { width: 1080, height: 1080, label: 'Instagram Square', prop: 'isquare' },
]

const colors = ['black', 'white', 'gray']

export default function Product({ product: _product, tags }: Props) {

  const [product, setProduct] = useState(_product)
  const [allTags, setAllTags] = useState<TagRecord[]>(tags)


  return (
    <div className={s.container}>
      <div className={s.intro}>
        <Image
          data={product.png.responsiveImage}
          className={s.image}
          sizes={`(min-width: 768px) 300px, 100vw`}
          placeholderClassName={s.picture}
          pictureClassName={s.picture}
        />
        <div className={s.details}>
          {format(new Date(product._createdAt), 'yyyy MM dd')}<br />
          <p>
            <br />
            <DownloadZipButton
              products={product}
              label="Download images"
              status={{
                downloading: 'Download images',
                generating: 'Generating zip file...',
              }}
            />
            <br />
            <span>(inc png, high-res tif and clipping path)</span>
          </p>
          <TagForm
            product={product}
            allTags={allTags}
            setProduct={setProduct}
            setAllTags={setAllTags}
          />
          <MetaForm product={product} setProduct={setProduct} />
        </div>
      </div>
      {sizes.map(({ width, height, label, prop }, idx) => (
        <div key={idx} className={s.gallery}>
          <ul className={s.images}>
            {colors.map((color, i) => {
              const image = product[`${prop}${color}`]
              return (
                <a key={i} href={image.responsiveImage.src} download>
                  <li>
                    <Image
                      data={image.responsiveImage}
                      className={s.image}
                      pictureClassName={s.picture}
                      placeholderClassName={s.placeholder}
                      intersectionMargin="0px 0px 200% 0px"
                    />
                  </li>
                </a>
              )
            })}
          </ul>
          <h2>Download {label} ({width}x{height})</h2>
        </div>
      ))}
    </div>
  )
}



export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  if (!props.session && (!context.query.secret || context.query.secret !== process.env.DATOCMS_PREVIEW_SECRET))
    return { redirect: { destination: '/login', permanent: false } }

  const productId = context.params.product
  const { product } = await apiQuery(ProductDocument, { variables: { productId, gray: props.settings.grid.hex } })

  if (!product)
    return { notFound: true }

  const { tags } = await apiQueryAll(AllClientTagsDocument, { variables: { id: product.client.id } })

  return {
    props: {
      ...props,
      product,
      tags
    }
  };
});