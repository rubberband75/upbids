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
import { useEffect, useState } from "react"
import AuctionEvent from "../../../models/AuctionEvent"
import AuctionItem from "../../../models/AuctionItem"
import AuctionItemTableRow from "../../../components/AuctionItemTableRow"

export default function AuctionDashboard() {
  const router = useRouter()
  const { id } = router.query

  const [auctionEvent, setEvent] = useState<AuctionEvent>()
  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([])

  useEffect(() => {
    if (!router.isReady) return
    getEvent()
  }, [router.isReady])

  const getEvent = async () => {
    let response = await axios.get(`/api/auctions/${id}`)
    setEvent(response.data.auctionEvent)
    setAuctionItems(response.data.auctionItems)
  }

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        sx={{ my: 2, display: "inline-block" }}
      >
        {auctionEvent?.title}
      </Typography>

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
    </>
  )
}
