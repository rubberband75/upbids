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
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import { Box } from "@mui/system"
import LaunchIcon from "@mui/icons-material/Launch"
import AuctionItemCard from "../../components/AuctionItemCard"
import User from "../../models/user"
import AuctionEvent from "../../models/AuctionEvent"

export default function EditAuctionPage() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  const router = useRouter()
  const { id } = router.query

  let [loading, setLoading] = useState(true)
  let [errorMessage, setErrorMessage] = useState("")
  let [event, setEvent] = useState<AuctionEvent>()
  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")
  const [dataModified, setDataModified] = useState(false)

  const [auctionItems, setAuctionItems] = useState<AuctionItem[]>([])

  const [collaboratorEmail, setCollaboratorEmail] = useState("")
  const [collaboratorError, setCollaboratorError] = useState("")

  const getEvent = () => {
    setErrorMessage("")
    resetImage()
    axios
      .get(`/api/auctions/${id}`)
      .then((response) => {
        setEvent(response.data.auctionEvent)
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
    let eventData: any = { ...event }
    for (const key in eventData) {
      if (eventData[key] !== null && eventData[key] !== undefined)
        formData.append(key, eventData[key].toString())
    }

    // formData.append("bannerImage", event?.bannerImage)
    // formData.append("title", event?.title)
    // formData.append("description", event?.description)
    // formData.append("slug", event?.slug)
    // formData.append("published", event?.published.toString())
    // formData.append("biddingOpen", event?.biddingOpen.toString())

    if (selectedFile) {
      formData.append("bannerImage", selectedFile)
    }

    try {
      let response = await axios.patch(`/api/auctions/${event?._id}`, formData)
      setEvent(response.data.auctionEvent)

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
    let eventData: any = { ...event }
    eventData[e.currentTarget.name] = e.currentTarget.value
    setEvent(eventData)
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
    let eventData: any = { ...event, bannerImage: "" }
    setEvent(eventData)
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

  const addCollaborator = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCollaboratorError("")
    try {
      await axios.post(`/api/auctions/${event?._id}/managers`, {
        email: collaboratorEmail,
      })
      setCollaboratorEmail("")
      getEvent()
    } catch (error) {
      setCollaboratorError("Error Adding Collaborator")
    }
  }

  const deleteCollaborator = async (email: string) => {
    setCollaboratorError("")
    try {
      await axios.delete(`/api/auctions/${event?._id}/managers`, {
        data: { email },
      })
      setCollaboratorEmail("")
      getEvent()
    } catch (error) {
      setCollaboratorError("Error Deleting Collaborator")
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
        {event?.published && event?.slug && (
          <Link href={`/${event.slug}`}>
            <Button variant="text" endIcon={<LaunchIcon />}>
              View Public Page
            </Button>
          </Link>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />
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
                image={previewImage || event?.bannerImage}
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
                  {event?.bannerImage && (
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
                    value={event?.title}
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
                    value={event?.description}
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
                    value={event?.slug}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i>www.upbids.net/</i>
                        </InputAdornment>
                      ),
                    }}
                    placeholder="example"
                  />
                </FormControl>

                <FormGroup>
                  <FormControlLabel
                    label="Published"
                    control={
                      <Switch
                        checked={!!event?.published}
                        onChange={() => {
                          let eventData: any = {
                            ...event,
                            published: !event?.published,
                          }
                          setEvent(eventData)
                          setDataModified(true)
                        }}
                      />
                    }
                  />
                  <FormControlLabel
                    label="Bidding Open"
                    control={
                      <Switch
                        checked={!!event?.biddingOpen}
                        onChange={() => {
                          let eventData: any = {
                            ...event,
                            biddingOpen: !event?.biddingOpen,
                          }
                          setEvent(eventData)
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
                  <Button type="button" onClick={getEvent}>
                    Cancel
                  </Button>
                )}
              </CardActions>
            </Card>
          </form>

          <Typography variant="h5" component="h2" sx={{ mt: 6 }}>
            Auction Items
          </Typography>
          <Divider sx={{ mb: 2 }} />
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
          <Link href={`/items/new?eventId=${id}`}>
            <Button variant="contained" size="large">
              + Add Item
            </Button>
          </Link>

          <Typography variant="h5" component="h2" sx={{ mt: 6 }}>
            Collaborators
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <i>
            Enter the email address of the UpBids account you wish to share
            access with, and they will be invited to see and update this event.
          </i>
          <form onSubmit={addCollaborator}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                my: 1,
              }}
            >
              <TextField
                label="Email"
                type="email"
                id="email"
                name="email"
                size="small"
                value={collaboratorEmail}
                onChange={(e) => {
                  setCollaboratorEmail(e.currentTarget.value)
                }}
                sx={{ flexGrow: 1, mr: 1 }}
              />
              <Button type="submit" variant="contained">
                Invite
              </Button>
            </Box>
          </form>

          <Table size="small" sx={{ mt: 2 }}>
            <TableBody>
              {event?.managers?.map((user) => {
                if (typeof user === "object")
                  return (
                    <TableRow
                      key={user._id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          name={user.email}
                          onClick={(e) => {
                            if (
                              confirm(
                                "Are you sure you want to remove this collaborator?"
                              )
                            ) {
                              deleteCollaborator(e.currentTarget.name)
                            }
                          }}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
              })}
            </TableBody>
          </Table>

          <Typography variant="h5" component="h2" sx={{ mt: 6 }}>
            Danger Zone
          </Typography>
          <Divider sx={{ mb: 2 }} />
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
