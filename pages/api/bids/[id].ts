import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import getCurrentUser from "../../../middleware/getCurrentUser"
import connectToDB from "../../../middleware/connectToDB"
import AuctionItem from "../../../models/AuctionItem"
import Bid from "../../../models/Bid"
import logRequest from "../../../middleware/logRequest"
import { socket } from "../../../sockets/SocketClient"

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
  //   if (!req.user) return res.status(403).json({ error: "Must be logged in" })

  // Load bid
  let bid: Bid
  try {
    bid = await Bid.findOne({ _id: id })
    if (!bid) return res.status(404).json({ error: "Item Not Found" })
  } catch (error) {
    return res.status(500).json({ error: "Error Loading Bid" })
  }

  let itemId = bid.itemId

  switch (method) {
    case "GET":
      return res.json({ bid })
      break
    case "PATCH":
      try {
        // Extract fields from req body
        let { amount, isTopBid, won, notified, paid } = req.body || {}

        // TODO: Check for equal/greter bid amounts on same item

        if (amount != undefined) bid.amount = amount
        if (isTopBid != undefined) bid.isTopBid = isTopBid
        if (won != undefined) bid.won = won
        if (notified != undefined) bid.notified = notified
        if (paid != undefined) bid.paid = paid

        bid.save()

        if (req.io) {
          req.io.to(bid.itemId.toString()).emit("bid-update", { bid })
        }

        return res.json({ bid })
      } catch (error: any) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Updating Bid" })
      }
    case "DELETE":
      try {
        await bid.delete()

        await Bid.updateMany(
          { itemId },
          {
            $set: {
              isTopBid: false,
            },
          }
        )

        let newTopBid: Bid = await Bid.findOne({ itemId })
          .sort({ amount: -1 })
          .limit(1)
          .populate({
            path: "itemId",
            select: "-description",
            populate: { path: "eventId", select: "-description -userId " },
          })

        if (newTopBid) {
          let won = false
          if (
            typeof newTopBid.itemId === "object" &&
            typeof newTopBid.itemId.eventId === "object"
          ) {
            won = !newTopBid.itemId.eventId.biddingOpen
          }

          await newTopBid.update({ isTopBid: true, won })

          if (req.io) {
            let socketData: any = newTopBid
            socketData.itemId = itemId.toString()
            socketData.isTopBid = true
            req.io.to(itemId.toString()).emit("bid-update", {
              bid: socketData,
            })
          }
        }

        return res.end(`Bid Deleted: ${id}`)
      } catch (error) {
        return res
          .status(500)
          .json({ error: `${error}` || "Error Deleting Bid" })
      }
    default:
      res.setHeader("Allow", ["GET", "PATCH", "DELETE"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
