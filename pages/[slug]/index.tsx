import Layout from "../../components/layout"
import axios from "axios"
import AuctionEvent from "../../models/AuctionEvent"
import AuctionItem from "../../models/AuctionItem"
import Link from "next/link"
import Card from "@mui/material/Card"

function Page({
  slug,
  auctionEvent,
  auctionItems,
}: {
  slug: string
  auctionEvent: AuctionEvent
  auctionItems: AuctionItem[]
}) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Layout>
      <div
        style={{ backgroundImage: `url(${auctionEvent.bannerImage})` }}
        className={"bannerImage"}
      ></div>
      <br />
      <br />
      <h1>{auctionEvent.title}</h1>
      <p>{auctionEvent.description}</p>
      <br />
      <h2>Auction Items</h2>
      <hr />
      {auctionItems.map(({ _id, title, image, lotNumber, retailValue }) => (
        <Link key={_id} href={`/${slug}/${lotNumber}`}>
          <a className={"text-decoration-none"}>
            <Card variant="outlined">
              <div
                style={{
                  backgroundImage: `url(${image})`,
                  width: "150px",
                  height: "150px",
                }}
                className={"bannerImage"}
              ></div>

              <p style={{ margin: "0 2em" }}>
                Lot #{lotNumber?.toString().padStart(3, "0")}
                <h2>{title}</h2>
                <span>
                  <small>Retail Value</small>
                  <br />
                  {currencyFormatter.format(Number(retailValue))}
                </span>
              </p>
            </Card>
          </a>
        </Link>
      ))}
    </Layout>
  )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  const { slug } = context.query

  try {
    let response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/auctions/public/${slug}`
    )
    let {
      auctionEvent,
      auctionItems,
    }: { auctionEvent: AuctionEvent; auctionItems: AuctionItem[] } =
      response.data

    return { props: { slug, auctionEvent, auctionItems } }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export default Page
