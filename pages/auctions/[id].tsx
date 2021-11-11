import Layout from "../../components/layout"
import { useRouter } from "next/router"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import Link from "next/link"
import AuctionItem from "../../models/AuctionItem"

export default function EditAuctionPage() {
  const router = useRouter()
  const { id } = router.query

  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  let [errorMessage, setErrorMessage] = useState("")
  let [loading, setLoading] = useState(true)
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

        console.log({ items: response.data.auctionItems })

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
    e: React.FormEvent<HTMLInputElement> | React.FormEvent<HTMLTextAreaElement>
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

  return (
    <Layout>
      <h1>
        Edit Auction
        <small style={{ marginLeft: "1em" }}>
          <Link href={`/${event.slug}`}>
            <a>View Live</a>
          </Link>
        </small>
      </h1>
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
            <fieldset>
              <legend>Account Details</legend>
              <div
                style={{
                  backgroundImage: `url(${previewImage || event.bannerImage})`,
                }}
                className={"bannerImage"}
              ></div>
              <br />
              <p>
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
                {event.bannerImage && (
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

              <p>
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={event.published}
                  onChange={() => {
                    setEvent({ ...event, published: !event.published })
                    setDataModified(true)
                  }}
                />
                <label htmlFor="published">Published</label>
              </p>

              <p>
                <input
                  type="checkbox"
                  id="biddingOpen"
                  name="biddingOpen"
                  checked={event.biddingOpen}
                  onChange={() => {
                    setEvent({ ...event, biddingOpen: !event.biddingOpen })
                    setDataModified(true)
                  }}
                />
                <label htmlFor="biddingOpen">Bidding Open</label>
              </p>
            </fieldset>
            <br />
            <button type="submit">Save</button>
            {dataModified && (
              <button
                type="button"
                className={"text-button"}
                onClick={getEvent}
              >
                Cancel
              </button>
            )}
          </form>

          <br />
          <h2>Auction Items</h2>
          <hr />
          {!auctionItems.length && (
            <div>
              <i>You haven't added any auction items</i>
            </div>
          )}
          <ul>
            {auctionItems.map(({ _id, title }) => (
              <li key={_id}>
                <Link href={`/items/${_id}`}>
                  <a>{title}</a>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/auctions/${id}/items/new`}>
            <button type="button">+ Add Item</button>
          </Link>
        </>
      )}
    </Layout>
  )
}
