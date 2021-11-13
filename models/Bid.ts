import mongoose from "mongoose"
import AuctionItem from "./AuctionItem"
import User from "./user"
const Schema = mongoose.Schema

interface Bid extends mongoose.Document {
  userId: string | User
  itemId: string | AuctionItem
  amount: number
  timestamp: Date
  isTopBid: Boolean
  won: Boolean
  notified: Boolean
  payed: Boolean
}

const bidSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  itemId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "AuctionItem",
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  isTopBid: {
    type: Boolean,
    required: true,
    default: false,
  },
  won: {
    type: Boolean,
    required: true,
    default: false,
  },
  notified: {
    type: Boolean,
    required: true,
    default: false,
  },
  payed: {
    type: Boolean,
    required: true,
    default: false,
  },
})

var Bid = mongoose.models.AuctionEvent || mongoose.model<Bid>("Bid", bidSchema)

export default Bid
