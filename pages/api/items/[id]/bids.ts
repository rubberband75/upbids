import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import AuctionItem from "../../../../models/AuctionItem"
import Bid from "../../../../models/Bid"

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
    auctionItem = await AuctionItem.findOne({ _id: id })
    if (!auctionItem) return res.status(404).json({ error: "Item Not Found" })
  } catch (error) {
    return res.status(500).json({ error: "Error Loading Item" })
  }

  // Load Bids
  let bids: Bid[] = await Bid.find({ itemId: id }).populate('userId').sort({ amount: -1 })
  switch (method) {
    case "GET":
      try {
        return res.json({bids})
      } catch (error) {
        return res.status(500).json({ error: "Error Loading Bids" })
      }
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
