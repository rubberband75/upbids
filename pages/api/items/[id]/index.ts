import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import multer from "multer"
import uploadCoudinaryImage from "../../../../lib/cloudinary"
import AuctionItem from "../../../../models/AuctionItem"
import AuctionEvent from "../../../../models/AuctionEvent"
import logRequest from "../../../../middleware/logRequest"
import { io } from "socket.io-client"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, multer().single("file"))
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Get object id and request method
  const {
    query: { id },
    method,
  } = req

  // Return 403 error if not logged in
  if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  // Load Item
  let auctionItem: AuctionItem
  try {
    auctionItem = await AuctionItem.findOne({ _id: id }).populate("eventId")
    if (!auctionItem) return res.status(404).json({ error: "Item Not Found" })
  } catch (error) {
    return res.status(500).json({ error: "Error Loading Item" })
  }

  switch (method) {
    case "GET":
      return res.json({ auctionItem })
    case "PATCH":
      try {
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
        if (
          lotNumber &&
          lotNumber != auctionItem.lotNumber &&
          typeof auctionItem.eventId === "object"
        ) {
          let existingLot: AuctionItem = await AuctionItem.findOne({
            eventId: auctionItem.eventId._id.toString(),
            lotNumber,
          })
          if (existingLot)
            return res.status(400).json({ error: "Lot Number Taken" })
        }

        // Validate Numeric Values
        if (lotNumber != undefined && lotNumber <= 0)
          throw "Lot Number must be greater than 0"
        if (retailValue != undefined && retailValue <= 0)
          throw "Retail Value must be greater than 0"
        if (startingBid != undefined && startingBid <= 0)
          throw "Starting Bid must be greater than 0"
        if (minimunIncrement != undefined && minimunIncrement <= 0)
          throw "Minimun Increment must be greater than 0"

        if (title != undefined) auctionItem.title = title
        if (description != undefined) auctionItem.description = description
        if (lotNumber != undefined) auctionItem.lotNumber = lotNumber
        if (retailValue != undefined) auctionItem.retailValue = retailValue
        if (startingBid != undefined) auctionItem.startingBid = startingBid
        if (minimunIncrement != undefined)
          auctionItem.minimunIncrement = minimunIncrement
        if (published != undefined) auctionItem.published = published

        // If file included, upload and save URL
        if (req.file) {
          try {
            let cloudinaryImage = await uploadCoudinaryImage(req.file)
            auctionItem.image = cloudinaryImage.secure_url
          } catch (error) {
            console.error(error)
            return res.status(500).json({ error: "Error Uploading Image" })
          }
        } else if (image != undefined) auctionItem.image = image

        auctionItem.save()

        if (req.io && auctionItem._id) {
          req.io
            .to(auctionItem._id.toString())
            .emit("item-update", { auctionItem })
        }

        return res.json({ auctionItem })
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Updating Item" })
      }
    case "DELETE":
      try {
        await auctionItem.delete()
        return res.end(`Item Deleted: ${id}`)
      } catch (error) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Deleting Item" })
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
