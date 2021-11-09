import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import connectDB from "../../../middleware/mongodb"
import multer from "multer"
import AuctionEvent from "../../../models/AuctionEvent"
import uploadCoudinaryImage from "../../../lib/cloudinary"
import connectToDB from "../../../middleware/connectToDB"
import getCurrentUser from "../../../middleware/getCurrentUser"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, multer().single("bannerImage"))
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Return 403 error if not logged in
  // if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case "GET":
      try {
        let auctionEvent: AuctionEvent = await AuctionEvent.findOne({ _id: id })

        // Throw 404 if event id not found
        if (!auctionEvent)
          return res.status(404).json({ error: "Event Not Found" })

        // Throw 403 if not owned by current user
        // if (!req.user || `${auctionEvent.userId}` != `${req.user._id}`)
        //   return res
        //     .status(403)
        //     .json({ error: "You do not have permission to view this event" })

        res.json(auctionEvent)
      } catch (error) {
        return res.status(404).json({ error: "Error Loading Event" })
      }
      break
    case "PATCH":
      try {
        let auctionEvent: AuctionEvent = await AuctionEvent.findOne({ _id: id })

        // Throw 404 if event id not found
        if (!auctionEvent)
          return res.status(404).json({ error: "Event Not Found" })

        // Throw 403 if not owned by current user
        // if (!req.user || `${auctionEvent.userId}` != `${req.user._id}`)
        //   return res
        //     .status(403)
        //     .json({ error: "You do not have permission to view this event" })

        // Extract fields from req body
        let { title, description, slug, published, biddingOpen } =
          req.body || {}

        // Check for duplicate slugs
        if (slug) {
          let existingSlug = await AuctionEvent.findOne({ slug })
          if (existingSlug)
            return res.status(400).json({ error: "URL slug already exists" })
        }

        // If file included, upload and save URL
        if (req.file) {
          try {
            let cloudinaryImage = await uploadCoudinaryImage(req.file)
            auctionEvent.bannerImage = cloudinaryImage.secure_url
          } catch (error) {
            return res.status(500).end("Error Uploading Image")
          }
        }

        // Upding existing event
        if (title != undefined) auctionEvent.title = title
        if (description != undefined) auctionEvent.description = description
        if (slug != undefined) auctionEvent.slug = slug
        if (published != undefined) auctionEvent.published = published
        if (biddingOpen != undefined) auctionEvent.biddingOpen = biddingOpen

        // Save and return event object
        await auctionEvent.save()
        res.json(auctionEvent)
      } catch (error) {
        // Thow 500 error if any uncaught errors occure
        return res.status(500).json({ error: "Error Updating Event" })
      }
      break
    default:
      res.setHeader("Allow", ["GET", "PATCH"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
export const config = {
  api: {
    bodyParser: false,
  },
}
