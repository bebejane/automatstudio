import { buildClient } from "@datocms/cma-client-browser"

const client = buildClient({ apiToken: process.env.NEXT_PUBLIC_GRAPHQL_API_TOKEN })

type Routes = {
  [key: string]: Route
}

type Route = {
  basePath: ((slug?: string) => Promise<string>) | string
  typeName: string
}

const routes: Routes = {
  "product": {
    typeName: "ProductRecord",
    basePath: async (productId) => {
      const product = (await client.items.list({
        filter: {
          type: 'product',
          fields: {
            product_id: { eq: productId }
          }
        }
      }))[0]

      if (!product) throw new Error(`Invalid product: ${productId}`)
      const clientId = (await client.items.find(product.client as string, { version: 'latest', nested: true })).client_id
      return `/client/${clientId}/products/${productId}`
    }
  },
  "client": {
    typeName: "ClientRecord",
    basePath: "/client"
  }
}

export const buildRoute = async (model: string, slug?: string): Promise<string> => {
  if (!routes[model]) throw new Error(`Invalid model: ${model}`)

  if (typeof routes[model].basePath === 'function')
    return await (routes[model].basePath as Function)(slug)
  else
    return `${routes[model].basePath}${slug ? `/${slug}` : ''}`
}

export const recordToRoute = async (record: any, slugKey = 'slug'): Promise<string> => {
  const { __typename } = record
  const slug = record[slugKey]
  const model = Object.keys(routes).find(key => routes[key].typeName === __typename)
  if (!model) throw new Error(`Invalid record: ${__typename}`)
  if (!slug) throw new Error(`Invalid slug: ${slug}`)
  return await buildRoute(model, slug)
}

export default routes