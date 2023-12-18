import puppeteer, { Browser } from 'puppeteer'
import { NextApiRequest, NextApiResponse } from 'next';
import withAuthentication from '/lib/withAuthentication';

export default withAuthentication(async (req: NextApiRequest, res: NextApiResponse, session) => {

  let browser: Browser = null;

  try {

    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/account/pricelist/pdf`

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-first-run",
        "--no-zygote",
      ],
      pipe: false,
    });

    const page = await browser.newPage();
    const cookies = []
    Object.keys(req.cookies).forEach((name) => cookies.push({
      name,
      value: req.cookies[name],
      domain: req.headers.host.split('.')[0],
    }))
    console.log(cookies)
    await page.setCookie(...cookies);

    const response = await page.goto(url, {
      timeout: 60 * 1000,
      waitUntil: "networkidle0"
    });

    if (response.status() !== 200)
      throw new Error(`Internal server error. HTTP status: ${response.status()}`);

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      height: "297mm",
      width: "210mm",
      timeout: 60 * 1000 * 2,
      margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
    });

    await page.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", "inline; filename=pricelist.pdf");
    res.status(200).send(buffer);
    res.end()

  } catch (e) {
    console.error(e);
    res.status(500).end();

  } finally {
    browser.close();
  }
})
