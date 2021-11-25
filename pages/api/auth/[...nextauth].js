import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"
import logRequest from "../../../middleware/logRequest"
import runMiddleware from "../../../middleware/runMiddleware"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from "axios"

export default async function auth(req, res) {
  await runMiddleware(req, res, logRequest)

  const database = process.env.MONGODB_DATABASE
  return await NextAuth(req, res, {
    session: {
      strategy: "jwt",
    },
    adapter: MongoDBAdapter({
      db: (await clientPromise).db(database),
    }),
    providers: [
      // EmailProvider({
      //   server: process.env.EMAIL_SERVER,
      //   from: process.env.EMAIL_FROM,
      //   // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
      // }),

      CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: "Email",
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          email: {
            label: "Email",
            type: "email",
            name: "email",
            placeholder: "Email",
          },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req) {
          // You need to provide your own logic here that takes the credentials
          // submitted and returns either a object representing a user or value
          // that is false/null if the credentials are invalid.
          // e.g. return { id: 1, name: 'J Smith', email: 'jsmith@example.com' }
          // You can also use the `req` object to obtain additional parameters
          // (i.e., the request IP address)

          try {
            const response = await axios.post(
              "/api/auth/with-credentials/login",
              credentials
            )
            return response.data.user
          } catch (error) {
            console.error(error)
            return null
          }
        },
      }),

      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
      }),
    ],
    secret: process.env.SECRET,
  })
}
