import type { NextApiRequest, NextApiResponse } from "next"

interface ApiRequest extends NextApiRequest {
  user?: any
  file?: any
}

interface ApiResponse extends NextApiResponse {}
