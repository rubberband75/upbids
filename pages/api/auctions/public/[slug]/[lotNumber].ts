import type { ApiRequest, ApiResponse } from "../../../../../types/api"
import runMiddleware from "../../../../../middleware/runMiddleware"
import AuctionEvent from "../../../../../models/AuctionEvent"
import connectToDB from "../../../../../middleware/connectToDB"
import AuctionItem from "../../../../../models/AuctionItem"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, connectToDB)

  const {
    query: { slug, lotNumber },
    method,
  } = req

  // Check that lotNumber is an integer
  if (isNaN(+lotNumber))
    return res.status(400).json({ error: "Invalid Lot Number" })

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
        let auctionItem: AuctionItem[] = await AuctionItem.findOne({
          eventId: auctionEvent._id,
          published: true,
          lotNumber: lotNumber,
        })

        // Throw 404 if no public item found with this lot number
        if (!auctionItem)
          return res.status(404).json({ error: "Item Not Found" })

        // Return auctionItem
        return res.json(auctionItem)
      } catch (error: any) {
        return res.status(500).json({ error: "Error Loading Item" })
      }
    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
