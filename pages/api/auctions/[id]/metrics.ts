import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import AuctionItem from "../../../../models/AuctionItem"
import AuctionEvent from "../../../../models/AuctionEvent"
import logRequest from "../../../../middleware/logRequest"
import Bid from "../../../../models/Bid"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

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
    case "GET":
      let totalBid = 0
      let totalPaid = 0

      let topBids = await Bid.find({
        isTopBid: true,
      }).populate({
        path: "itemId",
        match: {
          eventId: id,
        },
      })

      topBids.forEach((bid) => {
        if (bid.itemId) {
          totalBid += bid.amount
          if (bid.paid) totalPaid += bid.amount
        }
      })

      res.json({ totalBid, totalPaid })
      break
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
