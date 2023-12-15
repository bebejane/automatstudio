import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextAuthOptions } from 'next-auth';
import { parseDatoCMSApiError } from 'dato-nextjs-utils/utils';
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import client from '/lib/client';

const useSecureCookies = !!process.env.RAILWAY_PUBLIC_DOMAIN

export type SessionExtended = {
  id: string
  clientId: string
  email: string
  name: string
  image: string
}

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
  /*
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.automatstudio.se' : 'localhost',
        secure: useSecureCookies,
      },
    },
  },
  */
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

          const session: SessionExtended = {
            id: user.id as string,
            clientId: user.client_id as string,
            email: user.email as string,
            name: user.name as string,
            image: null
          }

          return session
        } catch (err) {
          console.log(JSON.stringify(err, null, 2))
          return null
        }
      }
    })
  ]
}

const handler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default handler