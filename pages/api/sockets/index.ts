import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import logRequest from "../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)

  const { method } = req
  switch (method) {
    case "GET":
      const { io } = req

      return res.json({ clientsCount: io.engine.clientsCount })
    default:
      res.setHeader("Allow", ["GET"])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
