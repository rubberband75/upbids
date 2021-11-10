import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import getCurrentUser from "../../../middleware/getCurrentUser"
import connectToDB from "../../../middleware/connectToDB"
import multer from "multer"
import AuctionEvent from "../../../models/AuctionEvent"
import uploadCoudinaryImage from "../../../lib/cloudinary"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, multer().single("bannerImage"))
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Return 403 error if not logged in
  if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  const { method } = req
  switch (method) {
    case "GET":
      let auctionEvents: AuctionEvent[] = await AuctionEvent.find({
        userId: req.user?._id,
      })
      res.json(auctionEvents)
      break
    case "POST":
      // Extract fields from req body
      let { title, description, slug } = req.body || {}

      // Check for duplicate slugs
      if (slug) {
        let existingSlug: AuctionEvent = await AuctionEvent.findOne({ slug })
        if (existingSlug)
          return res.status(400).json({ error: "Event URL already exists" })
      }

      // Create event object
      let event: AuctionEvent = new AuctionEvent({
        userId: req.user._id,
        title,
        description,
        slug,
      })

      // If file included, upload and save URL
      if (req.file) {
        try {
          let cloudinaryImage = await uploadCoudinaryImage(req.file)
          event.bannerImage = cloudinaryImage.secure_url
        } catch (error) {
          console.error(error)
          return res.status(500).end("Error Uploading Image")
        }
      }

      // Save and return event object
      await event.save()
      res.json(event)
      break
    default:
      res.setHeader("Allow", ["GET", "POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
export const config = {
  api: {
    bodyParser: false,
  },
}
