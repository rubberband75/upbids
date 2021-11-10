import Layout from "../components/layout"
import React, { useEffect, useState } from "react"
import axios from "axios"
import Link from "next/link"

export default function MyAuctions() {
  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctions, setAuctions] = useState<Array<any>>([])

  const getAuctions = () => {
    setErrorMessage("")
    axios
      .get("/api/auctions/public")
      .then((response) => {
        setAuctions([...response.data])
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage(`${error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => getAuctions(), [])

  return (
    <Layout>
      <h1>Discover Public Auctions</h1>
      {/* // Error Message */}
      {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
      {/* // Loaing Message */}
      {loading && <p>Loading...</p>}
      {/* // Account Data Form */}
      {!loading && (
        <>
          {!auctions.length && (
            <div>
              <i>There are currently no public auctions</i>
            </div>
          )}

          <ul>
            {auctions.map(({ slug, title }) => (
              <li key={slug}>
                {/* <Link href={}> */}
                <a href={`/${slug}`}>{title}</a>
                {/* </Link> */}
              </li>
            ))}
          </ul>
        </>
      )}
    </Layout>
  )
}
