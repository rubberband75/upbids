import Layout from "../../components/layout"
import axios from "axios"
import AuctionItem from "../../models/AuctionItem"
import Bid from "../../models/Bid"
import { useCallback, useContext, useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import DefaultErrorPage from "next/error"
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  Grid,
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
import { SocketContext } from "../../sockets/SocketClient"
import AuctionEvent from "../../models/AuctionEvent"

export default function LotNumberPage() {
  const socket = useContext(SocketContext)

  const router = useRouter()
  const { slug, lotNumber } = router.query
  const { data: session, status } = useSession()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [itemLoaded, setItemLoaded] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [auctionEvent, setAuctionEvent] = useState<AuctionEvent>()
  const [auctionItem, setAuctionItem] = useState<AuctionItem>()
  const [currentBid, setCurrentBid] = useState<Bid>()
  const [minNextBid, setMinNextBid] = useState(0)
  const [bidAmount, setBidAmount] = useState(0)
  const [verifyingBid, setVerifyingBid] = useState(false)
  const [highestBidder, setHighestBidder] = useState(false)
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Load item when router is ready
  useEffect(() => {
    if (!router.isReady) return
    getItem()
  }, [router.isReady])

  // When item is first loaded, subscribe to socket events for this item
  useEffect(() => {
    if (itemLoaded) {
      socket.emit("join-room", auctionEvent?._id)
      socket.emit("join-room", auctionItem?._id)
      socket.on("event-update", handleSocketEventUpdate)
      socket.on("item-update", handleSocketItemUpdate)
      socket.on("bid-update", handleSocketBidUpdate)
    }
    return () => {
      // When leaving the page, unsubscribe from this item
      socket.emit("leave-room", auctionEvent?._id)
      socket.emit("leave-room", auctionItem?._id)
      socket.off("event-update", handleSocketEventUpdate)
      socket.off("item-update", handleSocketItemUpdate)
      socket.off("bid-update", handleSocketBidUpdate)
    }
  }, [itemLoaded])

  // Reload event when update-event api call happens
  const handleSocketEventUpdate = useCallback((data: any) => {
    setAuctionEvent(data.auctionEvent)
  }, [])

  // Reload item when update-item api call happens
  const handleSocketItemUpdate = useCallback((data: any) => {
    setAuctionItem(data.auctionItem)
  }, [])

  // Reload bid when place-bid api call happens
  const handleSocketBidUpdate = useCallback((data: any) => {
    setCurrentBid(data.bid)
  }, [])

  // Recalculate next-Minimum-Bid when the current bid is updated
  useEffect(() => {
    let minBid = currentBid
      ? currentBid.amount + (auctionItem?.minimunIncrement || 0)
      : auctionItem?.startingBid || 0

    setMinNextBid(minBid)
    setBidAmount(Math.max(minBid, bidAmount))

    setHighestBidder(
      !!(
        currentBid &&
        session &&
        currentBid?.userId.toString() === session?.user?._id?.toString()
      )
    )
  }, [currentBid, session])

  // Load item and current bid from database
  const getItem = () => {
    setErrorMessage("")
    axios
      .get(`/api/auctions/public/${slug}/${lotNumber}`)
      .then((response) => {
        setAuctionEvent(response.data.auctionEvent)
        setAuctionItem(response.data.auctionItem)
        setCurrentBid(response.data.currentBid)

        if (!itemLoaded) setItemLoaded(true)
      })
      .catch((error: any) => {
        console.error({ error })
        if (error.response?.status === 404) setNotFound(true)
        try {
          setErrorMessage(`Error: ${error.response.data.error}`)
        } catch (e) {
          setErrorMessage(`${error}`)
        }
      })
      .finally(() => {
        setLoading(false)
        setVerifyingBid(false)
      })
  }

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setUser({ ...user, [e.currentTarget.name]: e.currentTarget.value })
  }

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const placeBid = async () => {
    setErrorMessage("")
    setVerifyingBid(true)
    try {
      await axios.post("/api/bids/place-bid", {
        itemId: auctionItem?._id,
        amount: bidAmount,
      })
      // getItem()
    } catch (error: any) {
      console.error(error)
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setVerifyingBid(false)
    }
  }

  const placeGuestBid = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    setVerifyingBid(true)
    try {
      await axios.post("/api/bids/place-bid", {
        itemId: auctionItem?._id,
        amount: bidAmount,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
      })
      // window.location.reload()
      getItem()
    } catch (error: any) {
      console.error(error)
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setVerifyingBid(false)
    }
  }

  return (
    <Layout>
      {loading && <Skeleton />}
      {!loading && auctionItem && (
        <>
          <Link href={`/${slug}`}>
            <a style={{ textDecoration: "none" }}>
              <Button variant="text" startIcon={<ArrowBackIcon />}>
                All Items
              </Button>
            </a>
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

          <Divider sx={{ my: 3 }} />

          <Paper elevation={0} sx={{ textAlign: "center" }}>
            <Typography variant="h4" gutterBottom component="div">
              {!!currentBid ? "Current Bid" : "Starting Bid"}
            </Typography>
            <Typography variant="h3" gutterBottom component="div">
              {!!currentBid
                ? currencyFormatter.format(currentBid.amount)
                : currencyFormatter.format(Number(auctionItem.startingBid))}
            </Typography>

            {auctionEvent?.biddingOpen === false ? (
              <i>Bidding Not Open</i>
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
                    inputProps={{
                      step: (auctionItem?.minimunIncrement || 0).toString(),
                      min: minNextBid,
                    }}
                    value={bidAmount || ""}
                    onChange={(e) => {
                      setBidAmount(
                        Number(
                          Number.parseFloat(e.currentTarget.value).toFixed(2)
                        )
                      )
                    }}
                    startAdornment={
                      <InputAdornment position="start">$</InputAdornment>
                    }
                    disabled={verifyingBid || highestBidder}
                  />
                </FormControl>
                {session && (
                  <FormControl fullWidth>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={placeBid}
                      disabled={
                        bidAmount < minNextBid || verifyingBid || highestBidder
                      }
                    >
                      Place Bid
                    </Button>

                    {currentBid &&
                      session &&
                      currentBid?.userId.toString() ===
                        session?.user?._id?.toString() && (
                        <Alert
                          sx={{ mt: 3 }}
                          action={
                            highestBidder && (
                              <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                  setHighestBidder(false)
                                }}
                              >
                                Bid Again?
                              </Button>
                            )
                          }
                        >
                          You are the highest bidder!
                        </Alert>
                      )}
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
                                !user.name ||
                                !user.email ||
                                !user.phone ||
                                bidAmount < minNextBid ||
                                verifyingBid
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

                {/* // Error Message */}
                {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              </>
            )}
          </Paper>
        </>
      )}
      {!loading && notFound && <DefaultErrorPage statusCode={404} />}
    </Layout>
  )
}
