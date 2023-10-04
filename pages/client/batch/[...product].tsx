import s from './[product].module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { AllProductsDocument, ProductDocument } from "/graphql"
import { GetStaticProps } from "next"
import { Image } from 'react-datocms'
import { format } from 'date-fns'

export type Props = {
  product: ProductRecord
}

export default function Product({ product }: Props) {

  return (
    <div className={s.container}>
      <div className={s.intro}>
        <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
        <div className={s.details}>
          {format(new Date(product._createdAt), 'yyyy mm dd')}<br />
          <br />

          <form>
            <label htmlFor="name">Tag:</label>
            <input type="text" id="name" name="name" /><br />
          </form>

          <p>
            <br />
            <button className="full">Download images</button><br />
            <span>(inc png, high-res tif and clipping path)</span>
          </p>


        </div>
      </div>
      <div className={s.gallery}>
        <h2>Download Instagram Story (1080x1920)</h2>

        <ul className={s.images}>
          {new Array(3).fill(0).map((_, i) => (
            <li key={i}>
              <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
            </li>
          ))}
        </ul>
      </div>
      <div className={s.gallery}>
        <h2>Download Instagram Square (700x700) </h2>

        <ul className={s.images}>
          {new Array(3).fill(0).map((_, i) => (
            <li key={i}>
              <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const { products } = await apiQueryAll(AllProductsDocument, {})
  const paths = products.map(({ batch, productId }) => ({ params: { product: [batch.id, 'product', productId] } }))

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
