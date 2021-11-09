import mongoose from "mongoose"
const Schema = mongoose.Schema

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
})

mongoose.models = {}

var AuctionEvent = mongoose.model("AuctionEvent", auctionEvent)

export default AuctionEvent
