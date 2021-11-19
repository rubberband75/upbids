import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"
import AuctionEvent from "../../models/AuctionEvent"
import { Button, Divider, Typography } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>
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
            <fieldset>
              <legend>Item Details</legend>
              <div
                style={{
                  backgroundImage: `url(${previewImage || auctionItem?.image})`,
                }}
                className={"profilePicture"}
              ></div>
              <br />
              <p style={{ width: "fit-content" }}>
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  // value={selectedFile}
                  onChange={updateImage}
                />
                <button
                  type="button"
                  style={{ padding: ".5em" }}
                  onClick={() => imageInputRef.current.click()}
                >
                  Update Image
                </button>
                {auctionItem?.image && (
                  <button
                    type="button"
                    className={"text-button"}
                    onClick={deleteImage}
                  >
                    Delete
                  </button>
                )}
                {previewImage && (
                  <button
                    type="button"
                    className={"text-button"}
                    onClick={resetImage}
                  >
                    Reset
                  </button>
                )}
              </p>

              <p>
                <label htmlFor="title">
                  <span>Title</span>
                </label>
                <br />
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={auctionItem?.title}
                  onChange={handleChange}
                />
              </p>

              <p>
                <label htmlFor="description">
                  <span>Description</span>
                </label>
                <br />

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={auctionItem?.description}
                  onChange={handleChange}
                  placeholder="Auction Description..."
                ></textarea>
              </p>

              <p>
                <label htmlFor="lotNumber">
                  <span>Lot Number</span>
                </label>
                <br />
                <input
                  id="lotNumber"
                  name="lotNumber"
                  type="number"
                  min="1"
                  step="1"
                  value={auctionItem?.lotNumber}
                  onChange={handleChange}
                />
              </p>

              <hr />

              <p>
                <label htmlFor="retailValue">
                  <span>Retail Value</span>
                </label>
                <br />
                <input
                  id="retailValue"
                  name="retailValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={auctionItem?.retailValue}
                  onChange={handleChange}
                />
              </p>

              <p>
                <label htmlFor="startingBid">
                  <span>Starting Bid</span>
                </label>
                <br />
                <input
                  id="startingBid"
                  name="startingBid"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={auctionItem?.startingBid}
                  onChange={handleChange}
                />
              </p>

              <p>
                <label htmlFor="minimunIncrement">
                  <span>Minimun Increment</span>
                </label>
                <br />
                <input
                  id="minimunIncrement"
                  name="minimunIncrement"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={auctionItem?.minimunIncrement}
                  onChange={handleChange}
                />
              </p>

              <hr />

              <p>
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={!!auctionItem?.published}
                  onChange={(e) => {
                    let item: any = { ...auctionItem }
                    item.published = !auctionItem?.published
                    setAuctionItem(item)
                  }}
                />
                <label htmlFor="published">Published</label>
              </p>
            </fieldset>
            <br />
            <button type="submit">Save</button>
            <a href={`/auctions/${eventId}`}>
              <button type="button" className={"text-button"}>
                Cancel
              </button>
            </a>
          </form>
        </>
      )}
    </Layout>
  )
}
