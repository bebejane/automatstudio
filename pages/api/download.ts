// next api route
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const upload_ids = req.body.upload_ids
    const filename = req.body.filename;
    const url = `https://kt-api.up.railway.app/automatstudio/download`
    //const url = `http://localhost:5000/automatstudio/download`

    return res.status(200).json({
      url: url,
      username: process.env.BASIC_AUTH_USER,
      password: process.env.BASIC_AUTH_PASSWORD,
      body: {
        upload_ids,
        filename,
      }
    })

  } catch (err) {
    return res.status(500).json({ success: false, error: err })
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
}