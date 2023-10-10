// next api route
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '/pages/api/auth/[...nextauth]';
import { buildClient } from '@datocms/cma-client-browser';

const client = buildClient({
  apiToken: process.env.DATOCMS_CMA_API_TOKEN,
  environment: process.env.DATOCMS_ENVIRONMENT
});

const allClientTags = async (id: string): Promise<TagRecord[]> => {
  return await client.items.list({
    filter: {
      type: 'tag',
      page: { limit: 30 },
      fields: { client: { eq: id } },

    },
    order_by: '_createdAt_DESC'
  }) as unknown as TagRecord[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    if (req.method !== 'POST')
      return res.status(405).json({ success: false, error: 'Method not allowed' })

    //@ts-ignore
    const id = session.user.id as string;
    const { product }: { product: ProductRecord } = req.body;

    if (!product.productId)
      return res.status(400).json({ success: false, error: 'Missing product' })

    const tagItemType = (await client.itemTypes.list()).find((itemType: any) => itemType.api_key === 'tag').id;
    const clientTags = await allClientTags(id)
    const tagsToAdd = product.tags?.filter(({ id, tag }) => !id || (!clientTags.find((clientTag: any) => clientTag.tag.toLowerCase() === tag.toLowerCase())));

    await Promise.all(tagsToAdd?.map(({ tag }) => client.items.create({
      item_type: {
        type: 'item_type',
        id: tagItemType
      },
      tag,
      client: id
    })));

    const allTags = await allClientTags(id);
    console.log(allTags)
    const productTags = allTags.filter((t) => !product.tags.find(({ id }) => id === t.id))
    await client.items.update(product.id, {
      tags: productTags.map(({ id }) => id)
    })
    return res.status(200).json({ success: true, product: { ...product, tags: productTags } })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, error: err })
  }


}