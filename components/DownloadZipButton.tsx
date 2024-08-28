import cn from 'classnames'
import React, { useState } from 'react'
import { formatDate } from '/lib/utils'
import { Loader } from '/components'

export type Props = {
  products: ProductRecord[] | ProductRecord
  label: string
  status: {
    generating: string
    downloading: string
  }
  className?: string
}

export default function DownloadZipButton({ products, label, status, className }: Props) {

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  const download = async () => {
    if (generating) return
    setGenerating(true)
    setError(null)

    try {
      await generateDownload(products)
    } catch (e) {
      setError(e)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <>
      <button className={cn(className, generating)} onClick={download}>
        {generating ? <>{status.generating} <Loader /></> : label}
      </button>
      {error && <div className="error">{error?.message}</div>}
    </>
  )
}

const generateDownload = async (products: ProductRecord[] | ProductRecord) => {

  if (!products)
    throw new Error('No products to download')

  try {
    const isSingle = !Array.isArray(products)
    const name = isSingle ? `${products.productId}` : `${formatDate(products[0].date)}`
    const upload_ids = (isSingle ? [products] : products).map((product) => [product.png?.id, product.tiff?.id, product.back?.id]).flat().filter((id) => id)

    const response = await fetch(`/api/download/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload_ids, name }),
    })

    if (response.status !== 200)
      throw new Error(await response.text())

    const { url, filename } = await response.json()
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (e) {
    throw new Error('Failed to generate download. ' + e?.message)
  }

}