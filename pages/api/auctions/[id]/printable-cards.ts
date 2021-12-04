import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import AuctionItem from "../../../../models/AuctionItem"
import AuctionEvent from "../../../../models/AuctionEvent"
import logRequest from "../../../../middleware/logRequest"
import path from "path"
import fs from "fs"
import PDFDocument from "pdfkit"
import QRCode from "qrcode"
import axios from "axios"
import multer from "multer"

const fetchImage = async (src: string) => {
  const image = await axios.get(src, {
    responseType: "arraybuffer",
  })
  return image.data
}

const generatePDF = (
  auctionEvent: AuctionEvent,
  auctionItems: AuctionItem[],
  logoImageBuffer: Buffer | null | undefined,
  noImage: Boolean
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let dir = path.join(
        process.cwd(),
        "public",
        "generated",
        auctionEvent._id.toString()
      )
      fs.mkdirSync(dir, { recursive: true })

      // Set PDF Settings
      let pageSize = [612 / 2, 792 / 2]
      let pageConfig = { size: pageSize, margin: 5 }

      let logo: any
      if (logoImageBuffer && !noImage) {
        logo = logoImageBuffer
      } else if (auctionEvent.bannerImage && !noImage)
        logo = await fetchImage(auctionEvent.bannerImage)

      // Create a document
      const doc = new PDFDocument(pageConfig)
      doc.pipe(fs.createWriteStream(path.join(dir, "cards.pdf")))

      for (let i = 0; i < auctionItems.length; i++) {
        let item = auctionItems[i]

        // QR Code
        let itemURL = `${process.env.NEXTAUTH_URL}/${auctionEvent.slug}/${item.lotNumber}`
        let dataURL = await QRCode.toDataURL(itemURL, {
          errorCorrectionLevel: "M",
          scale: 16,
        })
        doc.image(dataURL, 0, pageSize[1] * 0.61, {
          fit: [pageSize[1] * 0.3, pageSize[1] * 0.3],
        })

        // Logo Image
        if (logo)
          doc.image(logo, 0, pageSize[1] / 2 + 5, {
            fit: [pageSize[0], 40],
            align: "center",
          })

        doc
          .fontSize(10)
          .text(
            `LOT #${item.lotNumber?.toString().padStart(3, "0")}`,
            pageSize[0] * 0.4,
            pageSize[1] * 0.64
          )
          .fontSize(8)
          .text(" ")
          .fontSize(15)
          .text(`${item.title}`)
          .fontSize(8)
          .text(" ")
          .fontSize(11)
          .text(`Retail Value: $${item.retailValue?.toFixed(2)}`)
          .fontSize(2)
          .text(" ")
          .fontSize(11)
          .text(`Starting Bid: $${item.startingBid?.toFixed(2)}`)
        doc.fontSize(9).text(itemURL, 10, pageSize[1] - 25)
        doc
          .lineWidth(1)
          .stroke("#eee")
          .lineCap("round")
          .moveTo(0, pageSize[1] / 2)
          .lineTo(pageSize[0], pageSize[1] / 2)
          .stroke()
        doc
          .lineWidth(1)
          .stroke("#eee")
          .lineCap("round")
          .moveTo(0, pageSize[1] / 2)
          .lineTo(pageSize[0], pageSize[1] / 2)
          .stroke()
        if (i < auctionItems.length - 1) doc.addPage(pageConfig)
      }

      doc.on("end", () => {
        resolve(true)
      })

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
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
    if (typeof user === "object") return `${user._id}` == `${req.user._id}`
    else return `${user}` != `${req.user._id}`
  })

  // Check that Event is owned or managed by current user
  if (!(isOwner || isManager))
    return res
      .status(403)
      .json({ error: "You do not have permission to view this event" })

  switch (method) {
    case "POST":
      try {
        await runMiddleware(req, res, multer().single("bannerImage"))

        let auctionItems: AuctionItem[] = await AuctionItem.find({
          eventId: auctionEvent._id,
          published: true,
        }).sort("lotNumber")

        await generatePDF(
          auctionEvent,
          auctionItems,
          req.file ? req.file?.buffer : null,
          req.body.noImage === "true"
        )

        return res.json({
          url: `/generated/${auctionEvent._id}/cards.pdf`,
        })
      } catch (error) {
        return res.status(500).json({ error: "Error Loading Auction" })
      }
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
export const config = {
  api: {
    bodyParser: false,
  },
}
