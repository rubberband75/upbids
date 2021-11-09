import mongoose from "mongoose"
const Schema = mongoose.Schema

const auctionItem = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  published: {
    type: Boolean,
    required: true,
    default: false
  },
  biddingOpen: {
      type: Boolean,
      required: true,
      default: false
  }
})

mongoose.models = {};

var AuctionItem = mongoose.model("AuctionItem", auctionItem)

export default AuctionItem