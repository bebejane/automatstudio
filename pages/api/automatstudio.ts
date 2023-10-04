import multer from 'multer';
import fs from 'fs';
import { buildClient } from '@datocms/cma-client-node';
import { NextApiRequest, NextApiResponse } from 'next';

const datoClient = buildClient({ apiToken: process.env.DATOCMS_CMA_API_TOKEN, environment: 'dev' });
const uploadDestination = `${__dirname}/tmp`
const upload = multer({ dest: uploadDestination })

async function handler(req, res) {
  try {
    await runMiddleware(req, res, upload.single("file"))
    const data = parseFileName(req.file)
    const product = await upsertProduct(data)

    console.log('done', product.id)

    return res.send("ok")
  } catch (e) {
    console.log(e)
    if (req.file?.filename)
      fs.unlinkSync(`${uploadDestination}/${req.file.filename}`)

    res.status(400).send(e.message)
  }
}

type FileData = {
  clientId: string
  productId: string
  fileName: string
  filePath: string
}

const parseFileName = (data: any): FileData => {

  const file = data.originalname
  const filePath = `${uploadDestination}/${data.filename}`

  if (!file) throw new Error("File name is empty")
  if (file.split("_").length < 3) throw new Error("File name is not valid, must be in format: clientId_productId_fileName")

  const [clientId, productId] = file.split("_")
  const fileName = file.split("_").slice(2).join("_")

  if (!clientId) throw new Error("Client id is empty")
  if (!productId) throw new Error("Product id is empty")
  if (!fileName) throw new Error("Filename is is empty")

  return {
    clientId,
    productId,
    fileName,
    filePath
  }
}

const upsertProduct = async (data: FileData) => {

  const client = (await datoClient.items.list({ filter: { type: "client", fields: { clientId: { eq: data.clientId } } } }))[0]

  if (!client)
    throw new Error(`Client with id ${data.clientId} not found`)

  const itemTypes = await datoClient.itemTypes.list()
  let product = (await datoClient.items.list({ filter: { type: "product", fields: { product_id: { eq: data.productId } } } }))[0]


  console.log('uploading file...')

  const upload = await datoClient.uploads.createFromLocalFile({
    localPath: data.filePath,
    filename: data.fileName,
    skipCreationIfAlreadyExists: true
  })

  console.log('updating product...')

  const productData = {
    client: client.id,
    product_id: data.productId,
    png: { upload_id: upload.id }
  }

  if (product)
    product = await datoClient.items.update(product.id, productData)
  else
    product = await datoClient.items.create({
      item_type: { type: 'item_type', id: itemTypes.find(i => i.api_key === "product").id },
      ...productData
    })

  return product
}


function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error)
        return reject(result)
      return resolve(result)
    })
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler