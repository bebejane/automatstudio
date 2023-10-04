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
          <p>
            Name:<br />
            Producer:<br />
            Year:<br />
            Save
          </p>
        </div>
      </div>
      <div className={s.gallery}>
        <ul className={s.images}>
          {new Array(3).fill(0).map((_, i) => (
            <Image key={i} data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
          ))}
        </ul>
        <div>Download PNG (1080x1920) (instagram story)</div>
      </div>
    </div>
  )
}

export async function getStaticPaths(context) {
  const { products } = await apiQueryAll(AllProductsDocument, {})
  const paths = products.map(({ id }) => ({ params: { product: id } }))
  return {
    paths,
    fallback: 'blocking'
  }
}


export const getStaticProps: GetStaticProps = withGlobalProps({ queries: [] }, async ({ props, revalidate, context }: any) => {

  const id = context.params.product
  const { product } = await apiQuery(ProductDocument, { variables: { id } })
  return {
    props: {
      ...props,
      product
    },
    revalidate
  };
});
