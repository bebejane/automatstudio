import { buildClient } from "@datocms/cma-client-node"
import { parseDatoCMSApiError } from 'dato-nextjs-utils/utils'
import * as dotenv from 'dotenv'; dotenv.config({ path: './.env' });

const environment = 'main';

(async () => {

  const client = buildClient({ apiToken: process.env.DATOCMS_API_TOKEN, environment })

  try {
    const products = await client.items.list({
      filter: {
        type: 'product', fields: {
          produ_id: { eq: '123' }
        }, version: 'latest'
      }
    })
  } catch (e) {
    console.log(parseDatoCMSApiError(e))
  }

})()
