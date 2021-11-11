import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"

export default function EditItemPage() {
  const router = useRouter()
  const { id } = router.query

  let [loading, setLoading] = useState(true)
  let [auctionItem, setAuctionItem] = useState<AuctionItem>()

  const getAuctionItem = async () => {
    setLoading(true)
    try {
      let response = await axios.get(`/api/items/${id}`)
      setAuctionItem(response.data.auctionItem)
    } catch (error) {
      console.error({ error })
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    if (!router.isReady) return
    getAuctionItem()
  }, [router.isReady])

  return (
    <Layout>
      <h1>Edit Item</h1>
      <p>Id: {id}</p>
      <h2>{auctionItem?.title}</h2>
    </Layout>
  )
}
