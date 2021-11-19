import Layout from "../../components/layout"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Typography,
} from "@mui/material"

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
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        My Auctions
      </Typography>
      <Divider />
      {/* // Error Message */}
      {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
      {/* // Loaing Message */}
      {loading && <p>Loading...</p>}
      {/* // Account Data Form */}
      {!loading && (
        <>
          {!auctions.length && (
            <div>
              <i>You haven't created any auctions</i>
            </div>
          )}

          {auctions.map(({ _id, title }) => (
            <Link href={`/auctions/${_id}`} key={_id}>
              <Card sx={{ my: 2 }}>
                <CardActionArea>
                  <CardContent>
                    <Typography variant="h5" component="span" sx={{ my: 2 }}>
                      {title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          ))}
          <Link href="/auctions/new">
            <Button variant="contained" size="large">
              + Create New Auction
            </Button>
          </Link>
        </>
      )}
    </Layout>
  )
}
