import { apiQuery, SEOQuery } from "dato-nextjs-utils/api";
import { GetStaticProps, GetServerSideProps, GetStaticPropsContext, GetServerSidePropsContext } from 'next'
import { GlobalDocument, } from "/graphql";
import type { TypedDocumentNode } from "@apollo/client/core/types.js";
import { getServerSession } from "next-auth";
import { authOptions } from '/pages/api/auth/[...nextauth]'

export default function withGlobalProps(opt: any, callback?: Function): GetStaticProps | GetServerSideProps {

  const revalidate: number = parseInt(process.env.REVALIDATE_TIME)
  const queries: TypedDocumentNode[] = [GlobalDocument]

  if (opt.query)
    queries.push(opt.query)
  if (opt.queries)
    queries.push.apply(queries, opt.queries)
  if (opt.seo)
    queries.push(SEOQuery(opt.seo))

  return async (context: any) => {

    const props = await apiQuery(queries, { preview: context.preview });
    if (context.req)
      props.session = await getServerSession(context.req, context.res, authOptions)

    if (callback)
      return await callback({ context, props: { ...props }, revalidate });
    else
      return { props: { ...props }, revalidate };
  }
}