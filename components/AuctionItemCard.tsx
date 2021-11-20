import Card from "@mui/material/Card"
import {
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Link,
  Typography,
} from "@mui/material"
import AuctionItem from "../models/AuctionItem"
import SquareImage from "./SquareImage"

export default function AuctionItemCard({
  auctionItem,
  href,
}: {
  auctionItem: AuctionItem
  href?: string
}) {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <Card variant="outlined" sx={{ my: 3 }}>
      <CardActionArea>
        <Grid container spacing={0}>
          <Grid item>
            <SquareImage image={auctionItem.image} size={135} />
          </Grid>

          <Grid item xs>
            <CardContent>
              <Typography variant="overline" component="span">
                Lot #{auctionItem.lotNumber?.toString().padStart(3, "0")}
              </Typography>
              <Typography variant="h5" component="h3">
                {auctionItem.title}
              </Typography>
              <span>
                <small>Retail Value</small>
                <br />
                {currencyFormatter.format(Number(auctionItem.retailValue))}
              </span>
            </CardContent>
          </Grid>
        </Grid>
      </CardActionArea>
    </Card>
  )
}
