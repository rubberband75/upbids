import type { ApiRequest, ApiResponse } from "../../../types/api"
import runMiddleware from "../../../middleware/runMiddleware"
import logRequest from "../../../middleware/logRequest"

const handler = async (req: ApiRequest, res: ApiResponse) => {
  await runMiddleware(req, res, logRequest)

  const { io } = req
  const message = req.query.message?.toString()
  io.emit("broadcast", message)
  return res.json({ message })
}

export default handler
