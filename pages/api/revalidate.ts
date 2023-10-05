import { withRevalidate } from 'dato-nextjs-utils/hoc'
import { buildRoute } from '/lib/routes';

export default withRevalidate(async (record, revalidate) => {

  const { api_key: apiKey } = record.model;
  const { product_id, client_id } = record
  const paths = []

  switch (apiKey) {
    case 'product':
      paths.push(await buildRoute('product', product_id))
      break;
    case 'client':
      paths.push(await buildRoute('client', client_id))
      break;
    case 'gallery':
      paths.push(await buildRoute('gallery'))
      break;
    case 'contact':
      paths.push(await buildRoute('contact'))
      break;
    default:
      break;
  }

  revalidate(paths)
})