import Layout from "../../components/layout"
import axios from "axios"
import AuctionItem from "../../models/AuctionItem"
import Bid from "../../models/Bid"
import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import DefaultErrorPage from "next/error"
import {
  Button,
  Divider,
  Input,
  InputAdornment,
  OutlinedInput,
  Skeleton,
  TextField,
} from "@mui/material"
import Link from "next/link"
import { useRouter } from "next/router"

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
        setCurrentBid(response.data.auctionEvent)
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

  const [bidAmount, setBidAmount] = useState(
    !currentBid
      ? auctionItem?.startingBid || 0
      : currentBid.amount + (auctionItem?.minimunIncrement || 0)
  )

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
          <p>
            <Link href={`/${slug}`}>
              <Button variant="text"> {"<-"} All Items</Button>
            </Link>
          </p>
          <div
            style={{
              backgroundImage: `url(${auctionItem.image})`,
              width: "50%",
              margin: "1em",
              marginLeft: "0",
            }}
            className={"bannerImage"}
          ></div>
          <br />
          <br />
          <h1>{auctionItem.title}</h1>
          <h2>Lot #{auctionItem.lotNumber?.toString().padStart(3, "0")}</h2>
          <i>
            Retail Value:{" "}
            {currencyFormatter.format(Number(auctionItem.retailValue))}
          </i>
          <p>{auctionItem.description}</p>
          <br />
          <br />

          <h2>
            {!!currentBid ? (
              <>Current bid: {currencyFormatter.format(currentBid.amount)}</>
            ) : (
              <>
                Starting Bid:{" "}
                {currencyFormatter.format(Number(auctionItem.startingBid))}
              </>
            )}
          </h2>

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
              {session && (
                <>
                  <br />
                  <Button variant="contained" size="large" onClick={placeBid}>
                    Place Bid
                  </Button>
                </>
              )}
              {!session && (
                <>
                  <br />
                  <br />
                  <Link href={`/api/auth/signin`}>
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.preventDefault()
                        signIn()
                      }}
                    >
                      Sign in To Place Bid
                    </Button>
                  </Link>

                  <br />
                  <br />
                  <Divider />

                  <br />
                  <br />
                  <form onSubmit={placeGuestBid}>
                    <fieldset>
                      <legend>Bid Without an account</legend>
                      <p>
                        <label htmlFor="name">
                          <span>Full Name</span>
                        </label>
                        <br />
                        <OutlinedInput
                          type="text"
                          id="name"
                          name="name"
                          value={user.name}
                          onChange={handleChange}
                        />
                      </p>
                      <p>
                        <label htmlFor="email">
                          <span>Email Address</span>
                        </label>
                        <br />
                        <OutlinedInput
                          type="email"
                          id="email"
                          name="email"
                          value={user.email}
                          onChange={handleChange}
                        />
                      </p>
                      <p>
                        <label htmlFor="phone">
                          <span>Phone Number</span>
                        </label>
                        <br />
                        <OutlinedInput
                          type="tel"
                          id="phone"
                          name="phone"
                          value={user.phone}
                          onChange={handleChange}
                        />
                      </p>

                      <Button variant="contained" type="submit">
                        Place Guest Bid
                      </Button>
                    </fieldset>
                  </form>
                </>
              )}
            </>
          )}
        </>
      )}
      {!loading && (notFound || !auctionItem.lotNumber) && (
        <DefaultErrorPage statusCode={404} />
      )}
    </Layout>
  )
}
