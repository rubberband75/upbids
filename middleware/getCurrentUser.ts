import type { ApiRequest, ApiResponse } from "../types/api"
import { getSession } from "next-auth/react"
import User from "../models/user"

export default async function (
  req: ApiRequest,
  res: ApiResponse,
  next: Function
) {
  const session = await getSession({ req })
  req.user = await User.findOne({ email: session?.user?.email })
  next(req, res)
}
