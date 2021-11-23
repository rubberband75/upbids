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

  // Load event from slug
  let auctionEvent: AuctionEvent
  try {
    auctionEvent = await AuctionEvent.findOne({ slug, published: true })
    // Throw 404 if event id not found
    if (!auctionEvent)
      return res.status(404).json({ error: "Auction Not Found" })
  } catch (error) {
    return res.status(404).json({ error: "Error Loading Auction" })
  }

  switch (method) {
    case "GET":
      try {
        // Load published items associated with this event
        let auctionItems: AuctionItem[] = await AuctionItem.find({
          eventId: auctionEvent._id,
          published: true,
        })
        return res.json(auctionItems)
      } catch (error: any) {
        return res.status(500).json({ error: "Error Loading Items" })
      }
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
