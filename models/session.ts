import mongoose from "mongoose"
import User from "./user"
const Schema = mongoose.Schema

interface Session extends mongoose.Document {
  sessionToken: string
  userId: string | User
  expires?: Date
}

const session = new Schema({
  sessionToken: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  expires: {
    type: Date,
    required: false,
  },
})

var Session =
  mongoose.models.Session || mongoose.model<Session>("Session", session)

export default Session
