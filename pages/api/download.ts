// next api route
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '/pages/api/auth/[...nextauth]';
import { Readable } from 'stream';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const upload_ids = (req.query.upload_ids as String)?.split(',');
    const filename = req.query.filename;
    const url = `https://kt-api.up.railway.app/automatstudio/download?upload_ids=${upload_ids.join(',')}&filename=${filename}`

    //@ts-ignore
    const readableStream = await fetch(url).then(r => Readable.fromWeb(r.body));

    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/zip');
    readableStream.pipe(res).on('close', () => {
      console.log('done')
      res.status(200).end()
    });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, error: err })
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}