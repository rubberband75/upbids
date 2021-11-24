import Layout from "../../components/layout"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import {
  Alert,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Typography,
} from "@mui/material"
import PublicIcon from "@mui/icons-material/Public"
import PublicOffIcon from "@mui/icons-material/PublicOff"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import EventBusyIcon from "@mui/icons-material/EventBusy"
import AuctionEventCardSkeleton from "../../components/AuctionEventCardSkeleton"
import AuctionEventCard from "../../components/AuctionEventCard"

export default function MyAuctions() {
  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctions, setAuctions] = useState<Array<any>>([])
  let [sharedEvents, setSharedEvents] = useState<Array<any>>([])

  const getAuctions = () => {
    setErrorMessage("")
    axios
      .get("/api/auctions")
      .then((response) => {
        setAuctions([...response.data.auctionEvents])
        setSharedEvents([...response.data.sharedEvents])
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage(`${error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => getAuctions(), [])

  return (
    <Layout>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        My Auctions
      </Typography>
      <Divider />
      {/* // Error Message */}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {/* // Loaing Skeleton */}
      {loading && <AuctionEventCardSkeleton bannerHeight={140} />}
      {/* // Account Data Form */}
      {!loading && (
        <>
          {!auctions.length && (
            <div>
              <i>You haven't created any auctions</i>
            </div>
          )}

          {auctions.map((auctionEvent) => (
            <Link href={`/auctions/${auctionEvent._id}`} key={auctionEvent._id}>
              <a style={{ textDecoration: "none" }}>
                <AuctionEventCard auctionEvent={auctionEvent} />
              </a>
            </Link>
          ))}
          <Link href="/auctions/new">
            <Button variant="contained" size="large">
              + Create New Auction
            </Button>
          </Link>

          {sharedEvents.length > 0 && (
            <>
              <Typography variant="h4" component="h1" sx={{ mt: 8, mb: 2 }}>
                Shared With Me
              </Typography>
              <Divider />
              {sharedEvents.map((auctionEvent) => (
                <Link
                  href={`/auctions/${auctionEvent._id}`}
                  key={auctionEvent._id}
                >
                  <a style={{ textDecoration: "none" }}>
                    <AuctionEventCard auctionEvent={auctionEvent} />
                  </a>
                </Link>
              ))}
            </>
          )}
        </>
      )}
    </Layout>
  )
}
