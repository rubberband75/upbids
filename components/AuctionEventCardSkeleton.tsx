import {
  Card,
  CardActions,
  CardContent,
  Skeleton,
  Typography,
} from "@mui/material"
import ChipSkeleton from "./ChipSkeleton"

export default function AuctionEventCardSkeleton({
  bannerHeight,
  multiLineDesc,
}: {
  bannerHeight?: number
  multiLineDesc?: true
}) {
  return (
    <Card sx={{ my: 4 }}>
      <Skeleton
        sx={{ height: bannerHeight || 175 }}
        animation="wave"
        variant="rectangular"
      />
      <CardContent>
        <Typography variant="h4" sx={{ mb: 2 }}>
          <Skeleton animation="wave" />
        </Typography>
        <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} />
        {multiLineDesc && <Skeleton animation="wave" height={10} width="80%" />}
      </CardContent>
      <CardActions>
        <ChipSkeleton icon />
        <ChipSkeleton icon />
      </CardActions>
    </Card>
  )
}
