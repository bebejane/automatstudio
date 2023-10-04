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
          <p>
            Download single image (includes high res TIFF and clipping path)
          </p>

          <form>
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" /><br />
            <label htmlFor="producer">Producer:</label>
            <input type="text" id="producer" name="producer" /><br />
            <label htmlFor="year">Year:</label>
            <input type="text" id="year" name="year" /><br />
            <button>Save</button>
          </form>

        </div>
      </div>
      <div className={s.gallery}>
        <ul className={s.images}>
          {new Array(3).fill(0).map((_, i) => (
            <li key={i}>
              <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
            </li>
          ))}
        </ul>
        <div>Download PNG (1080x1920) (instagram story)</div>
      </div>
      <div className={s.gallery}>
        <ul className={s.images}>
          {new Array(3).fill(0).map((_, i) => (
            <li key={i}>
              <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
            </li>
          ))}
        </ul>
        <div>Download PNG (700x700) (square instagram story)</div>
      </div>
    </div>
  )
}

export async function getStaticPaths() {
  const { products } = await apiQueryAll(AllProductsDocument, {})
  const paths = products.map(({ batch, productId }) => ({ params: { product: [batch.id, 'product', productId] } }))
  console.log(paths)
  return {
    paths,
    fallback: 'blocking'
  }
}


export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const id = context.params.product[1]
  const { product } = await apiQuery(ProductDocument, { variables: { id } })
  return {
    props: {
      ...props,
      product
    },
    revalidate
  };
});
