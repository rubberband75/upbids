import { createContext } from "react"
import io from "socket.io-client"

export const socket = io()
export const SocketContext = createContext(socket)

socket.on("connect", () => {
  socket.emit("hello")
})
