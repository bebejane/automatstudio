import s from './[client].module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery } from "dato-nextjs-utils/api"
import { AllClientsDocument, ClientDocument } from "/graphql"
import { GetStaticProps } from "next"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import Link from 'next/link';

export type Props = {
  client: ClientRecord
}

export default function Client({ client }: Props) {
  const batches = client._allReferencingBatches;

  return (
    <div className={s.container}>
      {batches.length > 0 ? <ul>
        {batches?.map((batch) => (
          <li key={batch.id}>
            Batch {batch.id}<br />
            {format(new Date(batch._createdAt), 'yyyy mm dd')}<br />
            <button>Download archive</button><br />
            <ul className={s.images}>
              {batch._allReferencingProducts?.map((product) => (
                <Link href={`/client/batch/${batch.batchId}/product/${product.productId}`} key={product.id}>
                  <li >
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
        : <div>No batches found</div>}
    </div>
  )
}

export async function getStaticPaths(context) {
  const { clients } = await apiQuery(AllClientsDocument, {})
  const paths = clients.map(({ clientId }) => ({ params: { client: clientId } }))
  return {
    paths,
    fallback: 'blocking'
  }
}


export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const clientId = context.params.client
  const { client } = await apiQuery(ClientDocument, { variables: { clientId } })
  return {
    props: {
      ...props,
      client
    },
    revalidate
  };
});
