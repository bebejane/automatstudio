import s from './index.module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument, AllProductsByClientDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { useState } from 'react';
import Link from 'next/link';

export type Props = {
  client: ClientRecord
  products: ProductRecord[]
}

export default function Client({ client, products }: Props) {

  const batches = generateBatches(products)
  const [downloading, setDownloading] = useState({})
  const [error, setError] = useState({})

  const download = async (batch: Batch) => {
    setDownloading({ ...downloading, [batch.date]: true })
    setError({ ...error, [batch.date]: null })
    try {
      await generateDownload(batch)
    } catch (e) {
      setError({ ...error, [batch.date]: e })
    } finally {
      setDownloading({ ...downloading, [batch.date]: false })
    }
  }

  return (
    <div className={s.container}>
      {batches.length > 0 ?
        <ul>
          {batches?.map((batch, idx) => (
            <li key={idx}>
              {batch.date}<br />
              <button className={cn(downloading[batch.date] && 'pulse')} onClick={() => download(batch)}>
                {downloading[batch.date] ? 'Generating archive...' : 'Download archive'}
              </button>
              {error[batch.date] && <div className="error">{error[batch.date]?.message}</div>}
              <br />
              <ul className={s.images}>
                {batch.products?.map((product) => (
                  <Link href={`/client/products/${product.productId}`} key={product.id}>
                    <li>
                      <Image
                        data={product.png.responsiveImage}
                        className={s.image}
                        pictureClassName={s.picture}
                      />
                    </li>
                  </Link>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        : <div>No products available...</div>
      }
    </div >
  )
}

type Batch = {
  date: string
  createdAt: string
  products: ProductRecord[]
  downloading: boolean
  error: Error | null
}

const generateBatches = (products: ProductRecord[]): Batch[] => {

  if (!products) return []

  const batches: Batch[] = []

  products.forEach((product) => {
    const batch = batches.find((batch) => formatDate(batch.createdAt) === formatDate(product._createdAt))
    if (batch) {
      batch.products.push(product)
    } else {
      batches.push({
        date: formatDate(product._createdAt),
        createdAt: product._createdAt,
        products: [product],
        downloading: false,
        error: null
      })
    }
  })
  return batches
}

const formatDate = (date: string) => format(new Date(date), 'yyyy-MM-dd')

const generateDownload = async (batch: Batch) => {

  const { products } = batch

  if (!products || products.length === 0)
    throw new Error('No products to download')

  const filename = `automatstudio-${formatDate(products[0]._createdAt)}.zip`
  const upload_ids = products.map((product) => product.png.id).join(',')
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ upload_ids, filename })
  })

  const { url, username, password, body } = await res.json()

  const dres = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${username}:${password}`)}`
    },
    body
  })
  console.log(dres)
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

export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  const clientId = props.session?.user.clientId ?? (context.query.secret === process.env.DATOCMS_PREVIEW_SECRET ? context.query.client_id : null)

  if (!clientId)
    return { redirect: { destination: '/login', permanent: false } }

  const { client } = await apiQuery(ClientDocument, { variables: { clientId } })
  const { products } = await apiQueryAll(AllProductsByClientDocument, { variables: { id: client.id } })

  return {
    props: {
      ...props,
      client,
      products
    }
  };
});
