import { AllClientsDocument, AllProductsByClientDocument, ClientBySlugDocument } from "/graphql";
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api";
import withGlobalProps from "/lib/withGlobalProps";

export type Props = {
  client: ClientRecord
  products: ProductRecord[]
}

export default function Client({ client, products }: Props) {
  return (
    <>{client.name}</>
  )
}

export async function getStaticPaths() {

  const { clients } = await apiQueryAll(AllClientsDocument);
  const paths = clients.map((client) => ({
    params: { client: client.slug },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps = withGlobalProps({ queries: [] }, async ({ props, context, revalidate }: any) => {

  const slug = context.params.client


  if (!slug)
    return { notFound: true, revalidate }

  const { client } = await apiQuery(ClientBySlugDocument, { variables: { slug } })

  if (!client)
    return { notFound: true, revalidate }

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
