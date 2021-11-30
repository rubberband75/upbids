import Card from "@mui/material/Card"
import {
  Alert,
  AlertColor,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material"
import AuctionItem from "../models/AuctionItem"
import SquareImage from "./SquareImage"
import Link from "next/link"
import { useEffect, useState } from "react"
import Bid from "../models/Bid"

export default function AuctionItemCard({
  auctionItem,
  href,
  alertMessage,
  alertSeverity,
  bid,
}: {
  auctionItem: AuctionItem
  href?: string
  alertMessage?: string
  alertSeverity?: AlertColor
  bid?: Bid
}) {
  const [currentBid, setCurrentBid] = useState<Bid>()

  useEffect(() => {})

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const cardContent = (
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
      <Divider />
      {bid ? (
        <CardContent sx={{ textAlign: "right" }}>
          Bid Ammount:
          <Typography variant="h6" component="span" sx={{ mx: 1 }}>
            {currencyFormatter.format(bid.amount)}
          </Typography>
        </CardContent>
      ) : (
        <CardContent sx={{ textAlign: "right" }}>
          {!!currentBid ? "Current Bid:" : "Starting Bid:"}
          <Typography variant="h6" component="span" sx={{ mx: 1 }}>
            {!!currentBid
              ? currencyFormatter.format(currentBid.amount)
              : currencyFormatter.format(Number(auctionItem.startingBid))}
          </Typography>
        </CardContent>
      )}
    </CardActionArea>
  )

  return (
    <Card variant="outlined" sx={{ my: 2 }}>
      {alertMessage && <Alert severity={alertSeverity}>{alertMessage}</Alert>}
      {href ? (
        <Link href={href}>
          <a style={{ textDecoration: "none", color: "unset" }}>
            {cardContent}
          </a>
        </Link>
      ) : (
        cardContent
      )}
    </Card>
  )
}
