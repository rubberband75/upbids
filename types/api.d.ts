import type { NextApiRequest, NextApiResponse } from "next"
import SocketServer from "../sockets/SocketServer"

interface ApiRequest extends NextApiRequest {
  user?: User
  file?: any
  io?: socketio.Server
}

interface ApiResponse extends NextApiResponse {}
