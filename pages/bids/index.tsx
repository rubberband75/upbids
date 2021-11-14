import Layout from "../../components/layout"
import React, { useEffect, useState, useRef } from "react"
import Bid from "../../models/Bid"
import AuctionItem from "../../models/AuctionItem"
import AuctionEvent from "../../models/AuctionEvent"
import axios from "axios"

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

  var currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  })

  return (
    <Layout>
      <h1>My Bids</h1>

      <h2>Active Bids</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && activeBids === [] && <i style={{ color: "grey" }}>None</i>}
      {activeBids.map(({ amount, isTopBid, itemId }) => {
        if (typeof itemId === "object" && typeof itemId.eventId == "object") {
          return (
            <a href={`/${itemId.eventId.slug}/${itemId.lotNumber}`}>
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

      <h2>Won Item</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && wonItems === [] && <i style={{ color: "grey" }}>None</i>}
      <br />
      <br />

      <h2>Bid History</h2>
      <hr />
      {loading && <i style={{ color: "grey" }}>Loading...</i>}
      {!loading && bidHistory === [] && <i style={{ color: "grey" }}>None</i>}
      <br />
      <br />
    </Layout>
  )
}
