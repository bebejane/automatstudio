import s from './index.module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument, AllProductsByClientDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import Link from 'next/link';

export type Props = {
  client: ClientRecord
  products: ProductRecord[]
}

const createArchiveUrl = (products: ProductRecord[], filename: string) => {
  const upload_ids = products.map((product) => product.png.id).join(',')
  //return `https://kt-api.up.railway.app/automatstudio/download?upload_ids=${upload_ids}&filename=${filename}`
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/download?upload_ids=${upload_ids}&filename=${filename}`
}

export default function Client({ client, products }: Props) {

  const batches = products?.length ? [{
    createdAt: products[0]._createdAt,
    products,
    archiveUrl: createArchiveUrl(products, `automatstudio-${format(new Date(products[0]._createdAt), 'yyyy-MM-dd')}.zip`)
  }] : []

  return (
    <div className={s.container}>
      {batches.length > 0 ?
        <ul>
          {batches?.map((batch, idx) => (
            <li key={idx}>
              {format(new Date(batch.createdAt), 'yyyy MM dd')}<br />
              <button><a href={batch.archiveUrl} download>Download archive</a></button><br />
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
