import mongoose from "mongoose"
import AuctionEvent from "./AuctionEvent"
const Schema = mongoose.Schema

interface AuctionItem extends mongoose.Document {
  eventId: string | AuctionEvent
  title?: string
  description?: string
  image?: string
  lotNumber?: number
  retailValue?: number
  startingBid?: number
  minimunIncrement?: number
  published?: Boolean
}

const auctionItem = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "AuctionEvent",
    required: true,
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
  image: {
    type: String,
    required: false,
    default: "",
  },
  lotNumber: {
    type: Number,
    required: false,
    default: null,
  },
  retailValue: {
    type: Number,
    required: false,
    default: null,
  },
  startingBid: {
    type: Number,
    required: false,
    default: null,
  },
  minimunIncrement: {
    type: Number,
    required: false,
    default: null,
  },
  published: {
    type: Boolean,
    required: true,
    default: false,
  },
})

var AuctionItem =
  mongoose.models.AuctionItem || mongoose.model<AuctionItem>("AuctionItem", auctionItem)

export default AuctionItem
