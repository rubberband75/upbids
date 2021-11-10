import Layout from "../../components/layout"
import React, { useEffect, useState, useRef } from "react"
import Link from "next/link"
import axios from "axios"

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
      console.log(result)
      window.location.href = `/auctions/${result.data._id}`;
    } catch (error: any) {
      setErrorMessage(`${error.response.data.error}`)
    } finally {
      setLoading(false)
    }

    // updateUser()
  }

  const handleChange = (
    e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>
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
      <h1>New Acution</h1>

      {errorMessage && (
        // Error Message
        <p className={"error-message"}>Error: {errorMessage}</p>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Account Details</legend>
          <p>
            <div
              style={{
                backgroundImage: `url(${previewImage})`,
              }}
              className={"bannerImage"}
            ></div>
            <br />
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
              Add Banner Image
            </button>
            {previewImage && (
              <button
                type="button"
                className={"text-button"}
                onClick={deleteImage}
              >
                Delete
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
              value={event.title}
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
              value={event.description}
              onChange={handleChange}
              placeholder="Auction Description..."
            ></textarea>
          </p>
          <p>
            <label htmlFor="slug">
              <span>Event URL</span>
              <br />
              <i>
                Where guests can find this event. Example: www.upbids.net/
                <ins>event-url</ins>
              </i>
            </label>
            <br />
            <input
              type="text"
              id="slug"
              name="slug"
              value={event.slug}
              onChange={handleChange}
            />
          </p>
        </fieldset>
        <br />
        <button type="submit">Save</button>

        <Link href="/auctions">
          <button type="button" className={"text-button"}>
            Cancel
          </button>
        </Link>
      </form>
    </Layout>
  )
}
