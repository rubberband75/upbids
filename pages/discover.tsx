import Layout from "../components/layout"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import {
  Alert,
  Avatar,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material"
import AuctionEvent from "../models/AuctionEvent"
import AuctionEventCardSkeleton from "../components/AuctionEventCardSkeleton"

export default function DiscoverPage() {
  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctions, setAuctions] = useState<AuctionEvent[]>([])

  const getAuctions = () => {
    setErrorMessage("")
    axios
      .get("/api/auctions/public")
      .then((response) => {
        setAuctions([...response.data])
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
        Discover Public Auctions
      </Typography>
      <Divider />
      {/* // Error Message */}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {/* // Loaing Message */}
      {loading && <AuctionEventCardSkeleton />}
      {/* // Account Data Form */}
      {!loading && (
        <>
          {!auctions.length && (
            <Alert severity="info">
              There are currently no public auctions
            </Alert>
          )}

          {auctions.map((auction: AuctionEvent) => (
            <Link href={`/${auction.slug}`} key={auction._id}>
              <a style={{ textDecoration: "none" }}>
                <Card sx={{ my: 4 }}>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="175"
                      image={auction.bannerImage}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {auction.title}
                        {"\t"}
                        {auction.biddingOpen && (
                          <Chip
                            label="Bidding Open"
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {auction.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </a>
            </Link>
          ))}
        </>
      )}
    </Layout>
  )
}
