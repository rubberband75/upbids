import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import runMiddleware from "../../../middleware/runMiddleware"
import connectDB from "../../../middleware/mongodb"
import multer from "multer"
import AuctionEvent from "../../../models/AuctionEvent"

const handler = async (req: any, res: NextApiResponse) => {
  await runMiddleware(req, res, multer().single("file"))

  const { method } = req
  const session = await getSession({ req })

  switch (method) {
    case "GET":
      let auctionEvents = await AuctionEvent.find()
      res.json(auctionEvents)
      break
    case "POST":
      let { title } = req.body
      console.log({ body: req.body, file: req.file })

      let event = new AuctionEvent({
        title: "test",
      })

      let image
      // await event.save()

      res.json(event)
      break
    default:
      res.setHeader("Allow", ["GET", "POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default connectDB(handler)

export const config = {
  api: {
    bodyParser: false,
  },
}
