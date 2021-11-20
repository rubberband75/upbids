import Layout from "../../components/layout"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"
import {
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

export default function MyAuctions() {
  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctions, setAuctions] = useState<Array<any>>([])

  const getAuctions = () => {
    setErrorMessage("")
    axios
      .get("/api/auctions")
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
        My Auctions
      </Typography>
      <Divider />
      {/* // Error Message */}
      {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
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
              <Card sx={{ my: 4 }}>
                <CardActionArea>
                  {auctionEvent.bannerImage && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={auctionEvent.bannerImage}
                    />
                  )}
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {auctionEvent.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="div"
                      sx={{
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {auctionEvent.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Typography variant="body2">
                      {auctionEvent.published ? (
                        <Chip
                          icon={<PublicIcon />}
                          label="Published"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<PublicOffIcon />}
                          label="Unpublished"
                          variant="outlined"
                        />
                      )}{" "}
                      {auctionEvent.biddingOpen ? (
                        <Chip
                          icon={<EventAvailableIcon />}
                          label="Bidding Open"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<EventBusyIcon />}
                          label="Bidding Closed"
                          variant="outlined"
                        />
                      )}
                    </Typography>
                  </CardActions>
                </CardActionArea>
              </Card>
            </Link>
          ))}
          <Link href="/auctions/new">
            <Button variant="contained" size="large">
              + Create New Auction
            </Button>
          </Link>
        </>
      )}
    </Layout>
  )
}
