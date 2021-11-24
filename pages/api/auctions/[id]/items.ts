import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import AuctionItem from "../../../../models/AuctionItem"
import AuctionEvent from "../../../../models/AuctionEvent"
import logRequest from "../../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Return 403 error if not logged in
  // if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  const {
    query: { id },
    method,
  } = req

  // Load AuctionEvent
  let auctionEvent: AuctionEvent
  try {
    auctionEvent = await AuctionEvent.findOne({ _id: id })
    if (!auctionEvent)
      return res.status(404).json({ error: "Auction Not Found" })
  } catch (error) {
    return res.status(500).json({ error: "Error Loading Auction" })
  }

  // Check that Event is owned by current user
  if (`${auctionEvent.userId}` != `${req.user?._id}`)
    return res
      .status(403)
      .json({ error: "You do not have permission to view this event" })

  switch (method) {
    case "GET":
      let auctionItems: AuctionItem[] = await AuctionItem.find({
        eventId: id,
      }).sort("lotNumber")
      res.json(auctionItems)
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
