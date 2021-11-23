import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import User from "../../../models/user"
import Session from "../../../models/session"
import runMiddleware from "../../../middleware/runMiddleware"
import logRequest from "../../../middleware/logRequest"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, logRequest)
//   const session = await getSession({ req })

  let sessions = await Session.find().populate("userId")

  res.json(sessions)
}

export default connectDB(handler)
