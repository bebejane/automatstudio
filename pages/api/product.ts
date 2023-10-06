// next api route
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '/pages/api/auth/[...nextauth]';
import { buildClient } from '@datocms/cma-client-browser';

const client = buildClient({ apiToken: process.env.DATOCMS_CMA_API_TOKEN });

const allClientTags = async (id: string) => {
  return await client.items.list({
    filter: {
      type: 'tag',
      page: { limit: 30 },
      fields: { client: { eq: id } },

    },
    order_by: '_createdAt_DESC'
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    if (req.method !== 'POST')
      return res.status(405).json({ success: false, error: 'Method not allowed' })

    //@ts-ignore
    const id = session.user.id as string;
    const productId = req.body.product_id;

    if (!productId)
      return res.status(400).json({ success: false, error: 'Missing product id' })

    const product = await client.items.find(productId);

    if (!product)
      return res.status(400).json({ success: false, error: `Product not found: ${productId}` })

    const tagItemType = (await client.itemTypes.list()).find((itemType: any) => itemType.api_key === 'tag').id;
    const clientTags = await allClientTags(id)
    const tags = req.body.tags?.split(',')?.map((tag: string) => tag.trim()).filter((tag: string) => tag);
    const tagsToAdd = tags?.filter((tag: string) => !clientTags.find((clientTag: any) => clientTag.tag.toLowerCase() === tag.toLowerCase()));

    await Promise.all(tagsToAdd?.map((tag: string) => client.items.create({
      item_type: {
        type: 'item_type',
        id: tagItemType
      },
      tag,
      client: id
    })));

    const allTags = await allClientTags(id);
    const productTags = allTags.filter((tag: any) => tags?.includes(tag.tag)).map((tag: any) => tag.id)
    await client.items.update(product.id, {
      tags: productTags
    })
    return res.status(200).json({ success: true, tags: productTags })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, error: err })
  }


}