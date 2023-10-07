import s from './DownloadZipButton.module.scss'
import cn from 'classnames'
import React, { useState } from 'react'
import { formatDate } from '/lib/utils'

export type Props = {
  products: ProductRecord[] | ProductRecord
  label: string
  generating: string
  className?: string
}

export default function DownloadZipButton({ products, label, generating, className }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState(null)

  const download = async () => {
    setDownloading(true)
    setError(null)
    setProgress(null)
    try {
      await generateDownload(products, setProgress)
    } catch (e) {
      setError(e)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <button className={cn(className, downloading && 'pulse')} onClick={download}>
        {downloading ? `${generating}${progress !== null ? ` ${progress}%` : ''}` : label}
      </button>
      {error && <div className="error">{error?.message}</div>}
    </>
  )
}

const generateDownload = async (products: ProductRecord[] | ProductRecord, setProgress: React.Dispatch<React.SetStateAction<number>>) => {

  if (!products)
    throw new Error('No products to download')

  const isSingle = !Array.isArray(products)

  const filename = isSingle ? `automatstudio-${products.productId}.zip` : `automatstudio-${formatDate(products[0]._createdAt)}.zip`
  const upload_ids = isSingle ? [products.png.id, products.tiff.id] : products.map((product) => product.png.id)
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ upload_ids, filename })
  })

  const { url, username, password, body } = await res.json()

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const contentLength = response.headers.get('content-length');
  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const dres = new Response(new ReadableStream({
    async start(controller) {
      const reader = response.body.getReader();
      for (; ;) {
        const { done, value } = await reader.read();
        if (done) break;
        loaded += value.byteLength;
        setProgress(Math.round(((loaded / total) * 100)))
        controller.enqueue(value);
      }
      controller.close();
    },
  }));


  if (dres.status !== 200)
    throw new Error('Error generating archive')

  const blob = await dres.blob()
  const downloadUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()

}