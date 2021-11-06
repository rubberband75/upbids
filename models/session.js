import mongoose from "mongoose"
const Schema = mongoose.Schema

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

mongoose.models = {};

var Session = mongoose.model("Session", session)

export default Session
