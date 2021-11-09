import type { NextApiRequest, NextApiResponse } from "next"

interface ApiRequest extends NextApiRequest {
  user?: User
  file?: any
}

interface ApiResponse extends NextApiResponse {}
