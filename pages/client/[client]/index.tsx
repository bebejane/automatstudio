import s from "./index.module.scss";
import { AllClientsDocument, AllProductsByClientDocument, ClientBySlugDocument } from "/graphql";
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api";
import withGlobalProps from "/lib/withGlobalProps";
import { DefaultDatoSEO } from "dato-nextjs-utils/components";
import { Image } from "react-datocms";
import { useState } from "react";
import metaFields from "/lib/meta-fields";
import React from "react";

export type Props = {
  client: ClientRecord
  products: ProductRecord[]
}

export default function Client({ client, products }: Props) {

  const [product, setProduct] = useState<ProductRecord | null>(null)

  return (
    <>
      <DefaultDatoSEO siteTitle={`Automatstudio - ${client.name}`} />
      <main className={s.container}>
        {client.name}
        <ul className={s.products}>
          {products.map((product) =>
            <li key={product.id} onClick={() => setProduct(product)}>
              <Image
                data={product.png.responsiveImage}
                className={s.image}
                pictureClassName={s.picture}
                intersectionMargin="0px 0px 200% 0px"
              />
            </li>
          )}
        </ul>
      </main>
      {product &&
        <ProductPopup product={product} onClose={() => setProduct(null)} />
      }
    </>
  )
}


const ProductPopup = ({ product, onClose }: { product: ProductRecord, onClose: () => void }) => {

  return (
    <div className={s.productPopup}>
      <figure>
        <Image
          data={product.png.responsiveImage}
          className={s.image}
          pictureClassName={s.picture}
          intersectionMargin="0px 0px 200% 0px"
        />
      </figure>
      <h3>{product.name}</h3>
      <p className={s.info}>
        {metaFields.map((field, idx) =>
          <React.Fragment key={idx}>
            {field.label}: {product[field.id]}
            <br />
          </React.Fragment>
        )}

      </p>
      <button className={s.close} onClick={onClose}>Close</button>
    </div>
  )
}

export async function getStaticPaths() {

  const { clients } = await apiQueryAll(AllClientsDocument);
  const paths = clients.map((client) => ({
    params: { client: client.slug },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
}

export const getStaticProps = withGlobalProps({ queries: [] }, async ({ props, context, revalidate }: any) => {

  const slug = context.params.client


  if (!slug)
    return { notFound: true, revalidate }

  const { client } = await apiQuery(ClientBySlugDocument, { variables: { slug } })

  if (!client)
    return { notFound: true, revalidate }

  const { products } = await apiQueryAll(AllProductsByClientDocument, { variables: { id: client.id } })

  return {
    props: {
      ...props,
      client,
      products
    },
    revalidate
  };
});
