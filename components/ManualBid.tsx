import { useEffect, useState } from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import AuctionItem from "../models/AuctionItem"
import Bid from "../models/Bid"
import { Alert, Divider, InputAdornment, OutlinedInput } from "@mui/material"
import axios from "axios"

export default function FormDialog({
  auctionItem,
  currentBid,
}: {
  auctionItem: AuctionItem
  currentBid?: Bid | null | undefined
}) {
  const [open, setOpen] = useState(false)
  const [minNextBid, setMinNextBid] = useState(0)
  const [bidAmount, setBidAmount] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [verifyingBid, setVerifyingBid] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    let minBid = currentBid
      ? currentBid.amount + (auctionItem?.minimunIncrement || 0)
      : auctionItem?.startingBid || 0

    setMinNextBid(minBid)
    setBidAmount(Math.max(minBid, bidAmount))
  }, [currentBid])

  const createBid = async () => {
    setErrorMessage("")
    setVerifyingBid(true)
    try {
      await axios.post("/api/bids/place-bid", {
        itemId: auctionItem?._id,
        amount: bidAmount,
        fullName: name,
        email: email,
        phone: phone,
      })
      handleClose()
    } catch (error: any) {
      console.error(error)
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setVerifyingBid(false)
    }
  }

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Add Bid
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Bid</DialogTitle>
        <DialogContent sx={{ minWidth: "500px" }}>
          <DialogContentText>{auctionItem.title}</DialogContentText>
          <OutlinedInput
            fullWidth
            id="bid"
            type="number"
            name="bid"
            inputProps={{
              step: (auctionItem?.minimunIncrement || 0.01).toString(),
              min: minNextBid,
            }}
            value={bidAmount || ""}
            onChange={(e) => {
              setBidAmount(
                Number(Number.parseFloat(e.currentTarget.value).toFixed(2))
              )
            }}
            startAdornment={<InputAdornment position="start">$</InputAdornment>}
            disabled={verifyingBid}
          />

          <Divider sx={{ my: 3 }} />

          <TextField
            label="Full Name"
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value)
            }}
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value)
            }}
            fullWidth
            sx={{ my: 1 }}
          />

          <TextField
            label="Phone"
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => {
              setPhone(e.currentTarget.value)
            }}
            fullWidth
          />

          {errorMessage && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {errorMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={verifyingBid}>
            Cancel
          </Button>
          <Button onClick={createBid} disabled={verifyingBid}>
            Place Bid
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
