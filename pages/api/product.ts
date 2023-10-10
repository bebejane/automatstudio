// next api route
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '/pages/api/auth/[...nextauth]';
import { buildClient } from '@datocms/cma-client-browser';
import { apiQuery } from 'dato-nextjs-utils/api';
import { ProductDocument } from '/graphql';

const client = buildClient({
  apiToken: process.env.DATOCMS_CMA_API_TOKEN,
  environment: process.env.DATOCMS_ENVIRONMENT
});

const allClientTags = async (id: string): Promise<TagRecord[]> => {
  const tags = [];
  for await (const record of client.items.listPagedIterator({
    filter: {
      type: 'tag',
      page: { limit: 30 },
      fields: { client: { eq: id } },
    },
    order_by: '_createdAt_DESC'
  })) {
    tags.push(record);
  }
  return tags as TagRecord[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    if (req.method !== 'POST') // Ping
      return res.status(200).json({ success: false })

    //@ts-ignore
    const id = session.user.id as string;
    const { product }: { product: ProductRecord } = req.body;

    if (!product.productId)
      return res.status(400).json({ success: false, error: 'Missing product' })

    const [
      { product: productRecord },
      itemTypes,
      clientTags
    ] = await Promise.all([
      apiQuery(ProductDocument, { variables: { id: product.productId } }),
      client.itemTypes.list(),
      allClientTags(id)
    ])

    const tagItemTypeId = itemTypes.find((itemType: any) => itemType.api_key === 'tag').id
    const tagsToAdd = product.tags?.filter(({ id, tag }) => !id || (!clientTags.find((clientTag: any) => clientTag.tag.toLowerCase() === tag.toLowerCase())));
    const tagsToRemove = productRecord.tags.filter((t) => !product.tags.find(({ tag }) => tag.toLowerCase() === t.tag.toLowerCase()));

    await Promise.all(tagsToAdd?.map(({ tag }) =>
      client.items.create({
        item_type: {
          type: 'item_type',
          id: tagItemTypeId
        },
        tag: tag.trim(),
        client: id
      })
    ));

    const allTags = await allClientTags(id);
    const productTags = allTags.filter((t) => product.tags.find(({ tag }) => tag.toLowerCase() === t.tag.toLowerCase()))

    await client.items.update(product.id, {
      tags: productTags.map(({ id }) => id).filter((id) => !tagsToRemove.find((t) => t.id === id)),
    })

    return res.status(200).json({ product: { ...product, tags: productTags }, allTags })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || err })
  }
}