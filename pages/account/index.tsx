import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { getSession } from "next-auth/react"
import Layout from "../../components/layout"
import useSwr from "swr"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"

export default function AccountIndex() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>

  let [errorMessage, setErrorMessage] = useState("")
  let [loading, setLoading] = useState(true)
  let [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")
  const [dataModified, setDataModified] = useState(false)

  const getUser = () => {
    setErrorMessage("")
    resetImage()
    axios
      .get("/api/users/current")
      .then((response) => {
        setUser({
          ...user,
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          image: response.data.image || "",
        })
        setDataModified(false)
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage(`${error}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => getUser(), [])

  const updateUser = () => {
    setErrorMessage("")

    const formData = new FormData()
    formData.append("name", user.name)
    formData.append("email", user.email)
    formData.append("phone", user.phone)
    formData.append("image", user.image)

    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    axios
      .patch("/api/users/current", formData)
      .then((response) => {
        console.log("User Updated")
        setUser({
          ...user,
          name: response.data.name || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          image: response.data.image || "",
        })
        resetImage()
        setDataModified(false)
      })
      .catch((error) => {
        console.error(error)
        setErrorMessage(`${error}`)
      })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateUser()
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setUser({ ...user, [e.currentTarget.name]: e.currentTarget.value })
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
    setUser({
      ...user,
      image: "",
    })
    setDataModified(true)
  }

  return (
    <Layout>
      <h1>My Account</h1>
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
                  backgroundImage: `url(${previewImage || user.image})`,
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
                {user.image && (
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
                <label htmlFor="name">
                  <span>Full Name</span>
                </label>
                <br />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                />
              </p>
              <p>
                <label htmlFor="email">
                  <span>Email Address</span>
                </label>
                <br />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                />
              </p>
              <p>
                <label htmlFor="phone">
                  <span>Phone Number</span>
                </label>
                <br />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleChange}
                />
              </p>
            </fieldset>
            <br />
            <button type="submit">Save</button>
            {dataModified && (
              <button type="button" className={"text-button"} onClick={getUser}>
                Cancel
              </button>
            )}
          </form>
        </>
      )}
    </Layout>
  )
}
