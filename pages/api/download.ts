import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthentication from '/lib/withAuthentication';
import archiver from 'archiver';
import { Session } from 'next-auth';
import client from '/lib/client';
import Downloader from 'nodejs-file-downloader'
import asyncPromiseBatch from 'async-promise-batch';

const temp_dir = `/tmp`
const download_concurrency = 5

export const config = {
  api: {
    responseLimit: false,
  },
}

const download = async (url: string, directory: string, fileName: string) => {

  const downloader = new Downloader({
    url,
    directory,
    fileName,
    cloneFiles: false,
    timeout: 20000,
    maxAttempts: 3,
    onError: (error) => {
      throw error
    }
  });

  const d = await downloader.download()
  console.log('download', fileName, '100%')
  return d
}

export default withAuthentication(async (req: NextApiRequest, res: NextApiResponse, session: Session) => {

  console.time('archive download')

  const archive = archiver('zip', {
    zlib: { level: 0 },
    statConcurrency: 32
  });

  const zip_temp_dir = `${temp_dir}/${Date.now()}`
  const zip_filepath = `${zip_temp_dir}/products_${Date.now()}.zip`

  new Promise(async (resolve, reject) => {

    try {

      const upload_ids = (req.body.upload_ids as string[])//.slice(0, 50)
      const filename = (req.body.filename as string) || 'archive.zip'

      if (!upload_ids)
        throw new Error("upload_ids is empty")

      console.log(`request dato uploads: ${upload_ids.length}`)
      console.time(`done`)

      const uploads = []

      for await (const record of client.uploads.listPagedIterator({ filter: { ids: upload_ids.join(',') }, version: 'latest' }))
        uploads.push(record)

      console.timeEnd(`done`)

      if (!uploads.length)
        throw new Error("no uploads found")

      console.log('mkdir', zip_temp_dir)
      fs.mkdirSync(zip_temp_dir)

      const files = uploads.map(({ url, filename }, i) => ({
        file_path: `${zip_temp_dir}/${i + 1}_${filename}`,
        filename: `${i + 1}_${filename}`,
        url
      }))

      console.log(`downloading ${uploads.length} images...`)
      console.time(`done`)
      await asyncPromiseBatch(files.map(({ url, filename }, i) => () => download(url, zip_temp_dir, filename)), download_concurrency)
      console.timeEnd(`done`)

      for (let i = 0; i < files.length; i++)
        archive.append(fs.createReadStream(files[i].file_path), { name: files[i].filename })

      archive.on('warning', (err) => {
        throw err
      });

      console.log(`write zip ${uploads.length} files: ${zip_filepath}`)
      console.time(`write zip`)

      archive.pipe(fs.createWriteStream(zip_filepath))
        .on("finish", () => {

          const contentLength = archive.pointer()
          console.log(`done compressing ${filename} (${(contentLength / 1000000).toFixed(2)}mb)`)
          console.timeEnd(`write zip`)

          res.writeHead(200, {
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/zip',
            'Content-Length': contentLength,
          })

          fs.createReadStream(zip_filepath).pipe(res)
            .on('close', () => {
              cleanup(zip_temp_dir)
              resolve(zip_filepath)
            })
            .on('error', (e) => {
              throw e
            })
        }).on('error', (e) => {
          throw e
        })

      archive.finalize();

    } catch (e) {
      console.error(e)
      res.status(400).send(e.message)
      cleanup(zip_temp_dir)
      reject(e)
    }
  })
})

const cleanup = (dir: string) => {

  console.timeEnd('archive download')

  try {
    console.log('rm', dir)
    fs.rmSync(dir, { recursive: true, force: true })

  } catch {
    console.log(`error deleting dir ${dir}`)
  }
}