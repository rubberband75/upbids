import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import AuctionEvent from "../../../../models/AuctionEvent"
import AuctionItem from "../../../../models/AuctionItem"
import uploadCoudinaryImage from "../../../../lib/cloudinary"
import connectToDB from "../../../../middleware/connectToDB"
import getCurrentUser from "../../../../middleware/getCurrentUser"
import logRequest from "../../../../middleware/logRequest"
import User from "../../../../models/user"

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
  //   if (`${auctionEvent.userId}` != `${req.user._id}`)
  //     return res
  //       .status(403)
  //       .json({ error: "You do not have permission to view this event" })

  switch (method) {
    case "POST":
      try {
        let email = req.body.email
        if (!email) return res.status(400).json({ error: "Must Provide Email" })
        let newManager = await User.findOne({ email: email })

        let currentManagers = auctionEvent.managers || []

        console.log("In list", currentManagers.includes(newManager._id))

        if (currentManagers.includes(newManager._id))
          return res.status(400).json({ error: "User already a manager" })

        let newManagerList = [...currentManagers, newManager._id]

        auctionEvent.managers = newManagerList
        await auctionEvent.save()
        auctionEvent = await AuctionEvent.findOne({ _id: id })

        return res.json({ auctionEvent })
      } catch (error) {
        // Thow 500 error if any uncaught errors occure
        console.error(error)
        return res
          .status(500)
          .json({ error: `${error}` || "Error Adding Manager" })
      }
    default:
      res.setHeader("Allow", ["POST"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
