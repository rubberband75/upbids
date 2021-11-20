import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"
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
  InputAdornment,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import LaunchIcon from "@mui/icons-material/Launch"
import { Box } from "@mui/system"
import AuctionItemCard from "../../components/AuctionItemCard"

export default function EditAuctionPage() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const router = useRouter()
  const { id } = router.query

  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [event, setEvent] = useState({
    _id: "",
    bannerImage: "",
    title: "",
    description: "",
    slug: "",
    published: false,
    biddingOpen: false,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")
  const [dataModified, setDataModified] = useState(false)

  let [auctionItems, setAuctionItems] = useState<AuctionItem[]>([])

  const getEvent = () => {
    setErrorMessage("")
    resetImage()
    axios
      .get(`/api/auctions/${id}`)
      .then((response) => {
        setEvent({
          ...event,
          _id: response.data.auctionEvent._id || "",
          bannerImage: response.data.auctionEvent.bannerImage || "",
          title: response.data.auctionEvent.title || "",
          description: response.data.auctionEvent.description || "",
          slug: response.data.auctionEvent.slug || "",
          published: response.data.auctionEvent.published || false,
          biddingOpen: response.data.auctionEvent.biddingOpen || false,
        })

        setAuctionItems(response.data.auctionItems)
        setDataModified(false)
      })
      .catch((error: any) => {
        console.error(error)
        setErrorMessage(`${error.response.data.error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => {
    if (!router.isReady) return
    getEvent()
  }, [router.isReady])

  const updateEvent = async () => {
    setErrorMessage("")

    const formData = new FormData()
    formData.append("bannerImage", event.bannerImage)
    formData.append("title", event.title)
    formData.append("description", event.description)
    formData.append("slug", event.slug)
    formData.append("published", event.published.toString())
    formData.append("biddingOpen", event.biddingOpen.toString())

    if (selectedFile) {
      formData.append("bannerImage", selectedFile)
    }

    try {
      let response = await axios.patch(`/api/auctions/${event._id}`, formData)
      setEvent({
        ...event,
        bannerImage: response.data.auctionEvent.bannerImage || "",
        title: response.data.auctionEvent.title || "",
        description: response.data.auctionEvent.description || "",
        slug: response.data.auctionEvent.slug || "",
        published: response.data.auctionEvent.published || false,
        biddingOpen: response.data.auctionEvent.biddingOpen || false,
      })

      resetImage()
      setDataModified(false)
    } catch (error: any) {
      setErrorMessage(`${error.response.data.error}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateEvent()
  }

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setEvent({ ...event, [e.currentTarget.name]: e.currentTarget.value })
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
    setEvent({
      ...event,
      bannerImage: "",
    })
    setDataModified(true)
  }

  const deleteAuction = async () => {
    setLoading(true)
    try {
      await axios.delete(`/api/auctions/${id}`)
      window.location.href = `/auctions`
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
          Edit Auction
        </Typography>
        {event.published && event.slug && (
          <Link href={`/${event.slug}`}>
            <Button variant="text" endIcon={<LaunchIcon />}>
              View Public Page
            </Button>
          </Link>
        )}
      </Box>
      <Divider />
      {errorMessage && (
        // Error Message
        <p className={"error-message"}>{errorMessage}</p>
      )}
      {loading && (
        // Loaing Message
        <>
          <p>Loading...</p>
        </>
      )}
      {!loading && (
        // Account Data Form
        <>
          <form onSubmit={handleSubmit}>
            <Card>
              <CardMedia
                component="img"
                height="250"
                image={previewImage || event.bannerImage}
              />

              <CardContent>
                <div>
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
                  {event.bannerImage && (
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
                </div>
                <br />

                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Title"
                    type="text"
                    id="title"
                    name="title"
                    value={event.title}
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
                    value={event.description}
                    onChange={handleChange}
                    placeholder="Auction Description..."
                  />
                </FormControl>
                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Event URL"
                    type="text"
                    id="slug"
                    name="slug"
                    value={event.slug}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i>www.upbids.net/</i>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="event-name"
                  />
                </FormControl>

                <FormGroup>
                  <FormControlLabel
                    label="Published"
                    control={
                      <Switch
                        checked={event.published}
                        onChange={() => {
                          setEvent({ ...event, published: !event.published })
                          setDataModified(true)
                        }}
                      />
                    }
                  />
                  <FormControlLabel
                    label="Bidding Open"
                    control={
                      <Switch
                        checked={event.biddingOpen}
                        onChange={() => {
                          setEvent({
                            ...event,
                            biddingOpen: !event.biddingOpen,
                          })
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
                  <Button
                    type="button"
                    className={"text-button"}
                    onClick={getEvent}
                  >
                    Cancel
                  </Button>
                )}
              </CardActions>
            </Card>
          </form>

          <br />
          <h2>Auction Items</h2>
          <hr />
          {!auctionItems.length && (
            <div>
              <i>You haven't added any auction items</i>
            </div>
          )}
          {auctionItems.map((auctionItem: AuctionItem) => (
            <Link href={`/items/${auctionItem._id}`} key={auctionItem._id}>
              <a style={{ textDecoration: "none" }}>
                <AuctionItemCard auctionItem={auctionItem} />
              </a>
            </Link>
          ))}
          <br />
          <Link href={`/items/new?eventId=${id}`}>
            <Button variant="contained" size="large">
              + Add Item
            </Button>
          </Link>

          <br />
          <br />
          <h2>Danger Zone</h2>
          <hr />
          <Button
            variant="contained"
            type="button"
            style={{ backgroundColor: "#c11b1b" }}
            onClick={() => {
              if (confirm("Are you sure you want to delete this Auction?")) {
                deleteAuction()
              }
            }}
          >
            Delete Auction
          </Button>
        </>
      )}
    </Layout>
  )
}
