import * as React from "react"
import { useRouter } from "next/router"
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material"

import PersonIcon from "@mui/icons-material/Person"
import LoyaltyIcon from "@mui/icons-material/Loyalty"
import ExploreIcon from "@mui/icons-material/Explore"

export default function UpBidsFooter() {
  const [value, setValue] = React.useState(-1)
  const router = useRouter()

  React.useEffect(() => {
    if (!router.isReady) return
    switch (router.pathname) {
      case "/account":
        setValue(0)
        break
      case "/bids":
        setValue(1)
        break
      case "/discover":
        setValue(2)
        break

      default:
        break
    }
  }, [router.isReady])

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={4}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue)
          switch (newValue) {
            case 0:
              router.push("/account")
              break
            case 1:
              router.push("/bids")
              break
            case 2:
              router.push("/discover")
              break
            default:
              break
          }
        }}
      >
        <BottomNavigationAction label="Account" icon={<PersonIcon />} />
        <BottomNavigationAction label="My Bids" icon={<LoyaltyIcon />} />
        <BottomNavigationAction label="Discover" icon={<ExploreIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
