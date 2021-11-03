import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import User from "../../../models/user"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  let users = await User.find()

  res.json({ users })
}

export default connectDB(handler)
