import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import GoogleProvider from "next-auth/providers/google"
import FacebookProvider from "next-auth/providers/facebook"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import clientPromise from "../../../lib/mongodb"
import logRequest from "../../../middleware/logRequest"
import runMiddleware from "../../../middleware/runMiddleware"

export default async function auth(req, res) {
  await runMiddleware(req, res, logRequest)

  const database = process.env.MONGODB_DATABASE

  return await NextAuth(req, res, {
    adapter: MongoDBAdapter({
      db: (await clientPromise).db(database)
    }),
    // database: process.env.MONGODB_URI,
    providers: [
      // EmailProvider({
      //   server: process.env.EMAIL_SERVER,
      //   from: process.env.EMAIL_FROM,
      //   // maxAge: 24 * 60 * 60, // How long email links are valid for (default 24h)
      //   sendVerificationRequest: (requestData) => { console.log("sent verification request", { ...requestData }) }
      // }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
      }),
      FacebookProvider({
        clientId: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
      })
    ],
    secret: process.env.SECRET,
  })
}
