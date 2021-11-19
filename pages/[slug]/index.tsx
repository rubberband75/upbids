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

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

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
          {auctionItems.map(
            ({ _id, title, image, lotNumber, retailValue, startingBid }) => (
              <Card variant="outlined" sx={{ my: 3 }} key={_id}>
                <Link href={`/${slug}/${lotNumber}`}>
                  <CardActionArea>
                    <Grid container spacing={0}>
                      <Grid item xs={4}>
                        <CardMedia
                          image={image}
                          sx={{
                            backgroundImage: `url(${image})`,
                            width: "100%",
                            height: "100%",
                          }}
                        />
                      </Grid>

                      <Grid item xs={8}>
                        <CardContent>
                          <Typography variant="overline" component="span">
                            Lot #{lotNumber?.toString().padStart(3, "0")}
                          </Typography>
                          <Typography variant="h5" component="h3">
                            {title}
                          </Typography>
                          <span>
                            <small>Retail Value</small>
                            <br />
                            {currencyFormatter.format(Number(retailValue))}
                          </span>
                        </CardContent>
                      </Grid>
                    </Grid>
                  </CardActionArea>
                </Link>
                {/* <Divider />
                <CardActions>
                  <Typography variant="h5" component="span">
                    Starting Bid:{" "}
                    {currencyFormatter.format(Number(startingBid))}
                  </Typography>
                </CardActions> */}
              </Card>
            )
          )}
        </>
      )}
      {(notFound || !auctionEvent) && <DefaultErrorPage statusCode={404} />}
    </Layout>
  )
}
