import Layout from "../../components/layout"
import { useCallback, useContext, useEffect, useState } from "react"
import Bid from "../../models/Bid"
import axios from "axios"
import { Alert, Divider, Typography } from "@mui/material"
import { signIn } from "next-auth/react"
import AuctionItemCard from "../../components/AuctionItemCard"
import { SocketContext } from "../../sockets/SocketClient"

export default function MyBidsPage() {
  const socket = useContext(SocketContext)

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeBids, setActiveBids] = useState<Bid[]>([])
  const [wonItems, setWonItems] = useState<Bid[]>([])
  const [bidHistory, setBidHistory] = useState<Bid[]>([])

  const [joinedRooms, setJoinedRooms] = useState<string[]>([])

  const loadBids = async () => {
    // setLoading(true)
    try {
      let response = await axios.get("/api/bids")
      setActiveBids(response.data.activeBids)
      setWonItems(response.data.wonItems)
      setBidHistory(response.data.bidHistory)
      joinNewRooms()
    } catch (error: any) {
      if (error?.response?.status == 403) signIn()
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const joinNewRooms = () => {
    let rooms: Set<string> = new Set()
    bidHistory.forEach((bid) => {
      if (
        typeof bid.itemId === "object" &&
        typeof bid.itemId.eventId == "object"
      ) {
        rooms.add(bid.itemId._id)
        rooms.add(bid.itemId.eventId._id)
      }
    })

    rooms.forEach((room) => {
      socket.emit("join-room", room)
    })
  }

  useEffect(() => {
    loadBids()
    socket.on("event-update", handleSocketUpdate)
    socket.on("item-update", handleSocketUpdate)
    socket.on("bid-update", handleSocketUpdate)

    return () => {
      let rooms: Set<string> = new Set()
      bidHistory.forEach((bid) => {
        if (
          typeof bid.itemId === "object" &&
          typeof bid.itemId.eventId == "object"
        ) {
          rooms.add(bid.itemId._id)
          rooms.add(bid.itemId.eventId._id)
        }
      })

      rooms.forEach((room) => {
        socket.emit("leave-room", room)
      })

      socket.off("event-update", handleSocketUpdate)
      socket.off("item-update", handleSocketUpdate)
      socket.off("bid-update", handleSocketUpdate)
    }
  }, [])

  const handleSocketUpdate = useCallback((data: any) => {
    loadBids()
  }, [])

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {})

  return (
    <Layout>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        My Bids
      </Typography>
      <Divider />
      {/* // Error Message */}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <h2>Active Bids</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && !activeBids.length && <i style={{ color: "grey" }}>None</i>}
      {activeBids.map((bid: Bid) => {
        if (
          typeof bid.itemId === "object" &&
          typeof bid.itemId.eventId == "object"
        ) {
          return (
            <AuctionItemCard
              key={bid._id}
              auctionItem={bid.itemId}
              href={`/${bid.itemId.eventId.slug}/${bid.itemId.lotNumber}`}
              alertMessage={
                bid.isTopBid ? "You're the Top Bid!" : "You've Been Outbid"
              }
              alertSeverity={bid.isTopBid ? "success" : "warning"}
            />
          )
        }
      })}
      <br />
      <br />

      <h2>Won Items</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && !wonItems.length && <i style={{ color: "grey" }}>None</i>}
      {wonItems.map((bid) => {
        if (
          typeof bid.itemId === "object" &&
          typeof bid.itemId.eventId == "object"
        ) {
          return (
            <AuctionItemCard key={bid._id} auctionItem={bid.itemId} bid={bid} />
          )
        }
      })}
      <br />
      <br />

      <h2>Bid History</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      <table className="upbids-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Auction</th>
            <th>Item</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bidHistory.map(
            ({ _id, timestamp, amount, won, isTopBid, itemId }) => {
              if (
                typeof itemId === "object" &&
                typeof itemId.eventId == "object"
              ) {
                return (
                  <tr key={_id}>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: new Date(timestamp)
                          .toLocaleString("en-US")
                          .split(", ")
                          .join("<br />"),
                      }}
                    ></td>
                    <td>{itemId.eventId.title}</td>
                    <td>
                      Lot #{itemId.lotNumber?.toString().padStart(3, "0")}
                      {" - "}
                      {itemId.title}
                    </td>
                    <td>{currencyFormatter.format(amount)}</td>
                    <td>{won ? "Won" : isTopBid ? "Top Bid" : "Outbid"}</td>
                  </tr>
                )
              }
            }
          )}
        </tbody>
      </table>
      <br />
      <br />
    </Layout>
  )
}
