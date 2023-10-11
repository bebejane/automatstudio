import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import withAuthentication from '/lib/withAuthentication';
import yazl from 'yazl'
import { Session } from 'next-auth';
import client from '/lib/client';

const temp_dir = `/tmp`

export const config = {
  api: {
    responseLimit: false,
  },
}

export default withAuthentication(async (req: NextApiRequest, res: NextApiResponse, session: Session) => {

  const zip = new yazl.ZipFile()
  const zip_filepath = `${temp_dir}/products_${Date.now()}.zip`

  try {

    const upload_ids = (req.body.upload_ids as string[])
    const filename = (req.body.filename as string) || 'archive.zip'

    if (!upload_ids) throw new Error("upload_ids is empty")

    console.log(`getting uploads from dato: ${upload_ids.length}`)

    const uploads = []

    for await (const record of client.uploads.listPagedIterator({ filter: { ids: upload_ids.join(',') }, version: 'latest' }))
      uploads.push(record)

    console.log('got uploads from dato')

    for (let i = 0; i < uploads.length; i++) {
      const { filename, url } = uploads[i];
      //@ts-ignore
      const readableStream = await fetch(url).then(r => Readable.fromWeb(r.body));
      //@ts-ignore
      zip.addReadStream(readableStream, `${i + 1}_${filename}`, { compress: false })

    }

    console.log(`writing zip with ${uploads.length} files to ${zip_filepath}`)
    console.time(`done ${filename}`)

    zip.outputStream.pipe(fs.createWriteStream(zip_filepath)).on("close", () => {
      const contentLength = fs.statSync(zip_filepath).size
      console.log(`done compressing ${filename} (${(contentLength / 1000000).toFixed(2)}mb)`)

      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/zip',
        'Content-Length': contentLength,
      })
      fs.createReadStream(zip_filepath).pipe(res)
        .on('close', () => {
          console.timeEnd(`done ${filename}`)
          fs.unlinkSync(zip_filepath)
        })
        .on('error', (e) => {
          throw e
        })
    }).on('error', (e) => {
      try {
        fs.unlinkSync(zip_filepath)
      } catch {
        console.log(`error deleting ${zip_filepath}`)
      }
      throw e
    })

    zip.end();

  } catch (e) {
    console.error(e)
    res.status(400).send(e.message)
    try {
      fs.unlinkSync(zip_filepath)
    } catch {
      console.log(`error deleting ${zip_filepath}`)
    }
  }
})