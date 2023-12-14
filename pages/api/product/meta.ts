import { NextApiRequest, NextApiResponse } from 'next';
import { apiQuery } from 'dato-nextjs-utils/api';
import { ProductDocument } from '/graphql';
import withAuthentication from '/lib/withAuthentication';
import { Session } from 'next-auth';
import client from '/lib/client';
import metaFields from '/lib/meta-fields';

export default withAuthentication(async (req: NextApiRequest, res: NextApiResponse, session: Session) => {

  try {

    if (req.method !== 'POST') // Ping
      return res.status(200).json({ success: false })

    //@ts-ignore
    const id = session.user.id as string;
    const data = req.body;

    if (!data.id)
      return res.status(400).json({ success: false, error: 'Missing id' })
    if (!data.product_id)
      return res.status(400).json({ success: false, error: 'Missing product id' })

    const meta = metaFields.reduce((acc, field) => ({
      ...acc,
      [field.id]: data[field.id]
    }), {})

    await client.items.update(data.id, meta)
    //await sleep(1000)
    const { product } = await apiQuery(ProductDocument, { variables: { productId: data.product_id } })
    return res.status(200).json({ product })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || err })
  }
})