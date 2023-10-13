import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthentication from '/lib/withAuthentication';
import archiver from 'archiver';
import { Session } from 'next-auth';
import client from '/lib/client';
import Downloader from 'nodejs-file-downloader'
import asyncPromiseBatch from 'async-promise-batch';
import { cleanup, temp_dir } from './';

export default withAuthentication(async (req: NextApiRequest, res: NextApiResponse, session: Session) => {

  const zip_temp_dir = `${temp_dir}/${Date.now()}`

  new Promise(async (resolve, reject) => {

    try {

      const upload_ids = (req.body.upload_ids as string[])//?.slice(0, 1)

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
      console.time(`downloading`)
      const concurrency = process.env.DOWNLOAD_CONCURRENCY ? parseInt(process.env.DOWNLOAD_CONCURRENCY) : 5
      await asyncPromiseBatch(files.map(({ url, filename }, i) => () => download(url, zip_temp_dir, filename)), concurrency)
      console.timeEnd(`downloading`)

      const file_path = await zip(files, `${zip_temp_dir}/products_${Date.now()}.zip`)
      return res.status(200).json({
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/download?file_path=${file_path}`
      })

    } catch (e) {
      console.error(e)
      res.status(400).send(e.message)
      cleanup(zip_temp_dir)
      reject(e)
    }
  })
})

const zip = async (files: { file_path: string, filename: string }[], zip_filepath: string) => {

  const archive = archiver('zip', {
    zlib: { level: 0 },
    statConcurrency: 32
  });

  return new Promise((resolve, reject) => {

    for (let i = 0; i < files.length; i++)
      archive.append(fs.createReadStream(files[i].file_path), { name: files[i].filename })

    archive.on('warning', (err) => {
      throw err
    });

    console.log(`write zip ${files.length} files: ${zip_filepath}`)
    console.time(`write zip`)

    archive.pipe(fs.createWriteStream(zip_filepath))
      .on("finish", () => {
        console.timeEnd(`write zip`)
        resolve(zip_filepath)
      }).on('error', (e) => {
        reject(e)
      })
    archive.finalize();

  })

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

  return downloader.download()
}

export const config = {
  api: {
    responseLimit: false,
  },
}