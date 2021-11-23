import type { ApiRequest, ApiResponse } from "../../../../../types/api"
import runMiddleware from "../../../../../middleware/runMiddleware"
import AuctionEvent from "../../../../../models/AuctionEvent"
import connectToDB from "../../../../../middleware/connectToDB"
import AuctionItem from "../../../../../models/AuctionItem"
import logRequest from "../../../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)
  await runMiddleware(req, res, connectToDB)

  const {
    query: { slug },
    method,
  } = req

  switch (method) {
    case "GET":
      try {
        let auctionEvent: AuctionEvent = await AuctionEvent.findOne({
          slug,
          published: true,
        })

        // Throw 404 if event id not found
        if (!auctionEvent)
          return res.status(404).json({ error: "Event Not Found" })

        let auctionItems: AuctionItem[] = await AuctionItem.find({
          eventId: auctionEvent._id,
          published: true,
        })

        res.json({ auctionEvent, auctionItems })
      } catch (error) {
        return res.status(404).json({ error: "Error Loading Event" })
      }
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
