import { withWebPreviewsEdge } from 'dato-nextjs-utils/hoc';
import { buildRoute } from '/lib/routes';

export const config = {
  runtime: 'edge'
}

export default withWebPreviewsEdge(async ({ item, itemType }) => {

  let path = null;

  const { product_id, client_id } = item.attributes

  switch (itemType.attributes.api_key) {
    case 'product':
      path = `${(await buildRoute('product', product_id))}?secret=${process.env.DATO_PREVIEW_SECRET}`
      break;
    case 'client':
      path = await buildRoute('client', client_id)
      break;
    case 'gallery':
      path = await buildRoute('gallery')
      break;
    case 'contact':
      path = await buildRoute('contact')
      break;
    default:
      break;
  }

  return path
})