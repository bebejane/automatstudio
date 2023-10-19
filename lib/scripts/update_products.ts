import { buildClient } from "@datocms/cma-client-node"
import * as dotenv from 'dotenv'; dotenv.config({ path: './.env' });
import { parseFilenameData } from "../utils";

const environment = 'dev';//'main';

(async () => {

  const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN, environment })
  const uploads = []
  for await (const upload of client.uploads.listPagedIterator({ filter: { version: 'latest' } })) {
    uploads.push(upload)
  }
  const products = []
  for await (const product of client.items.listPagedIterator({ filter: { type: 'product', version: 'latest' } })) {
    products.push(product)
  }
  const products_to_update = products.filter(product => product.png)
  let invalid = 0;

  for (let i = 0; i < products_to_update.length; i++) {
    const product = products_to_update[i];
    const upload = uploads.find(upload => upload.id === product.png.upload_id)

    try {
      const { date, filename } = parseFilenameData(upload.filename)
      console.log(`${i + 1}/${products_to_update.length}`, date, filename)
      await client.items.update(product.id, { datetime: date })
    } catch (e) {
      invalid++
      console.log('no valid upload for', upload.filename)
    }

  }

  console.log(`\nfound ${products.length} products. ${products_to_update.length} to update. invalid uploads: ${invalid}`)

})()
