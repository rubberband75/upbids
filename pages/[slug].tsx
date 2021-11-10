import axios from "axios"

function Page({ data }: { data: any }) {
  return (
    <>
      <div
        style={{ backgroundImage: `url(${data.bannerImage})` }}
        className={"bannerImage"}
      ></div>
      <br />
      <br />
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </>
  )
}

// This gets called on every request
export async function getServerSideProps(context: any) {
  // Fetch data from external API
  // const res = await fetch(`https://dev.upbids.net/api/auctions/public/platleg2`)
  // const data = await res.json()

  const { slug } = context.query

  console.log("loading slug: ", slug)

  try {
    let response = await axios.get(
      `${process.env.NEXTAUTH_URL}/api/auctions/public/${slug}`
    )
    let data = response.data
    return { props: { data } }
  } catch (error) {
    return {
      notFound: true,
    }
  }
}

export default Page
