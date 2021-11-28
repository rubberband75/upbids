import * as http from "http"
import * as socketio from "socket.io"
import AuctionItem from "../models/AuctionItem"

const createSocketServer = (server: http.Server) => {
  const io: socketio.Server = new socketio.Server()
  io.attach(server)

  io.on("connection", (socket: socketio.Socket) => {
    console.log("connection")
    socket.emit("status", "Hello from Socket.io")

    socket.on("hello", (data) => {
      console.log("client confirmed connection")
      // io.emit("broadcast", "Somone joined the party")
    })

    socket.on("join-item-room", (auctionItem: AuctionItem) => {
      if (auctionItem) {
        console.log("Socket Room Joined:", auctionItem._id)
        socket.join(auctionItem._id.toString())
      }
    })

    socket.on("leave-item-room", (auctionItem: AuctionItem) => {
      if (auctionItem) {
        console.log("Socket Room Left:", auctionItem._id)
        socket.leave(auctionItem._id.toString())
      }
    })

    socket.on("disconnect", () => {
      console.log("client disconnected")
    })
  })

  return io
}

export default createSocketServer
