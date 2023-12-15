import s from "./index.module.scss";
import cn from "classnames";
import { AllClientsDocument, AllProductsByClientDocument, ClientBySlugDocument } from "/graphql";
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api";
import withGlobalProps from "/lib/withGlobalProps";
import { DatoMarkdown, DefaultDatoSEO } from "dato-nextjs-utils/components";
import { Image } from "react-datocms";
import { useEffect, useState } from "react";
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
        <h1>{client.name}</h1>
        <ul className={s.products}>
          {products.map((p) =>
            <li
              key={p.id}
              className={cn(product?.id === p.id && s.selected)}
              onClick={() => setProduct(p)}
            >
              <Image
                data={p.png.responsiveImage}
                className={s.image}
                pictureClassName={s.picture}
                intersectionMargin="0px 0px 200% 0px"
              />
            </li>
          )}
        </ul>
        <ProductDetails product={product} onClose={() => setProduct(null)} />

      </main>
      <div className={s.info}>
        <p>
          E-mail: {client.contactEmail}<br />
          Phone: {client.phone}
        </p>
        <DatoMarkdown>{client.address}</DatoMarkdown>
        <DatoMarkdown>{client.text}</DatoMarkdown>
      </div>

    </>
  )
}


const ProductDetails = ({ product, onClose, }: { product: ProductRecord, onClose: () => void }) => {


  const [showDetails, setShowDetails] = useState(false)

  const handleClose = () => {
    setShowDetails(false)
    setTimeout(() => onClose(), 200)

  }
  useEffect(() => {
    setShowDetails(product !== null)
  }, [product])

  return (
    <>
      <div className={cn(s.productDetailsBlock, showDetails && s.show)} />
      <div className={cn(s.productDetails, showDetails && s.show)}>
        {product &&

          <div className={s.wrap}>
            <figure>
              <Image
                data={product.png.responsiveImage}
                className={s.image}
                pictureClassName={s.picture}
                intersectionMargin="0px 0px 200% 0px"
              />
            </figure>
            <p className={s.info}>
              {metaFields.map((field, idx) =>
                <React.Fragment key={idx}>
                  {field.label}: {product[field.id]}
                  <br />
                </React.Fragment>
              )}
            </p>
            <button className={s.close} onClick={handleClose}>Stäng</button>
          </div>
        }
      </div>
    </>
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
