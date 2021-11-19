import Layout from "../../components/layout"
import React, { useEffect, useState, useRef } from "react"
import Bid from "../../models/Bid"
import axios from "axios"
import { Divider, Typography } from "@mui/material"

export default function MyBidsPage() {
  let [loading, setLoading] = useState(true)
  let [activeBids, setActiveBids] = useState<Bid[]>([])
  let [wonItems, setWonItems] = useState<Bid[]>([])
  let [bidHistory, setBidHistory] = useState<Bid[]>([])

  const loadBids = async () => {
    setLoading(true)
    try {
      let response = await axios.get("/api/bids")
      setActiveBids(response.data.activeBids)
      setWonItems(response.data.wonItems)
      setBidHistory(response.data.bidHistory)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

      <h2>Active Bids</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && !activeBids.length && <i style={{ color: "grey" }}>None</i>}
      {activeBids.map(({ _id, amount, isTopBid, itemId }) => {
        if (typeof itemId === "object" && typeof itemId.eventId == "object") {
          return (
            <a
              href={`/${itemId.eventId.slug}/${itemId.lotNumber}`}
              className={"text-decoration-none"}
              key={_id}
            >
              <div className={"card"}>
                <small>{itemId.eventId.title}</small> <br />
                <b>
                  Lot #{itemId.lotNumber?.toString().padStart(3, "0")} -{" "}
                  {itemId.title}
                </b>
                <br />
                {currencyFormatter.format(amount)} <br />
                <i>{isTopBid ? "You're the Top Bid!" : "Outbid"}</i>
              </div>
            </a>
          )
        }
      })}
      <br />
      <br />

      <h2>Won Items</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && !wonItems.length && <i style={{ color: "grey" }}>None</i>}
      {wonItems.map(({ _id, amount, itemId }) => {
        if (typeof itemId === "object" && typeof itemId.eventId == "object") {
          return (
            <div key={_id} className={"card"}>
              <small>{itemId.eventId.title}</small> <br />
              <b>
                Lot #{itemId.lotNumber?.toString().padStart(3, "0")} -{" "}
                {itemId.title}
              </b>
              <br />
              {currencyFormatter.format(amount)} <br />
            </div>
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
