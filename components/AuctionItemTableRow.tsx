import { Button, TableCell, TableRow } from "@mui/material"
import AuctionItem from "../models/AuctionItem"
import Link from "next/link"
import { useCallback, useContext, useEffect, useState } from "react"
import Bid from "../models/Bid"
import axios from "axios"
import { SocketContext } from "../sockets/SocketClient"
import User from "../models/user"
import ManualBid from "./ManualBid"
import ItemPaidToggle from "./ItemPaidToggle"

export default function AuctionItemTableRow({
  auctionItem,
}: {
  auctionItem: AuctionItem
}) {
  const socket = useContext(SocketContext)
  const [currentBid, setCurrentBid] = useState<Bid | undefined | null>()
  const [user, setUser] = useState<User | undefined | null>()

  useEffect(() => {
    getCurrentBid()

    socket.emit("join-room", auctionItem._id)
    socket.on("bid-update", handleSocketBidUpdate)
    return () => {
      socket.emit("leave-room", auctionItem._id)
      socket.off("bid-update", handleSocketBidUpdate)
    }
  }, [])

  const getCurrentBid = async () => {
    try {
      let response = await axios.get(
        `/api/items/${auctionItem._id}/current-bid`
      )
      setCurrentBid(response.data.currentBid)
      getUser(response.data.currentBid)
    } catch (error) {
      console.error(error)
    }
  }

  const getUser = async (bid: Bid | null | undefined) => {
    let userId = bid?.userId

    if (userId) {
      let userResponse = await axios.get(`/api/users/${userId}`)
      let userData = userResponse.data
      setUser(userData)
    } else {
      setUser(undefined)
    }
  }

  const handleSocketBidUpdate = useCallback((data: any) => {
    let updatedBid: Bid = data.bid
    if (
      updatedBid &&
      updatedBid.itemId === auctionItem._id &&
      updatedBid.isTopBid
    ) {
      setCurrentBid(updatedBid)
      getUser(updatedBid)
    }
  }, [])

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell align="center" component="th" scope="row">
        {auctionItem.lotNumber}
      </TableCell>
      <TableCell align="left">
        <Link href={`/items/${auctionItem._id}`}>
          <a style={{ textDecoration: "none" }}>
            <Button>{auctionItem.title}</Button>
          </a>
        </Link>
      </TableCell>
      <TableCell align="left">
        <div>
          <b>{user?.name}&nbsp;</b>
          <br />
          {user?.guestEmail || user?.email}&nbsp;
          <br />
          {user?.phone}&nbsp;
        </div>
      </TableCell>
      <TableCell align="right">
        {currentBid?.amount ? currencyFormatter.format(currentBid?.amount) : ""}
      </TableCell>
      <TableCell align="center">
        <ItemPaidToggle bid={currentBid} />
      </TableCell>
      <TableCell align="center">
        <ManualBid auctionItem={auctionItem} currentBid={currentBid} />
      </TableCell>
    </TableRow>
  )
}
