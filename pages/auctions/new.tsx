import Layout from "../../components/layout"
import React, { useState, useRef } from "react"
import Link from "next/link"
import axios from "axios"
import Card from "@mui/material/Card"
import {
  Button,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material"

export default function NewAuctionPage() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  let [errorMessage, setErrorMessage] = useState("")
  let [loading, setLoading] = useState(true)
  let [event, setEvent] = useState({
    title: "",
    description: "",
    slug: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData()
    formData.append("title", event.title)
    formData.append("description", event.description)
    formData.append("slug", event.slug)

    if (selectedFile) {
      formData.append("bannerImage", selectedFile)
    }

    try {
      setErrorMessage("")
      setLoading(true)
      let result = await axios.post("/api/auctions", formData)

      // Redirect to new event
      window.location.href = `/auctions/${result.data._id}`
    } catch (error: any) {
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }

    // updateUser()
  }

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    setEvent({ ...event, [e.currentTarget.name]: e.currentTarget.value })
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

  const deleteImage = () => {
    setSelectedFile(null)
    setPreviewImage("")
  }

  return (
    <Layout>
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        New Acution
      </Typography>
      <Divider />

      {errorMessage && (
        // Error Message
        <p className={"error-message"}>Error: {errorMessage}</p>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <div
            style={{
              backgroundImage: `url(${previewImage})`,
            }}
            className={"bannerImage"}
          ></div>
          <CardContent>
            <p>
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
              {previewImage && (
                <Button
                  type="button"
                  size="small"
                  onClick={deleteImage}
                  sx={{ color: "rgb(219, 72, 72)" }}
                >
                  Delete
                </Button>
              )}
            </p>
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
                placeholder="example"
              />
            </FormControl>
          </CardContent>
          <CardActions>
            <Button variant="contained" type="submit">
              Save
            </Button>
            <Link href="/auctions">
              <Button type="button">Cancel</Button>
            </Link>
          </CardActions>
        </Card>
      </form>
    </Layout>
  )
}
