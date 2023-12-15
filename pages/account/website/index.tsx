import s from './index.module.scss';
import withGlobalProps from '/lib/withGlobalProps';
import { apiQuery, apiQueryAll } from "dato-nextjs-utils/api"
import { ClientDocument } from "/graphql"
import React from 'react';
import Link from 'next/link';

export type Props = {
  client: ClientRecord
}

const infoFields = [{
  id: 'contact_email',
  label: 'Contact email',
  type: 'email'
}, {
  id: 'phone',
  label: 'Phone',
  type: 'text'
}, {
  id: 'address',
  label: 'Address',
  type: 'textarea'
}, {
  id: 'instagram',
  label: 'Instagram',
  type: 'text'
}, {
  id: 'facebook',
  label: 'Facebook',
  type: 'text'
}, {
  id: 'text',
  label: 'Text',
  type: 'textarea'
}]


export default function Website({ client }: Props) {


  return (
    <div className={s.container}>
      <form>
        {infoFields.map((field) => (
          <div key={field.id}>
            <label htmlFor={field.id}>{field.label}</label>
            <input
              id={field.id}
              type={field.type}
              defaultValue={client[field.id]}
            />
          </div>
        ))}
      </form>
    </div >
  )
}



export const getServerSideProps = withGlobalProps({ queries: [] }, async ({ props, context }: any) => {

  const clientId = props.session?.user.clientId ?? (context.query.secret === process.env.DATOCMS_PREVIEW_SECRET ? context.query.client_id : null)

  if (!clientId)
    return { redirect: { destination: '/login', permanent: false } }

  const { client } = await apiQuery(ClientDocument, { variables: { clientId } })

  return {
    props: {
      ...props,
      client
    }
  };
});
