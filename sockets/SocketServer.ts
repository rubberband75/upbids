import * as http from "http"
import * as socketio from "socket.io"
import AuctionItem from "../models/AuctionItem"

const createSocketServer = (server: http.Server) => {
  const io: socketio.Server = new socketio.Server()
  io.attach(server)

  io.on("connection", (socket: socketio.Socket) => {
    // console.info("socket - connected")

    socket.on("join-room", (roomId: string | undefined | null) => {
      if (roomId) socket.join(roomId)
    })

    socket.on("leave-room", (roomId: string | undefined | null) => {
      if (roomId) socket.join(roomId)
    })

    socket.on("disconnect", () => {
      console.info("socket - disconnected")
    })
  })

  return io
}

export default createSocketServer
