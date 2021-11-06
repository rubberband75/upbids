import mongoose from "mongoose"
const Schema = mongoose.Schema

const account = new Schema({
  provider: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  providerAccountId: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  expires_at: {
    type: Number,
    required: true,
  },
  scope: {
    type: String,
    required: true,
  },
  token_type: {
    type: String,
    required: true,
  },
  id_token: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

mongoose.models = {};

var Account = mongoose.model("Account", account)

export default Account
