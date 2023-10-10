import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextAuthOptions, User } from 'next-auth';
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { buildClient } from '@datocms/cma-client-browser';

const client = buildClient({ apiToken: process.env.GRAPHQL_API_TOKEN, environment: process.env.DATOCMS_ENVIRONMENT })

//export const config = { runtime: 'experimental-edge' }

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 365 * (24 * 60 * 60), // 365 days
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    //error: '/client/type=error', // Error code passed in query string as ?error=    
    //verifyRequest: '/auth/verify-request', // (used for check email message)    
    //newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)  }
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true
    },
    async jwt({ token, user }) {
      if (token && user) {
        //@ts-ignore
        token.id = user?.id
        //@ts-ignore
        token.clientId = user?.clientId
      }

      return token
    },
    async session({ session, token }) {
      //@ts-ignore
      session.user.id = token?.id;
      //@ts-ignore
      session.user.clientId = token?.clientId;
      return session;
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {

          const { username: email, password } = credentials
          //const isDev = false; ////process.env.DATOCMS_ENVIRONMENT === 'dev'

          const user = (await client.items.list({
            filter: {
              type: 'client',
              fields: {
                email: { eq: email },
                password: { eq: password }
              }
            }
          }))[0]

          if (!user) return null

          const session = {
            id: user.id as string,
            clientId: user.client_id as string,
            email: user.email as string,
            name: user.name as string,
            image: null
          }

          return session
        } catch (err) {
          console.error(err)
          return null
        }
      }
    })
  ]
}

const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default handler