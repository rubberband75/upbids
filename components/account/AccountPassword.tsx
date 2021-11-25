import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  Snackbar,
  TextField,
  Theme,
  Typography,
} from "@mui/material"
import { SxProps } from "@mui/system"
import axios from "axios"
import { useEffect, useState } from "react"
import User from "../../models/user"

export default function AccountPassword({
  user,
  sx,
  updateUser,
}: {
  user?: User
  sx?: SxProps<Theme> | undefined
  updateUser?: Function
}) {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [errorMessage, setErrorMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)

  const updatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage("")

    try {
      await axios.patch("/api/users/update-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setShowSnackbar(true)
      setTimeout(() => {
        setShowSnackbar(false)
      }, 2500)

      if (updateUser) updateUser()
    } catch (error: any) {
      try {
        setErrorMessage(`Error: ${error.response.data.error}`)
      } catch (e) {
        setErrorMessage(`${error}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card sx={{ my: 3, ...sx }}>
        <form onSubmit={updatePassword}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Update Password
            </Typography>

            {user?.password && (
              <>
                <FormControl fullWidth sx={{ my: 1 }}>
                  <TextField
                    size="small"
                    label="Current Password"
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.currentTarget.value)
                    }}
                    disabled={loading}
                  />
                </FormControl>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            <FormControl fullWidth sx={{ my: 1 }}>
              <TextField
                size="small"
                label="New Password"
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.currentTarget.value)
                }}
                disabled={loading}
              />
            </FormControl>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <TextField
                size="small"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.currentTarget.value)
                }}
                disabled={loading}
              />
            </FormControl>
          </CardContent>
          <CardActions>
            <FormControl>
              <Button
                size="small"
                variant="contained"
                type="submit"
                disabled={
                  !newPassword || newPassword !== confirmPassword || loading
                }
              >
                Update
              </Button>
            </FormControl>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          </CardActions>
        </form>
      </Card>

      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={showSnackbar}
        message="Password Updated"
      />
    </>
  )
}
