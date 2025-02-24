import { NextApiRequest, NextApiResponse } from 'next';
import { apiQuery, apiQueryAll } from 'dato-nextjs-utils/api';
import { ProductDocument, AllProductsByClientDocument, ClientDocument } from '/graphql';
import { withBasicAuth } from 'dato-nextjs-utils/hoc';

export default withBasicAuth(async (req: NextApiRequest, res: NextApiResponse) => {

  try {

    if (req.method !== 'POST') // Ping
      return res.status(200).json({ success: false })

    const { product_id, client_id }: { product_id: string, client_id: string } = req.body;

    if (!product_id && !client_id)
      return res.status(400).json({ success: false, error: 'Invalid request. Must include product_id or client_id' })

    const data: any = {}
    const { product }: { product: ProductRecord } = await apiQuery(ProductDocument, { variables: { productId: product_id ?? '' } });
    const { client }: { client: ClientRecord } = await apiQuery(ClientDocument, { variables: { clientId: client_id ?? '' } });
    const { products }: { products: ProductRecord[] } = await apiQueryAll(AllProductsByClientDocument, { variables: { id: client?.id ?? '' } });

    if (product && product_id) {
      data.productId = product.productId
      data.clientId = product.client?.clientId
      data.images = {
        png: product.png?.url ?? null,
        tiff: product.tiff?.url ?? null,
        back: product.back?.url ?? null
      }
    }

    if (products && client) {
      data.clientId = client.clientId
      data.products = products?.map(p => ({
        productId: p.productId,
        images: {
          png: p.png?.url ?? null,
          tiff: p.tiff?.url ?? null,
          back: p.back?.url ?? null
        }
      })) ?? []
    }

    if (!client && !product)
      return res.status(400).json({ success: false, error: 'Not found' })

    return res.status(200).json(data)

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || err })
  }
})
