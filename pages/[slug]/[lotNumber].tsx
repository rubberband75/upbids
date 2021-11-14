import Layout from "../../components/layout"
import axios from "axios"
import AuctionItem from "../../models/AuctionItem"
import Bid from "../../models/Bid"
import { useState } from "react"

function LotNumberPage({
  slug,
  auctionItem,
  currentBid,
}: {
  slug: string
  auctionItem: AuctionItem
  currentBid: Bid
}) {
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
      console.log("Placing Bid:", {
        itemId: auctionItem?._id,
        amount: bidAmount,
      })
      let response = await axios.post("/api/bids/place-bid", {
        itemId: auctionItem?._id,
        amount: bidAmount,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Layout>
      <p>
        <a href={`/${slug}`}> {"<-"} All Items</a>
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
      <label htmlFor="bid">
        <small>
          Minimum Bid: {currencyFormatter.format(Number(minNextBid))}
        </small>
      </label>
      <br />
      <input
        type="number"
        name="bid"
        value={bidAmount.toFixed(2)}
        onChange={(e) => {
          setBidAmount(Number(e.currentTarget.value))
        }}
        step="0.01"
        placeholder="0.00"
        min={minNextBid.toFixed(2)}
      ></input>

      <button type="button" onClick={placeBid}>
        Place Bid
      </button>
    </Layout>
  )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const { slug, lotNumber } = context.query

  try {
    let response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/auctions/public/${slug}/${lotNumber}`
    )
    let auctionItem: AuctionItem = response.data.auctionItem
    let currentBid: Bid = response.data.currentBid
    return { props: { slug, auctionItem, currentBid } }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export default LotNumberPage
