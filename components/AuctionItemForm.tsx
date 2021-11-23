import { Card, CardContent } from "@mui/material"
import AuctionItem from "../models/AuctionItem"

export default function AuctionItemForm({
  auctionItem,
  newItem,
  loading,
}: {
  auctionItem: AuctionItem
  newItem: Boolean
  loading: Boolean
}) {
  return (
    <>
      <Card>
        <CardContent> Title: {auctionItem.title}</CardContent>
      </Card>
    </>
  )
}
