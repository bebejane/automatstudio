import { buildClient } from "@datocms/cma-client-node"
import * as dotenv from 'dotenv'; dotenv.config({ path: './.env' });

const environment = 'main';

(async () => {

  const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN, environment })
  const uploads = []
  for await (const upload of client.uploads.listPagedIterator({ filter: { version: 'latest' } })) {
    uploads.push(upload)
  }
  const total_bytes = uploads.reduce((acc, upload) => acc + upload.size, 0)
  const uploads_to_update = uploads.filter(upload => upload.filename.split('_').length > 4 && upload.filename.split('_').slice(0, 1).join('_') === upload.filename.split('_').slice(2, 3).join('_'))

  for (let i = 0; i < uploads_to_update.length; i++) {
    const upload = uploads_to_update[i];
    const filename = upload.filename.split('_').slice(2).join('_') as string
    console.log(`updating ${upload.filename} to ${filename}`)
    //await client.uploads.update(upload.id, { basename: filename })

  }

  console.log(`found ${uploads.length} uploads. ${uploads_to_update.length} to update. total ${formatBytes(total_bytes)}`)

})()

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
