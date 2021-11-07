import { getSession } from "next-auth/react"
import type { NextApiRequest, NextApiResponse } from "next"
import connectDB from "../../../middleware/mongodb"
import User from "../../../models/user"
import multer from "multer"
import uploadCoudinaryImage from "../../../lib/cloudinary"

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

const handler = async (req: any, res: NextApiResponse) => {
  await runMiddleware(req, res, multer().single("file"))

  const { method } = req
  const session = await getSession({ req })
  if (session !== null) {
    let user = await User.findOne({ email: session.user!.email })
    switch (method) {
      case "GET":
        res.json(user)
        break
      case "PATCH":
        user.name = req.body.name
        user.email = req.body.email
        user.phone = req.body.phone
        user.image = req.body.image

        if (req.file) {
          try {
            let cloudinaryImage = await uploadCoudinaryImage(req.file)
            console.log(cloudinaryImage)
            user.image = cloudinaryImage.secure_url
          } catch (error) {
            console.error(error)
            return res.status(500).end("Error Uploading Image")
          }
        }

        user = await user.save()
        res.json(user)
        break
      default:
        res.setHeader("Allow", ["GET", "PATCH"])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } else {
    res.status(403).end("No Current User")
  }
}

export default connectDB(handler)

export const config = {
  api: {
    bodyParser: false,
  },
}
