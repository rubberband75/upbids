import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import logRequest from "../../../../middleware/logRequest"
import User from "../../../../models/user"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  const { method } = req
  switch (method) {
    case "POST":
      try {
        const { email, password } = req.body
        if (!email || !password) return res.json(false)

        const user = await User.findOne({ email })
        if (!user) return res.json(false)
        else return res.json({ user })
      } catch (error: any) {
        return res.status(500).json({ error: `${error}` || "Error Logging In" })
      }
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
