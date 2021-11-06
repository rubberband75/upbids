import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { getSession } from "next-auth/react"
import Layout from "../../components/layout"

export default function AccountIndex({
  session,
  name,
  image,
}: {
  session: Session
  name: string
  image: string
}) {
  return (
    <Layout>
      <h1>My Account</h1>
      <hr />
      <h2>{name}</h2>
      <img src={image} />
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<{
  session: Session | null
  name: string
  image: string
}> = async (context) => {
  const session = await getSession(context)
  console.log({ session })

  return {
    props: {
      session: session,
      name: session?.user?.name || "",
      image: session?.user?.image || "",
    },
  }
}
