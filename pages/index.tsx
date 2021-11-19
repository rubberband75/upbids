import { Typography } from "@mui/material"
import Layout from "../components/layout"

export default function Page () {
  return (
    <Layout>
      <Typography variant="h1" component="h1" sx={{ my: 6 }}>
        UpBids
      </Typography>
      <Typography variant="h5" component="h2">
        A Silent Auction management System        
      </Typography>
    </Layout>
  )
}