import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import multer from "multer"
import AuctionEvent from "../../../../models/AuctionEvent"
import AuctionItem from "../../../../models/AuctionItem"
import uploadCoudinaryImage from "../../../../lib/cloudinary"
import connectToDB from "../../../../middleware/connectToDB"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import logRequest from "../../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, multer().single("bannerImage"))
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Get object id and request method
  const {
    query: { id },
    method,
  } = req

  // Return 403 error if not logged in
  if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  // Load AuctionEvent
  let auctionEvent: AuctionEvent
  try {
    auctionEvent = await AuctionEvent.findOne({ _id: id }).populate(
      "managers",
      "_id name email"
    )
    if (!auctionEvent)
      return res.status(404).json({ error: "Auction Not Found" })
  } catch (error) {
    return res.status(500).json({ error: "Error Loading Auction" })
  }

  // Check if current user is owner or manager of event
  let isOwner = `${auctionEvent.userId}` === `${req.user._id}`
  let isManager = auctionEvent.managers?.some((user) => {
    console.log(user)
    if (typeof user === "object") return `${user._id}` == `${req.user._id}`
    else return `${user}` != `${req.user._id}`
  })

  // Check that Event is owned or managed by current user
  if (!(isOwner || isManager))
    return res
      .status(403)
      .json({ error: "You do not have permission to view this event" })

  switch (method) {
    case "GET":
      let auctionItems: AuctionItem[] = await AuctionItem.find({
        eventId: auctionEvent._id,
      }).sort("lotNumber")

      // Hide manager list from managers
      if (isManager) auctionEvent.managers = undefined

      return res.json({ auctionEvent, auctionItems })
    case "PATCH":
      try {
        // Extract fields from req body
        let { title, description, slug, published, biddingOpen, bannerImage } =
          req.body || {}

        // Check for duplicate slugs
        if (slug && slug != auctionEvent.slug) {
          let existingSlug = await AuctionEvent.findOne({ slug })
          if (existingSlug)
            return res.status(400).json({ error: "Event URL already exists" })
        }

        // If file included, upload and save URL
        if (req.file) {
          try {
            let cloudinaryImage = await uploadCoudinaryImage(req.file)
            auctionEvent.bannerImage = cloudinaryImage.secure_url
          } catch (error) {
            return res
              .status(500)
              .json({ error: `${error}` || "Error Uploading Image" })
          }
        } else if (bannerImage != undefined)
          auctionEvent.bannerImage = bannerImage

        // Upding existing event
        if (title != undefined) auctionEvent.title = title
        if (description != undefined) auctionEvent.description = description
        if (slug != undefined) auctionEvent.slug = slug
        if (published != undefined) auctionEvent.published = published
        if (biddingOpen != undefined) auctionEvent.biddingOpen = biddingOpen

        // Save and return event object
        await auctionEvent.save()
        return res.json({ auctionEvent })
      } catch (error) {
        // Thow 500 error if any uncaught errors occure
        console.error(error)
        return res
          .status(500)
          .json({ error: `${error}` || "Error Updating Event" })
      }
    case "DELETE":
      // Hide manager list from managers
      if (isManager)
        return res
          .status(403)
          .json({ error: "You do not have permission to delete this event" })

      try {
        await auctionEvent.delete()
        return res.end(`Item Deleted: ${id}`)
      } catch (error) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Deleting Event" })
      }
    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
export const config = {
  api: {
    bodyParser: false,
  },
}
