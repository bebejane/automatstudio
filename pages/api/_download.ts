import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import { ReadableStream } from 'node:stream/web';
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

  return new Promise(async (resolve, reject) => {

    try {

      const upload_ids = (req.body.upload_ids as string[])
      const filename = (req.body.filename as string) || 'archive.zip'

      if (!upload_ids) throw new Error("upload_ids is empty")

      console.log(`getting uploads from dato: ${upload_ids.length}`)

      const uploads = []

      for await (const record of client.uploads.listPagedIterator({ filter: { ids: upload_ids.join(',') }, version: 'latest' }))
        uploads.push(record)

      console.log(`getting uploads from dato: ${upload_ids.length}`, 'done')

      if (!uploads.length) throw new Error("no uploads found")

      console.log(`fetching ${uploads.length} streams to zip`)
      console.time(`fetching ${uploads.length} streams to zip`)

      const streams = await Promise.all(uploads.map(async ({ filename, url }, i) => {
        return fetch(url).then(r => Readable.fromWeb(r.body as ReadableStream<Uint8Array>));
      }))

      console.timeEnd(`fetching ${uploads.length} streams to zip`)

      for (let i = 0; i < streams.length; i++)
        zip.addReadStream(streams[i], `${i + 1}_${uploads[i].filename}`, { compress: false })

      console.log(`writing zip with ${uploads.length} files to ${zip_filepath}`)
      console.time(`done ${filename}`)

      zip.outputStream.pipe(fs.createWriteStream(zip_filepath))
        .on("close", () => {
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
              unlink(zip_filepath)
              resolve()
            })
            .on('error', (e) => {
              throw e
            })
        }).on('error', (e) => {
          console.log(e)
          throw e
        }).on('data', (data) => {
          console.log('.')
        })


      zip.end();

    } catch (e) {
      console.error(e)
      res.status(400).send(e.message)
      unlink(zip_filepath)
      reject(e)
    }
  })
})

const unlink = (filepath: string) => {
  try {
    fs.unlinkSync(filepath)
  } catch {
    console.log(`error deleting ${filepath}`)
  }
}