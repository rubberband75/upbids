import * as React from "react"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Typography from "@mui/material/Typography"
import AccountCircle from "@mui/icons-material/AccountCircle"
import MenuItem from "@mui/material/MenuItem"
import Menu from "@mui/material/Menu"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import {
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material"
import Divider from "@mui/material/Divider"

export default function UpBidsAppBar() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          UpBids
        </Typography>

        {!session && !loading && (
          <>
            <a
              style={{ textDecoration: "none", color: "unset" }}
              href={`/api/auth/signin`}
              onClick={(e) => {
                e.preventDefault()
                signIn()
              }}
            >
              <Button color="inherit">Sign In</Button>
            </a>
          </>
        )}

        {session && (
          <>
            <span>Welcome, {session.user?.name?.split(" ")[0]}</span>
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Link href="/account">
                  <MenuItem>
                    <ListItemAvatar>
                      <Avatar
                        alt={session.user?.name || ""}
                        src={session.user?.image || ""}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={session.user?.name}
                      secondary={session.user?.email}
                    />
                  </MenuItem>
                </Link>
                <Divider />
                <Link href="/account">
                  <MenuItem onClick={handleClose}>My Account</MenuItem>
                </Link>
                <Link href="/auctions">
                  <MenuItem onClick={handleClose}>My Auctions</MenuItem>
                </Link>
                <Link href="/bids">
                  <MenuItem onClick={handleClose}>My Bids</MenuItem>
                </Link>

                <Divider />
                <Link href={`/api/auth/signout`}>
                  <MenuItem
                    onClick={(e) => {
                      e.preventDefault()
                      signOut()
                      handleClose()
                    }}
                  >
                    Sign Out
                  </MenuItem>
                </Link>
              </Menu>
            </div>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}
