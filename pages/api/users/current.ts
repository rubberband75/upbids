import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import User from "../../../models/user"
import Session from "../../../models/session"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req })

  // let userJson:any[] = []
// 
  // let users = await User.find()

  res.json(session)
}

export default connectDB(handler)
