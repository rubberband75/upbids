import * as socketio from "socket.io"
import AuctionItem from "../models/AuctionItem"

const io: socketio.Server = new socketio.Server()

io.on("connection", (socket: socketio.Socket) => {
  console.log("connection")
  socket.emit("status", "Hello from Socket.io")

  socket.on("hello", (data) => {
    console.log("client confirmed connection")
    io.emit("broadcast", "Somone joined the party")
  })

  socket.on("watch-item", (auctionItem: AuctionItem) => {
    socket.join(auctionItem._id.toString())
  })

  socket.on("disconnect", () => {
    console.log("client disconnected")
  })
})

export default io
