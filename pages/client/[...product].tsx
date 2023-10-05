import s from './[...product].module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { AllProductsDocument, ProductDocument } from "/graphql"
import { GetStaticProps } from "next"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { buildRoute, recordToRoute } from '/lib/routes';
import { useEffect } from 'react';

export type Props = {
  product: ProductRecord
}

const sizes = [
  { width: 1080, height: 1920, label: 'Instagram Story', prop: 'instagramStory' },
  { width: 1080, height: 1080, label: 'Instagram Square', prop: 'instagramSquare' },
]

const colors = ['#cccccc', '#ffffff', '#000000']

export default function Product({ product }: Props) {


  useEffect(() => {

    const testRoute = async () => {
      const route = await buildRoute('product', product.productId)
      console.log('route', route)
      //const record = await recordToRoute(product)
      //console.log('record', record)
    }
    testRoute()

  }, [product])

  return (
    <div className={s.container}>
      <div className={s.intro}>
        <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
        <div className={s.details}>
          {format(new Date(product._createdAt), 'yyyy MM dd')}<br />
          <br />

          <form>
            <label htmlFor="name">Tag:</label>
            <input type="text" id="name" name="name" /><br />
          </form>

          <p>
            <br />
            <button className="full">Download images</button> <span>(inc png, high-res tif and clipping path)</span>
          </p>

        </div>
      </div>
      {sizes.map(({ width, height, label, prop }, idx) => (
        <div key={idx} className={s.gallery}>
          <h2>Download {label} ({width}x{height})</h2>
          <ul className={s.images}>
            {colors.map((color, i) => (
              <a key={i} href={`${product[prop].responsiveImage.src}&bg=${color.replace('#', '')}`} download>
                <li style={{ backgroundColor: color }}>
                  <Image
                    data={product[prop].responsiveImage}
                    className={s.image}
                    pictureClassName={s.picture}
                  />
                </li>
              </a>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export async function getStaticPaths() {
  const { products } = await apiQueryAll(AllProductsDocument, {})
  const paths = products.map(({ client, productId }) => ({ params: { product: [client.clientId, productId] } }))

  return {
    paths,
    fallback: 'blocking'
  }
}


export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const productId = context.params.product[2]

  const { product } = await apiQuery(ProductDocument, { variables: { productId } })
  return {
    props: {
      ...props,
      product
    },
    revalidate
  };
});
