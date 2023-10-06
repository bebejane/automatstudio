import s from './[product].module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, } from "dato-nextjs-utils/api"
import { ProductDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { useState } from 'react';

export type Props = {
  product: ProductRecord
}

const sizes = [
  { width: 1080, height: 1920, label: 'Instagram Story', prop: 'istory' },
  { width: 1080, height: 1080, label: 'Instagram Square', prop: 'isquare' },
]

const colors = ['black', 'white', 'gray']

export default function Product({ product }: Props) {

  return (
    <div className={s.container}>
      <div className={s.intro}>
        <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
        <div className={s.details}>
          {format(new Date(product._createdAt), 'yyyy MM dd')}<br />
          <p>
            <br />
            <button className="full">Download images</button> <span>(inc png, high-res tif and clipping path)</span>
          </p>
          <TagForm product={product} />
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
  const { product } = await apiQuery(ProductDocument, { variables: { productId } })

  return {
    props: {
      ...props,
      product
    }
  };
});


const TagForm = ({ product }: { product: ProductRecord }) => {

  const [tags, setTags] = useState<TagRecord[]>(product.tags)
  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)

  const saveTags = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const t = formData.get('tags') as string
    const product_id = formData.get('product_id') as string

    try {

      setSaving(true)

      const res = await fetch('/api/product', {
        method: 'POST',
        body: JSON.stringify({ tags: t, product_id }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (res.status !== 200) throw new Error('Error saving tags')

      const { tags, error } = await res.json()

      if (error)
        throw new Error(error)

      setTags(tags)

    } catch (e) {
      setError(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form method="POST" action="/api/product" onSubmit={saveTags} className={cn(saving && s.saving)}>
      <label htmlFor="tags">Tag:</label>
      <input type="hidden" id="product_id" name="product_id" value={product.id} />
      <input type="text" id="tags" name="tags" defaultValue={tags.map((t) => t.tag).join(',')} />
      {error && <div className="error">{error.message}</div>}
    </form>
  )
}