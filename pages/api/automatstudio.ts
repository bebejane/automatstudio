import multer from 'multer';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

const uploadDestination = `${__dirname}/tmp`
const upload = multer({ dest: uploadDestination })

export const config = {
  api: {
    bodyParser: false,
  },
};

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn): Promise<any> {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error)
        return reject(result)
      return resolve(result)
    })
  })
}

async function handler(req, res) {
  try {
    await runMiddleware(req, res, upload.single("file"))
    const data = parseFileName(req.file.originalname)
    console.log(data)
    console.log(req.file)
    console.log(`${uploadDestination}/${req.file.filename}`)

    return res.send("ok")

    /* handle success */
  } catch (e) {
    if (req.file?.filename)
      fs.unlinkSync(`${uploadDestination}/${req.file.filename}`)

    res.status(400).send(e.message)
  }
}

type FileData = {
  clientId: number
  batchId: number
  productId: number
  fileName: string
}

const parseFileName = (file: string): FileData => {
  if (!file) throw new Error("File name is empty")
  if (file.split("_").length < 4) throw new Error("File name is not valid, must be in format: clientId_batchId_productId_fileName")

  const [clientId, batchId, productId] = file.split("_")
  const fileName = file.split("_").slice(3).join("_")

  if (isNaN(Number(clientId))) throw new Error("Client id is not valid")
  if (isNaN(Number(batchId))) throw new Error("Batch id is not valid")
  if (isNaN(Number(productId))) throw new Error("Product id is not valid")
  if (!fileName) throw new Error("Filename is empty")

  return {
    clientId: parseInt(clientId),
    batchId: parseInt(batchId),
    productId: parseInt(productId),
    fileName
  }
}

const upsertProduct = async (data: FileData) => {


}


export default handler