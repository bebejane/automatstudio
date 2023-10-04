import formidable from 'formidable-serverless';


export default async function handler(req, res) {
  const form = new formidable.IncomingForm({ path: './tmp' });
  form.encoding = 'utf-8';
  form.uploadDir = "./tmp";

  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    console.log(err)
    if (err) {
      return res.status(400).json({ message: err });
    }

    return res.json(files);
  });
}