import s from './index.module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument, AllProductsByClientDocument } from "/graphql"
import { Image } from 'react-datocms'
import { formatDate, parseFilenameData } from '/lib/utils';
import Link from 'next/link';
import { DownloadZipButton } from '/components';

export type Props = {
  products: ProductRecord[]
}

type Batch = {
  date: string
  createdAt: string
  products: ProductRecord[]
  downloading: boolean
  error: Error | null
}

export default function Client({ products }: Props) {

  const batches = generateBatches(products)

  return (
    <div className={s.container}>
      {batches.length > 0 ?
        <ul>
          {batches?.map((batch, idx) => (
            <li key={idx}>
              {batch.date}<br />
              <DownloadZipButton
                products={batch.products}
                label="Download archive"
                status={{
                  downloading: 'Download archive',
                  generating: 'Generating zip file',
                }}
              />
              <br />
              <ul className={s.images}>
                {batch.products?.map((product) => (
                  <Link href={`/account/products/${product.productId}`} key={product.id}>
                    <li>
                      <Image
                        data={product.png.responsiveImage}
                        className={s.image}
                        pictureClassName={s.picture}
                        sizes={`(max-width: 768px) 300px, (min-width: 768px) 200px, 100vw`}
                        intersectionMargin="0px 0px 200% 0px"
                      />
                    </li>
                  </Link>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        :
        <div className={s.noproducts}>No products available...</div>
      }
    </div >
  )
}


const generateBatches = (products: ProductRecord[]): Batch[] => {

  if (!products) return []

  const batches: Batch[] = []

  products.forEach((product) => {
    const batch = batches.find((batch) => formatDate(batch.date) === formatDate(product.date))
    if (batch) {
      batch.products.push(product)
    } else {
      batches.push({
        date: formatDate(product.date),
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
