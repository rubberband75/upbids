import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import getCurrentUser from "../../../middleware/getCurrentUser"
import connectToDB from "../../../middleware/connectToDB"
import Bid from "../../../models/Bid"
import User from "../../../models/user"
import AuctionItem from "../../../models/AuctionItem"
import AuctionEvent from "../../../models/AuctionEvent"
import logRequest from "../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  const { method } = req
  switch (method) {
    case "POST":
      try {
        // Extract fields from req body
        let { userId, itemId, amount, fullName, email, phone } = req.body || {}

        // Default to current user ID if none provided
        if (!userId) userId = req.user?._id

        // If not logged in, create new user
        if (!userId) {
          console.log({ fullName, email, phone })
          if (!fullName || !email || !phone) {
            return res
              .status(400)
              .json({ error: "Must provide name, email, and phone number" })
          }
          let newUser: User = await User.create({
            name: fullName,
            email: email,
            phone: phone,
          })
          userId = newUser._id
        }

        // Check for equal/greter bid amounts on same item
        let auctionItem = await AuctionItem.findOne({
          _id: itemId,
        }).populate("eventId")
        if (!auctionItem) {
          return res.status(400).json({ error: "Auction Item does not exist" })
        }

        let auctionEvent: AuctionEvent = auctionItem.eventId
        if (
          !auctionEvent.biddingOpen ||
          !auctionEvent.published ||
          !auctionItem.published
        ) {
          return res
            .status(400)
            .json({ error: "Bidding is not open on this event or item" })
        }

        // Get Current Max Bid on Item
        let oldTopBid: Bid[] = await Bid.find({ itemId })
          .sort({ amount: -1 })
          .limit(1)

        // If at least one bid
        if (oldTopBid.length > 0) {
          // If provided amount <  maxBid + minIncrement, throw 400 error
          if (amount < oldTopBid[0].amount + auctionItem.minimunIncrement) {
            return res.status(400).json({
              error: `Amount must be at least the minimum next bid: $${(
                oldTopBid[0].amount + auctionItem.minimunIncrement
              ).toFixed(2)}`,
            })
          } else {
            // If amount valid, set all other bids to NOT isTopBid
            await Bid.updateMany(
              { itemId },
              {
                $set: {
                  isTopBid: false,
                },
              }
            )
          }
        } else {
          // If there are no other bids
          // Check that amount is at least the starting bid, else throw error
          if (amount < auctionItem.startingBid) {
            return res.status(400).json({
              error: `Amount must be at least the starting bid: $${auctionItem.startingBid.toFixed(
                2
              )}`,
            })
          }
        }

        // Create bid object
        let bid: Bid = await Bid.create({
          userId,
          itemId,
          amount,
          isTopBid: true,
        })

        // Return Bid
        return res.json({ bid, auctionItem, oldTopBid })
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Placing Bid" })
      }
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
