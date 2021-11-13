import type { ApiRequest, ApiResponse } from "../types/api"
import mongoose from "mongoose"
import AuctionItem from "../models/AuctionItem"
import AuctionEvent from "../models/AuctionEvent"

// Ensure all schemas are loaded
let item = new AuctionItem()
let event = new AuctionEvent()

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
