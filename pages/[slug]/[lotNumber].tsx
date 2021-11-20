import Layout from "../../components/layout"
import axios from "axios"
import AuctionItem from "../../models/AuctionItem"
import Bid from "../../models/Bid"
import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import DefaultErrorPage from "next/error"
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  OutlinedInput,
  Paper,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/router"
import SquareImage from "../../components/SquareImage"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

export default function LotNumberPage() {
  const router = useRouter()
  const { slug, lotNumber } = router.query
  const { data: session, status } = useSession()

  useEffect(() => {
    if (!router.isReady) return
    getItem()
  }, [router.isReady])

  let [loading, setLoading] = useState(true)
  let [notFound, setNotFound] = useState(false)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctionItem, setAuctionItem] = useState<AuctionItem>(new AuctionItem())
  let [currentBid, setCurrentBid] = useState<Bid>()
  let [bidAmount, setBidAmount] = useState(0)

  let [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const getItem = () => {
    setLoading(true)
    setErrorMessage("")
    setNotFound(false)
    axios
      .get(`/api/auctions/public/${slug}/${lotNumber}`)
      .then((response) => {
        setAuctionItem(response.data.auctionItem)
        setCurrentBid(response.data.currentBid)

        setBidAmount(
          !currentBid
            ? auctionItem?.startingBid || 0
            : currentBid.amount + (auctionItem?.minimunIncrement || 0)
        )
        console.log({ bidAmount })
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

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setUser({ ...user, [e.currentTarget.name]: e.currentTarget.value })
  }

  const minNextBid = !currentBid
    ? auctionItem?.startingBid || 0
    : currentBid.amount + (auctionItem?.minimunIncrement || 0)

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const placeBid = async () => {
    try {
      await axios.post("/api/bids/place-bid", {
        itemId: auctionItem?._id,
        amount: bidAmount,
      })
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  const placeGuestBid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post("/api/bids/place-bid", {
        itemId: auctionItem?._id,
        amount: bidAmount,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
      })
      window.location.reload()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      {loading && <Skeleton />}
      {!loading && !!auctionItem.lotNumber && (
        <>
          <Link href={`/${slug}`}>
            <Button sx={{ my: 0 }} variant="text" startIcon={<ArrowBackIcon />}>
              All Items
            </Button>
          </Link>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <SquareImage image={auctionItem.image} size={125} rounded />
            </Grid>
            <Grid item xs>
              <Typography variant="overline" component="span">
                Lot #{auctionItem.lotNumber?.toString().padStart(3, "0")}
              </Typography>
              <Typography variant="h5" gutterBottom component="h1">
                {auctionItem.title}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body1" component="p">
                {auctionItem.description}
              </Typography>
              <br />
              <Typography
                variant="subtitle1"
                component="p"
                color="text.secondary"
              >
                <i>
                  Retail Value:{" "}
                  {currencyFormatter.format(Number(auctionItem.retailValue))}
                </i>
              </Typography>
            </Grid>
          </Grid>

          <br />
          <Divider />
          <br />

          <Paper elevation={0} sx={{ textAlign: "center" }}>
            <Typography variant="h4" gutterBottom component="div">
              {!!currentBid ? "Current Bid" : "Starting Bid"}
            </Typography>
            <Typography variant="h3" gutterBottom component="div">
              {!!currentBid
                ? currencyFormatter.format(currentBid.amount)
                : currencyFormatter.format(Number(auctionItem.startingBid))}
            </Typography>

            {typeof auctionItem.eventId === "object" &&
            !auctionItem.eventId.biddingOpen ? (
              <i>Bidding Not Yet Open</i>
            ) : (
              <>
                <label htmlFor="bid">
                  <small>
                    Minimum Bid: {currencyFormatter.format(Number(minNextBid))}
                  </small>
                </label>
                <br />
                <FormControl fullWidth sx={{ my: 2 }}>
                  <OutlinedInput
                    id="bid"
                    type="number"
                    name="bid"
                    value={bidAmount}
                    onChange={(e) => {
                      setBidAmount(Number(e.currentTarget.value))
                    }}
                    // step="0.01"
                    // placeholder="0.00"
                    // min={minNextBid.toFixed(2)}
                    startAdornment={
                      <InputAdornment position="start">$</InputAdornment>
                    }
                  />
                </FormControl>
                {session && (
                  <FormControl fullWidth>
                    <Button variant="contained" size="large" onClick={placeBid}>
                      Place Bid
                    </Button>
                  </FormControl>
                )}
                {!session && (
                  <>
                    <FormControl fullWidth>
                      <Link href={`/api/auth/signin`}>
                        <Button
                          variant="outlined"
                          size="large"
                          onClick={(e) => {
                            e.preventDefault()
                            signIn()
                          }}
                        >
                          Sign in To Place Bid
                        </Button>
                      </Link>
                    </FormControl>

                    <Divider sx={{ my: 3 }} />

                    <form onSubmit={placeGuestBid}>
                      <Card sx={{ textAlign: "left" }}>
                        <CardContent>
                          <Typography
                            variant="h6"
                            color="text.secondary"
                            gutterBottom
                          >
                            Bid As Guest
                          </Typography>
                          <FormControl fullWidth sx={{ my: 2 }}>
                            <TextField
                              label="Full Name"
                              type="text"
                              id="name"
                              name="name"
                              value={user.name}
                              onChange={handleChange}
                            />
                          </FormControl>
                          <FormControl fullWidth sx={{ my: 2 }}>
                            <TextField
                              label="Email"
                              type="email"
                              id="email"
                              name="email"
                              value={user.email}
                              onChange={handleChange}
                            />
                          </FormControl>
                          <FormControl fullWidth sx={{ my: 2 }}>
                            <TextField
                              label="Phone"
                              type="tel"
                              id="phone"
                              name="phone"
                              value={user.phone}
                              onChange={handleChange}
                            />
                          </FormControl>
                        </CardContent>
                        <CardActions>
                          <FormControl fullWidth>
                            <Button
                              variant="contained"
                              size="large"
                              type="submit"
                              disabled={
                                !user.name || !user.email || !user.phone
                              }
                            >
                              Place Bid
                            </Button>
                          </FormControl>
                        </CardActions>
                      </Card>
                    </form>
                  </>
                )}
              </>
            )}
          </Paper>
        </>
      )}
      {!loading && (notFound || !auctionItem.lotNumber) && (
        <DefaultErrorPage statusCode={404} />
      )}
    </Layout>
  )
}
