import Layout from "../../components/layout"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"

export default function MyAuctions() {
  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctions, setAuctions] = useState<Array<any>>([])

  const getAuctions = () => {
    setErrorMessage("")
    axios
      .get("/api/auctions")
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
      <h1>My Auctions</h1>
      {/* // Error Message */}
      {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
      {/* // Loaing Message */}
      {loading && <p>Loading...</p>}
      {/* // Account Data Form */}
      {!loading && (
        <>
          {!auctions.length && <div><i>You haven't created any auctions</i></div>}

          <ul>
            {auctions.map(({ _id, title }) => (
              <li key={_id}>
                <Link href={`/auctions/${_id}`}>
                  <a>{title}</a>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/auctions/new">
            <button type="button">+ Create New Auction</button>
          </Link>
        </>
      )}
    </Layout>
  )
}
