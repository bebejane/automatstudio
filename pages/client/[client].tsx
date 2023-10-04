import s from './[client].module.scss';
import withGlobalProps from '/lib/withGlobalProps';

import { apiQuery } from "dato-nextjs-utils/api"
import { AllClientsDocument, ClientDocument } from "/graphql"
import { GetStaticProps } from "next"

export type Props = {
  client: ClientRecord
}

export default function Client({ client }: Props) {

  return (
    <div className={s.container}>
      {client?.name}
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
