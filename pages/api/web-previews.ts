import { withWebPreviewsEdge } from 'dato-nextjs-utils/hoc';
import { buildClient } from '@datocms/cma-client-node';

const client = buildClient({ apiToken: process.env.NEXT_PUBLIC_GRAPHQL_API_TOKEN });

export const config = {
  runtime: 'edge'
}

export default withWebPreviewsEdge(async ({ item, itemType }) => {

  let path = null;

  const { product_id, client_id } = item.attributes

  console.log(item)

  switch (itemType.attributes.api_key) {
    case 'product':
      const product = (await client.items.find(item.id, { version: 'latest', nested: true })) as any
      path = `/client/${product.client.client_id}/products/${product_id}`
      break;
    case 'client':
      path = `/client/${client_id}`
      break;
    default:
      break;
  }

  return path
})