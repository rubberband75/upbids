import type { NextApiRequest, NextApiResponse } from "next"
import logRequest from "../../../middleware/logRequest"
import connectDB from "../../../middleware/mongodb"
import runMiddleware from "../../../middleware/runMiddleware"
import User from "../../../models/user"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await runMiddleware(req, res, logRequest)
  const {
    query: { id, name },
    method,
  } = req

  console.log({ id, name, method })

  switch (method) {
    case "GET":
      try {
        let user = await User.findOne({ _id: id })
        if (!user) return res.status(404).json({ error: "User not found" })
        return res.json(user)
      } catch (error: any) {
        console.error(error)
        return res
          .status(500)
          .json({ error: error?.message || "Unknown Error" })
      }
      break
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default connectDB(handler)
