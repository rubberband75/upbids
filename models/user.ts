import mongoose from "mongoose"
const Schema = mongoose.Schema

interface User extends mongoose.Document {
  name: string
  email: string
  image?: string
  phone?: string
  emailVerified?: Boolean
}

const user = new Schema<User>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  image: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  emailVerified: {
    type: Date,
    required: false,
  },
})

var User = mongoose.models.User || mongoose.model<User>("User", user)

export default User