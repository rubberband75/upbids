import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import Card from "@mui/material/Card"
import {
  Button,
  CardActions,
  CardContent,
  CardMedia,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Skeleton,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import { Box } from "@mui/system"
import SquareImage from "../../components/SquareImage"

export default function EditItemPage() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const router = useRouter()
  const { eventId } = router.query

  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  // let [auctionEvent, setAuctionEvent] = useState<AuctionEvent>()
  let [auctionItem, setAuctionItem] = useState<AuctionItem>()

  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")
  // const [dataModified, setDataModified] = useState(false)

  // const getAuctionEvent = async () => {
  //   setLoading(true)
  //   try {
  //     let response = await axios.get(`/api/auctions/${eventId}`)
  //     setAuctionEvent(response.data.auctionEvent)
  //   } catch (error) {
  //     console.error({ error })
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  useEffect(() => {
    if (!router.isReady) return
    // getAuctionEvent()

    let item: any = { ...auctionItem, eventId: eventId }
    setAuctionItem(item)
    setLoading(false)
  }, [router.isReady])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage("")
    setLoading(true)
    try {
      // Iterate through keys in auctionItem and dd them to a formData object
      const formData = new FormData()
      let itemData: any = { ...auctionItem }
      for (const key in itemData) {
        if (itemData[key] !== null && itemData[key] !== undefined)
          formData.append(key, itemData[key].toString())
      }

      //   If new file attached, add File
      if (selectedFile) {
        formData.append("file", selectedFile)
      }

      // Send POST request
      let response = await axios.post(`/api/items`, formData)

      // Redirect to new item
      window.location.href = `/items/${response.data.auctionItem._id}`
    } catch (error: any) {
      console.log({ error })
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    }
  }

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    let item: any = { ...auctionItem }
    item[e.currentTarget.name] = e.currentTarget.value
    setAuctionItem(item)
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
  }

  const resetImage = () => {
    setSelectedFile(null)
    setPreviewImage("")
  }

  const deleteImage = () => {
    resetImage()
    let item: any = { ...auctionItem, image: "" }
    setAuctionItem(item)
  }

  return (
    <Layout>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        New Item
      </Typography>
      <Divider />
      <Link href={`/auctions/${eventId}`}>
        <Button variant="text" startIcon={<ArrowBackIcon />}>
          Back to Auction
        </Button>
      </Link>
      {/* // Error Message */}
      {errorMessage && <p className={"error-message"}>{errorMessage}</p>}
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
                        }}
                      />
                    }
                  />
                </FormGroup>
              </CardContent>
              <CardActions>
                <Button type="submit" variant="contained">
                  Save
                </Button>
                <Link href={`/auctions/${eventId}`}>
                  <a style={{ textDecoration: "none" }}>
                    <Button type="button">Cancel</Button>
                  </a>
                </Link>
              </CardActions>
            </Card>
          </form>
        </>
      )}
    </Layout>
  )
}
