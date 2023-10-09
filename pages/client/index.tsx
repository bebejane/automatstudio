import s from './index.module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument, AllProductsByClientDocument } from "/graphql"
import { Image } from 'react-datocms'
import { formatDate } from '/lib/utils';
import Link from 'next/link';
import { DownloadZipButton } from '/components';

export type Props = {
  client: ClientRecord
  products: ProductRecord[]
}

type Batch = {
  date: string
  createdAt: string
  products: ProductRecord[]
  downloading: boolean
  error: Error | null
}


export default function Client({ client, products }: Props) {

  const batches = generateBatches(products)


  return (
    <div className={s.container}>
      {batches.length > 0 ?
        <ul>
          {batches?.map((batch, idx) => (
            <li key={idx}>
              {batch.date}<br />
              <DownloadZipButton
                products={products}
                label="Download archive"
                generating="Download archive"
              />
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
