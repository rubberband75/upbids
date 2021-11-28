import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material"
import AuctionEvent from "../models/AuctionEvent"
import PublicIcon from "@mui/icons-material/Public"
import PublicOffIcon from "@mui/icons-material/PublicOff"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import EventBusyIcon from "@mui/icons-material/EventBusy"

export default function AuctionEventCard({
  auctionEvent,
}: {
  auctionEvent: AuctionEvent
}) {
  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardActionArea>
          {auctionEvent.bannerImage && (
            <CardMedia
              component="img"
              height="140"
              image={auctionEvent.bannerImage}
            />
          )}
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {auctionEvent.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="div"
              sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {auctionEvent.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Typography variant="body2" component="div">
              {auctionEvent.published ? (
                <Chip
                  icon={<PublicIcon />}
                  label="Published"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<PublicOffIcon />}
                  label="Unpublished"
                  variant="outlined"
                />
              )}{" "}
              {auctionEvent.biddingOpen ? (
                <Chip
                  icon={<EventAvailableIcon />}
                  label="Bidding Open"
                  variant="outlined"
                />
              ) : (
                <Chip
                  icon={<EventBusyIcon />}
                  label="Bidding Closed"
                  variant="outlined"
                />
              )}
            </Typography>
          </CardActions>
        </CardActionArea>
      </Card>
    </>
  )
}
