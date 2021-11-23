import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import Account from "../../../models/account"
import runMiddleware from "../../../middleware/runMiddleware"
import logRequest from "../../../middleware/logRequest"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, logRequest)
  //   const session = await getSession({ req })

  let accounts = await Account.find().populate("userId")

  res.json(accounts)
}

export default connectDB(handler)
