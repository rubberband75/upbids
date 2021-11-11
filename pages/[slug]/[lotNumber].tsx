import axios from "axios"
import AuctionItem from "../../models/AuctionItem"

function Page({
  slug,
  auctionItem,
}: {
  slug: string
  auctionItem: AuctionItem
}) {
  const minNextBid = (
    (auctionItem.startingBid || 0) + (auctionItem.minimunIncrement || 0)
  ).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  })
  return (
    <>
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
      <h2>Lot #{auctionItem.lotNumber}</h2>
      <i>Retail Value: ${auctionItem.retailValue}</i>
      <p>{auctionItem.description}</p>
      <br />
      <br />

      <h2>Current Bid: ${auctionItem.startingBid}</h2>
      <label htmlFor="bid">
        <small>Minimum Bid: {minNextBid}</small>
      </label>
      <input
        type="text"
        name="bid"
        disabled
        value={parseFloat(minNextBid.substr(1))}
      ></input>

      <button type="button">Place Bid</button>
    </>
  )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const { slug, lotNumber } = context.query

  try {
    let response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/auctions/public/${slug}/${lotNumber}`
    )
    let auctionItem: AuctionItem = response.data
    return { props: { slug, auctionItem } }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export default Page
