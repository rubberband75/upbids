import { CardMedia, Skeleton } from "@mui/material"

export default function SquareImage({
  image,
  size,
  rounded,
}: {
  image: string | undefined | null
  size: number
  rounded?: Boolean
}) {
  return (
    <>
      {image ? (
        <CardMedia
          component="img"
          image={image}
          sx={{
            width: size,
            height: size,
            borderRadius: rounded ? "5px" : "0",
          }}
        />
      ) : (
        <Skeleton
          variant="rectangular"
          width={size}
          height={size}
          animation={false}
          sx={{
            borderRadius: rounded ? "5px" : "0",
          }}
        />
      )}
    </>
  )
}
