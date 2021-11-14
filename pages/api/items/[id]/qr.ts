import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import AuctionItem from "../../../../models/AuctionItem"
import QRCode from "qrcode"

const handler = async (req: ApiRequest, res: ApiResponse) => {
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
    auctionItem = await AuctionItem.findOne({ _id: id }).populate({
      path: "eventId",
      select: "slug",
    })
    if (!auctionItem) return res.status(404).json({ error: "Item Not Found" })
  } catch (error) {
    return res.status(500).json({ error: "Error Loading Item" })
  }

  if (
    !auctionItem.lotNumber ||
    (typeof auctionItem.eventId === "object" && !auctionItem.eventId.slug)
  ) {
    return res.status(400).json({ error: "Must Set Event URL and Lot Number" })
  }

  switch (method) {
    case "GET":
      try {
        if (typeof auctionItem.eventId === "object") {
          let auctionItemURL = `${process.env.NEXTAUTH_URL}/${auctionItem.eventId.slug}/${auctionItem.lotNumber}`

          let dataURL = await QRCode.toDataURL(auctionItemURL, {
            errorCorrectionLevel: "M",
            scale: 16
          })

          let [_encoding, imageData] = dataURL.split(",")
          let buffer = Buffer.from(imageData, "base64")

          res.setHeader("Content-Type", "image/png")
          res.write(buffer)
          return res.end()
        } else throw "Error loading event URL"
      } catch (error) {
        return res.status(500).json({ error: "Error Generating QR Code" })
      }
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
export const config = {
  api: {
    bodyParser: false,
  },
}
