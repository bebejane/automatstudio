import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthentication from '/lib/withAuthentication';
import { Session } from 'next-auth';

export const config = {
  api: {
    responseLimit: false,
  },
}

export default withAuthentication(async (req: NextApiRequest, res: NextApiResponse, session: Session) => {

  const { file_path } = req.query as { file_path: string }

  if (!file_path)
    return res.status(400).json({ error: 'file_path is required' })
  if (!fs.existsSync(file_path))
    return res.status(400).json({ error: 'file_path does not exist' })

  try {

    const contentLength = fs.statSync(file_path).size
    const filename = file_path.split('/').pop()

    res.writeHead(200, {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/zip',
      'Content-Length': contentLength,
    })

    console.time('archive download')

    fs.createReadStream(file_path).pipe(res)
      .on('close', () => {
        console.timeEnd('archive download')
        cleanup(path.dirname(file_path))
      })
      .on('error', (e) => {
        throw e
      })

  } catch (e) {
    console.timeEnd('archive download')
    console.error(e)
    res.status(400).send(e.message)
    cleanup(path.dirname(file_path))
  }
})

export const temp_dir = `/tmp`

export function cleanup(dir: string) {

  try {
    console.log('cleanup', dir)
    fs.rmSync(dir, { recursive: true, force: true })

  } catch {
    console.log(`error deleting dir ${dir}`)
  }
}