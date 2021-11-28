import type { ApiRequest, ApiResponse } from "../../../../types/api"
import runMiddleware from "../../../../middleware/runMiddleware"
import AuctionEvent from "../../../../models/AuctionEvent"
import connectToDB from "../../../../middleware/connectToDB"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, connectToDB)

  const { method } = req

  switch (method) {
    case "GET":
      try {
        let auctionEvents: AuctionEvent[] = await AuctionEvent.find(
          {
            published: true,
            slug: { $ne: "" },
          },
          "-userId -__v"
        )
        res.json(auctionEvents)
      } catch (error) {
        return res.status(500).json({ error: "Error Loading Events" })
      }
      break

    default:
      res.setHeader("Allow", ["GET"])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
