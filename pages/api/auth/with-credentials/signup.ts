import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import logRequest from "../../../../middleware/logRequest"
import User from "../../../../models/user"
import bcrypt from "bcryptjs"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  const { method } = req
  switch (method) {
    case "POST":
      try {
        const { name, email, phone, password, confirmPassword } = req.body

        if (!name || !email || !phone || !password || !confirmPassword)
          return res.status(400).json({ error: `Missing Information` })

        const existingEmail = await User.findOne({ email })
        if (existingEmail)
          return res.status(400).json({ error: "Email Already Exists" })

        if (password !== confirmPassword)
          return res.status(400).json({ error: "Passwords do not match" })

        const hashedPassword = await bcrypt.hash(password, 12)

        let user = new User({
          name,
          email,
          phone,
          password: hashedPassword,
        })
        await user.save()

        return res.json({ user })
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Creating Account" })
      }
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
