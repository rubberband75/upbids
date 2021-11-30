import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import connectToDB from "../../../../middleware/connectToDB"
import AuctionItem from "../../../../models/AuctionItem"
import Bid from "../../../../models/Bid"
import logRequest from "../../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)

  // Get object id and request method
  const {
    query: { id },
    method,
  } = req

  switch (method) {
    case "GET":
      try {
        let currentBid: Bid = await Bid.findOne({ itemId: id })
          .sort({ amount: -1 })
          .limit(1)

        return res.json({ currentBid })
      } catch (error) {
        return res.status(500).json({ error: "Error Loading Bid" })
      }
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
