import type { ApiRequest, ApiResponse } from "../types/api"
import { getToken } from "next-auth/jwt"
import User from "../models/user"

export default async function (
  req: ApiRequest,
  res: ApiResponse,
  next: Function
) {
  const token = await getToken({ req, secret: process.env.SECRET })
  if (token) req.user = await User.findById(token.sub)
  next(req, res)
}
