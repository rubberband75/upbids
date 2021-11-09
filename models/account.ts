import mongoose from "mongoose"
import User from "./user"
const Schema = mongoose.Schema

interface Account extends mongoose.Document {
  provider?: string
  type?: string
  providerAccountId?: string
  access_token?: string
  expires_at?: Number
  scope?: string
  token_type?: string
  id_token?: string
  userId?: string | User
}

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

var Account =
  mongoose.models.Account || mongoose.model<Account>("Account", account)

export default Account
