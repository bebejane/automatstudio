import s from './[product].module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, } from "dato-nextjs-utils/api"
import { ProductDocument } from "/graphql"
import { Image } from 'react-datocms'
import { format } from 'date-fns'
import { buildRoute } from '/lib/routes';
import { useEffect } from 'react';

export type Props = {
  product: ProductRecord
}

const sizes = [
  { width: 1080, height: 1920, label: 'Instagram Story', prop: 'istory' },
  { width: 1080, height: 1080, label: 'Instagram Square', prop: 'isquare' },
]

const colors = ['black', 'white', 'gray']

export default function Product({ product }: Props) {

  return (
    <div className={s.container}>
      <div className={s.intro}>
        <Image data={product.png.responsiveImage} className={s.image} pictureClassName={s.picture} />
        <div className={s.details}>
          {format(new Date(product._createdAt), 'yyyy MM dd')}<br />
          <p>
            <br />
            <button className="full">Download images</button> <span>(inc png, high-res tif and clipping path)</span>
          </p>

          <form>
            <label htmlFor="name">Tag:</label>
            <input type="text" id="name" name="name" /><br />
          </form>

        </div>
      </div>
      {sizes.map(({ width, height, label, prop }, idx) => (
        <div key={idx} className={s.gallery}>
          <ul className={s.images}>
            {colors.map((color, i) => (
              <a key={i} href={`${product[`${prop}${color}`].responsiveImage.src}`} download>
                <li>
                  <Image
                    data={product[`${prop}${color}`].responsiveImage}
                    className={s.image}
                    pictureClassName={s.picture}
                    placeholderClassName={s.placeholder}
                  />
                </li>
              </a>
            ))}
          </ul>
          <h2>Download {label} ({width}x{height})</h2>

        </div>
      ))}
    </div>
  )
}

export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  if (!props.session && (!context.query.secret || context.query.secret !== process.env.DATOCMS_PREVIEW_SECRET))
    return { redirect: { destination: '/login', permanent: false } }

  const productId = context.params.product
  const { product } = await apiQuery(ProductDocument, { variables: { productId } })

  return {
    props: {
      ...props,
      product
    }
  };
});
