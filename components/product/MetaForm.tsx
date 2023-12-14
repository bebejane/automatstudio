import s from './MetaForm.module.scss';
import cn from 'classnames';
import { useRef, useState } from 'react';
import metaFields from '/lib/meta-fields';
import Loader from '../Loader';

export type Props = {
  product: ProductRecord
  setProduct: (product: ProductRecord) => void
}

export default function MetaForm({ product, setProduct }: Props) {

  const [error, setError] = useState<Error | null>(null)
  const [saving, setSaving] = useState(false)
  const [hasChanged, setHasChanged] = useState(true)
  const ref = useRef<HTMLFormElement>(null)

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setSaving(true)
    setError(null)

    try {

      const form = e.currentTarget
      const formData = new FormData(form)
      const meta: any = {}

      formData.forEach((value, key) => {
        const field = metaFields.find(field => field.id === key)
        meta[key] = field?.type === 'boolean' ? parseInt(value as string) === 1 ? true : false : value
      })

      const res = await fetch(form.action, {
        method: 'POST',
        body: JSON.stringify(meta),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()

      if (data.error)
        throw new Error(data.error)

      setProduct(data.product)

    } catch (e) {
      setError(new Error('Something went wrong'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const inputs = Array.from(ref.current.querySelectorAll('input')).slice(1)
    const changed = inputs.some(input => {
      if (!input.value && typeof product[input.id] === 'undefined') return false
      const field = metaFields.find(field => field.id === input.id)
      if (field?.type === 'boolean')
        return (parseInt(input.value) === 1) !== product[input.id]

      return input.value !== product[input.id]
    })
    //setHasChanged(changed)
  }

  return (

    <form
      id="meta-form"
      method="POST"
      action="/api/product/meta"
      onSubmit={submitForm}
      ref={ref}
      className={cn(s.metaForm, saving && s.saving)}
    >
      <input type="hidden" id="id" name="id" value={product.id} />
      <input type="hidden" id="product_id" name="product_id" value={product.productId} />
      {metaFields.map(field => (
        <div key={field.id} className={s.field}>
          {field.type !== 'boolean' ?
            <input
              id={field.id}
              name={field.id}
              type={field.type}
              placeholder={`${field.label}`}
              defaultValue={product[field.id]}
              onChange={handleChange}
              autoComplete="off"
            />
            :
            <>
              <label htmlFor={field.id}>{field.label}</label>
              <select
                id={field.id}
                name={field.id}
                defaultValue={product[field.id] ? '1' : '0'}
                onChange={handleChange}
                autoComplete="off"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </>
          }
        </div>
      ))}
      <br />
      <div className={s.submit}>
        <button type="submit" className={s.save} disabled={!hasChanged}>
          Save
          {saving &&
            <Loader className={s.loader} />
          }
        </button>
      </div>
      {error && <div className="error">{error.message}</div>}
    </form>
  )
}
