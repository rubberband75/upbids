import { getSession } from "next-auth/react"
import runMiddleware from "../../../middleware/runMiddleware"
import User from "../../../models/user"
import logRequest from "../../../middleware/logRequest"
import connectToDB from "../../../middleware/connectToDB"
import getCurrentUser from "../../../middleware/getCurrentUser"
import { ApiRequest, ApiResponse } from "../../../types/api"
import AuctionEvent from "../../../models/AuctionEvent"
import Session from "../../../models/session"
import Account from "../../../models/account"
import Bid from "../../../models/Bid"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)
  await runMiddleware(req, res, getCurrentUser)

  const { method } = req
  const session = await getSession({ req })

  if (session !== null && typeof req.user === "object") {
    switch (method) {
      case "DELETE":
        try {
          let auctionEvents: AuctionEvent[] = await AuctionEvent.find({
            userId: req.user._id,
          })

          let currentUser: User = req.user

          for (let i = 0; i < auctionEvents.length; i++) {
            await auctionEvents[i].update({
              published: false,
              biddingOpen: false,
            })
          }

          await Session.deleteMany({ userId: `${req.user._id}` })
          await Account.deleteMany({ userId: `${req.user._id}` })
          await Bid.deleteMany({ userId: `${req.user._id}` })

          // TODO: Recalculate winning bids

          await currentUser.delete()

          return res.end("Account Deleted")
        } catch (e) {
          res.status(500).json({ error: "Error Deleting Account" })
        }

        break
      default:
        res.setHeader("Allow", ["DELETE"])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } else {
    res.status(403).end("No Current User")
  }
}

export default handler
