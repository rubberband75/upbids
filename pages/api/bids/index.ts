import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import getCurrentUser from "../../../middleware/getCurrentUser"
import connectToDB from "../../../middleware/connectToDB"
import AuctionItem from "../../../models/AuctionItem"
import Bid from "../../../models/Bid"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Return 403 error if not logged in
  // if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  const { method } = req
  switch (method) {
    case "GET":
      let bids: Bid[] = await Bid.find({ userId: req.user?._id }).populate({
        path: "itemId",
        populate: "eventId",
      })
      res.json({ bids })
      break
    case "POST":
      // Extract fields from req body
      console.log({ body: req.body })
      let { userId, itemId, amount } = req.body || {}

      // Default to current user ID if none provided
      if (!userId) userId = req.user?._id

      // TODO: Check for equal/greter bid amounts on same item

      // Create bid object
      let bid: Bid = new Bid({
        userId,
        itemId,
        amount,
      })

      // Save and return bid
      try {
        await bid.save()
        res.json({ bid })
      } catch (error: any) {
        return res.status(500).end(`${error}` || "Error Saving Bid")
      }

      break
    default:
      res.setHeader("Allow", ["GET", "POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
