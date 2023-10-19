import s from './index.module.scss';
import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { AllClientsDocument } from "/graphql"

export type Props = {
  clients: ClientRecord[]
}


export default function Admin({ clients }: Props) {

  const totalProducts = clients.reduce((acc, client) => acc + client._allReferencingProductsMeta.count, 0)

  return (
    <div className={s.container}>
      <p>
        Total products: {totalProducts}
      </p>
      <ul>
        {clients.map((client) =>
          <li key={client.id}>
            <h3>{client.name}</h3>

            <p>
              {client.email}<br />
              Products: {client._allReferencingProductsMeta.count}
            </p>

          </li>
        )}
      </ul>
    </div >
  )
}

export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  if (process.env.NODE_ENV !== 'development') return { notFound: true }

  const { clients } = await apiQueryAll(AllClientsDocument)

  return {
    props: {
      ...props,
      clients
    }
  };
});
