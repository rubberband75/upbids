import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { getSession } from "next-auth/react"
import Layout from "../../components/layout"
import useSwr from "swr"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  Alert,
  Button,
  Divider,
  FormControl,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material"

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

  const handleChange = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
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
      <Typography variant="h4" component="h1" sx={{ my: 2 }}>
        My Account
      </Typography>
      <Divider />
      {/* // Error Message */}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
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
            <FormControl fullWidth sx={{}}>
              <div
                style={{
                  backgroundImage: `url(${previewImage || user.image})`,
                }}
                className={"profilePicture"}
              ></div>
            </FormControl>
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
                onClick={() => imageInputRef.current.click()}
              >
                Update Image
              </Button>
              {user.image && (
                <Button
                  type="button"
                  onClick={deleteImage}
                  sx={{ color: "rgb(219, 72, 72)" }}
                >
                  Delete
                </Button>
              )}
              {previewImage && (
                <Button type="button" onClick={resetImage}>
                  Reset
                </Button>
              )}
            </div>
            <Divider sx={{ my: 3 }} />
            <FormControl fullWidth sx={{ my: 2 }}>
              <TextField
                label="Full Name"
                type="text"
                id="name"
                name="name"
                value={user.name}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <TextField
                label="Email"
                type="email"
                id="email"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <TextField
                label="Phone"
                type="tel"
                id="phone"
                name="phone"
                value={user.phone}
                onChange={handleChange}
              />
            </FormControl>

            <br />
            <Button variant="contained" type="submit">
              Save
            </Button>
            {dataModified && (
              <Button type="button" onClick={getUser}>
                Cancel
              </Button>
            )}
          </form>
        </>
      )}
    </Layout>
  )
}
