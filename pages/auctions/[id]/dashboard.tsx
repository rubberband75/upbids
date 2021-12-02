import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import axios from "axios"
import { useRouter } from "next/router"
import { useCallback, useContext, useEffect, useState } from "react"
import AuctionEvent from "../../../models/AuctionEvent"
import AuctionItem from "../../../models/AuctionItem"
import AuctionItemTableRow from "../../../components/AuctionItemTableRow"
import Layout from "../../../components/layout"
import { Box } from "@mui/system"
import { SocketContext } from "../../../sockets/SocketClient"
import Link from "next/link"

export default function AuctionDashboard() {
  const socket = useContext(SocketContext)
  const router = useRouter()
  const { id } = router.query

  const [auctionEvent, setEvent] = useState<AuctionEvent>()
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([])

  const [totalBid, setTotalBid] = useState(0)
  const [totalPaid, setTotalPaid] = useState(0)

  useEffect(() => {
    if (!router.isReady) return
    getEvent()
    getMetrics()
  }, [router.isReady])

  const getEvent = async () => {
    try {
      let response = await axios.get(`/api/auctions/${id}`)
      setEvent(response.data.auctionEvent)
      setAuctionItems(response.data.auctionItems)
    } catch (e) {}
  }

  const getMetrics = async () => {
    try {
      let response = await axios.get(`/api/auctions/${id}/metrics`)
      setTotalBid(response.data.totalBid)
      setTotalPaid(response.data.totalPaid)
    } catch (e) {}
  }

  useEffect(() => {
    socket.on("event-update", handleSocketUpdate)
    socket.on("item-update", handleSocketUpdate)
    socket.on("bid-update", handleSocketUpdate)

    return () => {
      socket.off("event-update", handleSocketUpdate)
      socket.off("item-update", handleSocketUpdate)
      socket.off("bid-update", handleSocketUpdate)
    }
  }, [])

  const handleSocketUpdate = useCallback((data: any) => {
    console.log(data)
    getMetrics()
    getEvent()
  }, [])

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Layout fullWidth>
      <Box sx={{ m: 2, display: "flex", flexDirection: "column" }}>
        <Link href={`/auctions/${id}`}>
          <a style={{ textDecoration: "none", color: "unset" }}>
            <Typography variant="h3" component="h1">
              {auctionEvent?.title}
            </Typography>
          </a>
        </Link>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <Box sx={{ m: 2, mr: 6, display: "flex", flexDirection: "column" }}>
            Total Bid:
            <Typography variant="h4" component="h2">
              {currencyFormatter.format(totalBid)}
            </Typography>
          </Box>
          <Box
            sx={{
              m: 2,
              display: "flex",
              flexDirection: "column",
              color: "#666666",
            }}
          >
            Total Paid:
            <Typography variant="h6" component="h2">
              {currencyFormatter.format(totalPaid)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Lot</TableCell>
              <TableCell align="left">Item</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="center">Paid</TableCell>
              <TableCell align="center">Add Bid</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {auctionItems.map((auctionItem) => (
              <AuctionItemTableRow
                auctionItem={auctionItem}
                key={auctionItem._id}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  )
}
