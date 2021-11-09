import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import User from "../../../models/user"
import Session from "../../../models/session"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  let results: any[] = []

  let users: User[] = await User.find()
  for (let i = 0; i < users.length; i++) {
    let user = users[i]
    let session = await Session.findOne({ userId: user._id })
    results.push({ user, session })
  }

  res.json(results)
}

export default connectDB(handler)
