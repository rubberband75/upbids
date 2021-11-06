import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import User from "../../../models/user"
import Session from "../../../models/session"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
//   const session = await getSession({ req })

  let sessions = await Session.find().populate("userId")

  res.json(sessions)
}

export default connectDB(handler)
