import s from './DownloadZipButton.module.scss'
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

type DownloadStatus = {
  progress: number | null
  contentLength: number | null
}

export default function DownloadZipButton({ products, label, status, className }: Props) {

  const [downloading, setDownloading] = useState(false)
  const [dStatus, setDStatus] = useState<DownloadStatus>({
    progress: null,
    contentLength: null,
  })
  const [error, setError] = useState(null)

  const download = async () => {
    if (downloading) return
    setDownloading(true)
    setError(null)
    setDStatus({
      progress: null,
      contentLength: null,
    })

    try {
      await generateDownload(products, setDStatus)
    } catch (e) {
      setError(e)
    } finally {
      setDownloading(false)
    }
  }

  const isGenerating = downloading && dStatus.progress === null && dStatus.contentLength === null
  const isDownloading = downloading && dStatus.progress !== null && dStatus.contentLength !== null

  return (
    <>
      <button className={cn(className, downloading)} onClick={download}>
        {!isGenerating && !isDownloading && label}
        {isGenerating && <>{status.generating} <Loader /></>}
        {isDownloading && `${status.downloading} ${dStatus.progress !== null ? ` ${dStatus.progress}` : '0'}%`}
      </button>
      {error && <div className="error">{error?.message}</div>}
    </>
  )
}

const generateDownload = async (
  products: ProductRecord[] | ProductRecord,
  setDStatus: React.Dispatch<React.SetStateAction<DownloadStatus>>
) => {

  if (!products)
    throw new Error('No products to download')

  const isSingle = !Array.isArray(products)
  const filename = isSingle ? `automatstudio-${products.productId}.zip` : `automatstudio-${formatDate(products[0]._createdAt)}.zip`
  const upload_ids = (isSingle ? [products.png?.id, products.tiff?.id, products.back?.id] : products.map((product) => product.png.id)).filter((id) => id)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/download/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ upload_ids: upload_ids, filename }),
  })

  const { url, filename: file } = await response.json()
  console.log(url, file)
  const a = document.createElement('a')
  a.href = url
  a.download = file
  document.body.appendChild(a)
  a.click()
  a.remove()

}