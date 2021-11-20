import Layout from "../../components/layout"
import axios from "axios"
import AuctionEvent from "../../models/AuctionEvent"
import AuctionItem from "../../models/AuctionItem"
import Link from "next/link"
import Card from "@mui/material/Card"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import DefaultErrorPage from "next/error"
import {
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material"
import AuctionItemCard from "../../components/AuctionItemCard"

export default function AuctionPage() {
  const router = useRouter()
  const { slug } = router.query

  let [loading, setLoading] = useState(true)
  let [notFound, setNotFound] = useState(false)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctionEvent, setAuctionEvent] = useState<AuctionEvent>(
    new AuctionEvent()
  )
  let [auctionItems, setAuctionItems] = useState<AuctionItem[]>([])

  useEffect(() => {
    if (!router.isReady) return
    getEvent()
  }, [router.isReady])

  const getEvent = () => {
    setLoading(true)
    setErrorMessage("")
    setNotFound(false)
    axios
      .get(`/api/auctions/public/${slug}`)
      .then((response) => {
        setAuctionEvent(response.data.auctionEvent)
        setAuctionItems(response.data.auctionItems)
      })
      .catch((error: any) => {
        console.error({ error })
        if (error.response?.status === 404) setNotFound(true)
        setErrorMessage(`${error.response.data.error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <Layout>
      {loading && <Skeleton />}
      {!loading && !errorMessage && (
        <>
          <Card sx={{ my: 2 }}>
            <CardMedia
              component="img"
              height="200"
              image={auctionEvent.bannerImage}
              alt="Event Banner Image"
            />
          </Card>
          <Typography variant="h3" component="h1">
            {auctionEvent.title}
          </Typography>
          <Paper elevation={0} sx={{ my: 3, backgroundColor: "#f8f8f8" }}>
            <CardContent>
              <Typography>{auctionEvent.description}</Typography>
            </CardContent>
          </Paper>

          <Typography variant="h4" component="h2">
            Auction Items
          </Typography>
          <Divider />
          {auctionItems.map((auctionItem: AuctionItem) => (
            <Link
              href={`/${slug}/${auctionItem.lotNumber}`}
              key={auctionItem._id}
            >
              <a style={{ textDecoration: "none" }}>
                <AuctionItemCard
                  auctionItem={auctionItem}
                  key={auctionItem._id}
                />
              </a>
            </Link>
          ))}
        </>
      )}
      {(notFound || !auctionEvent) && <DefaultErrorPage statusCode={404} />}
    </Layout>
  )
}
