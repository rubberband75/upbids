import runMiddleware from "../../../middleware/runMiddleware"
import User from "../../../models/user"
import logRequest from "../../../middleware/logRequest"
import connectToDB from "../../../middleware/connectToDB"
import getCurrentUser from "../../../middleware/getCurrentUser"
import { ApiRequest, ApiResponse } from "../../../types/api"
import bcrypt from "bcryptjs"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  const { method, user } = req

  if (user && typeof user === "object") {
    switch (method) {
      case "PATCH":
        try {
          const { currentPassword, newPassword, confirmPassword } = req.body

          if (user.password) {
            const passwordValid = await bcrypt.compare(
              currentPassword,
              user.password
            )
            if (!passwordValid)
              return res
                .status(400)
                .json({ error: "Current Password Incorrect" })
          }

          if (!newPassword)
            return res.status(400).json({ error: "No password provided" })

          if (newPassword !== confirmPassword)
            return res.status(400).json({ error: "Passwords do not match" })

          const hashedPassword = await bcrypt.hash(newPassword, 12)

          await user.update({ password: hashedPassword })
          return res.json({ message: "Password Updated" })
        } catch (e) {
          return res.status(500).json({ error: "Error Deleting Account" })
        }
      default:
        res.setHeader("Allow", ["PATCH"])
        res.status(405).json({ error: `Method ${method} Not Allowed` })
    }
  } else {
    res.status(403).json({ error: "No Current User" })
  }
}

export default handler
