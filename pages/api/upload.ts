import multer from 'multer';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { withBasicAuth } from 'dato-nextjs-utils/hoc';
import { parseDatoCMSApiError } from 'dato-nextjs-utils/utils'
import { parseFilenameData } from '/lib/utils';
import client from '/lib/client';

const upload_destination = `/tmp`
const upload = multer({ dest: upload_destination })

export const config = {
  api: {
    bodyParser: false,
  },
};

type NextApiRequestWithFile = NextApiRequest & { file: any }

type FileData = {
  client_id: string
  product_id: string
  file_name: string
  file_path: string
  date: Date
  tags?: string[]
}

export default withBasicAuth(async (req: NextApiRequestWithFile, res: NextApiResponse) => {
  try {
    //@ts-ignore
    await run_middleware(req, res, upload.single("file"))
    const data = parse_form_data(req)
    console.time(`done ${data.file_name}`)
    await upsertProduct(data)
    console.timeEnd(`done ${data.file_name}`)
    return res.send("ok")
  } catch (e) {
    console.log(e)
    res.status(400).send(e.message)
  } finally {
    if (req.file?.filename)
      fs.unlinkSync(`${upload_destination}/${req.file.filename}`)
  }
})

const parse_form_data = (req: NextApiRequestWithFile): FileData => {

  const { client_id, product_id, } = req.body
  const { originalname: file_name, path: file_path } = req.file

  if (!client_id) throw new Error("Client id is empty")
  if (!product_id) throw new Error("Product id is empty")
  if (!file_name) throw new Error("Filename is is empty")
  if (!file_path) throw new Error("Filepath is is empty")

  const { date } = parseFilenameData(file_name)

  return {
    client_id,
    product_id,
    file_name,
    file_path,
    date
  }
}

const upsertProduct = async (data: FileData) => {

  try {

    console.log('upserting product', data.product_id, data.file_name)
    const clientRecord = (await client.items.list({ filter: { type: "client", fields: { client_id: { eq: data.client_id } } } }))[0]

    if (!clientRecord)
      throw new Error(`Client with id "${data.client_id}" not found`)

    const itemTypes = await client.itemTypes.list()
    let product = (await client.items.list({ filter: { type: "product", fields: { product_id: { eq: data.product_id } } } }))[0]

    const type = data.file_name.toLowerCase().includes('backside') ? 'back' : data.file_name.toLowerCase().endsWith('png') ? 'png' : data.file_name.toLowerCase().endsWith('tif') || data.file_name.toLowerCase().endsWith('tiff') ? 'tiff' : null

    if (!type)
      throw new Error(`File type not supported: ${data.file_name}`)

    console.log('uploading file', data.product_id, data.file_name)
    console.time(`uploading done ${data.file_name}`)

    const upload = await client.uploads.createFromLocalFile({
      localPath: data.file_path,
      filename: data.file_name,
      skipCreationIfAlreadyExists: true
    })

    console.timeEnd(`uploading done ${data.file_name}`)

    const product_data = {
      client: clientRecord.id,
      product_id: data.product_id,
      date: data.date,
      png: type === 'png' ? { upload_id: upload.id } : undefined,
      tiff: type === 'tiff' ? { upload_id: upload.id } : undefined,
      back: type === 'back' ? { upload_id: upload.id } : undefined,
    }

    if (product) {
      console.log('updating product', data.product_id)
      product = await client.items.update(product.id, product_data)
    } else {
      console.log('creating product', data.product_id)
      product = await client.items.create({
        item_type: { type: 'item_type', id: itemTypes.find(i => i.api_key === "product").id },
        ...product_data
      })
    }

    return product

  } catch (e) {
    throw new Error(parseDatoCMSApiError(e))
  }
}

function run_middleware(req: NextApiRequest, res: NextApiResponse, fn: (req: NextApiRequest, res: NextApiResponse, cb: (result: any) => any) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error)
        return reject(result)
      return resolve(result)
    })
  })
}
