import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import getCurrentUser from "../../../middleware/getCurrentUser"
import connectToDB from "../../../middleware/connectToDB"
import Bid from "../../../models/Bid"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  // Return 403 error if not logged in
  // if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  const { method } = req
  switch (method) {
    case "GET":
      let bids: Bid[] = await Bid.find({
        userId: req.user?._id,
      })
        .populate({
          path: "itemId",
          select: "-description",
          populate: { path: "eventId", select: "-description -userId " },
        })
        .sort("-timestamp") // Sort all bids chronologically, newest first.

      // For activeBids: Filter all bids to only the most recent bid per item, on auctions where bidding is open
      let activeBids: Bid[] = []
      for (let i = 0; i < bids.length; i++) {
        // Loop through each bid in bidding history
        let bid = bids[i]
        if (
          typeof bid.itemId === "object" &&
          typeof bid.itemId.eventId === "object" &&
          bid.itemId.eventId.biddingOpen && // Check that bidding is open on the event
          // Check for any bids on the current item already in the activeBids array
          !activeBids.some((newerBid) => {
            return (
              typeof newerBid.itemId === "object" &&
              typeof bid.itemId === "object" &&
              newerBid.itemId._id == bid.itemId._id
            )
          })
        ) {
          activeBids.push(bid) // if bidding open, and no newer bids on the same item, add it to the activeBids array
        }
      }

      // For wonItems: Filter all bids to only bids that won, on events where bidding is not open
      let wonItems: Bid[] = [...bids].filter((bid) => {
        return (
          bid.won &&
          typeof bid.itemId === "object" &&
          typeof bid.itemId.eventId === "object" &&
          !bid.itemId.eventId.biddingOpen
        )
      })

      return res.json({ activeBids, wonItems, bidHistory: bids })
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
        return res.json({ bid })
      } catch (error: any) {
        return res.status(500).end(`${error}` || "Error Saving Bid")
      }
    default:
      res.setHeader("Allow", ["GET", "POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
