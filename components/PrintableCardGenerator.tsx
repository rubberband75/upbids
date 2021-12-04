import { useEffect, useRef, useState } from "react"
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
  const [noImage, setNoImage] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const handleClickOpen = () => {
    setOpen(true)
    setErrorMessage("")
    resetImage()
  }

  const handleClose = () => {
    setOpen(false)
  }

  const loadPDF = async () => {
    setLoading(true)
    setErrorMessage("")
    try {
      const formData = new FormData()
      formData.append("noImage", noImage.toString())
      if (selectedFile && !noImage) {
        formData.append("bannerImage", selectedFile)
      }

      let response = await axios.post(
        `/api/auctions/${auctionEvent?._id}/printable-cards`,
        formData
      )
      const link = document.createElement("a")
      link.href = response.data.url

      link.setAttribute("download", `${auctionEvent?.title}.pdf`) //or any other extension
      document.body.appendChild(link)
      link.click()
      handleClose()
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

  const updateImage = (e: React.FormEvent<HTMLInputElement>): void => {
    resetImage()
    let fileList: FileList | null = (e.target as HTMLInputElement).files
    if (fileList && fileList[0]) {
      let file = fileList[0]
      setSelectedFile(file)

      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (r) => {
        let loadedImage = r.target?.result || ""
        setPreviewImage(`${loadedImage}`)
      }
    }
  }

  const removeImage = () => {
    setNoImage(true)
  }

  const resetImage = () => {
    setSelectedFile(null)
    setPreviewImage("")
    setNoImage(false)
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
                aspectRatio: "510/330",
                p: 1,
              }}
            >
              <div
                style={{ display: "block", height: "5em", margin: "0 auto" }}
              >
                {(previewImage || auctionEvent?.bannerImage) && !noImage && (
                  <img
                    src={previewImage || auctionEvent?.bannerImage}
                    style={{ height: "4.5em" }}
                  />
                )}
              </div>
              {auctionItems && auctionItems.length >= 1 && (
                <>
                  <Box display="flex" flexDirection="row" sx={{ mt: 0 }}>
                    <img
                      src={`/api/items/${auctionItems[0]._id}/qr`}
                      style={{ width: "12em", height: "12em" }}
                    />
                    <Box sx={{ mt: 2 }}>
                      <Typography display="block" gutterBottom>
                        LOT #
                        {auctionItems[0].lotNumber?.toString().padStart(3, "0")}
                      </Typography>
                      <Typography
                        display="block"
                        gutterBottom
                        sx={{ fontSize: "21pt", lineHeight: "1", my: 1.5 }}
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
                    sx={{ ml: 2, my: 1, fontSize: "10pt" }}
                  >
                    {`${window.origin}/${auctionEvent?.slug}/${auctionItems[0].lotNumber}`}
                  </Typography>
                </>
              )}
            </Box>
          </Card>

          <Box sx={{ my: 1 }}>
            <input
              hidden
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={updateImage}
            />
            <Button
              variant="outlined"
              onClick={() => imageInputRef.current.click()}
            >
              Change Image
            </Button>
            <Button onClick={removeImage}>Remove Image</Button>
          </Box>
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
