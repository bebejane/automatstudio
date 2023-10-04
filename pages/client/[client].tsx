import s from './[client].module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery } from "dato-nextjs-utils/api"
import { AllClientsDocument, ClientDocument } from "/graphql"
import { GetStaticProps } from "next"
import { Image } from 'react-datocms'
import { format } from 'date-fns'

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
                <li key={product.id}>
                  <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
                </li>
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
  const paths = clients.map(({ id }) => ({ params: { client: id } }))
  return {
    paths,
    fallback: 'blocking'
  }
}


export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const id = context.params.client
  const { client } = await apiQuery(ClientDocument, { variables: { id } })
  return {
    props: {
      ...props,
      client
    },
    revalidate
  };
});
