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
      {product.id}
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
