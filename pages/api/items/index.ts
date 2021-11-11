import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import getCurrentUser from "../../../middleware/getCurrentUser"
import connectToDB from "../../../middleware/connectToDB"
import multer from "multer"
import uploadCoudinaryImage from "../../../lib/cloudinary"
import AuctionItem from "../../../models/AuctionItem"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, multer().single("image"))
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Return 403 error if not logged in
  // if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  const { method } = req
  switch (method) {
    case "GET":
      let auctionItems: AuctionItem[] = await AuctionItem.find()
      res.json(auctionItems)
      break
    case "POST":
      // Extract fields from req body
      let {
        eventId,
        title,
        description,
        image,
        lotNumber,
        retailValue,
        startingBid,
        minimunIncrement,
        published,
      } = req.body || {}

      // Check for Lot Numbers
      if (lotNumber) {
        let existingLot: AuctionItem = await AuctionItem.findOne({
          eventId,
          lotNumber,
        })
        if (existingLot)
          return res.status(400).json({ error: "Lot Number Taken" })
      }

      // Create item object
      let item: AuctionItem = new AuctionItem({
        eventId,
        title,
        description,
        image,
        lotNumber,
        retailValue,
        startingBid,
        minimunIncrement,
        published,
      })

      // If file included, upload and save URL
      if (req.file) {
        try {
          let cloudinaryImage = await uploadCoudinaryImage(req.file)
          item.image = cloudinaryImage.secure_url
        } catch (error) {
          console.error(error)
          return res.status(500).end("Error Uploading Image")
        }
      }

      // Save and return item object
      try {
        await item.save()
        res.json(item)
      } catch (error: any) {
        return res.status(500).end(`${error}` || "Error Saving Item")
      }

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
