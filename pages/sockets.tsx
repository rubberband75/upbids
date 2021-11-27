// import Layout from "../components/layout"

// export default function PrivacyPage() {
//   return (
//     <Layout>
//       <h1>Web Socket Test</h1>
//     </Layout>
//   )
// }

import { useEffect } from "react"
import io from "socket.io-client"

export default function Sockets() {
  useEffect(() => {
    const socket = io()

    socket.on("connect", () => {
      console.log("connect")
      socket.emit("hello")
    })

    socket.on("status", (data) => {
      console.log({ socketStatus: data })
    })

    socket.on("broadcast", (data) => {
      console.log({ socketBroadcast: data })
    })

    socket.on("disconnect", () => {
      console.log("disconnect")
    })
  }, [])

  return <h1>Socket.io</h1>
}
