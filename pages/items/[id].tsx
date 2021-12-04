import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"
import AuctionEvent from "../../models/AuctionEvent"
import Bid from "../../models/Bid"
import LaunchIcon from "@mui/icons-material/Launch"
import { Box } from "@mui/system"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Card from "@mui/material/Card"
import {
  Alert,
  Button,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import DownloadIcon from "@mui/icons-material/Download"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import SquareImage from "../../components/SquareImage"
import { signIn } from "next-auth/react"

export default function EditItemPage() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const router = useRouter()
  const { id } = router.query

  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [auctionItem, setAuctionItem] = useState<AuctionItem>()
  let [auctionEvent, setAuctionEvent] = useState<AuctionEvent>()
  let [bids, setBids] = useState<Bid[]>([])

  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")
  const [dataModified, setDataModified] = useState(false)
  const [QRHash, setQRHash] = useState(0)

  const getAuctionItem = async () => {
    // setLoading(true)
    setErrorMessage("")
    try {
      let response = await axios.get(`/api/items/${id}`)
      setAuctionItem(response.data.auctionItem)
      setAuctionEvent(response.data.auctionItem.eventId)

      setDataModified(false)
      setQRHash(auctionItem?.lotNumber || 0)
    } catch (error: any) {
      if (error?.response?.status == 403) signIn()
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadBids = async () => {
    try {
      let response = await axios.get(`/api/items/${id}/bids`)
      setBids(response.data.bids)
    } catch (error) {
      console.error("Error Laoding Bids:", error)
    }
  }

  const togglePaid = async (
    index: number,
    bidId: string,
    currentStatus: Boolean
  ) => {
    if (bids && bids.length) {
      let upadatedBids = [...bids]
      upadatedBids[index].paid = !currentStatus
      setBids(upadatedBids)
    }

    try {
      await axios.patch(`/api/bids/${bidId}`, { paid: !currentStatus })
    } catch (error) {}
  }

  const removeBid = async (bidId: string) => {
    if (bids && bids.length) {
      let filteredBids = [...bids].filter(({ _id }) => _id != bidId)
      setBids(filteredBids)
    }

    try {
      await axios.delete(`/api/bids/${bidId}`)
    } catch (error) {}
  }

  useEffect(() => {
    if (!router.isReady) return
    getAuctionItem()
    loadBids()
  }, [router.isReady])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    try {
      // Iterate through keys in auctionItem and dd them to a formData object
      const formData = new FormData()
      let itemData: any = { ...auctionItem }
      delete itemData.eventId
      for (const key in itemData) {
        if (itemData[key] !== null && itemData[key] !== undefined)
          formData.append(key, itemData[key].toString())
      }

      //   If new file attached, add File
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      // Send PATCH request
      let response = await axios.patch(`/api/items/${id}`, formData)
      setAuctionItem(response.data.auctionItem)

      resetImage()
      setDataModified(false)
      setQRHash(auctionItem?.lotNumber || 0)
    } catch (error: any) {
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    let item: any = { ...auctionItem }
    item[e.currentTarget.name] = e.currentTarget.value
    setAuctionItem(item)
    setDataModified(true)
  }

  const updateImage = (e: React.FormEvent<HTMLInputElement>): void => {
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
    setDataModified(true)
  }

  const resetImage = () => {
    setSelectedFile(null)
    setPreviewImage("")
  }

  const deleteImage = () => {
    resetImage()
    let item: any = { ...auctionItem, image: "" }
    setAuctionItem(item)
    setDataModified(true)
  }

  const deleteItem = async () => {
    setLoading(true)
    try {
      await axios.delete(`/api/items/${id}`)
      window.location.href = `/auctions/${auctionEvent?._id}`
    } catch (error: any) {
      setErrorMessage(`${error.response.data.error}`)
      setLoading(false)
    }
  }

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ my: 2, display: "inline-block" }}
        >
          Edit Item
        </Typography>
        {auctionItem?.published && auctionItem?.lotNumber && (
          <Link href={`/${auctionEvent?.slug}/${auctionItem?.lotNumber}`}>
            <Button variant="text" endIcon={<LaunchIcon />}>
              View Public Page
            </Button>
          </Link>
        )}
      </Box>
      <Divider />
      <Link href={`/auctions/${auctionEvent?._id}`}>
        <Button variant="text" startIcon={<ArrowBackIcon />}>
          Back to Auction
        </Button>
      </Link>

      {/* // Error Message */}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {/* // Loaing Message */}
      {loading && <p>Loading...</p>}
      {/* Item Details Form */}
      {!loading && (
        <>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardContent>
                <SquareImage
                  image={previewImage || auctionItem?.image}
                  size={250}
                  rounded
                />

                <Box sx={{ my: 2 }}>
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={updateImage}
                  />
                  <Button
                    variant="contained"
                    type="button"
                    size="small"
                    onClick={() => imageInputRef.current.click()}
                  >
                    Update Image
                  </Button>
                  {auctionItem?.image && (
                    <Button
                      type="button"
                      size="small"
                      onClick={deleteImage}
                      sx={{ color: "rgb(219, 72, 72)" }}
                    >
                      Delete
                    </Button>
                  )}
                  {previewImage && (
                    <Button type="button" size="small" onClick={resetImage}>
                      Reset
                    </Button>
                  )}
                </Box>

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Title"
                    type="text"
                    id="title"
                    name="title"
                    value={auctionItem?.title}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Description"
                    multiline
                    id="description"
                    name="description"
                    rows={5}
                    value={auctionItem?.description}
                    onChange={handleChange}
                    placeholder="Auction Description..."
                  />
                </FormControl>

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Lot Number"
                    type="number"
                    id="lotNumber"
                    name="lotNumber"
                    // min="1"
                    // step="1"
                    value={auctionItem?.lotNumber}
                    onChange={handleChange}
                  />
                </FormControl>

                <Divider />

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Retail Value"
                    type="number"
                    id="retailValue"
                    name="retailValue"
                    // min="1"
                    // step="1"
                    value={auctionItem?.retailValue}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Starting Bid"
                    type="number"
                    id="startingBid"
                    name="startingBid"
                    // min="1"
                    // step="1"
                    value={auctionItem?.startingBid}
                    onChange={handleChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Minimun Increment"
                    type="number"
                    id="minimunIncrement"
                    name="minimunIncrement"
                    // min="1"
                    // step="1"
                    value={auctionItem?.minimunIncrement}
                    onChange={handleChange}
                  />
                </FormControl>

                <Divider />

                <FormGroup>
                  <FormControlLabel
                    label="Published"
                    control={
                      <Switch
                        checked={!!auctionItem?.published}
                        onChange={(e) => {
                          let item: any = { ...auctionItem }
                          item.published = !auctionItem?.published
                          setAuctionItem(item)
                          setDataModified(true)
                        }}
                      />
                    }
                  />
                </FormGroup>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!dataModified}
                >
                  Save
                </Button>
                {dataModified && (
                  <Button type="button" onClick={getAuctionItem}>
                    Cancel
                  </Button>
                )}
              </CardActions>
            </Card>
          </form>
        </>
      )}

      <br />
      <h2>QR Code</h2>
      <hr />
      <i>Event URL and Lot Number must be set to generate QR Coder</i>
      {!loading && (
        <p>
          <a
            href={`/api/items/${auctionItem?._id}/qr?${QRHash}`}
            download={`Lot-${auctionItem?.lotNumber}-QR.png`}
            style={{ textDecoration: "none" }}
          >
            <img
              src={`/api/items/${auctionItem?._id}/qr?${QRHash}`}
              width="50%"
            />
            <br />
            <Button startIcon={<DownloadIcon />}>Download</Button>
          </a>
        </p>
      )}

      <br />
      <br />
      <h2>Bid History</h2>
      <hr />
      <table className="upbids-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Paid</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {bids.map(
            (
              { _id, timestamp, amount, won, isTopBid, paid, userId },
              index
            ) => {
              if (userId && typeof userId === "object") {
                return (
                  <tr key={_id}>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: new Date(timestamp)
                          .toLocaleString("en-US")
                          .split(", ")
                          .join("<br />"),
                      }}
                    ></td>
                    <td>{userId?.name}</td>
                    <td>{currencyFormatter.format(amount)}</td>
                    <td>
                      {_id && (
                        <Checkbox
                          name={_id}
                          // disabled={!!!isTopBid}
                          checked={!!paid}
                          onChange={async (e) => {
                            await togglePaid(
                              index,
                              e.currentTarget.name,
                              !!paid
                            )
                            loadBids()
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {_id && (
                        <IconButton
                          type="button"
                          name={_id}
                          onClick={async (e) => {
                            if (
                              confirm(
                                "Are you sure you want to delete this Bid?"
                              )
                            ) {
                              await removeBid(e.currentTarget.name)
                            }
                            loadBids()
                          }}
                        >
                          <DeleteForeverIcon />
                        </IconButton>
                      )}
                    </td>
                  </tr>
                )
              }
            }
          )}
        </tbody>
      </table>

      <br />
      <br />
      <h2>Danger Zone</h2>
      <hr />
      <Button
        type="button"
        // style={{ backgroundColor: "#c11b1b" }}
        color="error"
        variant="contained"
        onClick={() => {
          if (confirm("Are you sure you want to delete this Item?")) {
            deleteItem()
          }
        }}
      >
        Delete Auction
      </Button>
    </Layout>
  )
}
