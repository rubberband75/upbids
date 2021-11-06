import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import Account from "../../../models/account"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const session = await getSession({ req })

  let accounts = await Account.find().populate("userId")

  res.json(accounts)
}

export default connectDB(handler)
