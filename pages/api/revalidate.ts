import { withRevalidate } from 'dato-nextjs-utils/hoc'
import { buildClient } from '@datocms/cma-client-node';

const client = buildClient({ apiToken: process.env.NEXT_PUBLIC_GRAPHQL_API_TOKEN });

export default withRevalidate(async (record, revalidate) => {

  const { api_key: apiKey } = record.model;
  const { product_id, client_id } = record
  const paths = []

  switch (apiKey) {
    case 'product':
      const c = (await client.items.find(record.attributes.client, { version: 'latest', nested: true })) as any
      paths.push(`/client/${c.client_id}/products/${product_id}`)
      break;
    case 'client':
      paths.push(`/client/${client_id}`)
      break;
    default:
      break;
  }

  revalidate(paths)
})