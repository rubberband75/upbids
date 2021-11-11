import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"
import AuctionEvent from "../../models/AuctionEvent"

export default function EditItemPage() {
  const router = useRouter()
  const { eventId } = router.query

  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctionEvent, setAuctionEvent] = useState<AuctionEvent>()

  const getAuctionEvent = async () => {
    setLoading(true)
    try {
      let response = await axios.get(`/api/auctions/${eventId}`)
      setAuctionEvent(response.data.auctionEvent)
    } catch (error) {
      console.error({ error })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!router.isReady) return
    getAuctionEvent()
  }, [router.isReady])

  return (
    <Layout>
      <h1>New Item</h1>
      {/* // Error Message */}
      {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
      {/* // Loaing Message */}
      {loading && <p>Loading...</p>}
      {!loading && (
        <>
          <h2>{auctionEvent?.title}</h2>
        </>
      )}
    </Layout>
  )
}
