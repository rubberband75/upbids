import Layout from '../components/layout'

export default function Page () {
  return (
    <Layout>
      <h1>UpBids</h1>
      <p>
        Secured using <a href={`https://next-auth.js.org`}>NextAuth.js</a> for authentication.
      </p>
    </Layout>
  )
}