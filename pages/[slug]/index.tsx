import axios from "axios"
import AuctionEvent from "../../models/AuctionEvent"
import AuctionItem from "../../models/AuctionItem"
import Link from "next/link"

function Page({
  slug,
  auctionEvent,
  auctionItems,
}: {
  slug: string
  auctionEvent: AuctionEvent
  auctionItems: AuctionItem[]
}) {
  return (
    <>
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
      <ul>
        {auctionItems.map(({ _id, title, lotNumber }) => (
          <li key={_id}>
            <Link href={`/${slug}/${lotNumber}`}>
              <a>
                #{lotNumber} - {title}
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </>
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
