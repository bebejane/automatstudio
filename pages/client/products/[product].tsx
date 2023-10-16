import s from './[product].module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll, } from "dato-nextjs-utils/api"
import { AllClientTagsDocument, ProductDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { useRef, useState } from 'react';
import { DownloadZipButton, Loader } from '/components';

export type Props = {
  product: ProductRecord
  tags: TagRecord[]
}

const sizes = [
  { width: 1080, height: 1920, label: 'Instagram Story', prop: 'istory' },
  { width: 1080, height: 1080, label: 'Instagram Square', prop: 'isquare' },
]

const colors = ['black', 'white', 'gray']

export default function Product({ product: productFromProps, tags }: Props) {

  const [product, setProduct] = useState(productFromProps)
  const [allTags, setAllTags] = useState<TagRecord[]>(tags)

  return (
    <div className={s.container}>
      <div className={s.intro}>
        <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
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

const TagForm = ({ product, setProduct, allTags, setAllTags }: { product: ProductRecord, setProduct, allTags: TagRecord[], setAllTags }) => {

  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLInputElement | null>(null)
  const filteredTags = allTags.filter((tag) => query && !product.tags.find(t => t.id === tag.id) && tag.tag.toLowerCase().startsWith(query.toLowerCase()))

  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const tag = (formData.get('tag') as string)?.trim()
    save(allTags.find(t => t.tag.toLowerCase() === tag.toLowerCase()) || tag)
  }

  const save = async (tag: TagRecord | string, remove = false) => {

    try {

      setQuery('')
      setSaving(true)
      setError(null)

      const tags = [...product.tags]

      if (!remove)
        tags.push(typeof tag === 'string' ? { tag } as TagRecord : tag)
      else if (typeof tag !== 'string')
        tags.splice(tags.findIndex(t => t.id === tag.id), 1)

      const res = await fetch('/api/product', {
        method: 'POST',
        body: JSON.stringify({ product: { ...product, tags } }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()

      if (data.error)
        throw new Error(data.error)

      setProduct(data.product)
      setAllTags(data.allTags)

    } catch (e) {
      setError(e)
    } finally {
      setQuery('')
      setSaving(false)
    }
  }

  return (
    <form
      method="POST"
      action="/api/product"
      onSubmit={submitForm}
      className={cn(saving && s.saving)}
    >
      <input type="hidden" id="product_id" name="product_id" value={product.id} />

      <div className={s.tagInput}>
        <input
          ref={ref}
          type="text"
          name="tag"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          placeholder="Add tag..."
          onChange={(e) => setQuery(e.target.value)} value={query}
        />
        {saving && <Loader className={s.loader} />}
        <div className={cn(s.alltags, filteredTags.length > 0 && s.show)}>
          {filteredTags.map((t, i) =>
            <div
              key={i}
              className={cn(s.tag, query.toLowerCase() === t.tag.toLowerCase() && s.selected)}
              onClick={() => save(t)}
            >
              {t.tag}
            </div>
          )}
        </div>
      </div>
      <div className={s.tags}>
        {product.tags.map((t, i) =>
          <span key={i} className={s.tag}>
            {t.tag}<span className={s.close} onClick={() => save(t, true)}>×</span>
          </span>
        )}
      </div>
      {error && <div className="error">{error.message}</div>}
    </form>
  )
}

export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  if (!props.session && (!context.query.secret || context.query.secret !== process.env.DATOCMS_PREVIEW_SECRET))
    return { redirect: { destination: '/login', permanent: false } }

  const productId = context.params.product
  const { product } = await apiQuery(ProductDocument, { variables: { productId, gray: props.settings.grid.hex } })
  const { tags } = await apiQueryAll(AllClientTagsDocument, { variables: { id: product.client.id } })

  return {
    props: {
      ...props,
      product,
      tags
    }
  };
});