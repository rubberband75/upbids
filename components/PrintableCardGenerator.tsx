import { useEffect, useState } from "react"
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import AuctionEvent from "../models/AuctionEvent"
import AuctionItem from "../models/AuctionItem"
import {
  Alert,
  Card,
  CardContent,
  CardMedia,
  Divider,
  InputAdornment,
  LinearProgress,
  OutlinedInput,
  Typography,
} from "@mui/material"
import axios from "axios"
import { Box } from "@mui/system"
import { useRouter } from "next/router"

export default function PrintableCardGenerator({
  auctionEvent,
  auctionItems,
}: {
  auctionEvent?: AuctionEvent
  auctionItems?: AuctionItem[]
}) {
  const [open, setOpen] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")

  let [loading, setLoading] = useState(false)
  let [errorMessage, setErrorMessage] = useState("")

  const handleClickOpen = () => {
    setOpen(true)
    setErrorMessage("")
  }

  const handleClose = () => {
    setOpen(false)
    setLoading(false)
  }

  const loadPDF = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      let response = await axios.get(
        `/api/auctions/${auctionEvent?._id}/printable-cards`
      )
      const link = document.createElement("a")
      link.href = response.data.url
      link.setAttribute("download", `${auctionEvent?.title}.pdf`) //or any other extension
      document.body.appendChild(link)
      link.click()
      setTimeout(function () {
        document.body.removeChild(link)
      }, 200)
    } catch (error: any) {
      try {
        setErrorMessage(`${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="text" onClick={handleClickOpen}>
        Printable Cards
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Generate Printable Item Cards</DialogTitle>
        <DialogContent sx={{ minWidth: "500px" }}>
          <DialogContentText>Preview:</DialogContentText>
          <Card elevation={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                aspectRatio: "8.5/5.5",
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: "14em",
                  height: "5em",
                  mx: "auto",
                }}
                image={previewImage || auctionEvent?.bannerImage}
              />
              {auctionItems && auctionItems.length >= 1 && (
                <>
                  <Box display="flex" flexDirection="row" sx={{ mt: 1 }}>
                    <img
                      src={`/api/items/${auctionItems[0]._id}/qr`}
                      style={{ width: "13em", height: "13em" }}
                    />
                    <Box sx={{ mt: 3 }}>
                      <Typography display="block" gutterBottom>
                        LOT #
                        {auctionItems[0].lotNumber?.toString().padStart(3, "0")}
                      </Typography>
                      <Typography
                        display="block"
                        gutterBottom
                        sx={{ fontSize: "21pt", lineHeight: "1" }}
                      >
                        {auctionItems[0].title}
                      </Typography>
                      <Typography
                        display="block"
                        gutterBottom
                        sx={{ fontSize: "15pt", lineHeight: "1.4" }}
                      >
                        Retail Value: ${auctionItems[0].retailValue?.toFixed(2)}
                        <br />
                        Starting Bid: ${auctionItems[0].startingBid?.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    display="block"
                    sx={{ ml: 2, mt: 1, fontSize: "10pt" }}
                  >
                    {`${window.origin}/${auctionEvent?.slug}/${auctionItems[0].lotNumber}`}
                  </Typography>
                </>
              )}
            </Box>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={loadPDF} disabled={loading}>
            Create PDF
          </Button>
        </DialogActions>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        {loading && <LinearProgress />}
      </Dialog>
    </div>
  )
}
