import s from './index.module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument, AllProductsByClientDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link';
import { useEffect } from 'react';
import { SessionLoader } from '/components';

export type Props = {
  client: ClientRecord
  products: ProductRecord[]
}

export default function Client({ client, products }: Props) {

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading' || session) return
    if (status === 'unauthenticated') signIn()
  }, [session, status])

  if (status === 'loading' || !session) return <SessionLoader />

  const batches = products.length ? [{
    createdAt: products[0]._createdAt,
    products
  }] : []

  return (
    <div className={s.container}>
      {batches.length > 0 ?
        <ul>
          {batches?.map((batch, idx) => (
            <li key={idx}>
              {format(new Date(batch.createdAt), 'yyyy MM dd')}<br />
              <button>Download archive</button><br />
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
        : <div>No batches found</div>
      }
    </div >
  )
}

export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const clientId = props.session?.user.id ?? context.query.secret === process.env.DATOCMS_PREVIEW_SECRET ? context.query.client_id : null
  console.log(clientId, context.query.secret, context.query.client_id)
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
