import mongoose from "mongoose"
import User from "./user"
const Schema = mongoose.Schema

interface AuctionEvent extends mongoose.Document {
  userId: string | User
  title?: string
  description?: string
  bannerImage?: string
  slug?: string
  published?: Boolean
  biddingOpen?: Boolean
  managers?: Array<string | User>
}

const auctionEvent = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  title: {
    type: String,
    required: false,
    default: "",
  },
  description: {
    type: String,
    required: false,
    default: "",
  },
  bannerImage: {
    type: String,
    required: false,
    default: "",
  },
  slug: {
    type: String,
    required: false,
    default: "",
  },
  published: {
    type: Boolean,
    required: true,
    default: false,
  },
  biddingOpen: {
    type: Boolean,
    required: true,
    default: false,
  },
  managers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  ],
})

var AuctionEvent =
  mongoose.models?.AuctionEvent ||
  mongoose.model<AuctionEvent>("AuctionEvent", auctionEvent)

export default AuctionEvent
