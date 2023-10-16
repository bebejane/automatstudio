import { withRevalidate } from 'dato-nextjs-utils/hoc'
import { buildRoute } from '/lib/routes';

export default withRevalidate(async (record, revalidate) => {

  const { api_key: apiKey } = record.model;
  const paths = []

  switch (apiKey) {
    case 'setting':
      paths.push.apply(paths, ['/', '/gallery', '/contact', '/login', '/logout'])
      break;
    case 'start':
      paths.push(await buildRoute('start'))
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