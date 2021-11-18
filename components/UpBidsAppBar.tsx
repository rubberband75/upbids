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
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material"
import Divider from "@mui/material/Divider"
import PersonIcon from "@mui/icons-material/Person"
import EventIcon from "@mui/icons-material/Event"
import LoyaltyIcon from "@mui/icons-material/Loyalty"
import ExploreIcon from "@mui/icons-material/Explore"

export default function UpBidsAppBar() {
  const { data: session, status } = useSession()
  const loading = status === "loading"

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [showDrawer, setShowDrawer] = React.useState(false)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const toggleDrawer = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return
    }
    setShowDrawer(!showDrawer)
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
          onClick={() => {
            setShowDrawer(true)
          }}
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
      <Drawer anchor="left" open={showDrawer} onClose={toggleDrawer}>
        <List sx={{ minWidth: "15em" }}>
          {!session && (
            <ListItem disablePadding>
              <ListItemButton
                href={`/api/auth/signin`}
                onClick={(e) => {
                  e.preventDefault()
                  signIn()
                }}
              >
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Sign In" />
              </ListItemButton>
            </ListItem>
          )}

          {session && (
            <>
              <ListItem disablePadding>
                <ListItemButton component="a" href="/account">
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Account" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component="a" href="/auctions">
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Auctions" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component="a" href="/bids">
                  <ListItemIcon>
                    <LoyaltyIcon />
                  </ListItemIcon>
                  <ListItemText primary="My Bids" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          <Divider />

          <ListItem disablePadding>
            <ListItemButton component="a" href="/discover">
              <ListItemIcon>
                <ExploreIcon />
              </ListItemIcon>
              <ListItemText primary="Discover" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  )
}
