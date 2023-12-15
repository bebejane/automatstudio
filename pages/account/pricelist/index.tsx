import s from './index.module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument, AllProductsByClientForPricelistDocument } from "/graphql"
import { Image } from 'react-datocms';
import React from 'react';
import Link from 'next/link';

export type Props = {
  products: ProductRecord[]
}

export type Pricelist = {
  country: string,
  region: {
    id: string,
    name: string,
    products: ProductRecord[]
  }[]
}[]

export default function Pricelist({ products }: Props) {

  const pricelist = generatePriceList(products)
  const maxColumns = 10

  return (
    <div className={s.container}>
      <table>
        <tbody>
          {pricelist.map(({ country, region }, idx) =>
            <React.Fragment key={idx}>
              <tr key={country} className={s.country}>
                <td colSpan={maxColumns}>{country}</td>
              </tr>

              {region.map(({ id, name, products }) => {
                return (
                  <>
                    <tr className={s.region}>
                      <td colSpan={maxColumns}>{name}</td>
                    </tr>
                    {products.map(({ id, productId, year, name, eco, category, grape, price, png }) =>
                      <tr key={id}>
                        <td className={s.image}><Image data={png.responsiveImage} className={s.image} pictureClassName={s.picture} /></td>
                        <td>{year}</td>
                        <td>{name}</td>
                        <td>{eco ? 'ECO' : ''}</td>
                        <td>{category}</td>
                        <td>{grape}</td>
                        <td>{price}kr</td>
                        <td className={s.edit}>
                          <Link href={`/account/products/${productId}`}>Edit</Link>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </React.Fragment>
          )}
        </tbody>
      </table>
    </div >
  )
}


const generatePriceList = (products: ProductRecord[]): Pricelist => {

  const list: Pricelist = []

  products.forEach(product => {
    const { country, region } = product

    if (country && region) {
      const countryIndex = list.findIndex(item => item.country === country)
      if (countryIndex < 0)
        list.push({ country, region: [{ id: region, name: region, products: products.filter(item => item.region === region && item.country === country) }] })
      else {
        const regionIndex = list[countryIndex].region.findIndex(item => item.id === region)
        const regions = list[countryIndex].region
        if (regionIndex < 0)
          regions.push({ id: region, name: region, products: products.filter(item => item.region === region && item.country === country) })
        else
          regions[regionIndex] = { id: region, name: region, products: products.filter(item => item.region === region && item.country === country) }

        list[countryIndex] = {
          ...list[countryIndex],
          region: regions
        }
      }

    }
  })

  return list

}

export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  const clientId = props.session?.user.clientId ?? (context.query.secret === process.env.DATOCMS_PREVIEW_SECRET ? context.query.client_id : null)

  if (!clientId)
    return { redirect: { destination: '/login', permanent: false } }

  const { client } = await apiQuery(ClientDocument, { variables: { clientId } })
  const { products } = await apiQueryAll(AllProductsByClientForPricelistDocument, { variables: { id: client.id } })

  return {
    props: {
      ...props,
      client,
      products
    }
  };
});
