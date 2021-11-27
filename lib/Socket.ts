import * as socketio from "socket.io"

const io: socketio.Server = new socketio.Server()

io.on("connection", (socket: socketio.Socket) => {
  console.log("connection")
  socket.emit("status", "Hello from Socket.io")
  io.emit("broadcast", "Somone joined the party")
  
  socket.on("hello", (data) => {
    console.log("client confirmed connection")
  })

  socket.on("disconnect", () => {
    console.log("client disconnected")
  })
})

export default io
