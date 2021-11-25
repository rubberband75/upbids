import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { signIn } from "next-auth/react"
import Layout from "../../components/layout"
import useSwr from "swr"
import React, { useEffect, useState, useRef } from "react"
import axios from "axios"
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material"
import SquareImage from "../../components/SquareImage"
import { useRouter } from "next/router"
import AccountPassword from "../../components/account/AccountPassword"
import User from "../../models/user"

export default function AccountIndex() {
  const imageInputRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const router = useRouter()

  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User>()
  const [selectedFile, setSelectedFile] = useState<File | null>()
  const [previewImage, setPreviewImage] = useState("")
  const [dataModified, setDataModified] = useState(false)

  const getUser = () => {
    setErrorMessage("")
    resetImage()
    axios
      .get("/api/users/current")
      .then((response) => {
        setUser(response.data)
        setDataModified(false)
      })
      .catch((error: any) => {
        if (error?.response?.status == 403) signIn()
        try {
          setErrorMessage(`Error: ${error.response.data.error}`)
        } catch (e) {
          setErrorMessage(`${error}`)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }
  useEffect(() => getUser(), [])

  const updateUser = () => {
    setErrorMessage("")

    const formData = new FormData()
    if (user) {
      formData.append("name", user.name)
      formData.append("email", user.email || "")
      formData.append("phone", user.phone || "")
      formData.append("image", user.image || "")
    }

    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    axios
      .patch("/api/users/current", formData)
      .then((response) => {
        setUser(response.data)
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
    let userData: any = { ...user }
    userData[e.currentTarget.name] = e.currentTarget.value
    setUser(userData)
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
    let userData: any = { ...user, image: "" }
    setUser(userData)
    setDataModified(true)
  }

  const deleteAccount = async () => {
    try {
      await axios.delete("/api/users/delete-account")
      window.location.href = "/"
    } catch (e) {
      console.error({ error: e })
    } finally {
    }
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
            <Card>
              <CardContent>
                <SquareImage
                  image={previewImage || user?.image}
                  size={250}
                  rounded
                />
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
                  {user?.image && (
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
                    value={user?.name}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Email"
                    type="email"
                    id="email"
                    name="email"
                    value={user?.email}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl fullWidth sx={{ my: 2 }}>
                  <TextField
                    label="Phone"
                    type="tel"
                    id="phone"
                    name="phone"
                    value={user?.phone}
                    onChange={handleChange}
                  />
                </FormControl>
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
                  <Button type="button" onClick={getUser}>
                    Cancel
                  </Button>
                )}
              </CardActions>
            </Card>
          </form>

          <AccountPassword user={user} updateUser={getUser} />

          <Divider sx={{ mt: 6, mb: 1 }} />
          <Button
            variant="text"
            type="button"
            size="small"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to delete your account and all of your data?"
                )
              ) {
                deleteAccount()
              }
            }}
          >
            Delete My Account
          </Button>
        </>
      )}
    </Layout>
  )
}
