import type { ApiRequest, ApiResponse } from "../types/api"
import mongoose from "mongoose"

export default async function (
  req: ApiRequest,
  res: ApiResponse,
  next: Function
) {
  if (mongoose.connections[0].readyState) {
    // Use current db connection
    return next(req, res)
  }
  // Use new db connection
  await mongoose.connect(process.env.MONGODB_URI)
  return next(req, res)
}
