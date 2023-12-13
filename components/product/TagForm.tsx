import s from './TagForm.module.scss';
import cn from 'classnames';
import { useRef, useState } from 'react';
import Loader from '../Loader';

export type Props = {
  product: ProductRecord
  allTags: TagRecord[]
  setProduct: (product: ProductRecord) => void
  setAllTags: (tags: TagRecord[]) => void
}

export default function TagForm({ product, setProduct, allTags, setAllTags }: Props) {

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

      const res = await fetch('/api/product/tags', {
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
      setError(new Error('Something went wrong'))
      console.error(e)
    } finally {
      setQuery('')
      setSaving(false)
    }
  }

  return (
    <form
      method="POST"
      action="/api/product/tags"
      onSubmit={submitForm}
      className={cn(s.tagForm, saving && s.saving)}
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
        {saving &&
          <span className={s.loaderWrap}>
            <Loader className={s.loader} />
          </span>
        }
      </div>
      {error && <div className="error">{error.message}</div>}
    </form>
  )
}
