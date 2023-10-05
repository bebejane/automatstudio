import s from './[client].module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { AllClientsDocument, ClientDocument, AllProductsByClientDocument } from "/graphql"
import { GetStaticProps } from "next"
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
    console.log(session, status)
    return
    if (status === 'loading' || session) return
    if (status === 'unauthenticated') signIn()
  }, [session, status])

  //if (status === 'loading' || !session) return <SessionLoader />

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
                  <Link href={`/client/${product.client.clientId}/products/${product.productId}`} key={product.id}>
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

export async function getStaticPaths(context) {
  const { clients } = await apiQueryAll(AllClientsDocument)
  const paths = clients.map(({ clientId }) => ({ params: { client: clientId } }))
  return {
    paths,
    fallback: 'blocking'
  }
}


export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const clientId = context.params.client
  const { client } = await apiQuery(ClientDocument, { variables: { clientId } })
  const { products } = await apiQueryAll(AllProductsByClientDocument, { variables: { id: client.id } })
  return {
    props: {
      ...props,
      client,
      products
    },
    revalidate
  };
});
